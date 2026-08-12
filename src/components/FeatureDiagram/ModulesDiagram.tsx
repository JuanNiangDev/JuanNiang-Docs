import type {JSX} from 'react';
import {BRAND, TXT, FILL_SOFT, SOFT, IconDB, IconImg, IconSmile, IconBlocks, IconClock, IconWordle} from './common';

/* 每个模块卡片：图标位置相对卡片 x 居中 */
function Col({x, y, label, iconX, iconY, delay}: {
  x: number; y: number; label: string; iconX: number; iconY: number; delay: string;
}) {
  const cx = x + 33;
  return (
    <g className="a-rise" style={{animationDelay: delay}}>
      <rect x={x} y={y} width="66" height="52" rx="8" fill={FILL_SOFT} opacity="0.5" stroke={SOFT} strokeWidth="1" />
      <text x={cx} y={y + 46} fontSize={7} textAnchor="middle" fontWeight={700} fill={BRAND}>{label}</text>
    </g>
  );
}

export default function ModulesDiagram(): JSX.Element {
  // 每列卡片 x: 8 / 87 / 166，图标水平居中
  return (
    <svg viewBox="0 0 240 138" role="img" aria-label="开箱即用模块">
      <g className="a-rise"><rect x="8" y="2" width="66" height="52" rx="8" fill={FILL_SOFT} opacity="0.5" stroke={SOFT} strokeWidth="1" /><IconDB x={27} y={8} s={1.15} color={BRAND} /><text x="41" y="48" fontSize={7} textAnchor="middle" fontWeight={700} fill={BRAND}>SQL</text></g>
      <g className="a-rise" style={{animationDelay: '0.12s'}}><rect x="87" y="2" width="66" height="52" rx="8" fill={FILL_SOFT} opacity="0.5" stroke={SOFT} strokeWidth="1" /><IconImg x={106} y={8} s={1.15} color={BRAND} /><text x="120" y="48" fontSize={7} textAnchor="middle" fontWeight={700} fill={BRAND}>图床</text></g>
      <g className="a-rise" style={{animationDelay: '0.24s'}}><rect x="166" y="2" width="66" height="52" rx="8" fill={FILL_SOFT} opacity="0.5" stroke={SOFT} strokeWidth="1" /><IconSmile x={185} y={8} s={1.15} color={BRAND} /><text x="199" y="48" fontSize={7} textAnchor="middle" fontWeight={700} fill={BRAND}>表情包</text></g>

      <g className="a-rise" style={{animationDelay: '0.3s'}}><rect x="8" y="66" width="66" height="52" rx="8" fill={FILL_SOFT} opacity="0.5" stroke={SOFT} strokeWidth="1" /><IconBlocks x={27} y={72} s={1.15} color={BRAND} /><text x="41" y="112" fontSize={7} textAnchor="middle" fontWeight={700} fill={BRAND}>插件</text></g>
      <g className="a-rise" style={{animationDelay: '0.42s'}}><rect x="87" y="66" width="66" height="52" rx="8" fill={FILL_SOFT} opacity="0.5" stroke={SOFT} strokeWidth="1" /><IconClock x={106} y={72} s={1.15} color={BRAND} /><text x="120" y="112" fontSize={7} textAnchor="middle" fontWeight={700} fill={BRAND}>定时任务</text></g>
      <g className="a-rise" style={{animationDelay: '0.54s'}}><rect x="166" y="66" width="66" height="52" rx="8" fill={FILL_SOFT} opacity="0.5" stroke={SOFT} strokeWidth="1" /><IconWordle x={185} y={80} s={1.15} color={BRAND} /><text x="199" y="112" fontSize={7} textAnchor="middle" fontWeight={700} fill={BRAND}>猜单词</text></g>
    </svg>
  );
}
