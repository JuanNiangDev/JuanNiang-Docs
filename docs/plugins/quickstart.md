---
title: 插件开发指南（快速开始）
---


本文档整合 JuanNiang-Neo Lua 插件的开发流程、API 参考与引擎实现细节，是二次开发插件的完整参考。插件系统的架构概览见 [架构文档](../development/architecture.md#四插件系统)。


## 1. 创建插件目录

每个插件是 `data/pluggins/<plugin-name>/` 下的一个独立目录，至少含 `pluggin.yaml`（清单）和 Lua 入口（默认 `main.lua`）。

```
data/pluggins/
└── my-hello/
    ├── pluggin.yaml
    └── main.lua
```

## 2. 编写 manifest — `pluggin.yaml`

```yaml
name: my-hello
version: "1.0.0"
author: me
description: "示例插件：回复 hello 命令"
entry: main.lua
system: false
enabled: true
permissions:
  - onebot11
  - cache
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `ppid` | string | 稳定 UUID（空时自动生成并写回） |
| `name` | string | 必须与目录名一致（作为 `id`） |
| `version` | string | 默认 `"1.0.0"` |
| `author` / `description` | string | 元数据 |
| `entry` | string | Lua 入口，默认 `main.lua` |
| `permissions` | string[] | 申请的权限，决定哪些全局表被注入 |
| `system` | bool | 系统插件（undeletable / unstoppable），仅内置 `system` 用 |
| `enabled` | bool | 是否在 `LoadAll` 时加载 |

## 3. 编写入口 — `main.lua`

```lua
local jn = require("jn")

-- 注册命令 /hello
jn.command.register("hello", function(args, event)
    return true, "你好，" .. (event.user_id or "陌生人") .. "！"
end, { description = "打招呼", usage = "/hello" })

-- 消息事件回调（返回 consumed, skip_reply）
-- consumed=true → 消息不进 Agent（不短路，其余插件仍会执行）
-- skip_reply=true → 跳过回复策略检查，强制进入 Agent
function on_message(event)
    if event.raw_message == "ping" then
        return true, false  -- 消费：不进 Agent
    end
    return false, false
end

-- webhook 事件回调（需在 permissions 申请 webhook）
function on_webhook(event)
    jn.log.info("webhook payload received")
    return false, nil
end
```

## 4. 部署

- **本地开发**：放目录进 `data/pluggins/`，重启进程或在 Web API 上 `POST /plugins/upload`（ZIP）或 `PUT /plugins/:id/toggle` 启用。
- **Docker 部署**：通过 `docker-compose.yaml` 的 `../data/pluggins:/app/data/pluggins` bind-mount 注入；镜像升级不丢插件（注意 `system/` 子目录由二进制在每次启动覆盖，勿修改）。
- **热加载**：`PUT /plugins/:id/toggle` 触发 Load/Unload；改了 Lua 源码后 toggle 先停再启即可（暂无单文件 reload API，整个插件 Reload）。

## 引入 SDK

```lua
local jn = require("jn")

-- jn.<table>.<func> 与全局 <table>.<func> 完全等价，可混用
jn.log.info("插件启动")    -- 推荐写法（IDE 有提示 via LuaCATS）
log.info("插件启动")        -- 等价
```

SDK 仅是 Go 注入全局表的再导出（`jn.log = log` 等），不引入额外行为。

| SDK 字段 | 全局表 | 说明 |
|----------|--------|------|
| `jn.log` | `log` | 日志 |
| `jn.json` | `json` | JSON |
| `jn.onebot11` | `onebot11` | OneBot11 协议 |
| `jn.http` | `http` | HTTP 请求 |
| `jn.database` | `database` | 数据库 |
| `jn.cache` | `cache` | Redis 缓存 |
| `jn.t2i` | `t2i` | 文生图 |
| `jn.sandbox` | `sandbox` | 代码沙箱 |
| `jn.agent` | `agent` | Agent 操作接口 |
| `jn.llm` | `llm` | LLM 调用（复用 Bot Provider 配置） |
| `jn.file` | `file` | 插件目录内文本文件读写 |
| `jn.command` | — | 命令注册 |

## 注册命令

`jn.command.register(path, handler, opts)`：

- `path`：string 或 table，多级命令如 `"system provider switch"` 或 `{"system","provider","switch"}`
- `handler`：Lua 函数 `(argsTable, eventTable) → (consumedBool, replyString)`
- `opts`：`{ description = "...", usage = "..." }`

最长前缀匹配；未命中 handler 但停在非根节点时返回该节点子命令列表。`/help` 列出所有顶级命令；`/help <cmd> [sub...]` 列子命令。

```lua
-- 多级命令
jn.command.register({"weather", "today"}, function(args, event)
    local city = args[1] or "北京"
    return true, city .. "今日晴"
end, { description = "查今日天气", usage = "/weather today <city>" })

-- /weather today 重庆 → "重庆今日晴"
```

## 打包上传

把整个插件目录打成 ZIP（目录在根），调用 `POST /api/v1/plugins/upload`：

```bash
cd data/pluggins
zip -r my-hello.zip my-hello
curl -X POST http://localhost:8090/api/v1/plugins/upload \
  -H "Authorization: Bearer <token>" -F "file=@my-hello.zip"
```

## 系统插件示例

内置 `system` 插件（`internal/pluggin/systemplugin/`）展示了完整用法，命令包括：

- `/system status` — 系统总览
- `/system provider list|switch <id>`
- `/system mcp list|toggle <id>`
- `/system tool list|toggle <name>`
- `/system memory compact`
- `/system t2i status|toggle on|off`
- `/system sandbox status|toggle on|off`
- `/system session list|info`

可用它作为多级命令 + 调用 agent 接口的范本。

## 调试

- 日志：`jn.log.*` 输出会进 stdout 与前端 SSE 流（带 `[plugin:<name>]` 前缀）
- `GET /api/v1/logs/stream` 实时查看
- `GET /api/v1/plugins` 看到每个插件注册的 `commands` 列表
- Web 面板"插件"页可直接 toggle 启停，无需改 `pluggin.yaml`

---
