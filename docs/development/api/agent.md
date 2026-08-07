---
title: Web API：Agent 配置
---

## 1. Providers

LLM Provider (text/image/embedding) CRUD。同类型只能一个 Active，激活时自动停用同类型其他 Provider。

### GET /providers
列出所有 Provider。

**data** `ProviderResp[]`:

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | UUID |
| `name` | string | 名称 |
| `type` | ModelType | 类型 |
| `endpoint` | string | API 地址 |
| `token` | string | API token |
| `model` | string | 模型名 |
| `temperature` | float32 | 温度（默认 0.7） |
| `is_active` | bool | 是否激活 |
| `created_at` | time | 创建时间 |

### GET /providers/:id
获取单个 Provider。`data` `ProviderResp`。

### POST /providers
新增 Provider。若 `is_active=true` 自动停用同类型其他 Provider。

**Body** `AddProviderReq`: `name`、`type`、`endpoint`、`token`、`model`（均必填），`temperature` float32（可选），`isActive` bool（必填）。

**data** `ProviderResp`（含生成的 UUID）。

### PUT /providers/:id
覆盖更新。**Body** `UpdateProviderReq`（同 Add）。**data** `null`。

### DELETE /providers/:id
删除 Provider 并从运行时 ProviderGroup 移除。**data** `null`。

### PUT /providers/:id/toggle
启停 Provider。

**Body** `ToggleProviderReq`: `is_active` bool（必填）。**data** `null`。

---


## 2. MCP

MCP（Model Context Protocol，SSE 传输）服务器配置 CRUD，支持运行时连接/断开。

### GET /mcp
列出所有 MCP 服务器。注意：返回会合并运行时连接状态。

**data** `MCPServerResp[]`:

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | UUID |
| `name` | string | 名称 |
| `server_url` | string | SSE 端点 |
| `headers` | JSONMap | 自定义请求头 |
| `timeout` | int | 超时毫秒 |
| `retry_count` | int | 重试次数 |
| `tool_filter` | string[] | 工具白名单（空=全量） |
| `auto_reconnect` | bool | 自动重连 |
| `is_active` | bool | 是否激活 |
| `created_at` | time | 创建时间 |

### GET /mcp/:id
获取单个。**data** `MCPServerResp`。

### POST /mcp
新增 MCP。若 `is_active=true` 立即建立 SSE 连接。

**Body** `AddMCPServerReq`：`name`、`server_url`（必填）；`headers` JSONMap、`timeout` int、`retry_count` int、`tool_filter` string[]、`auto_reconnect` bool（可选）；`is_active` bool（必填）。

**data** `MCPServerResp`。

### PUT /mcp/:id
覆盖更新。断开旧连接，若 `is_active=true` 重新建立 SSE。**data** `MCPServerResp`。

### DELETE /mcp/:id
断开连接并删除。**data** `null`。

### GET /mcp/:id/check
实时检测指定 MCP SSE 连接状态。**data** `{"connected": bool}`。

> 注：`GET /mcp/:id/check` 与 `PUT /mcp/:id/toggle` 配合使用，前者探活，后者启停。

### PUT /mcp/:id/toggle
启停 MCP，对应建立/断开 SSE 连接。
**Body** `ToggleMCPServerReq`: `is_active` bool。**data** `null`。

---


## 3. Memory

短期/长期记忆**配置**管理（按 ChatArea）。短期消息实际存 Redis，长期条目存 Postgres，本组接口只管理配置元数据。

### GET /memory/:chatAreaID/short-term
获取短期记忆配置，不存在则自动创建（`window_size=100, auto_compact=true`）。

**data** `ShortTermMemoryResp`: `id`、`chat_area_id`、`window_size` int、`auto_compact` bool、`created_at`。

### PUT /memory/:chatAreaID/short-term
更新短期记忆配置，同步运行时 MemoryGroup。

**Body**: `window_size` int、`auto_compact` bool（均必填）。**data** `ShortTermMemoryResp`。

### GET /memory/:chatAreaID/long-term
获取长期记忆配置，不存在自动创建（`hot_area_size=10, hot_memory_ttl=86400`）。

