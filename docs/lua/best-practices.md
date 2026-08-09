---
title: 常见坑与最佳实践
sidebar_position: 8
---

> 最后一章。把前面学的串起来，集中讲卷娘 Lua 插件开发里最容易踩的坑和推荐的写法。学完这一章，你就能读懂 `plugins/redrock_*` 的真实代码了。

## 坑 1：数组从 1 开始，不是 0

```lua
local t = { "a", "b" }
print(t[0])      -- nil！不存在
print(t[1])      -- "a"
```

## 坑 2：`#` 取长度在"空洞数组"上不可靠

如果数组中间有 `nil`，`#` 的结果是**未定义**的：

```lua
local t = { "a", nil, "c" }
print(#t)        -- 可能是 1 或 3，不可靠！
```

**建议**：数组里不要留 `nil` 空洞。要删元素用 `table.remove`，不要直接置 `nil`。

## 坑 3：不等于是 `~=` 不是 `!=`

```lua
if a ~= b then   -- 正确
-- if a != b    -- 错误，Lua 没有 !=
```

## 坑 4：没有 `++`、`+=`、`//` 等运算符

Lua 5.1 没有这些，自增要手写：

```lua
i = i + 1
```

## 坑 5：`and` / `or` 返回的是操作数

```lua
local x = false or "默认"      -- "默认"
local y = 0 or "默认"           -- 0（0 是真值！）
```

注意 Lua 里**只有 `nil` 和 `false` 是假值**，`0`、空字符串 `""` 都是真值！所以 `0 or "默认"` 得到 `0`。

## 坑 6：全局变量污染

卷娘每个插件虽然是独立 Lua 状态，但全局变量仍是共享命名空间。**务必用 `local`**：

```lua
local jn = require("jn")     -- 正确，局部
-- jn = require("jn")        -- 错误，污染全局
```

## 坑 7：异步 API 要配合回调，不要阻塞

卷娘里可能阻塞的 API（HTTP、T2I、沙箱、LLM）都有 `_async` 异步版本。**在事件循环里不要用同步版做慢操作**，否则会卡住整个插件：

```lua
--  ❌ 同步：会阻塞
local body = jn.http.get("https://example.com/api")

--  ✅ 异步：立即返回，完成时回调 on_http_response
jn.http.get_async("https://example.com/api", { my_ctx = "value" })

function on_http_response(req_id, ctx, result, err)
    if err then jn.log.warn("失败: " .. err) return end
    jn.log.info("拿到 " .. result.body)
end
```

详见 [插件 API 参考](../plugins/api-reference.md) 的异步章节。

## 坑 8：缓存/状态要先判空

从缓存或配置读出来的值可能是 `nil`，取用前先给默认值：

```lua
local reply = jn.cache.get("last_reply") or "默认回复"
local groups = jn.config.get("groups") or {}
```

## 最佳实践 1：用多返回值表达命令结果

命令 handler 返回 `(consumed, reply)`，事件回调返回 `(consumed, skip_reply)`。理解并善用：

```lua
jn.command.register("hi", function(args, event)
    return true, "你好！"     -- 消费了 /hi，回复"你好！"
end)
```

## 最佳实践 2：状态按群/用户隔离

游戏、计数器这类状态要按群隔离，别搞成全局共享。用"表 + 元表"或嵌套表：

```lua
local sessions = {}     -- group_id -> { 状态 }

function get_session(gid)
    if not sessions[gid] then
        sessions[gid] = { score = 0, wrong = 0 }
    end
    return sessions[gid]
end
```

需要跨重启保存的状态，用 `jn.cache`（Redis）或 `jn.database`（Postgres），别只存在模块级变量里。

## 最佳实践 3：命令优先于 on_message 监听

能用 `jn.command.register` 的命令式交互，就别用 `on_message` 手写解析。命令命中后自动不进 `on_message`，更清晰：

```lua
--  ✅ 推荐：注册命令
jn.command.register({"game", "start"}, function(args, event) ... end)

--  ❌ 不推荐：在 on_message 里手写 if 解析 "/game start"
```

## 最佳实践 4：词库/配置用数据文件，别硬编码

助手式插件把可配置的东西放 `config.yaml`（Web 面板可改），词库放 `words/*.txt` 或 `*.csv`，用 `jn.config.get` 读取：

```lua
local enabled = jn.config.get("enabled")           -- 开关
local reply = jn.config.get("reply_text") or "默认"
```

## 最佳实践 5：日志打清楚，方便排查

```lua
jn.log.info("收到命令，参数=" .. table.concat(args, ","))
jn.log.warn("配置缺失，使用默认值")
jn.log.error("HTTP 请求失败: " .. tostring(err))
```

日志会进 stdout 和前端 SSE 流（带 `[plugin:<name>]` 前缀），是排查问题的主要手段。

## 最佳实践 6：高危操作校验权限

禁言、踢人等操作前，检查 `event.admins` 或用命令的权限控制：

```lua
local function is_member(list, value)
    for _, v in ipairs(list or {}) do
        if tostring(v) == tostring(value) then return true end
    end
    return false
end

function is_admin(event)
    return is_member(event.admins, event.user_id)
end
```

（示意：`event.admins` 是系统管理员 QQ 号列表，见 [插件 API 参考](../plugins/api-reference.md)。）

## 一个综合范例：点歌词条插件

把本章要点综合成一个完整插件：

```lua
local jn = require("jn")

-- 本地词条表（也可从文件/配置读）
local SONGS = {
    { keyword = "晴天",  lyric = "故事的小黄花，从出生那年就飘着" },
    { keyword = "稻香",  lyric = "还记得你说家是唯一的城堡" },
}

-- 按关键词查词条
local function find_song(keyword)
    for _, song in ipairs(SONGS) do
        if song.keyword == keyword then
            return song
        end
    end
    return nil
end

-- 命令：/歌词 <关键词>
jn.command.register({"lyric"}, function(args, event)
    local keyword = args[1]
    if not keyword then
        return true, "用法：/歌词 <关键词>"
    end
    local song = find_song(keyword)
    if not song then
        return true, "没找到「" .. keyword .. "」的歌词～"
    end
    return true, song.keyword .. "：" .. song.lyric
end, { description = "查歌词", usage = "/歌词 <关键词>" })
```

这个插件用到了：`local` 变量、表、`ipairs` 遍历、函数、多返回值、`jn.command.register`。学完本章，你就能写出来了。

## 下一步

- 完整 API 参考：[插件 API 参考](../plugins/api-reference.md)
- 插件开发流程：[插件开发指南](../plugins/quickstart.md)
- 更多真实范例：[示例插件](../plugins/examples.md)
- 引擎原理：[插件引擎](../plugins/engine.md)