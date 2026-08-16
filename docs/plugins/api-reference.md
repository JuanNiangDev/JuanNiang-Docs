---
title: Lua API 参考
---


JuanNiang-Neo 暴露给 Lua 插件的 API 函数。**可用性由 `pluggin.yaml` 中 `permissions` 控制**。

> **SDK 区分**：`jn.command` 是命令注册的唯一入口（内部委托到 Go 侧 `__jn_internal.register_command` 全局函数）。直接调用 `__jn_internal.*` 不被推荐，签名可能随版本调整。其他 `jn.<table>` 仅是 Go 注入全局表的再导出。

## 全局表: `log`

权限：**始终可用**。日志输出到服务器 slog。

| 函数 |
|------|
| `log.info(msg)` / `log.warn(msg)` / `log.error(msg)` |

```lua
log.info("插件启动")
log.warn("配置缺失")
log.error("操作失败: " .. err)
```

## 全局表: `json`

权限：**始终可用**。

| 函数 |
|------|
| `json.encode(value) → string` Lua 值→JSON |
| `json.decode(str) → table` JSON→Lua table |

## 全局表: `file`

权限：`file`。插件读写**自身目录**（`data/pluggins/<name>/`）下的文本文件（txt/json/log/csv 等）。

> **安全边界**：`path` 必须为相对路径，禁止绝对路径与 `..` 越界；越权访问返回错误。目录自动创建，行号均从 1 开始。

| 函数 | 返回 | 说明 |
|------|------|------|
| `file.read(path) → string [, err]` | string | 读取整个文件内容（文件不存在返回 err） |
| `file.read_lines(path) → []string [, err]` | string[] | 读取全部行，自动去除行尾 `\n`/`\r` |
| `file.read_line(path, n) → string [, err]` | string | 读取第 n 行；**越界返回 nil**（非错误，便于循环读取） |
| `file.write(path, content) → bool [, err]` | bool | 覆盖写入整个文件（自动创建父目录） |
| `file.write_lines(path, lines) → bool [, err]` | bool | 覆盖写入多行（每行自动补 `\n`） |
| `file.write_line(path, n, content) → bool [, err]` | bool | 改写第 n 行；文件不足自动补空行 |
| `file.append(path, content) → bool [, err]` | bool | 追加内容到文件末尾（**不自动补换行**） |
| `file.append_line(path, content) → bool [, err]` | bool | 追加一行（末尾无换行时自动补） |
| `file.exists(path) → bool` | bool | 判断文件是否存在 |
| `file.remove(path) → bool [, err]` | bool | 删除文件 |

```lua
-- 逐行读取（read_line 越界返回 nil，可用作循环终止条件）
local i = 1
while true do
    local line = jn.file.read_line("data/notes.txt", i)
    if line == nil then break end
    log.info(line)
    i = i + 1
end

-- 整体读写
jn.file.write("data/state.txt", "hello")
local content = jn.file.read("data/state.txt")

-- 追加一行
jn.file.append_line("data/log.txt", "事件发生于 " .. os.date())
```

## 全局表: `onebot11`

权限：`onebot11`。所有函数返回 `(result, err)` —— 成功时 err 为 nil。

### 消息发送

| 函数 | 说明 |
|------|------|
| `onebot11.send_private_msg(user_id, message) → bool, string` | **异步发送**私聊，立即返回。`message` 可为 string 或消息段数组 |
| `onebot11.send_group_msg(group_id, message) → bool, string` | **异步发送**群聊，立即返回 |
| `onebot11.send_private_msg_sync(user_id, message) → bool [, err]` | **同步发送**私聊，阻塞等待结果返回 |
| `onebot11.send_group_msg_sync(group_id, message) → bool [, err]` | **同步发送**群聊，阻塞等待结果返回 |
| `onebot11.delete_msg(message_id) → bool [, err]` | 撤回消息；`message_id` 接受数字或字符串（事件表的 `message_id` 为字符串，避免 QQ 长 ID 精度丢失） |
| `onebot11.read_file_base64(path) → string, err` | 从插件目录读取文件并返回 `base64://...` 字符串 |

