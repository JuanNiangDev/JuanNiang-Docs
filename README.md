# JuanNiang-Docs（Docusaurus 文档站）

[JuanNiang-Neo](https://github.com/JuanNiangDev/JuanNiang-Neo) 的文档站点，使用 [Docusaurus](https://docusaurus.io/) 构建，涵盖**部署、二次开发与插件开发**。

## 贡献指南（分支保护）

本仓库对主分支（`main`）启用了分支保护，**禁止直接向主分支提交代码**：

- **仓库内贡献者（读写权限）**：所有文档修改必须在**新建的分支**（如 `docs/xxx`）上进行，然后通过 **Pull Request** 合并到主分支；直接 push 到 `main` 会被拒绝。
- **Fork 贡献者（含 agent 协作）**：可在自 fork 仓库的**主分支**上自由开发、提交（fork 的 `main` 不受上游分支保护限制）；但向本仓库贡献改动时，必须**基于功能分支**向本仓库发起 Pull Request；**禁止从 fork 仓库的主分支（`main`/`master`）直接发起 PR**，此类 PR 将被拒绝。
- **重要（agent 协作）**：当用户要求「发起 PR / 合并 PR」时，**不得把功能分支直接合并进 fork 自己的 `main`**——那只是本地合并，并不会把改动贡献给上游。应基于该功能分支向**上游仓库（`upstream`）**发起 Pull Request，由上游维护者合并。
- 主分支的合并只能通过 Pull Request 完成。

## 本地开发

```bash
npm install
npm start          # 启动开发服务器（默认 http://localhost:3000，热更新）
npm run build      # 生产构建（输出到 build/）
npm run serve      # 本地预览生产构建
npm run typecheck  # TypeScript 类型检查
```

## 站点结构

```
docs/                        # 文档内容（Markdown/MDX）
├── intro.md                 # 项目简介（入门）
├── quickstart.md            # 快速开始（入门）
├── deployment.md            # 部署与调试指南（部署）
├── development/             # 二次开发章节
│   ├── setup.md             # 本地开发环境
│   ├── architecture.md      # 架构与设计
│   ├── development.md       # 开发指南
│   ├── api.md               # Web API 文档
│   ├── external-services.md # 外部服务
│   ├── webhook-cronjob.md   # Webhook 与 CronJob
│   └── llm-provider.md      # LLM Provider 适配方案
└── plugins/                 # 插件章节
    ├── development.md       # 插件开发指南
    ├── store.md             # 插件商店
    ├── repo.md              # 官方插件仓库
    └── examples.md          # 示例插件

src/
├── pages/index.tsx          # 首页（自定义落地页）
└── css/custom.css           # 全局样式（品牌色 / mermaid 适配）

static/img/                  # 站点图片（avatar / banner / 截图）
sidebars.ts                  # 侧边栏结构（入门/部署/二次开发/插件）
docusaurus.config.ts         # 站点配置（导航 / 暗色模式 / mermaid / 搜索）
```

## 主要功能

- **暗色模式**：默认暗色，可切换亮色（`colorMode.defaultMode: 'dark'`）
- **Mermaid 图表**：` ```mermaid ` 代码块直接渲染（`markdown.mermaid: true`），明暗模式自动切换主题
- **本地全文搜索**：`@easyops-cn/docusaurus-search-local`，支持中文分词，无外部服务依赖
- **章节侧边栏**：入门 / 部署 / 二次开发 / 插件 四章

## 部署

`npm run build` 产物在 `build/`，可部署到 GitHub Pages / Vercel / Netlify / 任意静态服务器。

- GitHub Pages 项目站点：将 `docusaurus.config.ts` 中 `baseUrl` 改为 `/<仓库名>/`
- 部署脚本：`npm run deploy`（需在配置中设置 `organizationName` / `projectName`）

## Docker 打包

仓库自带 `Dockerfile`（多阶段构建：Node 构建 → nginx 托管）与 `nginx.conf`（SPA 路由回退 / gzip / 静态资源缓存 / 健康检查）：

```bash
# 构建镜像
cd JuanNiang-Docs
# 国内网络可加 --build-arg NPM_REGISTRY=https://registry.npmmirror.com 加速

docker build -t juan-docs .

# 运行
docker run -d --name juan-docs -p 8080:80 juan-docs
# 访问 http://localhost:8080

# 或 docker compose
docker run -d --name juan-docs --restart unless-stopped -p 8080:80 \
  -e TZ=Asia/Shanghai juan-docs
```

镜像内 nginx 监听 `80` 端口，健康检查地址 `/healthz`（Docker `HEALTHCHECK` 每 30s 探测）。

## 维护说明

- 新增文档：在 `docs/` 对应目录创建 `.md` 文件，并在 `sidebars.ts` 对应章节注册
- 修改侧边栏顺序：编辑 `sidebars.ts`
- 从 JuanNiang-Neo 主仓库同步内容时，注意：
  - 每个文档需要 front matter 标题（`---\ntitle: xxx\n---`）
  - 正文 `# H1` 会由 front matter 标题代替，正文章节请使用 `##` 起（H1 不生成锚点）
  - 裸 `<http://...>`、`<TOKEN>`、`{变量}` 会被 MDX 解析，需用反引号包裹或转义
