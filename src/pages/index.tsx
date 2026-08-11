import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {Icon} from '@iconify/react/offline';
import type {JSX} from 'react';
import styles from './index.module.css';
import {registerIconify} from '../icons/register';
import DepthCarousel from '../components/DepthCarousel';
import GithubInfo from '../components/GithubInfo';
import {Marquee, MarqueeContent, MarqueeItem, MarqueeFade} from '../components/Marquee';
import StickerPeel from '../components/StickerPeel';

// 注册离线 Iconify 图标集合（幂等）
registerIconify();

const repoUrl = 'https://github.com/JuanNiangDev/JuanNiang-Neo';

const features = [
  {
    icon: 'mdi:robot',
    color: '#6366f1',
    title: 'Agent 系统',
    points: ['基于 Eino ADK 的 ChatModelAgent', 'OpenAI 兼容，Provider / MCP / Tool / Skill / Prompt / Plugin 多模块组合', '工具调用在 ReAct 循环内同步完成'],
  },
  {
    icon: 'mdi:lightning-bolt',
    color: '#f59e0b',
    title: '异步并发处理',
    points: ['ConcurrencyManager 控制每 ChatArea 最多 8 个 Agent goroutine 并发', '事件经三阶段管线高效分流'],
  },
  {
    icon: 'mdi:brain',
    color: '#ec4899',
    title: '四层记忆体系',
    points: ['短期记忆（Redis 滑动窗口 + 自动 Compact）', '长期记忆（Postgres + LRU）', '技能记忆 / 会话记录，全部持久化可审计'],
  },
  {
    icon: 'mdi:puzzle',
    color: '#10b981',
    title: 'Lua 插件系统',
    points: ['gopher-lua 驱动，多级命令 + LuaCATS SDK 代码提示', '插件商店从 GitHub 一键安装', '动态配置由 Web 面板渲染'],
  },
  {
    icon: 'mdi:monitor',
    color: '#3b82f6',
    title: 'Web 管理后台',
    points: ['Vue 3 + Vuetify 3', 'JWT 鉴权（可选 OIDC SSO）', '管理全部配置与运行时状态，支持热切换'],
  },
  {
    icon: 'mdi:package-variant-closed',
    color: '#8b5cf6',
    title: '开箱即用模块',
    points: ['SQL 知识库 / 图床 / 表情包库', '摸鱼人日历 / 定时消息（积木式编排）', 'Postgres + Redis + Sandbox + T2I 可插拔基础设施'],
  },
];

// 首页「技术栈」区块：卷娘核心开发栈
const techStack = [
  'Go',
  'Eino ADK',
  'OneBot11',
  'LLM（OpenAI 兼容）',
  'Vue 3',
  'Vuetify 3',
  'Lua（gopher-lua）',
  'PostgreSQL',
  'Redis',
  'Docker Compose',
];

const chapters = [
  {
    icon: 'mdi:book-open-variant',
    color: '#06b6d4',
    title: '入门',
    desc: '了解项目定位与技术栈',
    to: '/docs/intro',
  },
  {
    icon: 'mdi:rocket-launch',
    color: '#f97316',
    title: '快速开始',
    desc: 'Docker Compose 一键部署 + 首次启动清单',
    to: '/docs/quickstart',
  },
  {
    icon: 'mdi:tools',
    color: '#14b8a6',
    title: '部署',
    desc: '环境变量、构建、健康检查、反代、systemd、FAQ',
    to: '/docs/deployment',
  },
  {
    icon: 'mdi:code-tags',
    color: '#22c55e',
    title: '二次开发',
    desc: '本地开发环境、架构设计、Web API',
    to: '/docs/development/setup',
  },
  {
    icon: 'mdi:puzzle',
    color: '#d946ef',
    title: '插件开发',
    desc: 'Lua API 参考、插件商店、示例插件',
    to: '/docs/plugins/quickstart',
  },
  {
    icon: 'mdi:package-variant-closed',
    color: '#eab308',
    title: '插件仓库',
    desc: 'JuanNiang-Plugins：hago CLI 与贡献指南',
    to: '/docs/plugins/repo',
  },
];