> **异步 vs 同步**：默认 `send_xxx_msg` 为异步（fire-and-forget），适合大多数场景。需要确认发送结果或获取 `message_id` 时用 `send_xxx_msg_sync`。

#### 消息段格式（富文本）

`message` 参数支持 Lua 数组格式的消息段：

```lua
-- 纯文本
jn.onebot11.send_group_msg(123456, "Hello")

-- 富文本消息段
jn.onebot11.send_group_msg(123456, {
    { type = "text", data = { text = "看图：" } },
    { type = "at", data = { qq = "123456789" } },
    { type = "image", data = { file = "img/cat.png" } },  -- 插件目录下文件自动转 base64
    { type = "image", data = { file = "https://example.com/dog.jpg" } },
    { type = "face", data = { id = "66" } },  -- CQ 表情 ID
})
```

图片 `file` 字段支持三种来源：
- `http://` / `https://` → 直接透传 URL
- `base64://` → 直接透传
- 相对路径（如 `img/photo.png`）→ 从插件目录自动读取并转 base64

### 群信息查询

| 函数 | 返回 |
|------|------|
| `onebot11.get_group_info(group_id) → table [, err]` | `{group_id, group_name, member_count, max_member_count}` |
| `onebot11.get_group_member_list(group_id) → []table [, err]` | `[{user_id, nickname, card, role, ...}]` |
| `onebot11.get_group_member_info(group_id, user_id) → table [, err]` | 单个成员信息 |
| `onebot11.get_group_honor_info(group_id) → table [, err]` | `{current_talkative, talkative_list, ...}` |

### 群管理

| 函数 | 说明 |
|------|------|
| `onebot11.kick_group_member(group_id, user_id [, reject_add]) → bool [, err]` | reject_add 默认 false |
| `onebot11.ban_group_member(group_id, user_id, duration) → bool [, err]` | duration 秒 |
| `onebot11.set_group_whole_ban(group_id, enable) → bool [, err]` | 全员禁言开关 |
| `onebot11.set_group_card(group_id, user_id, card) → bool [, err]` | 设群名片 |

### 请求处理

| 函数 | 说明 |
|------|------|
| `onebot11.handle_friend_request(flag, approve, remark) → bool [, err]` | |
| `onebot11.handle_group_request(flag, sub_type, approve, reason) → bool [, err]` | `sub_type` ∈ `"add"`/`"invite"` |

### 用户信息与其他

| 函数 | 返回 |
|------|------|
| `onebot11.get_login_info()` | `{user_id, nickname}`（机器人自身） |
| `onebot11.get_stranger_info(user_id)` | 陌生人信息 |
| `onebot11.get_friend_list()` | `[]table` |
| `onebot11.get_group_list()` | `[]table` |
| `onebot11.send_like(user_id, times)` | 发赞 |
| `onebot11.get_status()` | 适配器运行状态 |
| `onebot11.get_version_info()` | 协议版本 |

```lua
local jn = require("jn")
jn.onebot11.send_group_msg(987654321, "群通知")
local info, err = jn.onebot11.get_group_info(987654321)
```

## 全局表: `http`

权限：`http`。

| 函数 | 返回 | 说明 |
|------|------|------|
| `http.get(url) → table` | `{status=number, body=string}` | GET，30s 超时 |
| `http.post(url [, content_type, body]) → table` | `{status, body}` | POST，30s 超时 |
| `http.get_async(url [, ctx, headers]) → number` | `req_id` | GET 异步版：立即返回，完成回调 `on_http_response`（不阻塞事件循环）；可选第 3 位 `headers` 表（`{ ["User-Agent"]="...", ["Referer"]="..." }`）用于反爬/风控站点（如微信公众号） |
| `http.post_async(url [, content_type, body, ctx]) → number` | `req_id` | POST 异步版 |

