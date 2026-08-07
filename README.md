# JuanNiang-Docs（Docusaurus 文档站）

[JuanNiang-Neo](https://github.com/JuanNiangDev/JuanNiang-Neo) 的文档站点，使用 [Docusaurus](https://docusaurus.io/) 构建，涵盖**部署、二次开发与插件开发**。

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

## 维护说明

- 新增文档：在 `docs/` 对应目录创建 `.md` 文件，并在 `sidebars.ts` 对应章节注册
- 修改侧边栏顺序：编辑 `sidebars.ts`
- 从 JuanNiang-Neo 主仓库同步内容时，注意：
  - 每个文档需要 front matter 标题（`---\ntitle: xxx\n---`）
  - 正文 `# H1` 会由 front matter 标题代替，正文章节请使用 `##` 起（H1 不生成锚点）
  - 裸 `<http://...>`、`<TOKEN>`、`{变量}` 会被 MDX 解析，需用反引号包裹或转义