**data** `LongTermMemoryResp`: `id`、`chat_area_id`、`hot_area_size` int、`hot_memory_ttl` int（秒）、`created_at`。

### PUT /memory/:chatAreaID/long-term
更新长期记忆配置。

**Body**: `hot_area_size` int、`hot_memory_ttl` int（均必填）。**data** `LongTermMemoryResp`。

---


## 4. Prompts

Prompt 模板 CRUD。

> SystemLocked 提示词：启动时 `EnsureSystemPrompt` 幂等播种名为 `__system_locked__`、`IsSystem=true` 的种子，不受 `IsActive` 影响强制拼接。Service 层 Update/Delete/Toggle 拒绝 `IsSystem` 行；新建 Prompt 禁止使用 `type=system`（返回 40029）。拼接顺序：**SystemLocked → system → personality → custom**。

### GET /prompts
列出所有 Prompt（含系统锁定，前端只读）。

**data** `PromptResp[]`:

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | UUID |
| `name` | string | 名称 |
| `content` | string | 内容 |
| `type` | PromptType | 类型 |
| `is_active` | bool | 是否激活 |
| `is_system` | bool | 系统锁定（禁改/删/停用） |
| `created_at` | time | 创建时间 |

### POST /prompts
新增 Prompt。**禁止 `type=system`**。

**Body** `AddPromptReq`: `name`、`content`、`type`（personality/custom）、`is_active`（均必填）。

**data** `PromptResp`。

### PUT /prompts/:id
更新。若目标行 `IsSystem=true` 或请求 `type=system` 返回 40029。**Body** `UpdatePromptReq`（同 Add）。**data** `PromptResp`。

### DELETE /prompts/:id
删除。`IsSystem=true` 返回 40029。**data** `null`。

### PUT /prompts/:id/toggle
启停。系统锁定提示词**允许启用、不允许停用**（停用返回 40029）。
**Body** `TogglePromptReq`: `is_active` bool。**data** `null`。

---


## 5. Sessions

每个 ChatArea 对应一个 Session。

### GET /sessions
列出所有 Session（Preload ChatArea）。

**data** `SessionResp[]`: `id`、`chat_area_id`、`model`、`token_usage` int64、`meta_data` JSONMap、`created_at`。

### GET /sessions/:id
**data** `SessionResp`。

### DELETE /sessions/:id
删除 Session，同时清除 Redis 短期消息缓存。**data** `null`。

---


## 6. Skills

Skill = 关键词/正则触发的 Prompt+Tool 组合配置。`priority` 越大越优先。`prompt_refs` 支持引用多个 Prompt。

### GET /skills
**data** `SkillResp[]`: `id`、`name`、`description`、`keywords` string[]、`regex_pattern`、`prompt_refs` string[]、`tool_refs` string[]、`mcp_refs` string[]、`is_active`、`is_system`、`priority` int、`created_at`。

### POST /skills
**Body** `AddSkillReq`: `name`（必填）；`description`、`keywords`、`regex_pattern`、`prompt_refs`、`tool_refs`、`mcp_refs`（可选）；`is_active`（必填）；`is_system`、`priority`（可选）。

**data** `SkillResp`。

### PUT /skills/:id
覆盖更新。**Body** `UpdateSkillReq`（同 Add）。**data** `SkillResp`。

### DELETE /skills/:id
**data** `null`。

---


## 7. Tools

工具配置查看与启停。

> `GET /tools` 合并两份数据源：运行时 `ToolRegistry.List()` 中的内置工具（ID 形如 `builtin:<name>`，`is_builtin=true`，常驻不可启停）+ DB 中 `ToolConfig` 表（自定义工具与历史条目）。同名条目用 DB 的 ID/`is_active`/`admin_only`/`created_at`，但 `is_builtin` 与 `parameters` 以运行时注册表为准。

### GET /tools
**data** `ToolConfigResp[]`: `id`、`name`、`description`、`parameters` JSONMap、`timeout` int、`is_active`、`is_builtin`、`admin_only`（仅管理员可调用）、`created_at`。

