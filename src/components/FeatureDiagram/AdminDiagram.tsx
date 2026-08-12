import {useState, useEffect} from 'react';
import type {JSX} from 'react';
import {SOFT, TXT, FILL_SOFT, G_INDIGO, G_EMERALD, G_BLUE, G_AMBER} from './common';

const CARDS = [
  {label: 'Users', target: 1200, color: G_INDIGO},
  {label: 'Tokens', target: 8500000, color: G_EMERALD},
  {label: 'Goroutines', target: 42, color: G_BLUE},
];
function fmt(n: number, t: number): string {
  if (t >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (t >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(Math.round(n));
}
const LINE = [[18,84],[38,78],[58,80],[78,70],[98,72],[118,58],[138,62],[158,52],[178,56],[198,46],[222,50]];
const BASE_Y = 84;
const BARS = [
  {label: 'Adapter',  x: 14, w: 54, color: G_EMERALD, dotX: 76},
  {label: 'T2I',      x: 90, w: 42, color: G_BLUE,     dotX: 140},
  {label: 'Sandbox',  x: 166, w: 36, color: G_AMBER,   dotX: 210},
];

export default function AdminDiagram(): JSX.Element {
  const [active, setActive] = useState(false);
  const [p, setP] = useState(0); // 0..1 eased

  useEffect(() => {
    if (!active) { setP(0); return; }
    let raf = 0;
    const start = performance.now();
    const dur = 1300;
    const tick = (now: number) => {
      const raw = Math.min((now - start) / dur, 1);
      setP(1 - Math.pow(1 - raw, 3));
      if (raw < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <svg viewBox="0 0 240 138" role="img" aria-label="Web管理后台：数字统计、折线图、进度条"
      onMouseEnter={() => setActive(true)} onMouseLeave={() => setActive(false)}
      style={{cursor: 'pointer'}}>
      {CARDS.map((c, i) => {
        const x = 10 + i * 77;
        const val = fmt(c.target * p, c.target);
        return (
          <g key={c.label}>
            <rect x={x} y="8" width="66" height="34" rx="6" fill={FILL_SOFT} opacity="0.5" stroke={SOFT} strokeWidth="1" />
            <text x={x + 33} y="20" fontSize={5} textAnchor="middle" fill={TXT}>{c.label}</text>
            <text x={x + 33} y="33" fontSize={12} textAnchor="middle" fontWeight={800} fill={c.color} style={{fontVariantNumeric: 'tabular-nums'}}>{val}</text>
          </g>
        );
      })}

      <rect x="10" y="48" width="220" height="44" rx="6" fill={FILL_SOFT} opacity="0.3" stroke={SOFT} strokeWidth="1" />
      <text x="18" y="58" fontSize={5} fill={TXT}>QPS</text>
      <line x1="18" y1={BASE_Y} x2="222" y2={BASE_Y} stroke={SOFT} strokeWidth="1" />
      {LINE.map(([lx, ly], i) => {
        const cy = BASE_Y - (BASE_Y - ly) * p;
        return i < LINE.length - 1 ? (
          <line key={'l' + i} x1={lx} y1={cy} x2={LINE[i + 1][0]} y2={BASE_Y - (BASE_Y - LINE[i + 1][1]) * p} stroke={G_INDIGO} strokeWidth="2" strokeLinecap="round" />
        ) : null;
      })}
      {LINE.map(([lx, ly], i) => {
        const cy = BASE_Y - (BASE_Y - ly) * p;
        return <circle key={'c' + i} cx={lx} cy={cy} r="2.2" fill={G_INDIGO} />;
      })}

      {BARS.map((b) => {
        const w = b.w * p;
        return (
          <g key={b.label}>
            <text x={b.x} y="110" fontSize={5.5} fill={TXT}>{b.label}</text>
            <rect x={b.x} y="114" width={b.w} height="6" rx="3" fill={FILL_SOFT} />
            <rect x={b.x} y="114" width={w} height="6" rx="3" fill={b.color} />
            <circle cx={b.dotX} cy="117" r="2.5" fill={b.color} opacity={0.3 + 0.7 * p} />
          </g>
        );
      })}
    </svg>
  );
}
