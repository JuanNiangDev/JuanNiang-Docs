import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';
import { ImageZoom } from '../ImageZoom';

export interface CarouselItem {
  image: string;
  alt?: string;
}

export interface DepthCarouselProps {
  items?: CarouselItem[];
  cardWidth?: number;
  cardHeight?: number;
  radius?: number;
  duration?: number;
  ease?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  loop?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  onChange?: (index: number, item: CarouselItem) => void;
  className?: string;
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

export default function DepthCarousel({
  items = [],
  cardWidth = 300,
  cardHeight = 380,
  radius = 18,
  duration = 500,
  ease = 'cubic-bezier(0.22, 1, 0.36, 1)',
  autoplay = false,
  autoplayDelay = 4000,
  loop = true,
  showControls = true,
  showIndicators = true,
  onChange,
  className = '',
}: DepthCarouselProps) {
  const count = items.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [fit, setFit] = useState(1);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // 响应式：按容器宽度缩放整叠卡片，避免固定 cardWidth 溢出
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(([entry]) => {
      setFit(clamp(entry.contentRect.width / cardWidth, 0.4, 1));
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [cardWidth]);

  const go = useCallback(
    (rawIndex: number) => {
      if (!count) return;
      const next = loop
        ? ((rawIndex % count) + count) % count
        : clamp(rawIndex, 0, count - 1);
      if (next === activeRef.current) return;
      activeRef.current = next;
      setActive(next);
      onChangeRef.current?.(next, items[next]);
    },
    [count, loop, items]
  );

  // autoplay + hover/focus 暂停
  useEffect(() => {
    if (!autoplay || count < 2) return;
    const root = rootRef.current;
    let hovered = false;
    let focused = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const stop = () => {
      clearInterval(timer);
      timer = undefined;
    };
    const start = () => {
      stop();
      timer = setInterval(() => {
        if (!hovered && !focused) go(activeRef.current + 1);
      }, Math.max(autoplayDelay, 600));
    };
    const onEnter = () => { hovered = true; };
    const onLeave = () => { hovered = false; };
    const onFocusIn = () => { focused = true; };
    const onFocusOut = () => { focused = false; };
    root?.addEventListener('mouseenter', onEnter);
    root?.addEventListener('mouseleave', onLeave);
    root?.addEventListener('focusin', onFocusIn);
    root?.addEventListener('focusout', onFocusOut);
    start();
    return () => {
      stop();
      root?.removeEventListener('mouseenter', onEnter);
      root?.removeEventListener('mouseleave', onLeave);
      root?.removeEventListener('focusin', onFocusIn);
      root?.removeEventListener('focusout', onFocusOut);
    };
  }, [autoplay, autoplayDelay, count, go]);

  return (
    <div
      ref={rootRef}
      className={`${styles.depthCarousel} ${className}`.trim()}
      style={{ '--dc-dur': `${duration}ms`, '--dc-ease': ease } as React.CSSProperties}
      role="group"
      aria-roledescription="carousel"
      aria-label="Screenshot carousel"
    >
      <div className={styles.depthCarousel__stage}>
        {items.map((item, i) => {
          const isActive = i === active;
          return (
            <div
              key={i}
              className={styles.depthCarousel__card}
              style={{
                width: cardWidth,
                height: cardHeight,
                borderRadius: radius,
                transform: `translate(-50%, -50%) scale(${(fit * (isActive ? 1 : 0.92)).toFixed(4)})`,
                opacity: isActive ? 1 : 0,
                zIndex: isActive ? 10 : 1,
                pointerEvents: isActive ? 'auto' : 'none',
              }}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!isActive}
              onClick={() => go(i)}
            >
              <div
                style={{ width: '100%', height: '100%', position: 'relative' }}
                onClick={(e) => e.stopPropagation()}
              >
                <ImageZoom>
                  <img
                    className={styles.depthCarousel__img}
                    src={item.image}
                    alt={item.alt || ''}
                    draggable={false}
                  />
                </ImageZoom>
              </div>
            </div>
          );
        })}
      </div>

      {showControls && count > 1 && (
        <>
          <button
            type="button"
            className={`${styles.depthCarousel__arrow} ${styles.depthCarousel__arrow__prev}`}
            aria-label="Previous slide"
            onClick={() => go(activeRef.current - 1)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M15 5l-7 7 7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.depthCarousel__arrow} ${styles.depthCarousel__arrow__next}`}
            aria-label="Next slide"
            onClick={() => go(activeRef.current + 1)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M9 5l7 7-7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      )}

      {showIndicators && count > 1 && (
        <div className={styles.depthCarousel__dots} role="tablist" aria-label="Slides">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`Go to slide ${i + 1}`}
              className={`${styles.depthCarousel__dot}${active === i ? ' ' + styles.isActive : ''}`}
              onClick={() => go(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
