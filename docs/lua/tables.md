---
title: 表（Table）—— Lua 的核心
sidebar_position: 5
---

> 这一章是最重要的。Lua 里**没有数组、没有字典、没有对象**——这些统统用一个叫 **table（表）** 的数据结构搞定。学透表，就学透了一半 Lua。

## 表是什么

表是 Lua 唯一的复合数据结构。它同时是：

- **数组**（用数字做索引）
- **字典/映射**（用字符串做键）
- **对象**（配合元表，见下章）

创建表用花括号 `{}`：

```lua
local t = {}          -- 空表
```

## 表作为数组（数字索引）

```lua
local fruits = { "苹果", "香蕉", "橙子" }

print(fruits[1])      -- 苹果
print(fruits[2])      -- 香蕉
print(fruits[3])      -- 橙子
```

> **注意**：Lua 的数组索引**从 1 开始**，不是 0！这是新手最常见的坑。

```lua
local fruits = { "苹果", "香蕉", "橙子" }
print(fruits[0])      -- nil，根本不存在！Lua 数组从 1 开始
```

取数组长度用 `#`：

```lua
local fruits = { "苹果", "香蕉", "橙子" }
print(#fruits)        -- 3
```

## 表作为字典（字符串键）

```lua
local user = {
    name = "卷娘",
    age = 18,
    hobby = "写代码",
}

print(user.name)      -- 卷娘
print(user["name"])   -- 卷娘（两种写法等价）
```

两种访问方式：

```lua
user.name        -- 点号，键是标识符
user["name"]     -- 方括号，键可以任何值（含变量）
```

当键是变量或特殊字符串时，必须用方括号：

```lua
local key = "age"
print(user[key])       -- 18，用变量做键

local t = {}
t["hello world"] = 1   -- 键含空格，用方括号
```

## 表可以混合键类型

表和数组可以混在一个表里：

```lua
local mixed = {
    "第一个元素",        -- 数字键 1
    name = "卷娘",       -- 字符串键 name
    [10] = "十",         -- 显式数字键 10
}
```

## 增删改查

```lua
local t = {}

-- 新增
t.x = 1
t["y"] = 2
table.insert(t, "数组元素")        -- 在数字索引末尾追加

-- 查询
print(t.x)              -- 1
print(t["y"])           -- 2
print(t[1])             -- "数组元素"

-- 修改
t.x = 100

-- 删除（赋值为 nil）
t.x = nil
```

> 在 Lua 里，**给键赋 `nil` 就是删除**。没有 `delete` 关键字。

## 遍历表

遍历数组用 `ipairs`，遍历键值表用 `pairs`：

```lua
-- 数组：有顺序
local fruits = { "苹果", "香蕉" }
for i, v in ipairs(fruits) do
    print(i, v)
end

-- 字典：无顺序
local user = { name = "卷娘", age = 18 }
for k, v in pairs(user) do
    print(k, v)
end
```

## 常用 table 库函数

| 函数 | 作用 |
|------|------|
| `table.insert(t, v)` | 数组末尾追加 |
| `table.insert(t, i, v)` | 在位置 i 插入 |
| `table.remove(t)` | 移除并返回末尾元素 |
| `table.remove(t, i)` | 移除并返回位置 i 的元素 |
| `table.concat(t, sep)` | 把数组元素用 sep 拼成字符串 |
| `#t` | 数组长度 |

`table.concat` 在卷娘插件里拼回复时很常用：

```lua
local tags = { "高考", "四级", "六级" }
local s = table.concat(tags, " / ")
-- s = "高考 / 四级 / 六级"
```

## 表是引用类型

表赋值、传参都是**传引用**，不是拷贝：

```lua
local a = { x = 1 }
local b = a              -- b 和 a 指向同一个表
b.x = 100
print(a.x)               -- 100！a 也被改了

-- 想复制一份需要用循环手动拷贝
local function shallow_copy(t)
    local copy = {}
    for k, v in pairs(t) do
        copy[k] = v
    end
    return copy
end
```

这在写插件时要小心：把表存进缓存、再取出来判断，别误改共享状态。

## 表的嵌套：树状结构

表可以嵌表，形成复杂结构。卷娘的 `pluggin.yaml` 展开后就是这种结构：

```lua
local plugin_info = {
    name = "my-plugin",
    permissions = { "onebot11", "cache" },
    meta = {
        author = "me",
        version = "1.0.0",
    },
}

print(plugin_info.meta.author)              -- me
print(plugin_info.permissions[1])           -- onebot11
```

## 一个综合例子：命令参数表

卷娘命令的 handler 收到的 `args` 就是一个表：

```lua
-- 用户发送：/weather 重庆 明天
jn.command.register("weather", function(args, event)
    local city = args[1] or "北京"      -- "重庆"
    local day  = args[2] or "今天"      -- "明天"
    return true, city .. " " .. day .. " 晴"
end, { description = "查天气", usage = "/weather <城市> <日子>" })
```

这里 `args` 是 `{ "重庆", "明天" }`，用 `args[1]`、`args[2]` 取。

## 本章小结

- 表同时是数组、字典、对象，数组**从 1 开始**
- `#` 取长度，`ipairs` 遍历数组、`pairs` 遍历键值
- 赋 `nil` 即删除，`table.insert/remove/concat` 常用
- 表是引用类型，注意别误改共享状态

下一步：[元表与面向对象](metatables)。