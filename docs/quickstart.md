---
title: 快速开始
---


本页带你**在 5 分钟内把卷娘跑起来**。部署细节（环境变量、裸机、反代、systemd、故障排查）见 [部署与调试指南](deployment.md)。

## 前置要求

| 项目 | 要求 |
|------|------|
| Docker | 20.10+（Docker Compose v2） |
| 或 Go 工具链 | Go 1.25+（源码运行） |
| 或 Node | 18+（仅本地开发前端时需要） |
| 一个 LLM API | OpenAI 兼容端点（密钥在 Web 面板配置，可后补） |
| 一个 OneBot11 实现 | [NapCat](https://napcat.napneko.icu/) / [Lagrange](https://github.com/LagrangeDev/Lagrange.Core) 等（可后接） |

> 💡 没有 LLM 或 OneBot 客户端也能先启动面板：未配置时相关功能自动返回"未启用"提示。

## 方式一：Docker Compose（推荐）

镜像已发布至 `ghcr.io/juanniangdev/juan`。在任意目录新建 `docker-compose.yaml`：

```yaml
name: juanniang-neo

services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-juan}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 10s
      timeout: 10s
      retries: 5
    networks: [juanniang-net]

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD:-root}
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD:-root}", "ping"]
      interval: 10s
      timeout: 10s
      retries: 5
    networks: [juanniang-net]

  juan-niang-neo:
    image: ghcr.io/juanniangdev/juan:latest
    restart: unless-stopped
    init: true
    ports:
      - "8081:8081"   # OneBot11 反向 WS
      - "8090:8090"   # Web API + 仪表板
    environment:
      WEB_DIR: /app/web/dist
      OB_PORT: "8081"
      API_ADDR: ":8090"
      DB_HOST: postgres
      DB_PORT: "5432"
      DB_USER: ${DB_USER:-postgres}
      DB_PASSWORD: ${DB_PASSWORD:-postgres}
      DB_NAME: ${DB_NAME:-juan}
      REDIS_ADDR: redis:6379
      REDIS_PASSWORD: ${REDIS_PASSWORD:-root}
      JWT_SECRET: ${JWT_SECRET:-change-me-in-production}
      OB_TOKEN: ${OB_TOKEN:-}
      OB_ADMINS: ${OB_ADMINS:-}
    depends_on:
      postgres: { condition: service_healthy }
      redis:    { condition: service_healthy }
    volumes:
      - ./data:/app/data                     # 插件/图床/商店配置跨升级保留
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://127.0.0.1:8090/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s
    networks: [juanniang-net]

volumes:
  pgdata:

networks:
  juanniang-net:
    driver: bridge
```

同目录放 `.env`（按需修改）：

```bash
DB_PASSWORD=postgres
REDIS_PASSWORD=root
JWT_SECRET=请改成一段足够长的随机字符串
OB_TOKEN=请设置一个令牌（OneBot 客户端连接用）
OB_ADMINS=
```

**首次启动前**需创建插件目录并赋权：

```bash
mkdir -p data && chmod 777 data
docker compose up -d
```

启动完成后：

- **Web 仪表板**：[http://localhost:8090](http://localhost:8090)，初始账号 `admin` / `Admin123`（**首次登录务必改密码**）
- **OneBot11 反向 WS**：`ws://localhost:8081/`，请求头带 `Authorization: Bearer <OB_TOKEN>`

## 方式二：本地源码运行

```bash
# 1. 克隆并进入仓库
git clone https://github.com/JuanNiangDev/JuanNiang-Neo.git
cd JuanNiang-Neo

# 2. 准备依赖：Postgres + Redis（可用 Docker 起，或使用已有实例）

# 3. 复制开发配置并按需修改（数据库、Redis 连接等）
cp dev.yaml.example dev.yaml

# 4. 安装前端依赖并构建
make web-install && make web-build

# 5. 启动（Vite :3000 热更新 + Go :8090 API 并行）
make dev
# 或只跑后端（前端走 web/dist）
make run
```

> 配置优先级：**环境变量 > dev.yaml > 内置默认值**。详见 [本地开发环境](development/setup.md)。

## 首次启动清单

1. ✅ 登录 Web 面板（`admin / Admin123`），立即 `POST /api/v1/change-password` 改默认密码
2. **配置 LLM Provider**：「Providers」页添加 OpenAI 兼容端点（Base URL / API Key / 模型名），并激活为文本模型
3. **配置 Adapter**：「Adapter」页设置 `OB_TOKEN` 与 admin QQ，启用
4. **连接 OneBot11 客户端**：让 NapCat/Lagrange 以反向 WS 方式连接 `ws://<你的服务器>:8081/`，携带 `Authorization: Bearer <OB_TOKEN>`
5. **配置回复策略**：「回复策略」页设置群聊行为（`always` / `at_only` / `relevance` / `never_reply`）
6. 可选：配置 T2I（文生图）、Sandbox（代码沙箱）、知识库等。T2I 与 Sandbox 需先自行部署依赖服务：
   - T2I：[astrbot-t2i-service](https://github.com/AstrBotDevs/astrbot-t2i-service) → `docker run -itd -p 8999:8999 soulter/astrbot-t2i-service:latest`
   - Sandbox：[shipyard-neo](https://github.com/AstrBotDevs/shipyard-neo)
   - 然后在 Web 面板对应页面填写服务地址并启用（详见[外部服务](development/external-services.md)）

## 验证部署

```bash
# 健康检查（无需鉴权）
curl http://localhost:8090/health
# => {"status":"ok"}

# 查看实时日志（Web 面板「日志」页也有 SSE 流）
docker logs -f juan-niang-neo

# 在群里 @ 卷娘 发条消息试试；或在私聊直接发
```

如果 LLM 不回复，按 [FAQ](deployment.md#faq) 排查（Provider 未激活 / 回复策略 / ACL / 群聊需 @ 等）。

## 下一步

- 了解项目架构 → [架构与设计](development/architecture.md)
- 写第一个插件 → [插件开发指南](plugins/quickstart.md)
- 安装社区插件 → [插件商店](plugins/store.md)
