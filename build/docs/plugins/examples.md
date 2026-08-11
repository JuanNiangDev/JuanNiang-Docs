# 示例插件

> 学习插件开发最快的方式是读真实代码。JuanNiang 提供两套示例：

学习插件开发最快的方式是读真实代码。JuanNiang 提供两套示例：

1. **内置示例插件**（主项目 `data/pluggins/`）：10 个，覆盖全部插件 API，每个含 README.md
2. **Redrock 系列插件**（官方仓库 `plugins/redrock_*`）：真实生产插件，含多级命令、游戏、群管理等复杂模式

## 一、内置示例插件（data/pluggins/）

主项目仓库自带 10 个示例插件（不含 `sdk/` 与 `system/` 运行时资源），全部可运行、可参考：

| 插件 | 演示内容 | 核心 API |
|------|---------|---------|
| `hello-world` | 插件入门三件事：**命令注册、事件监听、日志/JSON** | `jn.command.register`、`on_message`、`log`、`json` |
| `ping` | 极简 `/ping` 命令 | `jn.command.register` |
| `http-tools` | HTTP 请求**同步 + 异步双示范**（一言 / wttr.in 天气 / httpbin 回显） | `http.get/post`、`http.get_async/post_async`、`on_http_response` |
| `data-store` | 数据持久化：**Redis 缓存 + Postgres 数据库** | `cache.*`、`database.*` |
| `memo` | 便签：**插件目录文本文件读写**，每用户一个文件、一行一条 | `jn.file.*` |
| `group-manager` | 群管理：**高危操作带 admin 权限校验** + 入群欢迎 + 好友申请处理 | `on_notice`、`on_request`、`onebot11.ban_group_member` 等 |
| `media-gen` | 媒体生成**同步 + 异步双示范**：**T2I 文生图 + Sandbox 代码沙箱** | `t2i.*`、`sandbox.*`、异步回调 |
| `rich-message` | 富文本消息与查询：**消息段数组**（文字/@/图片/表情）、群信息查询、图床表情发送 | `onebot11.send_group_msg(段数组)`、`get_group_info` |
| `agent-ops` | Agent 运行时管理：**多级命令**（`/agent xxx`）+ **agent API 全家桶** | `jn.agent.*`（配置查询 + 运行时切换） |
| `webhook-cron` | 外部集成：**Webhook 接收外部 HTTP 触发** + **CronJob 定时触发** | `on_webhook`、`on_cronjob` |

> 推荐阅读顺序：`hello-world` → `ping` → `http-tools` → `data-store` → `memo` → `media-gen` → `agent-ops` → `webhook-cron`。每个插件的 `README.md` 都含文件结构与逐段讲解。

## 二、Redrock 系列插件（官方仓库）

官方插件仓库的 `plugins/redrock_*` 是**红岩网校生产环境实际运行**的插件集合，展示了真实项目的复杂模式（状态隔离、多插件协调、持久化等）。完整文档见插件仓库 `docs/redrock-plugins.md`。

| 插件 | 类型 | 功能 |
|------|------|------|
| `redrock_welcome` | `on_notice` | 入群欢迎：@新人 + 海报 |
| `redrock_faq` | `on_message` + 命令 | 关键词问答 + 语料库（19 条闲聊 + 17 条部门问答） |
| `redrock_special` | `on_message` | 卷娘彩蛋（年龄/身高/体重…随机图片回复） |
| `redrock_caidanci` | `on_message` + 命令 | 猜单词游戏（Wordle 规则，62 词库） |
| `redrock_caidanci_grade` | 命令 | 分级猜单词小游戏（高考/四级/六级/考研/雅思/托福/GRE 七档难度，Wordle 规则，T2I 渲染棋盘，37151 词条） |
| `redrock_quiz` | 命令 | 红岩知识快问快答（Postgres KV 表持久化） |
| `redrock_code` | `on_message` + 命令 | 在线代码运行（Judge0，43 种语言） |
| `redrock_poke` | `on_notice` | 戳一戳回复（18 条，防连续重复） |
| `redrock_group_manager` | `on_message` + `on_notice` + 命令 | 群管理：黑/灰/敏感三地带检测（灰色词异步 LLM 审查）+ 三级惩罚 + `/豁免` 系列命令 + `/groupstats` |
| `redrock_cron_msg` | `on_cronjob` | 定时消息（多群，Payload JSON 配置） |
| `redrock_fanzha` | 命令 | 开学季反诈提醒（`/反诈提醒` / `/全体反诈提醒`，限流） |

### 值得借鉴的设计

- **多插件协调**：`无聊`/`emo` 等关键词有明确的归属插件（见语料库交叉引用表），避免两个插件对同一关键词给出不同回复
- **状态按群/用户隔离**：游戏状态用模块级 Lua 表按群隔离；`redrock_quiz` 用 Postgres KV 表（`INSERT ... ON CONFLICT`）保证重启不丢
- **命令优先于监听**：`/xxx` 命令命中后不再走 `on_message`，命令式交互用 `jn.command.register`，纯监听用 `on_message`
- **权限校验**：高危操作（禁言/踢人）检查 `event.admins`；管理员豁免敏感词检测
- **加载顺序**：`welcome` / `group_manager` 优先（事件拦截），`faq` 居中（高命中率），游戏类靠后

## 三、动手实践

1. 在 Web 面板「插件」页启用内置示例，观察日志与行为
2. 对照 [插件开发指南](quickstart.md) 逐段理解 `hello-world/main.lua`
3. 用 `hago init` 创建你自己的插件（见 [官方插件仓库](repo.md)）
4. 逐步替换 `on_message` 里的分支，改为 `jn.command.register` 多级命令
5. 需要慢操作（HTTP/T2I/LLM）时改用 `xxx_async` + `on_xxx_response` 回调，避免阻塞事件循环
