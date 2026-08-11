# Web API：功能模块

> Lua 插件管理。插件通过 ZIP 上传，自动解压到 `data/pluggins/<name>/`。

## 1. Plugins

Lua 插件管理。插件通过 ZIP 上传，自动解压到 `data/pluggins/<name>/`。

> `GET /plugins` 改用 `PluginEngine.ListMaps()`：不再有 `path`/`config`/`created_at`，新增 `permissions`/`commands`/`is_system`/`author`/`description`。系统插件（`is_system=true`）三层保护（Manifest.System + `PluginEngine.IsSystem()` + Service 守卫）禁止删除与停用，违规返回 40028。`POST /plugins/upload` 用 `multipart/form-data`。CronJob/Provider/MCP 新建后自动 reload 对应调度器/运行时。

### GET /plugins
列出所有插件配置。

**data** `PluginListMap[]`:

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 插件名（=目录名，作为 `id`） |
| `ppid` | string | 稳定 UUID |
| `version` | string | 版本 |
| `author` | string | 作者 |
| `description` | string | 描述 |
| `permissions` | string[] | 权限列表 |
| `is_system` | bool | 系统插件（禁删/停） |
| `is_active` | bool | 是否激活 |
| `commands` | PluginCommandInfo[] | 注册命令列表 |

`PluginCommandInfo`: `path` string[]、`description`、`usage`、`is_leaf` bool。

### POST /plugins/upload
**Body**: `multipart/form-data`，字段 `file` 为 ZIP。
**data** `PluginUploadResp`: `name`、`status`（`loaded`）。

```bash
curl -X POST http://localhost:8090/api/v1/plugins/upload \
  -H "Authorization: Bearer <token>" -F "file=@my-plugin.zip"
```

### PUT /plugins/:id/toggle
启停插件。启用 `Load`，停用 `Unload`。系统插件禁停用（40028）。
**Body** `TogglePluginReq`: `is_active` bool。**data** `null`。

### DELETE /plugins/:id
卸载并删除插件配置（**不删磁盘文件**）。系统插件禁删（40028）。**data** `null`。

### POST /plugins/reload
**热重载所有非系统插件**。先卸载全部非系统插件，再调用 `LoadAll()` 重新扫描并加载。
适用于：新增/修改 `on_cronjob` 或注册了新命令后无需重启进程即可生效。
**Body** 无。**data** `null`。

### 插件商店（/plugin-store）

