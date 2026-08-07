---
title: 插件开发常见坑
---


1. **QQ 号是 number 而非 string**：`send_private_msg("10086", ...)` 无效，Lua 字符串无法转 Go int64
2. **`on_message` 只有有 `onebot11` 权限的插件才被调用**
3. **`/cmd` 路径与 `on_message` 互斥**：命令命中后不进 `on_message`
4. **`cache` 命名空间隔离（`pluggin:<name>:`），`database` 没有** — 后者权限请谨慎使用并在插件侧加自己的表前缀
5. **改 `pluggin.yaml` 后必须 reload**（Web toggle 或重启），不重新加载不会生效
6. **系统插件目录 `system/` 每次启动被二进制覆盖** — 不要用它存自定义命令，自建插件目录
7. **`database` 权限声称有命名空间隔离，但 `prefixSQL` 是桩未生效** — 任意 SQL，请重度谨慎
8. **改 Lua 文件不 reload 看不到效果**：`PUT /plugins/:id/toggle` 先停再启才会重新 `DoFile`
9. **handler 返回值约定** `(consumed, modified_event, skip_reply)`：consumed=true 短路（不调 Agent）；skip_reply=true 跳过回复策略
10. **Webhook 与 CronJob 都不走 LLM**：仅喂插件，是外部集成与定时任务的钩子。若要让 Agent 处理外部输入，插件内 `onebot11.send_*_msg` 自己转发
