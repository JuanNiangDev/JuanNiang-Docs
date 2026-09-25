import {Icon} from '@iconify/react/offline';
import type {JSX, ReactNode} from 'react';
import styles from './FeatureVisual.module.css';

/**
 * 首页「核心特性」卡片的视觉层（efferd features-6/7/8 语言）：
 * 统一走「边缘渐隐遮罩 + 发丝边框 + 悬浮才动」的克制装饰，
 * 每个变体都是一段独立静态图，动效只在首页卡片 hover（.fv-card）时播放。
 */
export type FeatureVisualVariant =
  | 'models'
  | 'bars'
  | 'memory'
  | 'plugins'
  | 'admin'
  | 'modules';

export default function FeatureVisual({variant}: {variant: FeatureVisualVariant}): JSX.Element {
  switch (variant) {
    case 'models':
      return <ModelsVisual />;
    case 'bars':
      return <BarsVisual />;
    case 'memory':
      return <MemoryVisual />;
    case 'plugins':
      return <PluginsVisual />;
    case 'admin':
      return <AdminVisual />;
    case 'modules':
      return <ModulesVisual />;
    default:
      return <div />;
  }
}

/* ---------- Agent 系统：多模型选择（efferd features-8「Choose any LLM」） ---------- */

const MODELS: Array<{icon: string; label: string; brand: string; active?: boolean}> = [
  {icon: 'brands:googlegemini', label: 'Gemini', brand: 'fv-gemini'},
  {icon: 'brands:anthropic', label: 'Claude', brand: 'fv-anthropic'},
  {icon: 'brands:deepseek', label: 'DeepSeek', brand: 'fv-deepseek'},
  {icon: 'brands:openai', label: 'OpenAI', brand: 'fv-openai', active: true},
  {icon: 'brands:qwen', label: 'Qwen', brand: 'fv-qwen'},
  {icon: 'brands:glm', label: 'GLM', brand: 'fv-glm'},
  {icon: 'brands:kimi', label: 'Kimi', brand: 'fv-kimi'},
  {icon: 'brands:minimax', label: 'MiniMax', brand: 'fv-minimax'},
];

