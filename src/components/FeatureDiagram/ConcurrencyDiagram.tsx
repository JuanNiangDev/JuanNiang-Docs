import type {JSX} from 'react';
import {BRAND, G_EMERALD, G_BLUE, FILL_SOFT, SOFT} from './common';

export default function ConcurrencyDiagram(): JSX.Element {
  return (
    <svg viewBox="0 0 240 138" role="img" aria-label="异步并发：三条管线并行，光栅闸门">
      {/* 顶部入口标签 */}
      <g className="a-rise">
        <rect x="16" y="6" width="50" height="18" rx="9" fill={BRAND} opacity="0.13" />
        <text x="41" y="19" fontSize={7.5} textAnchor="middle" fontWeight={700} fill={BRAND}>Chat</text>
      </g>
      <g className="a-rise" style={{animationDelay: '0.15s'}}>
        <rect x="86" y="6" width="50" height="18" rx="9" fill={G_EMERALD} opacity="0.13" />
        <text x="111" y="19" fontSize={7.5} textAnchor="middle" fontWeight={700} fill={G_EMERALD}>T2I</text>
      </g>
      <g className="a-rise" style={{animationDelay: '0.3s'}}>
        <rect x="156" y="6" width="50" height="18" rx="9" fill={G_BLUE} opacity="0.13" />
        <text x="181" y="19" fontSize={7.5} textAnchor="middle" fontWeight={700} fill={G_BLUE}>Core</text>
      </g>

      {/* 三条水平轨道 */}
      <rect x="12" y="38" width="216" height="20" rx="10" fill={FILL_SOFT} opacity="0.4" />
      <rect x="12" y="66" width="216" height="20" rx="10" fill={FILL_SOFT} opacity="0.4" />
      <rect x="12" y="94" width="216" height="20" rx="10" fill={FILL_SOFT} opacity="0.4" />

      {/* 移动任务块 */}
      <g className="a-move"><rect x="18" y="42" width="24" height="12" rx="4" fill={BRAND} opacity="0.75" /><text x="30" y="51" fontSize={5.5} textAnchor="middle" fill="#fff" fontWeight={600}>Msg</text></g>
      <g className="a-move" style={{animationDelay: '0.4s'}}><rect x="18" y="70" width="24" height="12" rx="4" fill={G_EMERALD} opacity="0.75" /><text x="30" y="79" fontSize={5.5} textAnchor="middle" fill="#fff" fontWeight={600}>Img</text></g>
      <g className="a-move" style={{animationDelay: '0.8s'}}><rect x="18" y="98" width="24" height="12" rx="4" fill={G_BLUE} opacity="0.75" /><text x="30" y="107" fontSize={5.5} textAnchor="middle" fill="#fff" fontWeight={600}>Job</text></g>

      {/* 单个光栅门（整体，横跨三轨道） */}
      <g className="a-gate">
        <rect x="120" y="32" width="3" height="82" rx="1.5" fill={BRAND} opacity="0.9" />
        <rect x="128" y="32" width="3" height="82" rx="1.5" fill={BRAND} opacity="0.9" />
        <rect x="136" y="32" width="3" height="82" rx="1.5" fill={BRAND} opacity="0.9" />
        <rect x="144" y="32" width="3" height="82" rx="1.5" fill={BRAND} opacity="0.9" />
        <rect x="116" y="30" width="36" height="5" rx="2.5" fill={BRAND} opacity="0.55" />
        <rect x="116" y="111" width="36" height="5" rx="2.5" fill={BRAND} opacity="0.55" />
      </g>

      {/* Max 8 */}
      <g className="a-pulse" transform="translate(192, 118)">
        <rect x="0" y="0" width="42" height="19" rx="9.5" fill={BRAND} opacity="0.15" stroke={BRAND} strokeWidth="1.2" />
        <text x="21" y="13.5" fontSize={7.5} textAnchor="middle" fontWeight={800} fill={BRAND}>Max 8</text>
      </g>
    </svg>
  );
}
