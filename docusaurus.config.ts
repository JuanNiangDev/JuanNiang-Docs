import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const repoUrl = 'https://github.com/JuanNiangDev/JuanNiang-Neo';
const pluginsRepoUrl = 'https://github.com/JuanNiangDev/JuanNiang-Plugins';

// 站点部署域名（单一来源）：默认 nginx 托管域名，可用环境变量 SITE_URL 覆盖，避免硬编码。
const siteUrl = process.env.SITE_URL ?? 'https://docs.juan.team';

const config: Config = {
  title: 'JuanNiang-Neo',
  // tagline 同时作为全站 meta description 与 og:description（主题自动注入）
  tagline:
    '卷娘（JuanNiang）是红岩网校的吉祥物。本仓库由重庆邮电大学红岩网校工作室开发，基于 Go 与 OneBot11 协议接入大模型的 QQ 聊天 Agent，支持 Lua 插件扩展、Web 管理后台与自部署。',
  favicon: 'img/avatar.webp',

  // 部署地址：生产由 nginx 托管于 https://docs.juan.team（不走 GitHub Pages，故 url 用真实域名）
  url: siteUrl,
  baseUrl: '/',
  trailingSlash: false,

  // 构建加速 + 更小产物：Lightning CSS 压缩样式、SWC 压缩 JS（@docusaurus/faster 已安装）
  future: {
    faster: {
      lightningCssMinimizer: true,
      swcJsMinimizer: true,
    },
  },

  onBrokenLinks: 'warn',

  // 注入脚本：chunk 加载失败自动重试 + mermaid 缩放/拖动交互
  headTags: [
    {
      tagName: 'script',
      attributes: {
        src: '/js/chunk-retry.js',
        defer: true,
      },
    },
    {
      tagName: 'script',
      attributes: {
        src: '/js/mermaid-panzoom.js',
        defer: true,
      },
    },

    // ===== SEO 元信息（关键词、描述、Open Graph、Twitter Card、结构化数据）=====
    // 关键词：帮助搜索引擎理解站点主题（避免堆砌）
    {
      tagName: 'meta',
      attributes: {
        name: 'keywords',
        content:
          'JuanNiang, JuanNiang-Neo, 卷娘, OneBot11, OneBot 协议, QQ 机器人, QQ Bot, LLM, 大模型, 聊天机器人, AI 聊天 Agent, 智能对话, Go, 开源',
      },
    },
    // 网站描述由主题以 tagline 生成（data-rh），此处不再重复注入 description，避免出现两个 meta description。
    // Open Graph：Facebook / 微博 / QQ / 微信 等平台分享预览
    {tagName: 'meta', attributes: {property: 'og:type', content: 'website'}},
    {tagName: 'meta', attributes: {property: 'og:site_name', content: 'JuanNiang-Neo'}},
    // og:image 为 static/img/banner.webp（640×350）
    {tagName: 'meta', attributes: {property: 'og:image:type', content: 'image/webp'}},
    {tagName: 'meta', attributes: {property: 'og:image:width', content: '640'}},
    {tagName: 'meta', attributes: {property: 'og:image:height', content: '350'}},
    {tagName: 'meta', attributes: {property: 'og:image:alt', content: 'JuanNiang-Neo 项目横幅'}},
    // Twitter Card：推特分享预览（twitter:card/image 由主题生成）
    {tagName: 'meta', attributes: {name: 'twitter:title', content: 'JuanNiang-Neo - 基于 OneBot11 协议的 LLM QQ 聊天 Agent'}},
    {tagName: 'meta', attributes: {name: 'twitter:description', content: '基于 OneBot11 协议的 LLM QQ 聊天 Agent，支持插件扩展与二次开发。'}},
    {tagName: 'meta', attributes: {name: 'twitter:image:alt', content: 'JuanNiang-Neo 项目横幅'}},
    // 结构化数据：WebSite schema，增强搜索引擎对站点的理解
    {
      tagName: 'script',
      attributes: {type: 'application/ld+json'},
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'JuanNiang-Neo',
        alternateName: '卷娘',
        url: `${siteUrl}/`,
        description:
          '卷娘（JuanNiang）是红岩网校的吉祥物。本仓库由重庆邮电大学红岩网校工作室开发，基于 Go 与 OneBot11 协议接入大模型的 QQ 聊天 Agent，支持 Lua 插件扩展、Web 管理后台与自部署。',
        inLanguage: 'zh-CN',
        publisher: {
          '@type': 'Organization',
          name: '重庆邮电大学红岩网校工作室',
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/img/banner.webp`,
          },
        },
      }),
    },
  ],

  // 站内文档为中文，设置 html lang
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/docs',
          // 如文档与主仓库 docs/ 同源，可开启编辑链接；仓库就绪后取消注释
          // editUrl: `${repoUrl}/tree/main/docs/`,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        // 站点地图：构建时生成 sitemap.xml，供搜索引擎爬取
        sitemap: {
          lastmod: 'date',
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/search/**'],
        },
      } satisfies Preset.Options,
    ],
  ],

  // mermaid 图表支持（```mermaid 代码块）
  markdown: {
    mermaid: true,
  },

  // mermaid 图表支持（```mermaid 代码块）+ 本地全文搜索（无外部依赖，支持中文分词）
  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['zh', 'en'],
        highlightSearchTermsOnTargetPage: true,
        docsRouteBasePath: '/docs',
      },
    ],
  ],

  themeConfig: {
    // 站点社交卡片图（og:image / twitter:image）
    image: 'img/banner.webp',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      // 注意：不要开启 respectPrefersColorScheme。
      // 开启后切换按钮是 system → light → dark → system 三态循环，
      // 且每次切换都会触发全部 mermaid 图表重新渲染，导致严重卡顿闪屏。
      respectPrefersColorScheme: false,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    navbar: {
      title: 'JuanNiang-Neo',
      logo: {
        alt: 'JuanNiang-Neo',
        src: 'img/avatar.webp',
      },
      items: [
        {type: 'doc', docId: 'quickstart', label: '快速开始', position: 'left'},
        {type: 'doc', docId: 'deployment', label: '部署', position: 'left'},
        {type: 'doc', docId: 'development/setup', label: '二次开发', position: 'left'},
        {type: 'doc', docId: 'plugins/quickstart', label: '插件', position: 'left'},
        {type: 'doc', docId: 'development/api/intro', label: 'Web API', position: 'left'},
        {
          href: repoUrl,
          label: 'GitHub',
          position: 'right',
        },
        {
          href: pluginsRepoUrl,
          label: '插件仓库',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '入门',
          items: [
            {label: '项目简介', to: '/docs/intro'},
            {label: '快速开始', to: '/docs/quickstart'},
          ],
        },
        {
          title: '部署',
          items: [
            {label: '部署与调试指南', to: '/docs/deployment'},
          ],
        },
        {
          title: '二次开发',
          items: [
            {label: '本地开发环境', to: '/docs/development/setup'},
            {label: '架构与设计', to: '/docs/development/architecture'},
            {label: 'Web API 参考', to: '/docs/development/api/intro'},
          ],
        },
        {
          title: '插件',
          items: [
            {label: '插件开发指南', to: '/docs/plugins/quickstart'},
            {label: 'Lua API 参考', to: '/docs/plugins/api-reference'},
            {label: '插件商店', to: '/docs/plugins/store'},
            {label: '官方插件仓库', to: '/docs/plugins/repo'},
            {label: '示例插件', to: '/docs/plugins/examples'},
          ],
        },
        {
          title: '仓库',
          items: [
            {label: 'JuanNiang-Neo', href: repoUrl},
            {label: 'JuanNiang-Plugins', href: pluginsRepoUrl},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} <a href="https://redrock.team/" target="_blank" rel="noopener noreferrer">红岩网校工作站</a> · JuanNiang-Neo. 由 Docusaurus 强力驱动`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    // mermaid 图表主题：固定为 dark，不随站点明暗模式切换。
    // 若 theme 跟随 colorMode（如 {light:'neutral', dark:'dark'}），
    // 每次切换明暗都会触发全部图表重新渲染（mermaid 串行渲染、体量巨大），
    // 造成长时间卡顿闪屏，故这里固定主题。
    // 注意：必须是 {light, dark} 对象形式（theme-mermaid 内部按 colorMode 取 theme[colorMode]），
    // 两个值相同则明暗切换时 config 引用不变，不会触发重渲染。
    // dark 主题自带深色背景，亮色模式下图表呈现为“深色卡片”，明暗两种模式都可读；
    // 不要设 background: transparent，否则浅色文字在亮色页面上看不清。
    mermaid: {
      theme: {light: 'dark', dark: 'dark'},
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
