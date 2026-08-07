import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// 文档站侧边栏：按「入门 / 部署 / 二次开发 / Web API / 插件」五章组织，
// 二次开发与插件章节内再分子分类，细化导航层级
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
  ],
};

export default sidebars;
