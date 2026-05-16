'use client';
import { useCountUp } from '@/lib/useCountUp';

type Props = {
  /** Final value the count-up animates toward. */
  target: number;
  /** Format the displayed value. Defaults to integer with comma grouping. */
  formatter?: (n: number) => string;
  /** Duration in ms. */
  duration?: number;
  className?: string;
};

const defaultFormatter = (n: number) =>
  Math.round(n).toLocaleString('en-US');

export default function AnimatedNumber({
  target,
  formatter = defaultFormatter,
  duration = 1200,
  className = '',
}: Props) {
  const { value, ref } = useCountUp(target, duration);
  return (
    <span
      ref={ref as React.RefObject<HTMLSpanElement>}
      className={`numerals ${className}`}
    >
      {formatter(value)}
    </span>
  );
}
