import type {JSX} from 'react';
import Link from '@docusaurus/Link';
import {useThemeConfig} from '@docusaurus/theme-common';
import {Icon} from '@iconify/react/offline';
import {registerIconify} from '../../icons/register';
import styles from './styles.module.css';

// 页脚渲染在每个页面，需自带图标集注册（幂等）
registerIconify();

const REPO_URL = 'https://github.com/JuanNiangDev/JuanNiang-Neo';

/** 仓库行（真实仓库，职责取自仓库映射） */
const REPOS = [
  {label: 'JuanNiang-Neo', role: '主程序', href: REPO_URL},
  {
    label: 'JuanNiang-Plugins',
    role: '官方插件',
    href: 'https://github.com/JuanNiangDev/JuanNiang-Plugins',
  },
  {label: 'JuanNiang-Docs', role: '文档站', href: 'https://github.com/JuanNiangDev/JuanNiang-Docs'},
  {
    label: 'JuanNiang-RAG-Service',
    role: 'RAG 服务',
    href: 'https://github.com/JuanNiangDev/JuanNiang-RAG-Service',
  },
];

type FooterLinkItem = {label: string; to?: string; href?: string};
type FooterLinkCol = {title: string; items: FooterLinkItem[]};

/**
 * 站点页脚（整体替换原版 Footer，链接仍来自 themeConfig.footer.links）。
 * 版式：通栏品牌行 → 两列（左文档导航 / 右仓库）→ 条纹分隔条 → 三段底栏。
 */
export default function Footer(): JSX.Element {
  const {footer} = useThemeConfig();
  // useThemeConfig 的 footer 是宽松类型，这里按 Docusaurus 的 footer 分栏结构收窄
  const links = (footer?.links ?? []) as FooterLinkCol[];
  const copyright = footer?.copyright;

  return (
    <footer className={`footer footer--dark ${styles.footer}`}>
      <div className="container">
        <div className={styles.middle}>
          <div className={styles.left}>
            <div className={styles.brand}>
              <span className={styles.masthead}>
                <img
                  className={styles.avatar}
                  src="/img/avatar.webp"
                  alt=""
                  width={34}
                  height={34}
                />
                <span className={styles.wordmark}>JuanNiang</span>
              </span>
              <p className={styles.tagline}>基于 OneBot11 协议的 LLM QQ 聊天 Agent</p>
            </div>

            <nav className={styles.cols} aria-label="文档导航">
              {links.map((col) => (
                <div className={styles.col} key={col.title}>
                  <p className={styles.colTitle}>{col.title}</p>
                  <ul className={styles.colItems}>
                    {col.items.map((item) => (
                      <li key={item.label}>
                        {'to' in item && item.to ? (
                          <Link className={styles.colLink} to={item.to}>
                            {item.label}
                          </Link>
                        ) : (
                          <a
                            className={styles.colLink}
                            href={'href' in item ? item.href : undefined}
                            target="_blank"
                            rel="noopener noreferrer">
                            {item.label}
                            <Icon
                              className={styles.external}
                              icon="mdi:arrow-right"
                              width={12}
                              height={12}
                              aria-hidden="true"
                            />
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div className={styles.repoCol}>
            <p className={styles.colTitle}>仓库</p>
            <ul className={styles.repos}>
              {REPOS.map((r) => (
                <li key={r.label}>
                  <a
                    className={styles.repoRow}
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer">
                    <Icon icon="mdi:github" width={15} height={15} aria-hidden="true" />
                    <span className={styles.repoName}>{r.label}</span>
                    <span className={styles.repoRole}>{r.role}</span>
                    <Icon
                      className={styles.repoArrow}
                      icon="mdi:arrow-right"
                      width={14}
                      height={14}
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
            <a
              className={styles.repoButton}
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer">
              <Icon icon="mdi:star-outline" width={16} height={16} aria-hidden="true" />
              在 GitHub 上查看 JuanNiang-Neo
              <Icon
                className={styles.repoArrow}
                icon="mdi:arrow-right"
                width={15}
                height={15}
                aria-hidden="true"
              />
            </a>
          </div>
        </div>

        <div className={styles.pattern} aria-hidden="true" />

        {copyright ? (
          <div className={styles.bottom} dangerouslySetInnerHTML={{__html: copyright}} />
        ) : null}
      </div>
    </footer>
  );
}
