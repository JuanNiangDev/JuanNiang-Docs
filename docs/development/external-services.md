---
title: 外部服务接入细节
---


本文档集中说明 JuanNiang-Neo 如何接入外部服务：LLM Provider、MCP、Postgres、Redis、T2I、Sandbox、RAG。每节给出：包路径、客户端构造方式、运行时热更新机制、可配置项与启停语义，以及与 HagoCenter / Service 插件的关系。

## 总览

| 服务 | 接入位置 | 客户端构造 | 配置来源 | 热更新 |
|------|----------|------------|----------|--------|
| LLM Provider | `internal/agent/provider/` | `ProviderGroup.AddProvider` | Postgres `providers` 表 | API CRUD 时同类型自动停其他 |
| MCP (SSE) | `internal/agent/mcp/` | `MCPGroup.AddMCP` → sdk 客户端 Connect | Postgres `mcp_servers` 表 | API toggle 即建/断 SSE |
| Postgres | `infrastructure/postgres/` | `gorm.Open` | env (`DB_*`) | 无（启动连一次） |
| Redis | `infrastructure/redis/` | `redis.NewClient` | env (`REDIS_*`) | 无 |
| T2I | `infrastructure/t2i/` + `/handler` | `t2i.NewClient` (含 HealthCheck) | Postgres `t2i_configs` 单行 | API toggle 重建 `*Client` |
| Sandbox | `infrastructure/sandbox/` + `/handler` | `sandbox.NewClient` (含 HealthCheck) | Postgres `sandbox_configs` 单行 | API toggle 重建 `*Client` |
| RAG | `infrastructure/rag/` + `/handler` | `rag.NewClient` (含 HealthCheck) | Postgres `rag_configs` 单行 | API toggle 置 nil/重建 |

所有持久化在 Postgres + Redis（短期记忆窗口、PubSub、任意缓存）。`.env` 中的 `T2I_BASE_URL`/`SANDBOX_*` 仅是文档性 env，**运行时实际从 DB 读取**（RAG 同理，无 env）。

## LLM Provider

### 设计

- 协议：**OpenAI 兼容** `/v1/chat/completions`（chat + 流式 SSE），可接任何 OpenAI 兼容端点（OpenAI、DeepSeek、Moonshot、本地 vLLM 等）
- 支持三种 `ModelType`：`text_model`（对话）/ `image_model`（Vision）/ `embedding_model`（嵌入，预留）
- `ProviderGroup` 是同 `type` 内"单 Active"语义：激活一个时自动停用同类型其他
- `SelectModel(ModelType)` 返回当前激活的 Provider，未激活时短路返回 nil
- 流式 `ChatStream` 解析 `data: ...` SSE 行（`internal/agent/provider/provider.go:50`）

### 模型选取

唯一调用点：`HagoCenter.handleMessage` 用 `Providers.SelectModel(ModelTypeText)` 得到对话 Provider；相关性判断由 `filterRelevant` 规则快路径过滤后，候选消息经 `relevanceBatchEvaluate` 批量合并为一次 LLM 判断（含图消息在有 Vision Provider 时走 Vision 判定）。

### 接入指南

1. Web 面板"Providers"页：填 `Endpoint`（如 `https://api.deepseek.com/v1`）、`Token`、`Model`（如 `deepseek-chat`）、`Temperature`、`Type`。
2. 激活：`PUT /providers/:id/toggle`，会自动停用同类型其他。
3. 同类型可在 DB 多存，但运行时只有一个 Active。

### Provider 接口（如要接新协议）

```go
// internal/agent/provider/root.go:83
type Provider interface {
    ID() string
    Name() string
    Type() ModelType
    Model() string
    Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error)
    ChatStream(ctx context.Context, req ChatRequest) (<-chan ChatStreamChunk, error)
    Vision(ctx context.Context, imageURLs []string, prompt string) (string, error)
}
```

实现 + 注册到 `ProviderGroup`，可在 `agent_operator.go::providerGroupAccess` 包装一层供插件访问。

## MCP

### 设计

