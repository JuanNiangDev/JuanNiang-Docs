import type {JSX} from 'react';
import go from '../../icons/brands/go';
import lua from '../../icons/brands/lua';
import {BRAND, SOFT, SOFTER, FILL_SOFT, Brand} from './common';

export default function PluginsDiagram(): JSX.Element {
  return (
    <svg viewBox="0 0 240 138" role="img" aria-label="Lua插件：Go ↔ Lua，HMR 热更新点亮">
      <defs>
        <radialGradient id="ldot" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={BRAND} stopOpacity="1" />
          <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 左侧 Go Host - 大图标，加深 */}
      <g className="a-rise">
        <rect x="14" y="30" width="62" height="80" rx="10" fill={FILL_SOFT} opacity="0.5" stroke={SOFT} strokeWidth="1.2" />
        <Brand icon={go} x={32} y={62} s={0.95} color={BRAND} />
      </g>

      {/* 右侧 Lua VM - 大图标，加深，往右 */}
      <g className="a-rise" style={{animationDelay: '0.3s'}}>
        <rect x="166" y="30" width="62" height="80" rx="10" fill={FILL_SOFT} opacity="0.5" stroke={SOFT} strokeWidth="1.2" />
        <Brand icon={lua} x={188} y={62} s={0.95} color={BRAND} />
      </g>

      {/* 连接线 */}
      <line x1="80" y1="70" x2="162" y2="70" stroke={SOFTER} strokeWidth="2" strokeDasharray="5 3" className="a-draw" />
      <line x1="80" y1="90" x2="162" y2="90" stroke={SOFTER} strokeWidth="2" strokeDasharray="5 3" opacity="0.5" />

      {/* 发光圆点 - hover 才播放 */}
      <circle r="5" fill="url(#ldot)" opacity="0.9" className="a-glow" />
      <circle r="2" fill={BRAND} className="a-glow" />
      <circle r="3.5" fill="url(#ldot)" opacity="0.6" className="a-glow-rev" />
    </svg>
  );
}