```lua
local r, err = jn.http.get("https://api.github.com/repos/x/y")
local r, err = jn.http.post("https://httpbin.org/post", "application/json",
                            '{"k":"v"}')

-- 异步：立即返回 req_id，完成回调 on_http_response
local rid = jn.http.get_async("https://api.github.com/repos/x/y")
function on_http_response(req_id, ctx, result, err)
    if err then jn.log.warn("HTTP 请求失败: " .. err) return end
    jn.log.info("status=" .. result.status .. " body=" .. result.body)
end
```

## 全局表: `database`

权限：`database`。

> **⚠ 真实状态**：`database.query/exec` 跑在**共享库**上，没有真正的命名空间隔离（`prefixSQL` 桩未生效）。请给自定义表加自己的前缀（如 `my_plugin_state`），并在加载时用 `CREATE TABLE IF NOT EXISTS` 创建。

| 函数 | 返回 |
|------|------|
| `database.query(sql [, params]) → []table [, err]` | SELECT 查询行数组 |
| `database.exec(sql [, params]) → number [, err]` | INSERT/UPDATE/DELETE，返回影响行数 |

`query`/`exec` 均支持**参数化查询**：用 `?` 占位符，第二个参数传入参数表（推荐，避免手拼 SQL 拼接注入）。拿不到参数化时可用 `jn.sql.escape` 手动转义字符串字面量（单引号 `'` → `''`）。

```lua
-- 加载时自动建表
database.exec([[CREATE TABLE IF NOT EXISTS my_plugin_state (
  k TEXT PRIMARY KEY, v TEXT NOT NULL
)]])

-- 参数化查询（推荐）
local rows = database.query("SELECT k, v FROM my_plugin_state WHERE k = ?", { "last_seen" })
for _, row in ipairs(rows) do
  log.info(row.v)
end

-- 写入（UPSERT）
database.exec(
  "INSERT INTO my_plugin_state (k, v) VALUES (?, ?) " ..
  "ON CONFLICT (k) DO UPDATE SET v = EXCLUDED.v",
  { "last_seen", "2026-01-01" }
)
```

## 全局表: `cache`

权限：`cache`。**键自动加 `pluggin:<name>:` 前缀**，与系统缓存严密隔离。

| 函数 | 说明 |
|------|------|
| `cache.get(key) → table` | 读取（自动反序列化 JSON） |
| `cache.set(key, value [, ttl]) → bool [, err]` | 写入；`ttl` 秒，默认 0=永不过期 |
| `cache.del(key) → bool [, err]` | |
| `cache.exists(key) → number` | 0 或 1 |

```lua
jn.cache.set("last_seen", "2026-07-26", 3600)   -- 1h TTL
local v = jn.cache.get("last_seen")
jn.cache.del("last_seen")
if jn.cache.exists("last_seen") then ... end
```

## 全局表: `t2i`

权限：`t2i`。**未启用时** `generate`/`generate_url` 返回 `(nil, "T2I 服务未启用")`；运行时通过 `AgentOperator.GetT2IClient()` 获取最新实例，支持热更新。

| 函数 | 返回 | 说明 |
|------|------|------|
| `t2i.generate(html) → string [, err]` | 图片 ID | HTML→图片 |
| `t2i.generate_url(html) → string [, err]` | 公开 URL | |
| `t2i.generate_async(html [, opts, ctx]) → number` | `req_id` | 异步版：立即返回，完成回调 `on_t2i_response`（不阻塞事件循环） |
| `t2i.generate_url_async(html [, opts, ctx]) → number` | `req_id` | 异步版，回调返回 URL |
| `t2i.toggle(active) → bool [, err]` | bool | 启用/停用，委托 `SetT2IActive`（同步 DB + 重建客户端） |
| `t2i.is_active() → bool` | bool | 从 DB 读配置；`dao` 不可用时 false |
| `t2i.get_config() → table [, err]` | base_url/timeout/is_active 等 | |

