---
title: 本地开发环境
---


本文面向想在本地搭建开发环境、修改 JuanNiang-Neo 主项目的开发者。

## 前置依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| Go | 1.25+（见 `go.mod`） | 后端（模块路径 `JuanNiang-Neo`，大小写与连字符都重要） |
| Node.js / npm | 18+ | 前端（Vue 3 + Vite 6 + Vuetify 3，位于 `web/`） |
| PostgreSQL | 任意现代版本 | 持久化（建议 16） |
| Redis | 任意现代版本 | 缓存 / 短期记忆 / PubSub（建议 7） |

没有本机 Postgres/Redis 时，可用 Docker 快速起：

```bash
docker run -d --name jn-pg -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=juan postgres:16-alpine
docker run -d --name jn-redis -p 6379:6379 redis:7-alpine redis-server --requirepass root
```

## 快速初始化

```bash
git clone https://github.com/JuanNiangDev/JuanNiang-Neo.git
cd JuanNiang-Neo

# 1. 开发配置（数据库/Redis/端口等），复制并按需修改
cp dev.yaml.example dev.yaml

# 2. 安装前端依赖
make web-install

# 3. 全量构建（前端 -> web/dist + Go 二进制 -> bin/juan-niang-neo）
make build

# 4. 启动开发环境：Vite (:3000) + Go (:8090) 并行
make dev
```

访问 [http://localhost:3000](http://localhost:3000)（Vite 热更新，`/api` 代理到 :8090）。

## dev.yaml 说明

`dev.yaml` 用于配置基础设施连接端点，避免每次手动设置环境变量：

```yaml
database:
  host: localhost
  port: 5432
  user: postgres
  password: postgres
  name: juan

redis:
  addr: "localhost:6379"
  password: root
  db: 0

onebot11:
  port: 8081

api:
  addr: ":8090"

web:
  dir: web/dist          # 开发模式下可设为空字符串跳过

jwt:
  secret: dev-secret-change-me

debug:
  enabled: true          # make run-debug 会强制开启
  pprof_addr: ":6060"
```

**优先级：环境变量 > dev.yaml > 内置默认值。** `dev.yaml` 不存在时程序正常启动（使用环境变量或内置默认值）。`make run` / `make run-debug` 通过 `-dev-config` 参数传入，二进制本身不硬编码该路径。

## make 目标速查

| 目标 | 说明 |
|------|------|
| `make` / `make build` | 全量构建：前端 `web/dist` + Go 二进制 `bin/juan-niang-neo` |
| `make build-go` | 仅构建 Go 后端（依赖 `web/dist` 已存在） |
| `make web-install` | 安装前端依赖（`npm ci`，失败回退 `npm install`） |
| `make web-build` | 前端 typecheck + vite build |
| `make web-dev` | 仅启动 Vite 开发服务器 |
| `make web-lint` / `make web-typecheck` | 前端 lint / 类型检查 |
| `make dev` | Vite (:3000) + Go (:8090) 并行 |
| `make run` | 仅后端 `go run`，自动读取 dev.yaml，前端走 web/dist |
| `make run-debug` | 后端 debug 模式（自动读取 dev.yaml + pprof :6060 + Debug 日志） |
| `make fmt` / `make vet` / `make tidy` | go fmt / go vet / go mod tidy |
| `make lint` | `go vet` + 前端 typecheck |
| `make test` | go test（多数 `*_test.go` 用内存 SQLite） |
| `make docker-up` / `make docker-down` / `make docker-logs` | Docker Compose 编排 |
| `make clean` | 清理 `bin/` 与 `web/dist` |

## 开发循环

### 改后端

```bash
make run          # 改动后 Ctrl-C 重启；或
make run-debug    # 带 pprof 与 Debug 日志
```

### 改前端

```bash
make web-dev      # Vite 热更新，无需重启后端
```

> `web/dist` **不嵌入** Go 二进制，前端是磁盘文件——只换前端不用重编 Go，`WEB_DIR` 指向新产物即可。

### 检查与测试

```bash
make vet      # go vet
make lint     # go vet + 前端 typecheck
make test     # go test
make build    # 全量构建验证
```

> 项目没有单元测试 CI（已有 17 个 `*_test.go` 多数用内存 SQLite），关键路径请配合日志 + Web 面板手工验证。

## 调试

### Debug 模式

```bash
make run-debug
# 或
./bin/juan-niang-neo -debug
# 自定义 pprof 端口
./bin/juan-niang-neo -debug -pprof-addr :6061
```

| 功能 | 说明 |
|------|------|
| 日志级别 | Debug，所有 Debug 级别日志可见（插件图片处理耗时、异步消息发送耗时、Eino tool call 详情等） |
| pprof | HTTP 服务 `:6060`，支持 CPU/heap/goroutine 等 profile |
| 启动详情 | 打印 Go 版本、CPU 核数、每个插件的 name/version/permissions |

### pprof 常用命令

```bash
# CPU 火焰图（采集 30s）
go tool pprof -http :8080 http://127.0.0.1:6060/debug/pprof/profile

# goroutine 快照
go tool pprof -http :8080 http://127.0.0.1:6060/debug/pprof/goroutine

# 内存分配
go tool pprof -http :8080 http://127.0.0.1:6060/debug/pprof/heap
```

### 实时日志

- Web 面板「日志」页：`GET /api/v1/logs`（最近 250 条）+ `GET /api/v1/logs/stream`（SSE 实时）
- 命令行：直接看 stdout，插件日志带 `[plugin:<name>]` 前缀

## 端口约定

| 端口 | 用途 |
|------|------|
| `8090` | Web API + 仪表板（前端 SPA 兜底同端口） |
| `8081` | OneBot11 反向 WebSocket（QQ 机器人框架连接） |
| `8091` | Webhook HTTP 服务（独立端口，默认关闭） |
| `3000` | Vite 开发服务器（仅 dev） |
| `6060` | pprof（仅 debug） |

## 再深入

- 想了解代码结构"该读什么、该改什么" → [开发指南](development.md)
- 想理解架构设计 → [架构与设计](architecture.md)
- 想写插件 → [插件开发指南](../plugins/quickstart.md)
