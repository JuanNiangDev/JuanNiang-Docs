import type {JSX} from 'react';
import postgresql from '../../icons/brands/postgresql';
import {BRAND, SOFT, SOFTER, TXT, FILL_SOFT, Brand} from './common';

export default function MemoryDiagram(): JSX.Element {
  return (
    <svg viewBox="0 0 240 138" role="img" aria-label="四层记忆：对话→记忆→Compact→Postgres">
      {/* 对话层 h=28 rx=7 */}
      <g className="a-rise">
        <rect x="20" y="6" width="200" height="28" rx="7" fill={FILL_SOFT} opacity="0.5" stroke={SOFT} strokeWidth="1" />
        <text x="30" y="25" fontSize={7.5} fontWeight={700} fill={BRAND}>对话层</text>
        <text x="84" y="25" fontSize={6} fill={TXT}>短期上下文窗口</text>
      </g>
      {/* 记忆层 h=28 rx=7 */}
      <g className="a-rise" style={{animationDelay: '0.16s'}}>
        <rect x="20" y="38" width="200" height="28" rx="7" fill={FILL_SOFT} opacity="0.5" stroke={SOFT} strokeWidth="1" />
        <text x="30" y="57" fontSize={7.5} fontWeight={700} fill={BRAND}>记忆层</text>
        <text x="84" y="57" fontSize={6} fill={TXT}>工作记忆 / 实体提取</text>
      </g>
      {/* Compact 层 h=20 rx=5（比例 1:4） */}
      <g className="a-rise" style={{animationDelay: '0.32s'}}>
        <rect x="20" y="70" width="200" height="20" rx="5" fill={BRAND} opacity="0.08" stroke={BRAND} strokeWidth="1" />
        <text x="30" y="84.5" fontSize={7.5} fontWeight={700} fill={BRAND}>Compact</text>
        <text x="90" y="84.5" fontSize={6} fill={TXT}>自动压缩 / 摘要</text>
      </g>
      {/* 持久化层 h=20 rx=5（比例 1:4） */}
      <g className="a-rise" style={{animationDelay: '0.48s'}}>
        <rect x="20" y="94" width="200" height="20" rx="5" fill={FILL_SOFT} opacity="0.5" stroke={SOFT} strokeWidth="1" />
        <text x="30" y="108.5" fontSize={7.5} fontWeight={700} fill={BRAND}>持久化</text>
        <text x="84" y="108.5" fontSize={6} fill={TXT}>Postgres 长期存储</text>
        <Brand icon={postgresql} x="197" y={98} s={0.32} color={SOFTER} />
      </g>

      {/* 外框 - 覆盖全部，hover 聚焦 Compact+持久化 */}
      <rect x="16" y="2" width="208" height="116" rx="9" fill="none" stroke={BRAND} strokeWidth="1.5" opacity="0.4" className="a-focus" />
    </svg>
  );
}