```lua
local id, err = jn.t2i.generate("<h1 style='color:red'>卷娘</h1>")
local url = jn.t2i.generate_url(...)
jn.onebot11.send_group_msg(987654321, "[CQ:image,file=" .. url .. "]")
local active = jn.t2i.is_active()
local cfg = jn.t2i.get_config()

-- 异步：立即返回 req_id，完成回调 on_t2i_response（渲染较慢，适合异步）
local rid = jn.t2i.generate_async("<h1>卷娘</h1>", nil, { group_id = 987654321 })
function on_t2i_response(req_id, ctx, result, err)
    if err then jn.log.warn("T2I 渲染失败: " .. err) return end
    if ctx and ctx.group_id then
        jn.onebot11.send_group_msg(ctx.group_id, "[CQ:image,file=" .. result .. "]")
    end
end
```

## 全局表: `sandbox`

权限：`sandbox`。**未启用时** `create`/`exec_shell`/`exec_python` 返回 `(nil, "Sandbox 服务未启用")`。

| 函数 | 返回 | 说明 |
|------|------|------|
| `sandbox.create() → table [, err]` | `{sandbox_id, status}` | 新沙箱 |
| `sandbox.exec_shell(sandbox_id, command) → (output, exit_code) \| (nil, err)` | | |
| `sandbox.exec_python(sandbox_id, code) → (output, error) \| (nil, err)` | | |
| `sandbox.create_async([ctx]) → number` | `req_id` | 异步版：立即返回，完成回调 `on_sandbox_response`（不阻塞事件循环） |
| `sandbox.exec_shell_async(sandbox_id, command [, ctx]) → number` | `req_id` | 异步执行 shell（默认超时 120s），回调 result=`{output, exit_code}` |
| `sandbox.exec_python_async(sandbox_id, code [, ctx]) → number` | `req_id` | 异步执行 python，回调 result=`{output, error}` |
| `sandbox.toggle(active) → bool [, err]` | 启停：`SetSandboxActive` |
| `sandbox.is_active() → bool` | 从 DB 读配置 |
| `sandbox.get_config() → table [, err]` | base_url/api_key/timeout/is_active 等 |
| `sandbox.list() → table [, err]` | 沙箱列表 |
| `sandbox.delete(sandbox_id) → bool [, err]` | 删沙箱 |

```lua
local sb, err = jn.sandbox.create()
local sid = sb.sandbox_id
local out, exit = jn.sandbox.exec_shell(sid, "ls -la /")
local out, e = jn.sandbox.exec_python(sid, "print(1+1)")
jn.sandbox.delete(sid)

-- 异步（执行代码可能很慢，建议异步）：完成回调 on_sandbox_response
local rid = jn.sandbox.exec_shell_async(sid, "ls -la /", { sid = sid })
function on_sandbox_response(req_id, ctx, result, err)
    if err then jn.log.warn("沙箱执行失败: " .. err) return end
    jn.log.info("exit=" .. result.exit_code .. " output=" .. result.output)
end
```

## 全局表: `agent`

权限：`agent`。提供 Agent 配置查询与运行时管理（共 17 个函数）。

### 配置查询（从 DB 读取）

| 函数 | 返回 |
|------|------|
| `agent.get_providers() → []table` | 所有 LLM Provider 配置 |
| `agent.get_mcp_servers() → []table` | 所有 MCP 服务器配置 |
| `agent.get_skills() → []table` | 所有 Skill 配置 |
| `agent.get_sessions() → []table` | 所有 Session |
| `agent.get_prompts() → []table` | 所有 Prompt 模板 |
| `agent.get_tools() → []table` | 所有 Tool 配置 |
| `agent.get_plugins() → []table` | 所有已安装插件信息 |

### Provider 管理

```lua
jn.agent.set_provider_active("uuid", false)  -- 停用
jn.agent.set_provider_active("uuid", true)   -- 启用
```

| 函数 | 说明 |
|------|------|
| `agent.set_provider_active(id, active) → bool [, err]` | 启用→加载；停用→运行环境移除 |
| `agent.list_runtime_providers() → []table [, err]` | 当前运行时已加载（仅 active） |

返回每项：

```lua
{ id="...", name="openai", type="text_model", model="gpt-4", active=true }
```

| 函数 | 说明 |
|------|------|
| `agent.switch_provider(id) → bool [, err]` | 切换主 Provider；同类型自动停其他 |

### MCP 管理