- 协议：**MCP（Model Context Protocol），SSE 传输**，基于 `github.com/mark3labs/mcp-go`
- 单个 MCP server 描述：`server_url`（SSE 端点）、`headers`、`timeout`、`retry_count`、`tool_filter`（工具白名单，空=全量）、`auto_reconnect`
- 客户端 `sdkMCPClient`（`internal/agent/mcp/mcp.go:154`）`NewSSEMCPClient` → `Connect`（Start + Initialize，协议 LATEST 版本，clientInfo `{Name:"JuanNiang-Neo", Version:"1.0.0"}`）→ `ListTools`/`CallTool`
- `MCPGroup` 聚合所有 MCP，提供 `ListTools()`（仅已连接）和 `CallTool(name, args)`（按名分发）
- **工具合并**：内置工具与 MCP 工具在 `tool.BuildEinoTools`（`internal/agent/tool/eino_tool.go`）中合并为 Eino 工具列表（内置在前、MCP 追加在后），由 LLM 在 ReAct 循环内按名同步调用；同名工具会并列出现，配置 MCP 的 `tool_filter` 可避免与 builtin 冲突

### 接入指南

1. Web 面板"MCP"页：填 SSE 端点 URL、可选 headers / 超时 / 重试 / 工具白名单
2. 激活后立即建立 SSE 连接；`GET /mcp/:id/check` 实时探活
3. `GET /overview` 的 `mcp_count` 反映配置数；运行时连接状态合并到 `ListMCPs`

### 名称解析冲突

builtin 工具名（如 `send_group_msg`）可能与 MCP 工具同名并同时在 Eino 工具列表中可见，由 LLM 决定调用哪一个。如不希望 MCP 工具与 builtin 冲突，配 MCP 的 `tool_filter` 排除该名。

## Postgres

### 客户端

`infrastructure/postgres/client.go`，功能选项风格。`NewPostgresClient(opts...) (*gorm.DB, error)`，构建 `gorm.DB`：
- DSN：`host=... port=... user=... password=... dbname=... sslmode=...`
- `PreferSimpleProtocol:true`、`PrepareStmt:false`
- 连接池：`MaxOpenConns=150`、`MaxIdleConns=10`、`ConnMaxLifetime=1h`、`ConnMaxIdleTime=15m`

`cmd/server/main.go:98` 用 `WithHost/WithPort/WithUser/WithPassword/WithDefaultDB` 从 env 组装。

### Schema

`core.Init` 调用 `AutoMigrate` 创建 39 张表。**不读 `sql/init.sql`**（仅文档参考）。GORM AutoMigrate 按列追加/索引同步，**不会删列**，开发期字段删除需手工 `ALTER TABLE`。

## Redis

### 客户端

`infrastructure/redis/client.go`。函数名 `NewRedisSentinelClient`（保留了"Sentinel"字眼兼容旧调用），**实为单节点** `redis.NewClient`（注释 line 47），ping 5s 超时。`WithAddr/WithPassword/WithDB`。`cmd/server/main.go:111` 调用。

### 用途

通过 `internal/core/cache.Cache` 包装，所有 Redis 访问集中在此（前缀 `juan:` 或 `$REDIS_PREFIX`）：

- **KV**：`Get/Set(ttl)/Del/Exists/SetNX`
- **List**：`LPush/RPush/LRange/LTrim/LLen` — 短期记忆滑动窗口用（key `shortterm:msgs:<areaID>`，`LTrim` 维持窗口）
- **Hash**：`HGet/HSet/HGetAll/HDel`
- **PubSub**：`Publish/Subscribe`

`Cache.Client()` 暴露原始 `*redis.Client`，仅给需要 PubSub 的模块用。

### 命名空间

- Agent/系统：`juan:` 前缀
- 插件：`pluggin:<name>:` 前缀（`cache` Lua API 自动加，插件间隔离）
- 系统短期记忆：`shortterm:msgs:<areaID>`、`session:msgs:<id>`

## T2I

