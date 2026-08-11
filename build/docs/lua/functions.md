# 函数与闭包

> 函数是 Lua 里的一等公民。有两种写法，完全等价：

## 定义与调用

函数是 Lua 里的一等公民。有两种写法，完全等价：

```lua
-- 写法一：local function
local function add(a, b)
    return a + b
end

-- 写法二：匿名函数赋值给变量
local add = function(a, b)
    return a + b
end

print(add(1, 2))   -- 3
```

## return 可以返回多个值

Lua 的函数可以一次返回多个值，用逗号分隔：

```lua
local function minmax(a, b)
    if a < b then
        return a, b      -- 返回多个值
    else
        return b, a
    end
end

local lo, hi = minmax(3, 1)
print(lo, hi)   -- 1 3
```

### 多返回值在卷娘插件里非常关键

卷娘的命令 handler 和事件回调都靠**多返回值**来告诉引擎"这条消息要不要消费、要不要回复"：

```lua
-- 命令 handler：返回 (consumed, reply)
jn.command.register("hello", function(args, event)
    return true, "你好！"     -- 第 1 个 true 表示命令被处理，第 2 个是回复文本
end)
```

```lua
-- on_message 事件回调：返回 (consumed, skip_reply)
function on_message(event)
    if event.raw_message == "ping" then
        return true, false   -- 消费：这条消息不进 Agent
    end
    return false, false      -- 不消费
end
```

理解这两个返回值，是看懂卷娘插件代码的关键。详见 [插件开发指南](../plugins/quickstart.md)。

## 省略参数

函数定义时可以不列参数名，用 `...` 接收所有实参：

```lua
local function sum(...)
    local total = 0
    for _, v in ipairs({ ... }) do
        total = total + v
    end
    return total
end

print(sum(1, 2, 3, 4))   -- 10
```

## 闭包：函数能"记住"外层局部变量

Lua 的函数会捕获它定义时的外层局部变量，即使外层函数已经返回：

```lua
local function make_counter()
    local count = 0
    return function()
        count = count + 1      -- 记住并修改外层的 count
        return count
    end
end

local c = make_counter()
print(c())   -- 1
print(c())   -- 2
print(c())   -- 3
```

闭包在卷娘插件里常用来**按群隔离状态**。看 `redrock_group_manager` 的统计思路——每个群一个独立的 counter：

```lua
local function new_group_stats()
    local stats = {}
    return {
        add = function(kind)
            stats[kind] = (stats[kind] or 0) + 1
        end,
        get = function(kind)
            return stats[kind] or 0
        end,
    }
end

local warnings = new_group_stats()
warnings.add("spam")
print(warnings.get("spam"))   -- 1
```

## 高阶函数：函数作为参数/返回值

Lua 函数可以像值一样传递。卷娘插件里最典型的两个场景：

### 1. 匿名函数作为命令 handler

```lua
jn.command.register("ping", function(args, event)
    return true, "pong!"
end)
```

传给 `jn.command.register` 的就是一个匿名函数。

### 2. 用高阶函数做映射

```lua
local function map(tbl, fn)
    local result = {}
    for i, v in ipairs(tbl) do
        result[i] = fn(v)
    end
    return result
end

local nums = { 1, 2, 3 }
local doubled = map(nums, function(x) return x * 2 end)
-- doubled = { 2, 4, 6 }
```

## 本章小结

- `local function` 定义函数，可以返回多个值
- 卷娘的命令/事件回调靠多返回值传 `consumed` / `reply`
- 闭包能记住外层变量，用来做状态隔离
- 函数是一等公民，匿名函数、高阶函数很常用

下一步：[表（table）——Lua 的核心](tables)。
