# 语法基础

> ```lua
-- 单行注释：两个减号

## 注释

```lua
-- 单行注释：两个减号

--[[
  多行注释：两个减号 + 两个方括号
  可以跨多行
]]
```

卷娘的插件代码里，头部通常是一大段 `--[[ ... ]]` 描述插件用途、命令和权限，然后是 `-- 单行注释` 说明每一段干什么。

## 变量

Lua 的变量**不需要声明类型**，第一次赋值就创建：

```lua
name = "卷娘"          -- 字符串
age = 18               -- 数字
height = 1.65          -- 数字（浮点）
is_active = true       -- 布尔
```

> **注意**：Lua 里**没有 `undefined` 或 `null`**，用 `nil` 表示"什么都没有"。一个变量没赋值时就是 `nil`。

### local：局部变量（强烈建议）

```lua
local x = 10           -- 局部变量
y = 20                 -- 全局变量（不推荐！）
```

**在卷娘插件里，几乎所有的变量都应该用 `local` 声明**。原因有二：

1. 卷娘的插件引擎把每个插件加载进独立的 Lua 状态，但**全局变量没有名字隔离**——你用 `temp = 1`，别的插件也用 `temp`，就会互相覆盖出 bug。
2. 局部变量访问更快、更安全。

看真实插件 `redrock_faq` 的开头：

```lua
local jn = require("jn")

local FAQ = {
    "卷娘是谁？",
    "红岩网校是什么？",
}
```

这里 `jn`、`FAQ` 都是 `local`。养成习惯：**能用 local 就用 local**。

## 基本类型

Lua 有 8 种基本类型，卷娘插件里常用这几种：

| 类型 | 例子 | 说明 |
|------|------|------|
| `nil` | `nil` | 什么都没有 |
| `boolean` | `true` / `false` | 布尔 |
| `number` | `18` / `1.65` | 数字（Lua 5.1 里整数小数都是 number） |
| `string` | `"卷娘"` | 字符串 |
| `table` | `{}` | 表——Lua 唯一的数据结构（见 [表](tables)） |
| `function` | `function() end` | 函数（见 [函数](functions)） |

用 `type(x)` 可以查到变量的类型：

```lua
print(type("hi"))     -- string
print(type(18))       -- number
print(type(true))     -- boolean
print(type(nil))      -- nil
print(type({}))       -- table
print(type(print))    -- function
```

## 运算符

### 算术

```lua
local a, b = 7, 2
a + b   -- 9
a - b   -- 5
a * b   -- 14
a / b   -- 3.5
a % b   -- 1（取余）
a ^ b   -- 49（幂）
```

> **注意**：Lua 5.1 里 `a / b` 永远返回小数（`7/2 == 3.5`），没有语言的整数除法。5.1 也没有 `++`、`+=`、`//` 这些运算符——自增要写 `i = i + 1`。

### 比较

```lua
==   ~=   <   >   <=   >=
```

注意：**不等于 是 `~=`，不是 `!=`**！

```lua
if 1 ~= 2 then print("不相等") end     -- 正确
-- if 1 != 2 then ... end             -- 错误！Lua 没有 !=
```

### 逻辑

```lua
and   or   not
```

Lua 的 `and` / `or` 返回的是**操作数本身**，不是固定的 true/false：

```lua
local x = nil
local y = x or "默认值"      -- y 是 "默认值"（x 为 nil 时取 or 的右边）
local z = x and "有值"       -- z 是 nil（x 为 nil 时 and 短路返回 x）
```

这在卷娘插件里非常常用，用来给配置给默认值：

```lua
local reply_text = jn.config.get("reply_text") or "pong!"
-- 配置里没写 reply_text 就用 "pong!"
```

### 字符串拼接

```lua
local name = "卷娘"
local msg = "你好，" .. name .. "！"     -- "你好，卷娘！"
```

字符串拼接用**两个点 `..`**，不是 `+`：

```lua
"卷娘" .. "最棒"          -- "卷娘最棒"
"数量：" .. 18            -- "数量：18"（数字会被转成字符串）
```

## 字符串

### 三种写法

```lua
local s1 = "双引号字符串"
local s2 = '单引号字符串'          -- 跟双引号等价
local s3 = [[
多行字符串
可以含有 "双引号" 和 '单引号'
]]                              -- 长括号，常用在多行 SQL 或模板
```

卷娘插件里，`[[ ]]` 长括号常用来写多行 SQL：

```lua
jn.database.exec([[
    CREATE TABLE IF NOT EXISTS my_plugin_state (
        k TEXT PRIMARY KEY, v TEXT NOT NULL
    )
]])
```

### 常用函数

```lua
string.len("hello")        -- 5，或 #"hello"
string.upper("abc")        -- "ABC"
string.lower("ABC")        -- "abc"
string.sub("hello", 1, 3)  -- "hel"（从第 1 到第 3 个字符）
string.format("%d 分", 10) -- "10 分"（类似 printf）
string.match("abc123", "%d+")  -- "123"（正则匹配，见下）
```

### 取长度：`#`

```lua
local s = "hello"
#s       -- 5
```

`#` 是 Lua 的长度运算符，对字符串返回字符数，对数组返回元素个数（见 [表](tables)）。

### 一点正则（pattern）

Lua 的字符串匹配用的是自己的 pattern 语法，跟正则不完全一样，但常用够用：

| pattern | 含义 |
|---------|------|
| `%d` | 数字 |
| `%a` | 字母 |
| `%s` | 空白 |
| `+` | 一个或多个 |
| `*` | 零个或多个 |

```lua
string.match("我的QQ是123456", "%d+")    -- "123456"
string.gsub("a1b2", "%d", "#")          -- "a#b#"，把数字替换成 #
```

## 本章小结

- 变量不用声明类型，用 `local` 声明局部变量
- `nil` 表示"没有"，`~=` 表示"不等于"，`..` 拼接字符串
- `and`/`or` 返回操作数本身，常用 `x or "默认值"` 给默认值
- 字符串有 `"..."`、`'...'`、`[[...]]` 三种写法

下一步：[控制流](control-flow)。