| 函数 | 说明 |
|------|------|
| `agent.set_mcp_active(id, active) → bool [, err]` | 启用→连接；停用→断开 |
| `agent.list_mcps() → []table [, err]` | 运行时已加载的 MCP 列表 |
| `agent.toggle_mcp(id, active) → bool [, err]` | 同 set_mcp_active 的语义别名 |

返回每项：`{ id, name, url, active }`

### Tool 管理

| 函数 | 说明 |
|------|------|
| `agent.list_tools() → []table [, err]` | 运行时已注册的 Tool |
| `agent.toggle_tool(name, active) → bool [, err]` | `name` 是工具名（非 ID）；停用从 ToolRegistry 移除 |

返回每项：`{ name, description, builtin, long_running, active }`

> 注意：内置工具运行时常驻，停用后仍保留在注册表；用户自定义工具停用后会被 Unregister。

### 上下文与记忆

| 函数 | 返回 | 说明 |
|------|------|------|
| `agent.get_current_chat_area() → table` | `{post_type, message_type, user_id, group_id, chat_area_id}` | 当前正在处理的消息所属 ChatArea |
| `agent.compact_memory() → string [, err]` | | Compact 当前 ChatArea 短期记忆：LLM 压缩为摘要写入长期记忆，随后窗口清理为只保留最近 10 条消息（需 Text LLM Provider） |

## SDK 模块: `jn.llm`

权限：`llm`。通过 **Bot 自身启用的文本模型 Provider** 调用 LLM——模型、采样参数、密钥全部复用 Bot 配置，插件不接触任何密钥。适合内容审查、二次判断等场景。

```lua
local jn = require("jn")

-- 同步调用（适合命令等低频路径）
local content, err = jn.llm.chat("你好", { timeout = 30 })

-- 异步调用（高频路径必须用异步：不阻塞事件循环与其它插件）
local rid = jn.llm.chat_async(
    { { role = "system", content = "你是审查员" }, { role = "user", content = "待审查消息" } },
    { timeout = 60 }
)  -- 立即返回 req_id（失败返回 0）

-- 完成后引擎调用插件入口函数（引擎级异步注册表派发）：
function on_chat_response(req_id, content, err)
    if err then
        log.warn("LLM 调用失败: " .. err)
        return
    end
    log.info("LLM 返回: " .. content)
end
```

| 函数 | 说明 |
|------|------|
| `llm.available() → bool` | 当前是否有可用的文本模型 Provider |
| `llm.chat(messages, opts?) → string?, string?` | 同步调用，返回 `(content, err)`；err 为 nil 表示成功 |
| `llm.chat_async(messages, opts?) → number` | 异步提交，立即返回 `req_id`（失败返回 `0`）；完成后引擎派发到插件入口 `on_chat_response(req_id, content, err)` |

参数：

- `messages`：单字符串（role=`user`）或数组。数组元素可为字符串（role=`user`）或 `{role="system|user|assistant", content="..."}`。
- `opts`：`{temperature=?, max_tokens=?, timeout=?秒}`；**缺省采样参数回退 Bot Provider 配置**，`timeout` 缺省 60s。
- `on_chat_response` 的 `req_id` 与 `chat_async` 返回值一致，用于关联请求上下文（例如维护 `req_id → 消息/关键词` 映射表，回调时取回）。

### 异步 API 注册表

`xxx_async` 由引擎级**异步注册表**驱动（`PluginEngine.RegisterAsyncAPI`）：

- 提交后立即返回 `req_id`，阻塞操作（HTTP 调用 / T2I 渲染 / LLM）在独立 goroutine 完成，**不阻塞事件循环**；
- 完成后引擎串行派发到插件 Lua 入口函数 `on_xxx_response`（与事件派发互斥，保证 LState 安全）；
- 插件卸载后未派发的任务自动丢弃。

**异步 API 一览**（`xxx_async(...) → req_id`，完成后引擎调用对应回调）：

