# Web API：适配器与会话

> OneBot11 反向 WebSocket 适配器状态查询与配置更新。

## 1. Adapter

OneBot11 反向 WebSocket 适配器状态查询与配置更新。

> 说明：`listen_addr` 由 `Adapter.listenAddr()` 规范化为 `host:port`；管理员 QQ 列表持久化在 DB 的 `AdminQQNumbers` 字段；`SyncConfig` 在启用时 Stop+Start 重启，禁用时仅 Stop。

### GET /adapter
返回适配器运行状态（不含配置）。

**data** `AdapterStatus`:

| 字段 | 类型 | 说明 |
|------|------|------|
| `running` | bool | 是否在运行 |
| `listen_addr` | string | 规范化后的 `host:port` |
| `self_id` | int64 | 机器人 QQ |
| `conn_count` | int | WS 连接数 |
| `conn_ids` | int64[] | 已连接客户端 QQ 列表 |
| `conns` | ConnDetail[] | 每条连接详情 `{id, ip, self_id}` |

### GET /adapter/config
读取持久化的适配器配置。

**data** `AdapterConfigResp`: `addr` string、`port` int、`token` string、`admin_qq_numbers` string[]、`enabled` bool。

### PUT /adapter
更新适配器配置并同步到运行时。

**Body** `UpdateAdapterConfigReq`:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `addr` | string | 是 | 监听地址（支持 host / `:port` / `host:port`） |
| `port` | int | 是 | 监听端口 |
| `token` | string | 是 | OneBot access token |
| `admin_qq_numbers` | string[] | 是 | 管理员 QQ 列表 |
| `enabled` | bool | 是 | 是否启用 |

**data** `null`。

### POST /adapter/restart
重启 OneBot11 适配器。**data** `null`。

---

## 2. 聊天记录

按 ChatArea 分页查询持久化聊天记录（Postgres）。

### GET /chat-records/:chatAreaID
| Query | 类型 | 默认 | 说明 |
|-------|------|------|------|
| `limit` | int | 20 | 每页数量 |
| `offset` | int | 0 | 偏移 |
| `role` | string | (空) | 过滤角色 `user`/`assistant`/`tool` |

**data** `ChatRecordListResp`: `total` int64、`list` ChatRecordResp[]。

`ChatRecordResp`: `id` int64、`chat_area_id`、`user_id` int64、`role`、`content`、`token_count` int、`tool_calls` JSONMap、`created_at` time。

### GET /chat-records/:chatAreaID/token-usage
返回该 ChatArea 的会话 Token 用量（实际是 `Session.GetOrCreate`）。**data** `SessionResp`。

---

## 3. Chat Areas

聊天区域自动由消息驱动创建（私聊/群聊各一个）。

### GET /chat-areas
**data** `ChatAreaResp[]`: `id`、`area_type`、`target_id` int64、`created_at`。

---

## 4. Webhook

Webhook 适配器配置（监听独立端口接收外部 HTTP 事件）。详见 [webhook-cronjob.md](../webhook-cronjob.md)。

### GET /webhook/config
**data** `WebhookConfigResp`: `addr`、`port` int、`token`、`enabled` bool、`running` bool。

### PUT /webhook/config
**Body** `UpdateWebhookConfigReq`: `addr`、`port`、`token`、`enabled`（均必填）。**data** `WebhookConfigResp`（含最新 `running`）。

---

## 5. T2I

Text-to-Image 配置与健康管理。单行配置（ID=1）。详见 [external-services.md](../external-services.md#t2i)。

### GET /t2i/config
**data** `T2IConfigResp`: `base_url`、`timeout` int、`is_active` bool、`healthy` bool。

### PUT /t2i/config
更新配置。运行时若启用则重建客户端并注入 HagoCenter，停用则置空。
**Body** `UpdateT2IConfigReq`: `base_url`（必填）、`timeout` int（可选）、`is_active` bool（必填）。**data** `T2IConfigResp`。

### GET /t2i/health
实时健康检查。**data** `{"healthy": bool}`。

---

## 6. Sandbox

代码沙箱配置与健康管理。单行配置（ID=1）。详见 [external-services.md](../external-services.md#sandbox)。

### GET /sandbox/config
**data** `SandboxConfigResp`: `base_url`、`api_key`、`timeout` int、`is_active` bool、`healthy` bool。

### PUT /sandbox/config
**Body** `UpdateSandboxConfigReq`: `base_url`、`api_key`、`is_active`（必填），`timeout`（可选）。**data** `SandboxConfigResp`。

### GET /sandbox/health
**data** `{"healthy": bool}`。

---

## 7. CronJob

定时任务管理。详见 [webhook-cronjob.md](../webhook-cronjob.md)。

CronJob 增删改/toggle 后**自动 reload** 调度器（`robfig/cron`，6 字段：秒 分 时 日 月 周）。

### GET /cronjobs
**data** `CronJobResp[]`。

### GET /cronjobs/:id
**data** `CronJobResp`。

### POST /cronjobs
新增，自动同步调度器。

**Body** `AddCronJobReq`:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 名称 |
| `cron_expr` | string | 是 | 6 字段 cron，如 `0 0 9 * * *` 每天 9:00 |
| `is_active` | bool | 是 | 是否立即启用 |
| `message` | string | 否 | 合成消息内容（透传给插件 `event.raw_message`） |
| `message_type` | string | 否 | `private`（默认）/ `group` |
| `target_id` | int64 | 否 | 消息目标：私聊=QQ 号，群聊=群号 |
| `plugin_ids` | string[] | 否 | 触发插件列表（插件目录名），到点时调用其 `on_cronjob` 回调 |
| `payload` | string | 否 | JSON 字符串，传递给插件 `on_cronjob(event)` 的 `event.payload` |

**data** `CronJobResp`。

`CronJobResp`: `id`、`name`、`cron_expr`、`plugin_ids` JSONSlice、`payload` JSONMap、`is_active`、`last_run_at` *time、`last_error`、`created_at`、`updated_at`。

### PUT /cronjobs/:id
覆盖更新，自动 reload。**Body** `UpdateCronJobReq`（同 Add）。**data** `CronJobResp`。

### DELETE /cronjobs/:id
删除，自动 reload。**data** `null`。

### PUT /cronjobs/:id/toggle
启停，自动 reload。**Body** `ToggleCronJobReq`: `is_active` bool。**data** `null`。

---
