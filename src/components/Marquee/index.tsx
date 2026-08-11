import type { HTMLAttributes, ReactNode } from 'react';
import type { MarqueeProps as FastMarqueeProps } from 'react-fast-marquee';
import FastMarquee from 'react-fast-marquee';
import styles from './styles.module.css';

export const Marquee = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={[styles.marquee, className].filter(Boolean).join(' ')} {...props} />
);

export const MarqueeContent = ({
  loop = 0,
  autoFill = true,
  pauseOnHover = true,
  ...props
}: FastMarqueeProps) => (
  <FastMarquee autoFill={autoFill} loop={loop} pauseOnHover={pauseOnHover} {...props} />
);

export const MarqueeFade = ({
  className,
  side,
  ...props
}: HTMLAttributes<HTMLDivElement> & { side: 'left' | 'right' }) => (
  <div
    data-side={side}
    className={[styles.marqueeFade, className].filter(Boolean).join(' ')}
    {...props}
  />
);

export const MarqueeItem = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={[styles.marqueeItem, className].filter(Boolean).join(' ')} {...props} />
);
