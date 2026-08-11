---
title: Web API：接口约定与系统状态
---


**Base URL:** `http://localhost:8090/api/v1`
**Content-Type:** `application/json`（上传文件为 `multipart/form-data`）

## 统一响应格式

所有接口返回 `FinalResponse`：

```json
{ "status": 0, "info": "OK", "data": <任意类型或 null> }
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `status` | uint | 0=成功，非 0=错误码 |
| `info` | string | 状态描述（成功为 `"OK"`，失败为错误信息） |
| `data` | any | 业务数据；失败时可为 `null` 或 `{"error_detail": "..."}` |

> 注意：逻辑错误也使用 HTTP 200，全部以信封中的 `status` 判定结果。

### 错误码表

| Code | 说明 |
|------|------|
| 0 | 成功 |
| 40001 | 参数格式错误（BindJSONErr） |
| 40002 | 用户名或密码错误 |
| 40003 | token 生成失败 |
| 40004 | 用户不存在 |
| 40005 | 原密码错误 |
| 40006 | 密码更新失败 |
| 40007 | 无效的 QQ 号 |
| 40008 | adapter 未初始化 |
| 40009 | provider 不存在 |
| 40010 | MCP 服务器不存在 |
| 40011 | Session 不存在 |
| 40012 | 缺少上传文件 |
| 40013 | 临时文件创建失败 |
| 40014 | 文件写入失败 |
| 40015 | 无效的 ZIP 文件 |
| 40016 | 无效的 ACL ID |
| 40017 | onebot11 适配器配置更新失败 |
| 40018 | Skill 不存在 |
| 40019 | Prompt 不存在 |
| 40020 | Tool 不存在 |
| 40021 | Plugin 不存在 |
| 40022 | 插件加载失败 |
| 40023 | ChatArea 不存在 |
| 40024 | Memory 配置不存在 |
| 40025 | adapter 配置不存在 |
| 40026 | T2I 配置不存在 |
| 40027 | Sandbox 配置不存在 |
| 40028 | 系统插件不允许删除或停用 |
| 40029 | 系统提示词不允许修改或删除 |
| 40030 | 内置工具运行时常驻，不支持启停 |
| 40031 | 无效的回复策略 |
| 40032 | 相关性阈值非法 / 判断失败策略只能是 drop 或 reply |
| 40033 | 知识内容不能为空 |
| 40034 | 图片大小不能超过 1.5MB |
| 40035 | 不支持的图片格式（仅支持 jpg/png/gif/webp） |
| 40036 | 图片不存在 |
| 40037 | 文件夹已存在 |
| 40038 | 文件夹不存在 |
| 40039 | 表情不存在 |
| 40040 | 标签已存在 |
| 40041 | 标签不存在 |
| 40042 | 该图床图片已被其他表情引用 |
| 40043 | 摸鱼日历配置不存在 |
| 40044 | 定时消息任务不存在 |
| 40045 | 插件名不合法（仅允许字母/数字/下划线/连字符） |
| 40046 | 插件包包含非法路径（疑似 zip-slip 攻击） |
| 40047 | 系统内置标签不可删除 |
| 50000 | 服务器内部错误 |

## 认证

除 `POST /login` 和根路径下的 `GET /health` 外，**所有接口需要** `Authorization: Bearer <token>` 头。Token 由 `POST /login` 获取。
系统初始化时默认账号 `admin / Admin123`，首次启动后请尽快通过 `POST /change-password` 修改。

`JWT_SECRET` 用于 HMAC 签名；Token 有效期 72 小时（`internal/api/middleware/auth.go`）。

---

## 通用数据类型

| 类型 | JSON 形式 | 说明 |
|------|-----------|------|
| `JSONMap` | `{"k":"v"}` | `map[string]any`（GORM jsonb） |
| `JSONSlice` | `["a","b"]` | `[]string`（GORM jsonb） |
| `time.Time` | RFC3339 字符串 | `"2026-07-20T12:00:00Z"` |

**枚举类型**

- `ModelType`: `text_model` | `image_model` | `embedding_model`
- `PromptType`: `system` | `personality` | `custom`（`system` 保留给系统锁定提示词，禁止新建）
- `AreaType`: `private` | `group`
- `ACLScope`: `chat` | `tool` | `mcp`（**当前仅 `chat` 生效**，`tool`/`mcp` 为历史保留）
- `ACLPermission`: `allow` | `deny`
- `ACLTargetType`: `all` | `list`（`list` 时 `user_ids` 才有效）
- `ReplyStrategy`: `never_reply` | `at_only` | `always` | `relevance`

**ACL 语义**（当前仅聊天黑名单）：无规则=允许所有；仅 `deny` 规则生效（`all`=禁止所有人、`list`=禁止指定 `user_ids`）；`allow` 规则不再生效；Admins 列表中的用户绕过 ACL。

---


## 1. 认证

### POST /login
管理员登录，返回 JWT。

**Body** `LoginReq`:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `username` | string | 是 | 用户名 |
| `password` | string | 是 | 明文密码 |

**data** `TokenResp`:

| 字段 | 类型 | 说明 |
|------|------|------|
| `token` | string | JWT，放入后续 `Authorization: Bearer <token>` |

```bash
curl -X POST http://localhost:8090/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123"}'
# {"status":0,"info":"OK","data":{"token":"eyJhbGciOi..."}}
```

### POST /change-password
修改当前登录用户密码。

**Body** `ChangePasswordReq`: `old_password` string、`new_password` string（均必填）。
**data** `null`。

---


## 2. 健康检查

### GET /health
（**不在 `/api/v1` 前缀下**，无需认证）服务存活检查。

```json
{"status":"ok"}
```

---


## 3. Overview

### GET /overview
返回系统全局概览（资源计数 + 系统状态 + T2I/Sandbox 健康）。

**data** `OverviewResp`: `chat_area_count`、`mcp_count`、`adapter_count`（固定 1）、`plugin_count`、`provider_count`、`skill_count`、`session_count`、`total_token_usage` int64、`cpu_count`、`goroutine_num`、`mem_alloc_bytes`、`mem_sys_bytes`、`mem_heap_inuse_bytes` uint64、`go_version`、`t2i_active`、`t2i_healthy`、`sandbox_active`、`sandbox_healthy` bool。

### GET /overview/daily-token-usage
近 N 天每日 Token 用量（折线图数据点）。

| Query | 类型 | 默认 | 说明 |
|-------|------|------|------|
| `days` | int | 7 | 天数，范围 1–30 |

**data** `DailyTokenUsageResp[]`: `date` string（`YYYY-MM-DD`）、`token_count` int64。

---


## 4. 日志

日志由 `internal/logging` Hub 维护，环形缓冲区保留最近 250 条。

### GET /logs
返回最近 250 条，**最新排在最前**。

**data** `LogEntryResp[]`: `time` time、`level` string、`message` string、`attrs` map。

### GET /logs/stream
SSE 实时日志流。`text/event-stream`。

- 先按时间顺序发送最近 250 条历史
- 再订阅 Hub 实时推送；每 15 秒发送一次 keepalive 心跳
- 客户端断开或服务停止时退出

事件：

```
event: log
data: {"time":"2026-07-20T12:00:00Z","level":"INFO","message":"...","attrs":{}}
```

```javascript
const es = new EventSource('/api/v1/logs/stream', {
  headers: { Authorization: 'Bearer ' + token }
});
es.addEventListener('log', (e) => {
  const entry = JSON.parse(e.data);
  console.log(entry.time, entry.level, entry.message);
});
```

---


## 附：前端 SPA 静态服务

后端复用 Hertz 引擎同端口（`:8090`）服务前端 SPA：

| 请求路径模式 | 行为 |
|--------------|------|
| `/api/v1/<已注册路由>` | Hertz 路由，JWT 鉴权（除 `/login`） |
| `/health` | 内联健康检查（root，无需鉴权） |
| `/api/*`（未命中） | 标准信封 404：`{"status":40400,"info":"资源不存在","data":null}` |
| 其它任何路径 | 文件存在→serve 文件；不存在→回退 `index.html` |
| 前端未构建（`index.html` 缺失） | 200 + 引导提示页（"请先构建前端"） |

实现：`internal/web/web.go::SPAHandler(webDir)`，在 `engine.New` 中通过 `h.NoRoute(...)` 注册；不嵌入二进制，磁盘上 `WEB_DIR`（默认 `web/dist`）为准；开发期 Vite `:3000` 代理 `/api`→`:8090`，Go 的 fallback 不会被触发。
