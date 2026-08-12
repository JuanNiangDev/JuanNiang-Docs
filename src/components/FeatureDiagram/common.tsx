import type {JSX} from 'react';
import type {IconifyIcon} from '@iconify/react/offline';

export const BRAND = 'var(--ifm-color-primary)';
export const SOFT = 'var(--ifm-color-emphasis-300)';
export const SOFTER = 'var(--ifm-color-emphasis-400)';
export const TXT = 'var(--ifm-color-emphasis-600)';
export const FILL_SOFT = 'var(--ifm-color-emphasis-200)';
export const G_INDIGO = '#818cf8';
export const G_EMERALD = '#34d399';
export const G_BLUE = '#60a5fa';
export const G_AMBER = '#fbbf24';

export function Brand({icon, x, y, s = 0.5, color, cls}: {
  icon: IconifyIcon; x: number; y: number; s?: number; color?: string; cls?: string;
}): JSX.Element {
  return (
    <g className={cls} transform={`translate(${x},${y}) scale(${s})`} style={color ? {color} : undefined}
      dangerouslySetInnerHTML={{__html: icon.body}} />
  );
}

export function IconDB({x, y, s = 1, color = TXT}: {x: number; y: number; s?: number; color?: string}) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx="12" cy="4" rx="10" ry="3" fill="none" stroke={color} strokeWidth="1.5" />
      <path d="M2 4v12c0 1.66 4.48 3 10 3s10-1.34 10-3V4" fill="none" stroke={color} strokeWidth="1.5" />
      <path d="M2 10c0 1.66 4.48 3 10 3s10-1.34 10-3" fill="none" stroke={color} strokeWidth="1" />
    </g>
  );
}

export function IconImg({x, y, s = 1, color = TXT}: {x: number; y: number; s?: number; color?: string}) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x="0" y="0" width="24" height="20" rx="2" fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx="7" cy="7" r="2" fill={color} />
      <path d="M3 17l6-6 4 4 5-5 3 3v4H3z" fill={color} opacity="0.4" />
    </g>
  );
}

export function IconSmile({x, y, s = 1, color = TXT}: {x: number; y: number; s?: number; color?: string}) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx="8.5" cy="9" r="1.2" fill={color} />
      <circle cx="15.5" cy="9" r="1.2" fill={color} />
      <path d="M7.5 14.5c1.2 2 3.8 3 4.5 3s3.3-1 4.5-3" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

export function IconBlocks({x, y, s = 1, color = TXT}: {x: number; y: number; s?: number; color?: string}) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x="4" y="10" width="16" height="8" rx="1.5" fill={color} opacity="0.25" stroke={color} strokeWidth="1" />
      <rect x="1" y="4" width="10" height="6" rx="1.5" fill={color} opacity="0.35" stroke={color} strokeWidth="1" />
      <rect x="13" y="0" width="10" height="6" rx="1.5" fill={color} opacity="0.45" stroke={color} strokeWidth="1" />
    </g>
  );
}

export function IconClock({x, y, s = 1, color = TXT}: {x: number; y: number; s?: number; color?: string}) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="1.5" />
      <path d="M12 6v6l4 2" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

export function IconWordle({x, y, s = 1, color = TXT}: {x: number; y: number; s?: number; color?: string}) {
  const rects = [0, 7, 14, 21, 28];
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {rects.map((dx, i) => (
        <rect key={i} x={dx} y="0" width="6" height="6" rx="1" fill={i === 0 ? color : 'none'} stroke={color} strokeWidth="1" opacity={i === 0 ? 0.9 : 0.5} />
      ))}
    </g>
  );
}