> 商店从 GitHub 仓库（默认 `JuanNiangDev/JuanNiang-Plugins`）经镜像源实时拉取元数据与插件文件；列表元数据每晚由仓库 workflow 自动更新。详见 [插件商店](../../plugins/store.md)。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/plugin-store` | 商店插件列表（合并元数据分片，按名称排序） |
| GET | `/api/v1/plugin-store/readme?path=` | 仓库内 `plugins/<name>/README.md` |
| GET | `/api/v1/plugin-store/avatar?path=` | 仓库内 `plugins/<name>/avatar.png`（`Cache-Control: no-store`，每次实时拉取，仓库更新后刷新可见） |
| POST | `/api/v1/plugin-store/install?path=` | 下载 `dist/<name>.zip` 并安装到 `data/pluggins/<name>/` |
| GET | `/api/v1/plugin-store/config` | 商店配置 + 镜像列表（`config`/`mirrors`） |
| PUT | `/api/v1/plugin-store/config` | 更新仓库配置（`repo_owner`/`repo_name`/`branch`） |
| POST | `/api/v1/plugin-store/mirror` | 添加自定义镜像（需含 `{path}` 占位符） |
| POST | `/api/v1/plugin-store/mirror/test` | 测试镜像连通性，返回 `latency_ms` |
| POST | `/api/v1/plugin-store/mirror/select` | 手动指定生效镜像源（空 = 恢复自动按序尝试） |
| DELETE | `/api/v1/plugin-store/mirror` | 删除自定义镜像 |

---

## 2. 知识库

SQL 驱动知识库：Web 存入知识条目，Agent 异步提取关键词；对话前按关键词/内容模糊匹配，命中结果注入系统提示词（LRU 50 条缓存加速）。

> `keyword_status`：`pending`（提取中，暂不参与匹配）→ `ready`（可匹配）→ `failed`（提取失败，可手动重试）。新增/编辑后自动异步提取关键词。

### GET /knowledge
分页列出。**Query** `page`（默认 1）、`page_size`（默认 20，上限 100）。

**data** `{total int64, list KnowledgeResp[]}`。

### GET /knowledge/:id
详情。**data** `KnowledgeResp`。

### POST /knowledge
新增，触发异步关键词提取。

**Body** `AddKnowledgeReq`: `title` string（可选）、`content` string（必填，非空否则 40033）。**data** `KnowledgeResp`（`keyword_status=pending`）。

### PUT /knowledge/:id
编辑，重新触发异步提取。**Body** `UpdateKnowledgeReq`（同 Add）。**data** `KnowledgeResp`。

### DELETE /knowledge/:id
删除（软删）。**data** `null`。

### POST /knowledge/:id/re-extract
手动重试关键词提取（`failed` 状态时用）。**data** `null`。

`KnowledgeResp`: `id`、`title`、`content`、`keywords` string[]、`keyword_status`、`created_at`、`updated_at`。

---

## 3. 图床

图片二进制存储在 `data/imgs`（`IMG_DIR` 可覆盖），元数据在 Postgres `image_assets` / `image_folders` 表。
虚拟文件夹仅一层：图片默认在根 `/`，根下可创建文件夹（如 `/meme`），文件夹下不能再建文件夹。

### 上传约束

- 大小 ≤ **1.5MB**（超出返回 40034）
- MIME 白名单：`image/jpeg` / `image/png` / `image/gif` / `image/webp`（以文件内容嗅探为准，不信任扩展名；不支持返回 40035）

### 消息引用（imgs://）

Plugin 与 Agent 发送消息时，用 `[CQ:image,file=imgs://<id>]` 引用图床图片。发送层（`internal/adapter`）
检测到 `imgs://` 前缀后自动从图床加载图片并转成 `base64://` 再发给 OneBot11 客户端——
对 Plugin / Agent 无感，无需关心 Onebot11 与机器人之间的网络互通。

### GET /images
分页列出。**Query** `folder`（默认 `/`）、`page`（默认 1）、`page_size`（默认 48，上限 100）。

**data** `{total int64, list ImageResp[]}`。

### GET /images/:id
图片元数据详情。**data** `ImageResp`。

### GET /images/:id/file
图片文件流（Web 预览用，响应 `Content-Type` 为该图片 MIME）。

### POST /images
上传图片。**multipart/form-data**：`file`（必填）、`name`（可选，默认文件名）、`folder`（可选，默认 `/`）。

**data** `ImageResp`。

### PUT /images/:id
编辑（重命名 / 移动文件夹）。**Body** `UpdateImageReq`: `name` string（可选）、`folder` string（可选，`/` 或 `/<name>`，目标文件夹需存在）。**data** `ImageResp`。

### DELETE /images/:id
删除（DB 软删 + 删除磁盘文件）。**data** `null`。

### GET /image-folders
列出全部虚拟文件夹。**data** `ImageFolderResp[]`。

### POST /image-folders
创建虚拟文件夹。**Body** `CreateImageFolderReq`: `name` string（必填，不能含 `/`，重名返回 40037）。**data** `ImageFolderResp`。

### DELETE /image-folders/:id
删除文件夹（其下图片自动移到根 `/`，不存在返回 40038）。**data** `null`。

`ImageResp`: `id`、`name`、`folder`（虚拟路径，`/` 为根）、`mime_type`、`size_bytes`、`created_at`、`updated_at`。
`ImageFolderResp`: `id`、`name`、`created_at`。

---

## 4. 表情包库

基于图床的二次封装：表情引用图床图片（`image_id` 长 UUID），对外暴露短 UUID（8 位 hex）作为表情 ID。
发送时用 `[CQ:image,file=stk://<短UUID>,subType=1]`（OneBot11 以 `subType=1` 区分表情与普通图片），
发送层（`internal/adapter`）自动把短 UUID 解析为图床长 UUID 并转 base64，Plugin / Agent 只接触表情 ID。

### Agent 工具

- `send_sticker`：单独发送表情（参数 `sticker_id` 短 UUID + 可选 `message_type`/`target_id`）
- `send_sticker_by_keyword`：**一步发送**——按关键词搜索表情包库并直接发送最匹配的一个（参数 `keyword` + 可选 `message_type`/`target_id`），接梗/回应情绪时优先使用
- `list_sticker_tags`：获取全部标签
- `list_stickers`：按标签分页获取表情（`tag`/`page`/`page_size`）
- `search_stickers`：关键词模糊匹配表情名称/简介/标签（`keyword`/`limit`）

### 每轮对话注入的表情包上下文

`handleMessage` 构建系统指令时会注入表情包上下文（`buildStickerContext`）：

1. **全部标签列表** → 引导 Agent 优先用 `send_sticker_by_keyword` 按意图发送，或 `list_stickers` 按标签浏览；
2. **「常用」标签下的表情（ID/名称/简介，最多 20 个）**，按表情自身标签分组 → Agent 命中场景时可直接用 `send_sticker + ID` 发送。

使用方式：「常用」为**系统内置标签**（启动时自动创建、不可删除）；把常用表情加入该标签即可。其余标签可自由创建/删除。没有「常用」标签内容时不注入对应部分。

### Plugin API

- `onebot11.send_group_sticker(group_id, sticker_id)`
- `onebot11.send_private_sticker(user_id, sticker_id)`
- 消息段方式：`{{type="image", data={file="stk://<短UUID>", subType=1}}}`

### GET /stickers
分页列出表情。**Query** `tag`（标签过滤）、`keyword`（名称/简介模糊匹配）、`page`（默认 1）、`page_size`（默认 24，上限 100）。

**data** `{total int64, list StickerResp[]}`。

### GET /stickers/:id
表情详情。**data** `StickerResp`。

### POST /stickers
新建表情。**Body** `CreateStickerReq`: `image_id` string（必填，图床图片长 UUID）、`name` string（必填）、`desc` string（可选）、`tags` string[]（可选）。
图床图片不存在返回 40036；已被其他表情引用返回 40042。**data** `StickerResp`（`id` 为短 UUID）。

### PUT /stickers/:id
编辑表情。**Body** `UpdateStickerReq`: `name` / `desc` / `tags`。**data** `StickerResp`。

### DELETE /stickers/:id
删除表情（软删，不影响图床图片）。**data** `null`。

### GET /sticker-tags
列出全部标签。**data** `StickerTagResp[]`。

### POST /sticker-tags
创建标签。**Body** `CreateStickerTagReq`: `name` string（必填，重名返回 40040）。**data** `StickerTagResp`。

### DELETE /sticker-tags/:id
删除标签（所有表情中的该标签一并移除，不存在返回 40041）。**data** `null`。

`StickerResp`: `id`（短 UUID）、`image_id`（图床长 UUID）、`name`、`desc`、`tags` string[]、`created_at`、`updated_at`。
`StickerTagResp`: `id`、`name`、`created_at`。

---

## 5. 摸鱼人日历

独立于 CronJob 系统的每日定时任务（`internal/agent/fishcal`）：按配置的 cron 表达式触发，
用模板组装日历内容 → 通过 T2I 服务渲染成 JPEG 图片 → 发送到目标群。

日历图片内容：标题 / 今日宜划水·忌内卷 / 日期与星期 / 农历（lunar-go）/ 本周进度 /
距下一个法定假日倒计时（内置 2025-2026 节假日表）/ 今日金句（[一言 API](https://v1.hitokoto.cn/)，失败回退内置句子）/ 今日群务 / 落款。

### GET /fish-calendar/config
读取配置（未初始化时写入默认配置）。**data** `FishCalendarConfigResp`。

### PUT /fish-calendar/config
更新配置并重新调度。**Body** `UpdateFishCalendarConfigReq`: `enabled` bool、`cron_expr` string（6 字段秒级 cron）、`target_groups` string[]（目标群号列表）。**data** `null`。

### POST /fish-calendar/trigger
手动触发一次立即生成并发送（测试用），失败返回 50000 + `error_detail`。**data** `null`。

### GET /fish-calendar/affairs
列出某月已配置的群务。**Query** `month`（必填，YYYY-MM）。**data** `FishCalendarAffairResp[]`。

### PUT /fish-calendar/affairs
设置某天群务（content 为空则清除当天）。**Body** `SetFishCalendarAffairReq`: `date` string（YYYY-MM-DD）、`content` string。**data** `null`。

`FishCalendarConfigResp`: `enabled`、`cron_expr`、`target_groups` string[]、`last_run_at`（可空）、`last_error`。
`FishCalendarAffairResp`: `date`、`content`。

发送消息为富文本：`今日份摸鱼人日历来了~` + 日历图片（800×720，黑白纸张质感模板，内容铺满）。

---

## 6. 定时消息

独立于 CronJob 系统的定时任务（`internal/agent/scheduledmsg`），采用**积木式编排**：
任务从触发器（cron 表达式）开始，按序执行编排块链，最后一个块执行完任务即结束。

编排块（`ScheduledBlockReq`）：

| type | 字段 | 说明 |
|------|------|------|
| `message` | `segments` | 消息块：块内所有段拼成**一条**富文本消息 |
| `delay` | `delay_seconds` | 延时块：等待 N 秒后继续下一个块（1~3600） |

消息块内的段（`ScheduledSegmentReq`）：

| type | source | content |
|------|--------|---------|
| `text` | - | 文字内容 |
| `image` | `t2i` | HTML 模板（T2I 服务渲染成图片） |
| `image` | `url` | 图片直链 |
| `image` | `imgstore` | 图床引用（`imgs://<图片ID>`，发送层自动转 base64） |
| `face` | - | CQ 码表情（如 `[CQ:face,id=66]`） |

### GET /scheduled-messages
分页列出。**Query** `page`、`page_size`（默认 20）。**data** `{total, list ScheduledMessageResp[]}`。

### GET /scheduled-messages/:id
任务详情。**data** `ScheduledMessageResp`。

### POST /scheduled-messages
新建任务。**Body** `AddScheduledMessageReq`: `name`、`enabled`、`cron_expr`（6 字段秒级触发器）、`target_type`（group/private）、`target_id`、`blocks` ScheduledBlockReq[]。**data** `ScheduledMessageResp`。

### PUT /scheduled-messages/:id
编辑任务。**Body** `UpdateScheduledMessageReq`（同 Add）。**data** `ScheduledMessageResp`。

### DELETE /scheduled-messages/:id
删除任务。**data** `null`。

### PUT /scheduled-messages/:id/toggle
启停任务。**Body** `{enabled bool}`。**data** `ScheduledMessageResp`。

### POST /scheduled-messages/:id/trigger
手动触发立即执行（沿块链顺序：消息块发一条消息，延时块等待）。**data** `null`。

`ScheduledMessageResp`: `id`、`name`、`enabled`、`cron_expr`、`target_type`、`target_id`、`blocks`、`last_run_at`、`last_error`、`created_at`、`updated_at`。

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
