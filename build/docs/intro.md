# 项目简介

> > 复活吧卷娘 — 基于 OneBot11 协议的 LLM QQ 聊天 Agent

> 复活吧卷娘 — 基于 OneBot11 协议的 LLM QQ 聊天 Agent

***JuanNiang-Neo 是一个以 Go 1.25 构建的 QQ 机器人项目，红岩网校的吉祥物卷娘。***

核心由 LLM 驱动的对话 Agent（`HagoCenter` 聚合 Provider / MCP / Memory / Prompt / Session / Skill / Tool）与 OneBot11 反向 WebSocket 适配器组成，基于 [Eino ADK](https://github.com/cloudwego/eino) 框架构建 `ChatModelAgent`，工具调用在 ReAct 循环内同步执行，每个聊天区域最多 8 个 Agent goroutine 并发处理（由 `ConcurrencyManager` 控制）。事件流经三阶段管线：Plugin 拦截 → 回复策略检查 → 异步派发 Agent。项目同时包含 Lua 插件引擎、Vue 3 管理面板，以及 Postgres + Redis + Sandbox + T2I 等可插拔基础设施，并内置知识库、图床、表情包库、摸鱼人日历、定时消息（积木式编排）等开箱即用的功能模块。所有持久化状态落 Postgres + Redis，配置与运行时状态均可在 Web 面板热切换。

## 主要特性

- **Agent 系统**：基于 Eino ADK 的 `ChatModelAgent`（OpenAI 兼容），支持 Provider / MCP / Tool / Skill / Prompt / Plugin 多模块组合，工具调用在 ReAct 循环内同步完成
- **异步并发处理**：`ConcurrencyManager` 控制每 ChatArea 最多 8 个 Agent goroutine 并发，事件经三阶段管线（Plugin 拦截 → 回复策略 → Agent 派发）高效分流
- **相关性回复优化**：`relevance` 策略下 @/命令/提及名字必回、噪音消息规则过滤、候选消息批量合并为一次 LLM 判断，带 Redis 结果缓存/冷却、并发限流与刷屏自动降级，热聊场景判断开销降至原来的 ~1/10
- **四层记忆体系**：短期记忆（Redis 滑动窗口，默认 100 条，自动 Compact）/ 长期记忆（Postgres + 内存 LRU）/ 技能记忆（SkillMemory，Compact 时自动提取）/ 会话记录（Postgres 审计）
- **OneBot11 反向 WebSocket 适配器**：与 QQ 机器人框架对接，OneBot11 API 作为 Agent 工具注册
- **Lua 插件系统**：gopher-lua 驱动，支持多级命令、Lua SDK（带 LuaCATS 注解）、插件目录文本文件读写（`jn.file`）、系统插件保护
- **插件商店**：从 GitHub 仓库浏览/安装社区插件（统一 5 件套格式），国内镜像源手动选择 + 连通性测试，每晚自动更新元数据；插件动态配置（bool/string/list）由 Web 面板按 `config.yaml` 动态渲染
- **Web 管理后台**：Vue 3 + Vuetify 3，JWT 鉴权（可选 OIDC SSO），管理全部配置与运行时状态
- **基础设施**：Postgres 持久化 + Redis 缓存 + Sandbox 代码沙箱 + T2I 文生图，未配置时自动返回未启用提示
- **彩色日志系统**：基于 `fatih/color` 的自定义日志，彩色输出、JSON 自动格式化、WARN+ 调用栈、模块日志器、GORM SQL 日志集成
- **SQL 驱动知识库**：Web 存知识 → Agent 异步提取关键词 → 对话前模糊匹配注入提示词；50 条 LRU 加速检索
- **图床服务**：`data/imgs` 存储 + MIME/大小校验 + 虚拟文件夹；`imgs://<ID>` 引用由发送层自动转 base64（Plugin / Agent 无感）
- **表情包库**：图床二次封装（名称/简介/标签）；短 UUID 对外，`stk://` 引用自动映射图床长 UUID（表情段 subType=1）；Agent 工具 + Plugin API 齐备
- **摸鱼人日历**：独立每日定时任务，模板 → T2I 渲染 800×720 黑白纸张质感图片 → 富文本发送（不 @全体成员）；多群、按天群务、一言金句、农历/法定假日倒计时
- **定时消息（积木式编排）**：触发器 → 消息块（一条消息多段：文字 / 图片[T2I·URL·图床] / CQ 表情）→ 延时块链；Web 可视化编排 + 325 个 CQ 表情缩略图
- **示例插件库**：`data/pluggins/` 下 10 个示例插件覆盖全部插件功能（含 `xxx_async` 异步调用示范），每个含 README.md
- **开发配置**：`dev.yaml` 本地开发配置文件（数据库、Redis、OneBot11 等），`make run` 自动读取

## 技术栈

| 层 | 技术 |
|----|------|
| 语言 | Go 1.25、Lua（gopher-lua 插件）、TypeScript / Vue 3 |
| Agent 框架 | [Eino ADK](https://github.com/cloudwego/eino)（`adk.ChatModelAgent` + `adk.Runner`） |
| Web 框架 | Hertz（Go）+ Vite 6 + Vuetify 3（前端） |
| 存储 | PostgreSQL（持久化）+ Redis（缓存 / 短期记忆 / PubSub） |
| 协议 | OneBot11 反向 WebSocket |
| 基础设施 | Sandbox 代码沙箱、T2I 文生图（可插拔，未配置自动降级） |

## 相关仓库

| 仓库 | 说明 |
|------|------|
| [JuanNiang-Neo](https://github.com/JuanNiangDev/JuanNiang-Neo) | 主项目：机器人本体 + Web 管理面板（Go + Vue） |
| [JuanNiang-Plugins](https://github.com/JuanNiangDev/JuanNiang-Plugins) | 官方插件仓库：插件源码 + 商店元数据 + `hago` 脚手架 CLI |

## 从哪开始？

- 想**立刻跑起来** → [快速开始](quickstart.md)
- 想**部署到生产** → [部署与调试指南](deployment.md)
想**改主项目代码** → [本地开发环境](development/setup.md) 与 [开发指南](development/development.md)
- 想**给卷娘写插件** → [插件开发指南](plugins/quickstart.md)

> 详细架构（Eino ADK Agent / 三阶段事件循环 / 数据模型 / 插件系统）见 [架构与设计](development/architecture.md)。
