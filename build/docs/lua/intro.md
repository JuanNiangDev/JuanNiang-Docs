# Lua 是什么

> > 写给：想给卷娘写插件、但还没写过 Lua，或者只写过 Python/JavaScript 想快速上手 Lua 的同学。

> 写给：想给卷娘写插件、但还没写过 Lua，或者只写过 Python/JavaScript 想快速上手 Lua 的同学。

## Lua 是一门什么样的语言

**Lua** 是一门轻量、小巧、可嵌入的脚本语言，诞生于 1993 年（巴西里约热内卢天主教大学）。它最出名的地方是**嵌入**：很多游戏（World of Warcraft、Roblox、Angry Birds）、Wireshark、Redis（它的脚本）、Nginx（OpenResty）都用它当扩展脚本语言。

为什么大家都喜欢嵌入 Lua？因为它：

- **体积小**：整个解释器几 MB 甚至几百 KB，极易打包进任何程序
- **速度快**：LuaJIT 甚至能接近 C 的速度
- **易嵌入**：有非常干净的 C API，宿主程序（这里是 Go）可以轻松注入自定义函数
- **语法简单**：全部语法半小时能讲完，一门语言的核心概念只有几个

卷娘（JuanNiang-Neo）就是用它做**插件引擎**：你在 `data/pluggins/<name>/main.lua` 里写的脚本，由 Go 内置的 gopher-lua 解释器加载执行。你写的 Lua 脚本能调用 Go 注入的 API（发消息、查数据库、调 HTTP……），从而扩展卷娘的功能。

## Lua 和卷娘的关系

| 层 | 是什么 |
|----|--------|
| 你写的 | `main.lua`（纯 Lua 脚本） |
| 解释器 | gopher-lua（Go 实现的标准 Lua 5.1 兼容解释器） |
| 宿主 | Go 的 `internal/pluggin/` 插件引擎 |
| 注入的 API | `log` / `json` / `onebot11` / `http` / `database` / `cache` / `t2i` / `sandbox` / `jn.*` 等全局表 |

所以学习 Lua 对卷娘插件开发来说，重点其实是两件事：

1. **Lua 语言本身**（本教程）：变量、类型、控制流、函数、表、元表、模块
2. **卷娘注入的 API**（见 [插件 API 参考](../plugins/api-reference.md)）：怎么用这些表发消息、存数据

本教程专注第 1 件。学完后，你就能读懂 `plugins/redrock_*` 那些真实插件的代码，并自己动手写。

## 本教程的阅读方法

- 已会 Python/JavaScript 的读者：**重点看"表"和"元表"**两章——这是 Lua 最不一样、也最容易踩坑的地方；其余语法看一眼就能懂。
- 完全零基础的读者：请从头连贯读下来，每章都有可运行的小例子。
- 想直接上手写卷娘插件的读者：请先读 [插件开发指南](../plugins/quickstart.md)，再回头补语言细节。

> **提示**：gopher-lua 是 **Lua 5.1** 兼容。本教程只讲 5.1 就有的语法，不涉及 5.2/5.3 的新特性（如整数除法 `//`、位运算符、`goto`），避免你在卷娘里用了不支持的语法。

## 第一个 Lua 程序

卷娘插件里最常见的入门写法是这个：

```lua
local jn = require("jn")

jn.command.register("hello", function(args, event)
    return true, "你好，" .. (event.user_id or "陌生人") .. "！"
end, { description = "打招呼", usage = "/hello" })
```

现在你可能看不懂，没关系。学完本教程你会明白每一个词的含义。让我们从 [语法基础](basics) 开始。