| kind | 异步函数 | 回调入口 | 回调参数 |
|------|---------|---------|---------|
| `chat` | `llm.chat_async(messages, opts?)` | `on_chat_response` | `(req_id, content, err)` |
| `t2i` | `t2i.generate_async` / `t2i.generate_url_async` | `on_t2i_response` | `(req_id, ctx, result, err)` |
| `http` | `http.get_async` / `http.post_async` | `on_http_response` | `(req_id, ctx, result, err)` |
| `sandbox` | `sandbox.create_async` / `exec_shell_async` / `exec_python_async` | `on_sandbox_response` | `(req_id, ctx, result, err)` |

> **调用现场保存（ctx）**：`t2i` / `http` 异步回调带 `ctx` 参数——调用时把要保留的变量打包成一张表作为最后一个参数传入（如 `generate_async(html, opts, ctx)`），引擎按 `req_id` 关联保存，回调时**原样带回**（不序列化，可含函数）。用于延续调用前的业务状态（待处理消息、群号、临时标记等）；不传则为 `nil`。`llm.chat_async` 不带 `ctx`（回调签名保持 `(req_id, content, err)`，兼容现有插件）。
>
> **顺序语义**：多个异步任务并发提交时，回调按**完成顺序**派发（FIFO），不保证与提交顺序一致，插件勿依赖提交顺序。

## SDK 模块: `jn.command`

多级命令注册。需先 `local jn = require("jn")`。

`CommandRegistry` 维护一棵 `CommandNode` 树。`PluginEngine.OnMessage` 在派发到 `on_message` 之前，先检查 `event.RawMessage` 是否以 `/` 开头，若是则调 `commands.Dispatch` 最长前缀匹配：

- 命中可执行 handler → 自动回复 `reply`（非空时）+ `consumed=true` 跳过 Agent 与 `on_message`
- 未命中 handler 但停在某个非根节点 → 自动列出该节点的子命令作为提示
- 完全未命中 → fallback 到插件的 `on_message` 回调

### `jn.command.register(path, handler [, opts]) → bool [, err]`

| 参数 | 说明 |
|------|------|
| `path` | 命令路径，string（按空格切分）或 string[]（多级） |
| `handler` | `function(args, event) → (consumed, reply)`；`args` 是路径之后的所有空格分隔 token `string[]` |
| `opts` | `{ description="...", usage="..." }`，用于 `/help` 自动生成 |

handler 返回：
- `consumed` — 是否消费此命令（true 跳过 Agent）
- `reply` — 若非空，由系统自动回复

```lua
local jn = require("jn")

jn.command.register("greet", function(args, event)
    local name = args[1] or "朋友"
    return true, "你好，" .. name .. "！"
end, { description = "打招呼", usage = "/greet [名字]" })

jn.command.register({"myplugin", "subcmd1", "subcmd2"}, function(args, event)
    return true, "收到参数: " .. table.concat(args, " ")
end, { description = "多级命令", usage = "/myplugin subcmd1 subcmd2 [args...]" })
```

> handler 引用保活：Go 侧通过 `L.SetGlobal(refKey, handlerFn)` 保留引用，防止 Lua GC 回收。

### 内置 `/help` 命令

`PluginEngine.registerBuiltinCommands()` 启动时注册到 `system/help`：

- `/help` — 列出所有顶层命令
- `/help <cmd>` — 查看 `<cmd>` 的子命令与用法
- `/help <cmd> <subcmd>` — 查看更深层级

## 回调: `on_message`

```lua
function on_message(event) → (consumed, skip_reply)
```

| event 字段 | 类型 | 说明 |
|----------|------|------|
| `post_type` | string | `"message"` |
| `message_type` | string | `"private"` / `"group"` |
| `user_id` | number | 发送者 QQ |
| `group_id` | number | 群号 |
| `raw_message` | string | 消息原文 |
| `message_id` | number | 消息 ID |
| `sender` | table | 发送者信息 `{user_id, nickname, sex, age, card}` |
| `admins` | []string | admin QQ 列表（透传 OB AdminQQNumbers） |

