---
title: 控制流
sidebar_position: 3
---

## 条件判断：if / elseif / else

```lua
local score = 85

if score >= 90 then
    print("优秀")
elseif score >= 60 then
    print("及格")
else
    print("不及格")
end
```

要点：

- 用 **`then`** 开头、**`end`** 结尾（没有花括号 `{}`）
- 是 **`elseif`** 连写，不是 `else if`
- 卷娘插件里经常用 `if event.message_type == "group" then` 判断消息是群聊还是私聊：

```lua
if event.message_type == "group" then
    return true, "这是群里的消息"
else
    return true, "这是私聊"
end
```

## while 循环

```lua
local i = 1
while i <= 3 do
    print(i)
    i = i + 1      -- Lua 5.1 没有 i++，要自己加
end
-- 输出 1 2 3
```

## repeat until 循环

Lua 特有：**先执行一次，再判断条件**。

```lua
local i = 1
repeat
    print(i)
    i = i + 1
until i > 3
-- 输出 1 2 3
```

## 数字 for 循环

```lua
-- 从 1 到 3，默认步长 1
for i = 1, 3 do
    print(i)
end
-- 输出 1 2 3

-- 指定步长
for i = 1, 10, 3 do
    print(i)
end
-- 输出 1 4 7 10

-- 倒着数
for i = 3, 1, -1 do
    print(i)
end
-- 输出 3 2 1
```

## 泛型 for 循环（遍历表）

这是遍历表的核心写法，两个常用方式：`ipairs` 和 `pairs`。

### ipairs：遍历数组部分（有顺序）

```lua
local fruits = { "苹果", "香蕉", "橙子" }
for i, v in ipairs(fruits) do
    print(i, v)
end
-- 输出：
-- 1   苹果
-- 2   香蕉
-- 3   橙子
```

`ipairs` 从 1 开始，只遍历连续的整数键，遇到 `nil` 就停。

### pairs：遍历所有键（无顺序）

```lua
local config = { name = "卷娘", age = 18 }
for k, v in pairs(config) do
    print(k, v)
end
-- 输出顺序不保证：
-- name  卷娘
-- age   18
```

`pairs` 遍历表里所有键值对，但不保证顺序。遍历"字典"型表必须用它。

在卷娘插件里，遍历事件或配置经常用：

```lua
-- 遍历消息里的所有参数
for i, arg in ipairs(args) do
    jn.log.info("参数 " .. i .. " = " .. arg)
end
```

## break 与 return

```lua
for i = 1, 10 do
    if i == 5 then
        break        -- 跳出循环
    end
end

return   -- 退出当前函数/文件
```

## 一个结合卷娘的完整例子

写一个命令，逐个列出某群里的几条规则：

```lua
local jn = require("jn")

local RULES = {
    "1. 禁止刷屏",
    "2. 禁止广告",
    "3. 互相尊重",
}

jn.command.register("rules", function(args, event)
    local reply = "本群规则：\n"
    for _, rule in ipairs(RULES) do
        reply = reply .. rule .. "\n"
    end
    return true, reply
end, { description = "查看群规", usage = "/rules" })
```

这里就用到了 `for ... in ipairs` 遍历数组，再用 `..` 拼出一个多行回复。

## 本章小结

- `if ... then ... elseif ... then ... else ... end`
- 三种循环：`while`、`repeat until`、`for`
- 遍历数组用 `ipairs`，遍历键值表用 `pairs`
- Lua 用 `end` 结束块，没有花括号

下一步：[函数与闭包](functions)。