### PUT /tools/:id/toggle
启停 Tool。**内置工具（`id` 以 `builtin:` 开头）运行时常驻，不支持启停**，返回 40030。

**Body** `ToggleToolReq`: `is_active` bool。**data** `null`。

### PUT /tools/:id/admin-only
更新工具"仅管理员"标志（内置/自定义工具均可）。开启后该工具只能由 Admins 列表内用户触发，防止提示词注入诱导 Agent 执行敏感操作；内置群管理工具（踢人/禁言/全员禁言/群名片/好友与加群请求/撤回）默认开启。

**Body** `UpdateToolAdminOnlyReq`: `admin_only` bool。**data** `null`。

---


## 8. ACL

访问控制规则管理。规则以 ChatArea 为单位组织。

### GET /acl
**data** `ACLRuleResp[]`: `id` int64、`chat_area_id`、`scope`、`permission`、`target_type`、`user_ids` string[]、`created_at`。

### POST /acl
新增或覆盖规则（同 ChatArea + Scope 已存在则覆盖）。

**Body** `AddACLRuleReq`: `chat_area_id`、`scope`、`permission`、`target_type`（均必填）；`user_ids` string[]（`target_type=list` 时有效）。**data** `ACLRuleResp`。

### DELETE /acl/:id
删除规则并同步运行时 ACL 管理器。**data** `null`。

---


## 9. Agent 活跃循环

当前正在执行的 Agent ReAct 循环（监控展示，原后台任务页改造）。对应前端页面 `web/src/views/AgentLoopsPage.vue`，实现见 `internal/agent/loop_tracker.go`。

### GET /agent/loops
返回当前所有活跃的 Agent ReAct 循环。

**data** `AgentLoopResp[]`:

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 循环 ID |
| `chat_area_id` | string | 所属 ChatArea |
| `message_type` | string | `private` / `group` |
| `target_id` | int64 | 私聊: user_id；群聊: group_id |
| `user_id` | int64 | 发起者 QQ |
| `user_msg` | string | 触发消息（批内合并） |
| `current_tool` | string | 当前正在执行的工具；空=思考/生成中 |
| `started_at` | time | 开始时间 |

---


## 10. 回复策略

系统回复策略（单例，仅一行）。控制群聊中 Agent 对消息的回复行为。

**ReplyStrategy 枚举**

| 值 | 含义 |
|----|------|
| `never_reply` | 完全不回复 |
| `at_only` | 仅被 @ 时回复 |
| `always` | 始终回复（默认） |
| `relevance` | 按相关性回复：@/命令/提及名字必回；噪音消息规则过滤；其余候选批量合并为一次 LLM 判断（受 `relevance_threshold` 影响），带结果缓存/冷却与刷屏降级 |

### GET /reply-strategy
获取配置。首次 GET 不存在时自动创建（`strategy=always, relevance_threshold=0.5`）。

**data** `ReplyStrategyResp`: `strategy`、`relevance_threshold` float64、`bot_name`、`strip_markdown` bool、`agent_lite` bool、`relevance_prompt` string、`relevance_model` string、`relevance_timeout` int（相关性判断超时秒，默认 10）、`judge_fail_policy` string（`drop`=判断失败不回复（默认）/ `reply`=照常回复）。

### PUT /reply-strategy
更新。

**Body** `UpdateReplyStrategyReq`: `strategy`、`relevance_threshold`（必填）；`bot_name`、`strip_markdown`、`agent_lite`（可选）；`relevance_prompt`（相关性检测自定义提示词，空=默认）、`relevance_model`（相关性检测 Text Provider ID，空=默认）、`relevance_timeout`（相关性判断超时秒，0=默认 10s，范围 1-120）、`judge_fail_policy`（`drop`/`reply`，空=默认 `drop`）。

**data** `ReplyStrategyResp`。

```bash
curl -X PUT http://localhost:8090/api/v1/reply-strategy \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"strategy":"relevance","relevance_threshold":0.6,"bot_name":"小卷","judge_fail_policy":"reply"}'
```

---
