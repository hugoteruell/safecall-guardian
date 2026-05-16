'use client';
import { useEffect, useRef, useState } from 'react';

type Props = {
  children: React.ReactNode;
  /** Delay (ms) before reveal animation starts. */
  delay?: number;
  /** How far below the trigger before reveal fires. 0..1, default 0.15. */
  threshold?: number;
  className?: string;
};

/**
 * Wrap any block to fade-up when scrolled into view. Used to give the landing
 * page a sense of unfolding. Below-the-fold sections animate; above-the-fold
 * content reveals immediately so there's no flash of blank space.
 */
export default function Reveal({
  children,
  delay = 0,
  threshold = 0.15,
  className = '',
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const t = setTimeout(() => setVisible(true), delay);
            obs.disconnect();
            return () => clearTimeout(t);
          }
        }
      },
      { threshold, rootMargin: '0px 0px -10% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay, threshold]);

  return (
    <div ref={ref} className={`reveal-on-scroll ${visible ? 'is-visible' : ''} ${className}`}>
      {children}
    </div>
  );
}
