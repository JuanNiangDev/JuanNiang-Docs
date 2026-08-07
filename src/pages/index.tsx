import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type {JSX} from 'react';
import styles from './index.module.css';

const repoUrl = 'https://github.com/JuanNiangDev/JuanNiang-Neo';
const pluginsRepoUrl = 'https://github.com/JuanNiangDev/JuanNiang-Plugins';

const features = [
  {
    icon: '🤖',
    title: 'Agent 系统',
    desc: '基于 Eino ADK 的 ChatModelAgent（OpenAI 兼容），Provider / MCP / Tool / Skill / Prompt / Plugin 多模块组合，工具调用在 ReAct 循环内同步完成',
  },
  {
    icon: '⚡',
    title: '异步并发处理',
    desc: 'ConcurrencyManager 控制每 ChatArea 最多 8 个 Agent goroutine 并发，事件经三阶段管线（Plugin 拦截 → 回复策略 → Agent 派发）高效分流',
  },
  {
    icon: '🧠',
    title: '四层记忆体系',
    desc: '短期记忆（Redis 滑动窗口 + 自动 Compact）/ 长期记忆（Postgres + LRU）/ 技能记忆 / 会话记录，全部持久化可审计',
  },
  {
    icon: '🧩',
    title: 'Lua 插件系统',
    desc: 'gopher-lua 驱动，多级命令 + LuaCATS SDK 代码提示 + 插件目录文件读写；插件商店从 GitHub 一键安装，动态配置由 Web 面板渲染',
  },
  {
    icon: '🖥️',
    title: 'Web 管理后台',
    desc: 'Vue 3 + Vuetify 3，JWT 鉴权（可选 OIDC SSO），管理全部配置与运行时状态，支持热切换',
  },
  {
    icon: '📦',
    title: '开箱即用模块',
    desc: 'SQL 知识库 / 图床 / 表情包库 / 摸鱼人日历 / 定时消息（积木式编排）等内置功能，Postgres + Redis + Sandbox + T2I 可插拔基础设施',
  },
];

const chapters = [
  {
    title: '📖 入门',
    desc: '了解项目定位与技术栈',
    to: '/docs/intro',
  },
  {
    title: '🚀 快速开始',
    desc: 'Docker Compose 一键部署 + 首次启动清单',
    to: '/docs/quickstart',
  },
  {
    title: '🛠️ 部署',
    desc: '环境变量、构建、健康检查、反代、systemd、FAQ',
    to: '/docs/deployment',
  },
  {
    title: '💻 二次开发',
    desc: '本地开发环境、架构设计、Web API',
    to: '/docs/development/setup',
  },
  {
    title: '🧩 插件开发',
    desc: 'Lua API 参考、插件商店、示例插件',
    to: '/docs/plugins/quickstart',
  },
  {
    title: '📦 插件仓库',
    desc: 'JuanNiang-Plugins：hago CLI 与贡献指南',
    to: '/docs/plugins/repo',
  },
];

const screenshots = [
  {src: '/img/login.png', alt: '登录页'},
  {src: '/img/home.png', alt: '首页'},
  {src: '/img/chat.png', alt: '聊天'},
];

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main>
        {/* Hero */}
        <section className={styles.hero}>
          <img src="/img/banner.png" alt="JuanNiang-Neo" className={styles.banner} />
          <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
          <p className={styles.heroTagline}>{siteConfig.tagline}</p>
          <div className={styles.heroButtons}>
            <Link className="button button--primary button--lg" to="/docs/quickstart">
              快速开始
            </Link>
            <Link className="button button--secondary button--lg" href={repoUrl}>
              GitHub
            </Link>
          </div>
        </section>

        {/* 特性 */}
        <section className={styles.section}>
          <div className="container">
            <h2 className={styles.sectionTitle}>核心特性</h2>
            <div className="row">
              {features.map((f) => (
                <div className="col col--4" key={f.title}>
                  <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>{f.icon}</div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 章节导航 */}
        <section className={styles.section}>
          <div className="container">
            <h2 className={styles.sectionTitle}>文档导航</h2>
            <div className="row">
              {chapters.map((c) => (
                <div className="col col--4" key={c.title}>
                  <Link className={styles.chapterCard} to={c.to}>
                    <h3>{c.title}</h3>
                    <p>{c.desc}</p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 效果图 */}
        <section className={styles.section}>
          <div className="container">
            <h2 className={styles.sectionTitle}>效果图</h2>
            <div className="row">
              {screenshots.map((s) => (
                <div className="col col--4" key={s.src}>
                  <img src={s.src} alt={s.alt} className={styles.screenshot} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 仓库 */}
        <section className={styles.section}>
          <div className="container">
            <h2 className={styles.sectionTitle}>相关仓库</h2>
            <div className={styles.repoCards}>
              <a className={styles.repoCard} href={repoUrl}>
                <strong>JuanNiang-Neo</strong>
                <span>主项目：机器人本体 + Web 管理面板</span>
              </a>
              <a className={styles.repoCard} href={pluginsRepoUrl}>
                <strong>JuanNiang-Plugins</strong>
                <span>官方插件仓库：插件源码 + 商店元数据 + hago CLI</span>
              </a>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
