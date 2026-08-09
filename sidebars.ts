import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// 文档站侧边栏：按「入门 / 部署 / 二次开发 / Web API / 插件 / Git 指南 / Lua 开发教学」组织，
// 二次开发与插件章节内再分子分类，细化导航层级；Git 指南与 Lua 教学为独立章节，与卷娘文档分开
const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: '入门',
      items: ['intro', 'quickstart'],
    },
    {
      type: 'category',
      label: '部署',
      items: ['deployment'],
    },
    {
      type: 'category',
      label: '二次开发',
      items: [
        {
          type: 'category',
          label: '环境与工具',
          items: ['development/setup', 'development/development'],
        },
        {
          type: 'category',
          label: '架构与原理',
          items: [
            'development/architecture',
            'development/external-services',
            'development/webhook-cronjob',
          ],
        },
        'development/llm-provider',
      ],
    },
    {
      type: 'category',
      label: 'Web API 参考',
      items: [
        'development/api/intro',
        'development/api/agent',
        'development/api/features',
        'development/api/infra',
      ],
    },
    {
      type: 'category',
      label: '插件',
      items: [
        {
          type: 'category',
          label: '开发指南',
          items: [
            'plugins/quickstart',
            'plugins/api-reference',
            'plugins/engine',
            'plugins/pitfalls',
          ],
        },
        'plugins/store',
        'plugins/repo',
        'plugins/examples',
      ],
    },
    {
      type: 'category',
      label: 'Git 指南',
      items: [
        'git/intro',
        'git/install',
        'git/account',
        'git/repository',
        'git/pull-request',
        'git/cheatsheet',
        'git/appendix',
      ],
    },
    {
      type: 'category',
      label: 'Lua 开发教学',
      items: [
        'lua/intro',
        'lua/basics',
        'lua/control-flow',
        'lua/functions',
        'lua/tables',
        'lua/metatables',
        'lua/modules',
        'lua/best-practices',
      ],
    },
  ],
};

export default sidebars;
