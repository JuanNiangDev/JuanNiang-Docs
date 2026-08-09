---
title: 模块与 require
sidebar_position: 7
---

> 写完的代码不能全堆在一个文件里。Lua 用 `require` 加载模块，把公共代码抽出来复用。卷娘插件里你几乎天天见 `local jn = require("jn")`——这就是加载卷娘 SDK 模块。

## require 怎么用

`require("模块名")` 会加载并**执行**指定模块文件，返回它的返回值：

```lua
local jn = require("jn")
```

`require` 做的事：

1. 在 `package.path` 里按名字找 `.lua` 文件
2. 执行该文件
3. 若有返回值，返回它；否则返回 `true`
4. **只加载一次**，之后连同表一起缓存，重复 `require` 拿到同一个模块

## 写一个自己的模块

一个模块文件其实就是**一个返回表的 Lua 文件**。新建 `utils.lua`：

```lua
-- utils.lua
local M = {}

function M.contains(tbl, value)
    for _, v in ipairs(tbl) do
        if v == value then return true end
    end
    return false
end

function M.pick_random(tbl)
    return tbl[math.random(#tbl)]
end

return M
```

在 `main.lua` 里加载使用：

```lua
-- main.lua
local utils = require("utils")

print(utils.contains({ 1, 2, 3 }, 2))    -- true
```

## 卷娘的 SDK 模块：jn

卷娘把整套插件 API 封装进了 `jn` 模块，你的插件用它拿所有功能：

```lua
local jn = require("jn")

jn.log.info("插件启动")            -- 日志
jn.json.encode({ a = 1 })          -- JSON 序列化
jn.onebot11.send_group_msg(gid, "hi")   -- 发群消息
jn.cache.set("key", value, 60)     -- Redis 缓存
jn.database.query("SELECT 1")      -- 数据库查询
```

`jn` 模块里的字段其实就是 Go 注入的全局表（见 [插件开发指南](../plugins/quickstart.md) 的 SDK 对照表）：

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
| `jn.llm` | `llm` | LLM 调用 |
| `jn.file` | `file` | 插件目录内文件读写 |
| `jn.command` | — | 命令注册 |

## 模块的好处：复用 + 隔离

真实插件会把"词库/配置/工具函数"抽成单独模块或用局部表管理。看 `redrock_group_manager` 的思路——把词库处理逻辑抽成独立文件，`main.lua` 只负责流程：

```lua
-- words.lua（示意）
local M = {}

function M.load_from_files(paths)
    local set = {}
    for _, path in ipairs(paths) do
        local content = jn.file.read(path)
        for line in content:gmatch("[^\r\n]+") do
            set[line] = true
        end
    end
    return set
end

function M.contains(set, word)
    return set[word] == true
end

return M
```

```lua
-- main.lua（示意）
local words = require("words")

local black = words.load_from_files({ "words/black.txt" })
if words.contains(black, msg) then
    -- 触发惩罚
end
```

## package.path：模块去哪找

`require` 按 `package.path` 里的路径模板找文件。卷娘启动时会给插件追加 `sdk/?.lua`，所以 `require("jn")` 能找到 `data/pluggins/sdk/jn.lua`。

你也可以在插件里看到/修改查找路径：

```lua
print(package.path)
-- 追加一个目录：
package.path = package.path .. ";/path/to/modules/?.lua"
```

## 本章小结

- `require("模块名")` 执行并缓存模块文件，返回表的写法最常见
- 模块文件 = 一个 `return M` 的表
- 卷娘的 `jn` 就是 SDK 模块，封装了全部插件 API
- 用模块把词库、工具、配置抽出来，`main.lua` 保持简洁

下一步：[常见坑与最佳实践](best-practices)。