const screenshots = [
  {src: '/img/login.webp', alt: '登录页'},
  {src: '/img/home.webp', alt: '首页'},
  {src: '/img/chat.webp', alt: '聊天'},
];

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroBg} aria-hidden="true">
            <img src="/img/banner.webp" alt="" className={styles.heroBgImg} />
            <div className={styles.heroMask} />
          </div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>JuanNiang</h1>
            <p className={styles.heroTagline}>基于 OneBot11 协议的 LLM QQ 聊天 Agent</p>
            <div className={styles.heroButtons}>
              <Link className="button button--primary button--lg" to="/docs/quickstart">
                快速开始
              </Link>
              <Link className="button button--secondary button--lg" href={repoUrl}>
                GitHub
              </Link>
            </div>
          </div>
          <StickerPeel
            imageSrc="/img/stick.webp"
            className={styles.heroMascot}
            rotate={30}
            peelBackHoverPct={30}
            peelBackActivePct={40}
          />
        </section>

        {/* 项目介绍 + 技术栈 */}
        <section className={styles.section}>
          <div className="container">
            <h2 className={styles.sectionTitle}>项目介绍</h2>
            <p className={styles.introText}>
              卷娘（JuanNiang）是红岩网校的吉祥物，也是本项目的名字来源。
              本仓库为卷娘的文档站，由重庆邮电大学红岩网校工作室开发。
              卷娘基于 <strong>Go</strong> 编写，通过 <strong>OneBot11</strong> 协议接入 QQ，
              驱动主流大模型（LLM）实现智能对话，支持 Lua 插件扩展、Web 管理后台与自部署。
            </p>
            <h3 className={styles.techTitle}>技术栈</h3>
            <div className={styles.techStack}>
              {techStack.map((t) => (
                <span key={t} className={styles.techChip}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 特性 */}
        <section className={styles.section}>
          <div className="container">
            <h2 className={styles.sectionTitle}>核心特性</h2>
            <Marquee>
              <MarqueeContent speed={28} direction="left">
                {features.map((f) => (
                  <MarqueeItem key={f.title}>
                    <div className={styles.featureCard}>
                      <div className={styles.featureCardHeader}>
                        <span className={styles.featureIcon}>
                          <Icon icon={f.icon} color={f.color} width={26} height={26} />
                        </span>
                        <h3>{f.title}</h3>
                      </div>
                      <ul className={styles.featurePoints}>
                        {f.points.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  </MarqueeItem>
                ))}
              </MarqueeContent>
              <MarqueeFade side="left" />
              <MarqueeFade side="right" />
            </Marquee>
          </div>
        </section>

        {/* 效果图 */}
        <section className={styles.section}>
          <div className="container">
            <h2 className={styles.sectionTitle}>效果图</h2>
            <div style={{ height: 600 }}>
              <DepthCarousel
                items={screenshots.map(s => ({ image: s.src, alt: s.alt }))}
                cardWidth={960}
                cardHeight={540}
                radius={16}
                autoplay={true}
                autoplayDelay={4000}
              />
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
                    <div className={styles.chapterIcon}>
                      <Icon icon={c.icon} color={c.color} width={32} height={32} />
                    </div>
                    <h3>{c.title}</h3>
                    <p>{c.desc}</p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 仓库 */}
        <section className={styles.section}>
          <div className="container">
            <h2 className={styles.sectionTitle}>项目仓库</h2>
            <div className="row">
              <div className="col col--4">
                <GithubInfo owner="JuanNiangDev" repo="JuanNiang-Neo" />
              </div>
              <div className="col col--4">
                <GithubInfo owner="JuanNiangDev" repo="JuanNiang-Plugins" />
              </div>
              <div className="col col--4">
                <GithubInfo owner="JuanNiangDev" repo="JuanNiang-Docs" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