> Text-to-Image：HTML → 渲染为图片的服务。依赖 [astrbot-t2i-service](https://github.com/AstrBotDevs/astrbot-t2i-service)。

### 客户端

- 包 `infrastructure/t2i`（构造 `*handler.Client`），`NewClient(opts...)` 强制 `HealthCheck()` 通过才返回成功
- 选项：`WithBaseURL`、`WithTimeout`（**无 `WithAPIKey`** — T2I 不鉴权）
- `handler` 子包（package `caller`，别名 `t2icaller`）才是真正 `Client`：`Config{BaseURL, Timeout}` + `HttpClient`
  - `HealthCheck`（`hadler.go:76`）：宽容版，接受 200 或 404
  - `Generate(req)`（`POST /text2img/generate`，强制 `AsJSON:true`，返回 `{ID}`）、`GenerateImage`（原始字节，`AsJSON:false`）、`GenerateURL`（返回 `<BaseURL>/text2img/data/<ID>`）、`GetImage(id)`
- 请求体：`GenerateRequest{HTML, Template, TemplateData, AsJSON, Options{Timeout, Type(jpeg/png), Quality, OmitBackground, FullPage, Viewport, Scale, Animations, Caret, DeviceScaleFactor}}`

### 运行时

- 启动时 `loadT2IFromDB`（`cmd/server/main.go:347`）读 `t2i_configs` 单行；DB 无配置则 `InitConfig`，T2I 不可用则注销 `text_to_image` 工具的特性
- `Service.OnUpdateT2I`（`cmd/server/main.go:228`）回调：每次 `PUT /t2i/config` 用最新配置重建 `*Client` 并改写 `HagoCenter.T2IClient` 与 `Service.T2IClient`；插件通过 `agentOp.GetT2IClient()` 拿到最新指针
- Web 面板 T2I 页：`PUT /t2i/config` `/is_active=true` 即生效，无需重启

### 接入指南

1. 部署 [astrbot-t2i-service](https://github.com/AstrBotDevs/astrbot-t2i-service)（提供 `/text2img/generate` 与 `/text2img/data/:id`），Docker 一键启动：
   ```bash
   docker run -itd -p 8999:8999 soulter/astrbot-t2i-service:latest
   ```
2. Web 面板"T2I"页填 `base_url`（如 `http://<服务器>:8999`）、`timeout`、勾"启用"
3. Agent 内置工具 `text_to_image`（长任务，`builtin.go` 自动注册，ReAct 循环内同步执行）、Lua 插件 `t2i.generate/generate_url`（同步）与 `t2i.generate_async/generate_url_async`（异步，完成回调 `on_t2i_response`，不阻塞事件循环）

## Sandbox

> 代码沙箱：执行 shell / Python / 文件操作。官方唯一接入实现：[shipyard-neo](https://github.com/AstrBotDevs/shipyard-neo)。

### 客户端

- 包 `infrastructure/sandbox`，`NewClient` 强制 `HealthCheck()` 通过
- 选项：`WithBaseURL`、`WithAPIKey`、`WithTimeout`（默认 30s）
- `handler` 子包（package `caller`，别名 `sandboxcaller`）真正 `Client`：每个请求带 `Authorization: Bearer <APIKey>`（若设置）
  - `HealthCheck` `GET /health`
  - `CreateSandbox` `POST /v1/sandboxes`（`CreateSandboxRequest{Profile, CargoID, TTL}`）
  - `ExecPython` `POST /v1/sandboxes/{id}/python/exec` / `ExecShell` `POST /v1/sandboxes/{id}/shell/exec`
  - `ListSandboxes(limit,cursor,status)`（游标分页）、`GetSandbox`、`ExtendTTL`、`KeepAlive`、`StopSandbox`、`DeleteSandbox`
  - 文件操作：`ReadFile/WriteFile/ListDirectory/DeleteFile/UploadFile(multipart)/DownloadFile`
  - 历史：`GetExecutionHistory/GetExecution/GetLastExecution`
- 状态枚举：`idle|starting|ready|failed|expired`；`SandboxInfo{Containers, Capabilities, ...expiry}`

### 运行时

- 启动 `loadSandboxFromDB`（`cmd/server/main.go:378`）；`Service.OnUpdateSandbox` 热更新 `HagoCenter.SandboxClient`/`Service.SandboxClient`
- 启用时注册 sandbox 系列内置工具：`create_sandbox`、`list_sandboxes`、`browser_search`、`command_exec`、`code_exec`（均与 MCP 工具一样同步执行）
- 关闭/未配置时返回"未启用"提示；不影响其他工具

### 接入指南

1. 部署 [shipyard-neo](https://github.com/AstrBotDevs/shipyard-neo)（当前唯一接入实现，接口见上文「客户端」一节，建议带 APIKey 鉴权）
2. Web 面板"Sandbox"页填 `base_url`、`api_key`、`timeout`、勾"启用"
3. Agent 内置工具 `command_exec`/`code_exec`/`browser_search`/`create_sandbox`/`list_sandboxes` 与 MCP 工具一样在 Eino ReAct 循环内**同步执行**（无后台调度管道；`IsLongRunning` 仅作元数据标记，不影响执行方式）。Lua 插件 `sandbox.create/exec_shell/exec_python/list/delete`（同步）；耗时执行建议用 `create_async/exec_shell_async/exec_python_async`（异步，完成回调 `on_sandbox_response`，不阻塞事件循环）

## RAG

> RAG 向量检索服务：独立部署的 Rust 进程，bge 模型进程内推理（零外部依赖），提供文本向量化 / 语义检索 / 自动分块。v2 起按**分库（scoop）**物理隔离各功能块的向量。仓库：[JuanNiang-RAG-Service](https://github.com/JuanNiangDev/JuanNiang-RAG-Service)，API 详见其 `docs/API.md`。

### 客户端

- 包 `infrastructure/rag`（构造 `*handler.Client`），`NewClient(opts...)` 强制 `HealthCheck()` 通过才返回成功
- 选项：`WithBaseURL`、`WithTimeout`（**无 APIKey** — RAG 不鉴权）
- `handler` 子包（package `caller`）真正 `Client`：`Config{BaseURL, Timeout}` + `HttpClient`
  - `HealthCheck` `GET /health`、`Info` `GET /info`（模型状态/进程内存/**各分库规模**）
  - `Upsert(scoop, tag, text)` `PUT /scoops/{scoop}/tags/{tag}`（幂等，长文服务端自动分块）、`BatchUpsert(scoop, items)` `POST /scoops/{scoop}/tags/batch`（批量，一次嵌入推理）
  - `Search(scoop, q, k, minScore)` `GET /scoops/{scoop}/tags/search`（**只在指定分库内检索**，按相似度返回 `[{tag, score}]`，自动加 bge 官方指令前缀）、`Delete(scoop, tag)` `DELETE /scoops/{scoop}/tags/{tag}`
- **tag 契约**：Agent 侧保管原始文档与 UUID；本服务只做向量化/检索/删除。`tag` 必须为 UUID 字符串；**同一 tag 全局只允许归属一个 scoop**（跨分库写入/删除 → 409，服务端归属注册表强校验，重启后自动重建）

### 运行时

- 启动时 `loadRAGFromDB`（`cmd/server/main.go`）读 `rag_configs` 单行（**默认未启用**），创建客户端后同时注入 `HagoCenter.RAGClient`（`atomic.Pointer`）与 `Memory.SetRAGClient`（Compact 双写记忆向量）；`Service.OnUpdateRAG` 回调：每次 `PUT /rag/config` 用最新配置重建 `*Client` 并注入，停用/失败置 nil（= 降级开关）
- 客户端经 `agentOp.GetRAGClient()`（`pluggin.AgentOperator`）供插件动态获取，热更新即时生效
- **scoop 分库**：向量按功能块物理分库（4 个白名单：`knowledge` / `memory` / `groupmgr` / `plugin`，见 `internal/core/ragtag` 常量 `ScoopKnowledge` 等），**检索限定在目标分库内**——不同集合互不挤占 top-k，精确度不受无关数据干扰。业务 ID → tag 仍用 UUID v5 确定性派生（`k:`/`m:`/`s:`/`wt:` 前缀命名空间，写入/检索/删除/手动同步用同一函数）；分库化后**候选集职责收敛**为「tag → 本地 ID 反查」——如群管理 `buildPhraseSet` 维护 语录ID→派生tag 映射，检索命中后按 tag 归类黑白并反查本地行（scoop 内黑白同库，一次检索取两边最优命中）。数据按分库独立落盘 `data/scoops/<name>/`（每库一对 `index.tvim` + `tags.bin`）
- **k 值收窄**：分库化后无需再为外来集合挤占 top-k 而调大候选数——知识库/长期记忆 `k=10`、群管理黑白语录 `k=15`（旧单库版为 50/50/30）

### 降级语义（任何 RAG 故障都不影响主流程）

> 热路径（每轮对话知识注入 / 记忆召回 / 群管理核实）检索均带 **1s 硬超时**（与群管理 `ragSearchTimeout` 对齐），RAG 服务假死/超时自动走降级，不拖住消息链路；Compact 的记忆向量双写为**异步 goroutine + 5s 快速失败**，不阻塞 Agent 循环。

| 调用方 | 首选 | 降级 |
|--------|------|------|
| 知识库检索 | RAG 语义检索（命中按分数注入 ≤5 条；`k=10`，scoop `knowledge`） | SQL 关键词 + ILIKE 匹配（接入前行为） |
| 长期记忆召回 | RAG 向量语义（`k=10`，scoop `memory`） | pg_trgm gram 候选 → 最近条目（三级降级链；pg_trgm 扩展创建失败时自动回退最近条目，不阻断启动） |
| 群管理违禁检测 | RAG 黑白语录语义匹配（黑命中 ≥ `black_min_score` 处罚 / 白命中 ≥ `white_min_score` 放行，`k=15`，scoop `groupmgr`）；RAG 可用但无语录命中 → 送 LLM 批量判定 | 关键词路径（= 旧插件行为，仅 RAG/LLM 均不可用时） |
| 群管理词条/语录写入 | RAG 可用时同步 Upsert（学习闭环/导入/手动同步） | 未配置静默跳过、失败仅告警（`rag_synced` 仅真实写入成功才置 true） |

### 接入指南

1. 部署 [JuanNiang-RAG-Service](https://github.com/JuanNiangDev/JuanNiang-RAG-Service)：`make download && cargo run --release`（默认监听 `127.0.0.1:3000`，可用 `RAG_PORT` 等环境变量覆盖）
2. Web 面板"RAG 向量"页填 `base_url`（如 `http://localhost:3000`）、`timeout`，勾"启用"
3. 知识库 / 群管理 / 记忆页面有「同步向量库」按钮手动全量同步；新增/编辑/删除自动双写双删
4. 插件可用 `jn.rag`（权限 `rag`）直连原始 RAG-Service（默认写入 `plugin` 分库，见 [插件 API 参考](../plugins/api-reference.md#全局表-rag)）
5. 可加监控：`GET /metrics`（前缀 `rag_`）接入 Prometheus，RAG 仓库自带 Grafana 面板 `deployment/grafana/rag-dashboard.json`；`GET /` 是简易**无鉴权** Web 控制台（分页查看各分库 tag 的 UUID/块数 + 增删/批量删除，仅限本机/内网）

## 一致性：HagoCenter 与 Service 共享同指针

T2I 与 Sandbox 的客户端**热更新关键**在于 `HagoCenter` 与 `Service` **共享同一个 `*Client` 指针**：

- `Service.OnUpdateT2I = func(c *t2icaller.Client) { hago.T2IClient = c }`
- 同时 `svc.T2IClient = c`
- 插件通过 `agentOp.GetT2IClient()`（`pluggin.AgentOperator` 接口，实现于 `internal/agent/agent_operator.go`）拿到同一指针

→ 无需广播通知，谁拿到指针谁就用最新版。任何端点都自动一致。

## 鉴权与 Admins

- OneBot11 反向 WS：`OB_TOKEN`（`Authorization: Bearer` 或 `?access_token=`）
- Webhook：`WebhookConfig.Token`（同上）
- Web API：JWT（`JWT_SECRET`）
- Sandbox：`APIKey`（Bearer）
- T2I：无鉴权
- RAG：无鉴权（内网部署）
- Admins 列表（OneBot11 绕 ACL）：来自 `Onebot11Adapter.AdminQQNumbers`（DB，可热增删），每条 `Event` 都透传 `Admins []string`

## 健康检查约定

- T2I / Sandbox / RAG 的 `NewClient` 在构造时就执行 `HealthCheck()`，慢启动——不健康直接返回 err（视情况选择是否启用）
- 进程启动后 `GET /api/v1/t2i/health`、`GET /api/v1/sandbox/health`、`GET /api/v1/rag/health` 可再探活；`GET /api/v1/rag/info` 返回模型/内存/向量规模；`GET /api/v1/overview` 返回 `t2i_healthy`/`sandbox_healthy`/`rag_active`/`rag_healthy`
- Postgres / Redis 无端点级健康接口，但 `core.Init` 要求都能连接成功；`docker compose` 给 PG/Redis 配了 healthcheck