**返回值：**
- `consumed` (bool): `true` → 消息**不进 Agent**。注意：**不短路**——即使某个插件返回 `true`，其余插件的 `on_message` 仍会全部执行完（适合"多个监听插件都要看到消息"的场景）。
- `skip_reply` (bool): `true` → 跳过回复策略检查（`at_only` / `never` / relevance 过滤），**强制进入 Agent 处理**；当 `consumed=true` 时以 `consumed` 为准（消息不进 Agent）。

> **已移除**：`modified_event`（修改事件）不再支持——插件不得中途改写事件内容（防止上下文失真）。需要拦截/处理消息时，在 `on_message` 中直接调用 `jn.onebot11` API 产生副作用（如 `delete_msg` 撤回、`ban_group_member` 禁言）。

> **命令优先**：`/` 开头的 RawMessage 会**先**进 `commands.Dispatch`，命中命令后直接 sendReply 并短路，`on_message` 不会被调用。插件应优先用 `jn.command.register` 注册命令式交互，将 `on_message` 用于纯事件监听。

## 回调: `on_webhook`

```lua
function on_webhook(event) → (consumed, reply)
```

| event 字段 | 说明 |
|----------|------|
| `event.webhook.path` | 接收路径 |
| `event.webhook.method` | HTTP 方法 |
| `event.webhook.payload` | body 解析结果（JSON 失败则 `{raw="<原文>", type="non-json"}`） |

Webhook 事件永远不走 LLM Agent，是给插件做外部集成（如 GitHub push 通知）。

**两种路由模式：**
- **定向模式** (`/webhook/{plugin_name}`)：请求按插件名称精确路由，只有同名插件收到事件
- **广播模式** (`/webhook` 或 `/`)：无插件名时，广播给所有有 `webhook` 权限的插件

**返回值：**
- `consumed` (bool): 是否已消费事件。广播模式下返回 `true` 会停止遍历后续插件
- `reply` (string, 可选): 定向模式下，reply 会作为 HTTP 响应的 `metadata` 返回给调用方

```lua
function on_webhook(event)
    local p = event.webhook and event.webhook.payload or {}
    if p.action == "opened" then
        jn.onebot11.send_group_msg(987654321, "新 PR: " .. (p.title or "?"))
        return true, "PR opened notification sent"
    end
    return false, "unhandled action"
end
```

## 回调: `on_cronjob`

定时任务回调，由 CronJob 通过统一事件循环 → `Plugin.Dispatch` 分发触发。

```lua
function on_cronjob(event)  -- 无返回值
```

| event 字段 | 类型 | 说明 |
|----------|------|------|
| `post_type` | string | `"cronjob"` |
| `payload` | table | CronJob 配置的 Payload JSON 对象 |
| `admins` | []string | admin QQ 列表 |

- CronJob 事件**不**经过 Agent，仅通过 `Plugin.Dispatch` 分发到插件
- 只有定义了 `on_cronjob` 全局函数且已加载的插件才会被 CronJob 调用
- 前端多选下拉框自动过滤 `supports_cronjob=true` 的已启用插件
- 新增/修改 `on_cronjob` 后需通过前端"重载全部"或 `POST /api/v1/plugins/reload` 热重载

```lua
-- 示例：向 Payload 指定的 QQ 发定时消息
function on_cronjob(event)
    local p = event.payload or {}
    if p.target_qq and p.message then
        jn.onebot11.send_private_msg(p.target_qq, p.message)
    end
end
```

完整示例见 `data/pluggins/webhook-cron/`（on_cronjob + on_webhook）。

## 回调: `on_notice`

通知事件回调，由 OneBot11 的 notice 事件触发（群成员增减、禁言、文件上传、戳一戳等）。

```lua
function on_notice(event)  -- 无返回值
```

| event 字段 | 类型 | 说明 |
|----------|------|------|
| `post_type` | string | `"notice"` |
| `notice_type` | string | `group_upload` / `group_admin` / `group_decrease` / `group_increase` / `group_ban` / `friend_add` / `group_recall` / `friend_recall` / `notify` |
| `sub_type` | string | 子类型（如 `approve`/`invite` 对应 group_increase，`poke` 对应 notify） |
| `user_id` | number | 触发事件的 QQ（如加入群的人） |
| `group_id` | number | 群号 |
| `operator_id` | number | 操作者 QQ（如邀请人、管理员） |
| `target_id` | number | 被操作者 QQ（如被禁言的人） |
| `duration` | number | 禁言时长（秒，仅 group_ban） |
| `file` | table | 文件信息 `{id, name, size, busid}`（仅 group_upload） |
| `admins` | []string | admin QQ 列表 |