function ModelsVisual(): JSX.Element {
  return (
    <div className={`${styles.fadeX} ${styles.modelsViewport}`}>
      <div className={styles.models}>
        {MODELS.map((m) => (
          <div
            className={`${styles.modelSlot} ${m.active ? styles.modelSlotActive : ''}`}
            key={m.label}>
            <span className={`${styles.modelTile} ${m.brand}`}>
              <Icon icon={m.icon} width={26} height={26} aria-hidden="true" />
            </span>
            {m.active ? <span className={styles.modelLabel}>{m.label}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- 异步并发：柱状图 + 悬浮标签（efferd features-7「Actual Analytics」） ---------- */

const BARS = [34, 46, 56, 92, 64, 50, 28];

function BarsVisual(): JSX.Element {
  return (
    <div className={styles.barsViewport}>
      <span className={styles.barsTip}>
        <i className={styles.barsDot} />
        8 goroutines
      </span>
      <svg className={styles.bars} viewBox="0 0 240 112" role="img" aria-label="并发量柱状图">
        <line
          x1="4"
          y1="106"
          x2="236"
          y2="106"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.18"
        />
        {BARS.map((h, i) => (
          <rect
            key={i}
            x={14 + i * 30}
            y={106 - h}
            width="22"
            height={h}
            rx="4"
            className={`fv-bar ${i === 3 ? styles.barHi : styles.bar}`}
            style={{animationDelay: `${i * 70}ms`}}
          />
        ))}
      </svg>
    </div>
  );
}

/* ---------- 四层记忆：会话逐行浮现 + 光标闪烁（efferd features-8「Built-in memory」） ---------- */

const MEMORY_LINES = [
  '短期记忆：Redis 滑动窗口，超限即自动 Compact。',
  '长期记忆：Postgres 持久化 + LRU 淘汰。',
  '技能记忆与会话记录同步落库，逐条可审计。',
];

function MemoryVisual(): JSX.Element {
  return (
    <div className={styles.memory}>
      <div className={styles.memoryHead}>
        <span className={styles.memoryAvatar}>
          <Icon icon="mdi:brain" width={15} height={15} aria-hidden="true" />
        </span>
        <span className={styles.memoryName}>Agent</span>
        <span className={styles.memoryTime}>[12:21]</span>
      </div>
      <p className={styles.memoryText}>
        {MEMORY_LINES.map((line, i) => (
          <span
            className={styles.memoryLine}
            style={{animationDelay: `${i * 150}ms`}}
            key={line}>
            {line}
          </span>
        ))}
        <span className={styles.memoryCaret} style={{animationDelay: '480ms'}} />
      </p>
    </div>
  );
}

/* ---------- Lua 插件：虚线插槽里的插件胶囊逐个弹入（efferd features-7「Easy to Use」） ---------- */

const PLUGINS = [
  'welcome',
  'redrock_quiz',
  'redrock_caidanci',
  'redrock_group_manager',
  'redrock_fanzha',
  'redrock_caidanci_grade',
];

function PluginsVisual(): JSX.Element {
  return (
    <div className={`${styles.fadeX} ${styles.pluginsViewport}`}>
      <div className={styles.plugins}>
        {PLUGINS.map((p, i) => (
          <span className={styles.pluginSlot} key={p}>
            <span className={styles.pluginChip} style={{animationDelay: `${i * 90}ms`}}>
              <Icon icon="mdi:puzzle" width={14} height={14} aria-hidden="true" />
              {p}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Web 管理后台：窗口上浮 + 高光扫过（efferd features-6 dashboard） ---------- */

function AdminVisual(): JSX.Element {
  return (
    <div className={styles.adminViewport}>
      <figure className={styles.adminWindow}>
        <span className={styles.adminBar} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <img src="/img/home.webp" alt="卷娘 Web 管理后台" loading="lazy" />
      </figure>
    </div>
  );
}

/* ---------- 开箱即用模块：虚线方格逐个浮起（efferd features-7「Integrate Fearlessly」） ---------- */

function Glyph({children}: {children: ReactNode}): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      width={22}
      height={22}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      {children}
    </svg>
  );
}

const MODULES: Array<{key: string; label: string; brand?: string; icon: JSX.Element}> = [
  {
    key: 'kb',
    label: 'SQL 知识库',
    icon: (
      <Glyph>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
        <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
      </Glyph>
    ),
  },
  {
    key: 'img',
    label: '图床',
    icon: (
      <Glyph>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9.5" r="1.5" />
        <path d="m4 18 5-5 4 4 3-3 4 4" />
      </Glyph>
    ),
  },
  {
    key: 'sticker',
    label: '表情包库',
    icon: (
      <Glyph>
        <circle cx="12" cy="12" r="9" />
        <circle cx="9" cy="10" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="15" cy="10" r="0.9" fill="currentColor" stroke="none" />
        <path d="M8.5 14.5c1 1.6 2.2 2.4 3.5 2.4s2.5-.8 3.5-2.4" />
      </Glyph>
    ),
  },
  {
    key: 'calendar',
    label: '摸鱼人日历',
    icon: (
      <Glyph>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </Glyph>
    ),
  },
  {
    key: 'schedule',
    label: '定时消息',
    icon: (
      <Glyph>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </Glyph>
    ),
  },
  {
    key: 'sandbox',
    label: 'Sandbox',
    icon: (
      <Glyph>
        <path d="m8 8-4 4 4 4M16 8l4 4-4 4" />
      </Glyph>
    ),
  },
  {
    key: 'postgres',
    label: 'PostgreSQL',
    brand: 'fv-postgres',
    icon: <Icon icon="brands:postgresql" width={22} height={22} aria-hidden="true" />,
  },
  {
    key: 'redis',
    label: 'Redis',
    brand: 'fv-redis',
    icon: <Icon icon="brands:redis" width={22} height={22} aria-hidden="true" />,
  },
];

function ModulesVisual(): JSX.Element {
  return (
    <div className={styles.modulesViewport}>
      <div className={styles.modules}>
        {MODULES.map((m, i) => (
          <span
            className={styles.moduleTile}
            style={{animationDelay: `${i * 60}ms`}}
            key={m.key}>
            <span className={`${styles.moduleIcon} ${m.brand ?? ''}`}>{m.icon}</span>
            <span className={styles.moduleLabel}>{m.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
