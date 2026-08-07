import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const repoUrl = 'https://github.com/JuanNiangDev/JuanNiang-Neo';
const pluginsRepoUrl = 'https://github.com/JuanNiangDev/JuanNiang-Plugins';

const config: Config = {
  title: 'JuanNiang-Neo',
  tagline: '基于 OneBot11 协议的 LLM QQ 聊天 Agent',
  favicon: 'img/avatar.png',

  // 部署地址：GitHub Pages 项目站点需把 baseUrl 改为 '/<仓库名>/'（例如 '/JuanNiang-Docs/'）
  url: 'https://juanniangdev.github.io',
  baseUrl: '/',
  trailingSlash: false,

  onBrokenLinks: 'warn',

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
    // 站点社交卡片图
    image: 'img/banner.png',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
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
        src: 'img/avatar.png',
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
      copyright: `Copyright © ${new Date().getFullYear()} 红岩网校 · JuanNiang-Neo. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    // mermaid 图表主题跟随站点明暗模式
    mermaid: {
      theme: {light: 'neutral', dark: 'dark'},
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
