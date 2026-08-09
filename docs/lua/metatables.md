---
title: 元表与面向对象
sidebar_position: 6
---

> 元表（metatable）是 Lua 最强大也最易懵的特性。它给表配了"行为振铃"——当这个表被做某些操作时（相加、索引、调用、拼接……），会触发元表里对应的**元方法**。卷娘插件里最常用它来写面向对象（类和继承）。

## 什么是元表

元表本质也是个表，用 `setmetatable(t, mt)` 给表 `t` 挂上元表 `mt`：

```lua
local t = {}              -- 普通表
local mt = {}             -- 元表
setmetatable(t, mt)       -- 给 t 挂上元表 mt

print(getmetatable(t))    -- mt
```

关键元方法有：

- `__index`：访问不存在的键时触发（实现继承/默认值）
- `__newindex`：给不存在的键赋值时触发
- `__call`：把表当函数调用时触发
- `__tostring`：把表转字符串时触发（`print` 会用到）
- `__add` / `__sub` 等：算术运算

## `__index`：访问不存在的键

当表里没有某个键时，Lua 会去查元表的 `__index`。这是实现**继承**和**默认值**的核心。

```lua
local animal = { sound = "..." }

function animal.make_sound(self)
    print(self.sound)
end

local dog = {}
setmetatable(dog, { __index = animal })   -- dog 找不到的方法去 animal 找

dog.sound = "汪汪"
dog:make_sound()       -- 汪汪
```

`__index` 可以是一个表，也可以是一个函数：

```lua
local defaults = { limit = 10 }
local conf = setmetatable({}, { __index = defaults })
print(conf.limit)      -- 10，conf 里没有，去 defaults 找
```

## `__call`：把表当函数调用

```lua
local counter = setmetatable({ n = 0 }, {
    __call = function(self)
        self.n = self.n + 1
        return self.n
    end
})

print(counter())       -- 1，把表当函数调用了
print(counter())       -- 2
```

## `__tostring`：自定义打印

```lua
local point = setmetatable({ x = 1, y = 2 }, {
    __tostring = function(self)
        return "(" .. self.x .. ", " .. self.y .. ")"
    end
})

print(point)           -- (1, 2)，不再是默认的 table: 0x...
```

## 用元表实现面向对象（类）

Lua 没有 `class` 关键字，但用 `__index` + 冒号语法 `:` 就能模拟类、对象、继承。

### 冒号语法 `:` 是什么

```lua
local obj = { x = 1 }

function obj.get(self)   -- 注意：方法要显式带 self
    return self.x
end

print(obj.get(obj))      -- 1，手动传 self

-- 冒号写法等价，自动把调用者当第一个参数传进去：
print(obj:get())         -- 1，等价于 obj.get(obj)
```

**`:` 只是语法糖**：`obj:method(args)` 等价于 `obj.method(obj, args)`。定义方法时，用冒号会自动带 `self`：

```lua
function obj:get()       -- 等价于 function obj.get(self)
    return self.x
end
```

### 一个完整的类

```lua
-- 构造器（约定叫 new）
local Player = {}
Player.__index = Player        -- 实例找不到方法时去 Player 找

function Player.new(name)
    local self = setmetatable({}, Player)
    self.name = name
    self.hp = 100
    return self
end

function Player:take_damage(dmg)
    self.hp = self.hp - dmg
    if self.hp < 0 then self.hp = 0 end
    return self.hp
end

-- 使用
local p = Player.new("卷娘")
p:take_damage(30)
print(p.hp)                    -- 70
```

### 继承

```lua
local Mage = {}
Mage.__index = Mage
setmetatable(Mage, { __index = Player })   -- Mage 继承 Player

function Mage.new(name)
    local self = Player.new(name)          -- 调用父类构造器
    setmetatable(self, Mage)               -- 但实例的元表设成 Mage
    self.mp = 50
    return self
end

function Mage:cast()
    if self.mp >= 10 then
        self.mp = self.mp - 10
        return self.name .. " 施放了火球！"
    end
    return "法力不足"
end

local m = Mage.new("小红")
print(m:take_damage(10))       -- 90，继承了 Player 的方法
print(m:cast())                -- 小红 施放了火球！
```

## 卷娘插件里的面向对象

卷娘插件的状态管理常常用"表 + 闭包"或"表 + 元表"来组织。看 `redrock_quiz` 的思路——把一局游戏封装成带状态的对象：

```lua
local Game = {}
Game.__index = Game

function Game.new(questions)
    local self = setmetatable({}, Game)
    self.questions = questions
    self.index = 1
    self.wrong = 0
    return self
end

function Game:current()
    return self.questions[self.index]
end

function Game:answer(ans)
    if ans == self:current().answer then
        self.index = self.index + 1
        return true
    else
        self.wrong = self.wrong + 1
        return false
    end
end

function Game:is_over()
    return self.index > #self.questions or self.wrong >= 3
end
```

（真实 `redrock_quiz` 用内存缓存 + Postgres KV 表跨重启保存，但对象化的思路是一样的。）

## 本章小结

- 元表用 `setmetatable` 挂载，`__index` 实现继承/默认值
- `:` 冒号是语法糖，自动把调用者当 `self` 传
- 用 `__index` + `new` 构造器可以写出类、对象、继承
- 卷娘插件的游戏/状态管理常这样对象化

下一步：[模块与 require](modules)。