```lua
-- 示例：入群欢迎
function on_notice(event)
    if event.notice_type == "group_increase" then
        jn.onebot11.send_group_msg(event.group_id,
            "欢迎 [CQ:at,qq=" .. event.user_id .. "] 加入！")
    end
end
```

完整示例见 `data/pluggins/group-manager/`（on_notice + on_request + 群管理）。

## 回调: `on_request`

请求事件回调（加好友申请、加群邀请）。

```lua
function on_request(event)  -- 无返回值
```

| event 字段 | 类型 | 说明 |
|----------|------|------|
| `post_type` | string | `"request"` |
| `request_type` | string | `friend` / `group` |
| `sub_type` | string | `add` / `invite` |
| `user_id` | number | 请求发起者 QQ |
| `group_id` | number | 群号 |
| `comment` | string | 验证消息 |
| `flag` | string | 请求标识（传给 `handle_friend_request` / `handle_group_request`） |
| `admins` | []string | admin QQ 列表 |

```lua
-- 示例：自动同意加好友
function on_request(event)
    if event.request_type == "friend" and event.comment == "暗号" then
        jn.onebot11.handle_friend_request(event.flag, true, "欢迎")
    end
end
```

## 回调: `on_xxx_response`（异步 API 完成回调）

`xxx_async` 提交的阻塞操作完成后，引擎派发到插件入口回调（与事件派发互斥，保证 LState 安全）。`req_id` 与 `xxx_async` 返回值一致；`ctx` 为调用时保存的现场表（原样带回，未传则 `nil`）。

```lua
function on_t2i_response(req_id, ctx, result, err)
    -- result: 图片 ID（generate_async）或公开 URL（generate_url_async）；err 非 nil 表示失败
end

function on_http_response(req_id, ctx, result, err)
    -- result: {status=number, body=string}；err 非 nil 表示失败
end

function on_sandbox_response(req_id, ctx, result, err)
    -- result: create→{sandbox_id, status}、exec_shell→{output, exit_code}、
    --         exec_python→{output, error}；err 非 nil 表示失败
end
```

| 回调 | req_id 来源 | ctx | result |
|------|-----------|-----|--------|
| `on_t2i_response(req_id, ctx, result, err)` | `t2i.generate_async` / `t2i.generate_url_async` | 调用现场表（原样带回） | 图片 ID / URL |
| `on_http_response(req_id, ctx, result, err)` | `http.get_async` / `http.post_async` | 同上 | `{status, body}` |
| `on_sandbox_response(req_id, ctx, result, err)` | `sandbox.create_async` / `exec_shell_async` / `exec_python_async` | 同上 | 见上注释 |

```lua
-- 示例：http 异步 + 现场保存（url 与回调目标一起带到回调）
function on_message(event)
    local ctx = { url = "https://api.github.com/repos/x/y", group_id = event.group_id }
    local rid = jn.http.get_async(ctx.url, ctx)
    return false, false
end

function on_http_response(req_id, ctx, result, err)
    if err or not ctx then return end
    jn.onebot11.send_group_msg(ctx.group_id, "仓库信息: " .. result.body)
end
```

## 权限速查

| 权限 | 暴露的全局表 |
|------|-------------|
| `*` | 所有 |
| `onebot11` | `onebot11.*` |
| `http` | `http.*` |
| `database` | `database.*` |
| `cache` | `cache.*` |
| `t2i` | `t2i.*` |
| `sandbox` | `sandbox.*` |
| `agent` | `agent.*` |
| (webhook 调用层过滤) | `on_webhook` 会被调用 |
| (cronjob 调用层过滤) | `on_cronjob` 会被调用 |

---
