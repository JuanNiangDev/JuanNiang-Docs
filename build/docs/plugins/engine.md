# 插件引擎实现细节

> ```go
type PluginEngine struct {
    mu         sync.RWMutex
    plugins    map[string]*LoadedPlugin
    basePath   string                   // 默认 "data/pluggins"
    adapter    SendAdapter              // OneBot11 完整 API
    db         *gorm.DB                 // 共享数据库（⚠ 无真实命名空间）
    cache      *cache.Cache             // Redis（带 pluggin:<name>: 前缀）
    t2i        *t2icaller.Client        // 启动时通常 nil; 运行时通过 agentOp 取
    sandbox    *sandboxcaller.Client
    dao        *dao.Bundle              // Agent 配置查询
    agentOp    AgentOperator            // Provider/MCP/Tool/T2I/Sandbox 切换 + Compact
    currentEv  EventData                // 当前事件上下文
    commands   *CommandRegistry         // 多级命令注册表
}

## 核心结构（`internal/pluggin/pluggin.go`）

```go
type PluginEngine struct {
    mu         sync.RWMutex
    plugins    map[string]*LoadedPlugin
    basePath   string                   // 默认 "data/pluggins"
    adapter    SendAdapter              // OneBot11 完整 API
    db         *gorm.DB                 // 共享数据库（⚠ 无真实命名空间）
    cache      *cache.Cache             // Redis（带 pluggin:<name>: 前缀）
    t2i        *t2icaller.Client        // 启动时通常 nil; 运行时通过 agentOp 取
    sandbox    *sandboxcaller.Client
    dao        *dao.Bundle              // Agent 配置查询
    agentOp    AgentOperator            // Provider/MCP/Tool/T2I/Sandbox 切换 + Compact
    currentEv  EventData                // 当前事件上下文
    commands   *CommandRegistry         // 多级命令注册表
}

type LoadedPlugin struct {
    Manifest Manifest
    State    *lua.LState   // 独立 LState（VM 隔离）
    Dir      string
}

type Manifest struct {
    PPID        string   // 稳定 UUID，缺省时自动生成并写回
    Name        string
    Version     string
    Author      string
    Description string
    Entry       string   // 默认 main.lua
    Permissions []string
    System      bool     // true = 系统插件，三层守卫
    Enabled     bool
}
```

## 关键实现点

### 1. 独立 Lua VM（LState 隔离）

每个插件用独立 `*lua.LState`（`lua.NewState()`），VM 间完全隔离，一个插件崩不影响其他。

### 2. SDK 注入（`injectSDK`）

```go
//go:embed sdk/jn.lua
var jnSDKSource string
```

`ensureEmbeddedAssets`（`pluggin.go:2200`）每次启动强制覆盖落盘：`<basePath>/sdk/jn.lua` 与 `system/{pluggin.yaml,main.lua}`，确保 Docker 镜像在不同 bind-mount 上一致。`injectSDK` 把 `<basePath>/sdk/?.lua` 追加到 `package.path`，使 `require("jn")` 可用。

### 3. 按 permissions gate 注入全局表（`injectBaseAPI`）

```go
// pluggin.go:973
func (pe *PluginEngine) injectBaseAPI(L *lua.LState, pluginName string, permissions []string) {
    // log / json 始终
    if plugin.HasPermission("onebot11") { ... }
    if plugin.HasPermission("http")    { ... }
    if plugin.HasPermission("database")&&pe.db!=nil     { ... }
    if plugin.HasPermission("cache")&&pe.cache!=nil     { ... }
    if plugin.HasPermission("t2i")                     { ... }
    if plugin.HasPermission("sandbox")                 { ... }
    if plugin.HasPermission("agent")&&pe.dao!=nil      { ... }
}
```

`HasPermission(perm)`（`pluggin.go:960`）支持精确匹配或 `"*"` 通配。多余申请不会注入，日志会有提示。

### 4. 命令 API（`injectCommandAPI`）

```go
// pluggin.go:1055
__jn_internal.register_command(path, handlerFn, opts)
   ├─ path 转 CommandNode 路径，逐级创建
   ├─ handler 注册到全局 key __jn_cmd_handler_<plugin>_<path> 保活（防 GC）
   └─ 设置 Opts{Description, Usage}
```

SDK `jn.command.register` 是它的薄包装。

### 5. t2i / sandbox 客户端运行时获取

```go
// pluggin.go:1587 (t2i)
getCurrentClient := func() *t2icaller.Client {
    if agentOp != nil {
        if c := genT2IClient(); c != nil { return c }
    }
    return pe.t2i   // 启动期可能为 nil
}
```

→ 插件 `t2i.generate` 每次调用都拿最新客户端，与 HagoCenter / Service 共享指针，支持热更新（API 改 T2I 配置后立即对所有插件生效）。

### 6. CommandRegistry 派发（`command.go`）

```
Dispatch(raw, event):
  分词 -> 走树
  最长前缀匹配带 handler 的节点 -> 调用 handler(剩余 args, event)
  若停在非根但无 handler -> 返回子命令列表作 /help
```

`UnregisterPlugin(name)` 在 Unload 时递归清理该插件所有命令并修剪空叶子。

### 7. 系统插件三层守卫

| 层 | 位置 | 作用 |
|----|------|------|
| Manifest.System | `pluggin.yaml` `system: true` | 标记 |
| `PluginEngine.IsSystem(name)` | `pluggin.go:187` | 引擎层 Unload 拒绝 |
| Service Toggle/Delete | `internal/api/service` | API 层拒绝（返回 40028 PluginIsSystem） |

确保 `system` 插件不可删/停，但**可启用**（支持 idempotent 场景）。

### 8. 事件回调的 PCall 安全

`OnMessage`/`OnWebhook`/`OnCronjob` 用 `L.PCall` 保护调用，handler 抛错只记录日志不影响后续插件或 Agent。

---
