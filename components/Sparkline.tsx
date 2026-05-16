import { useId } from 'react';

type Props = {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  className?: string;
};

/**
 * Inline SVG sparkline — a tiny trend chart for stat cards.
 * Draws a smooth area + line; small gradient under the line.
 */
export default function Sparkline({
  data,
  color = '#0A1A3B',
  width = 80,
  height = 28,
  className = '',
}: Props) {
  // useId must run unconditionally (rules of hooks) — call it before any early return.
  const reactId = useId();
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });

  const pathD =
    'M ' +
    points
      .map(([x, y], i) => {
        if (i === 0) return `${x},${y}`;
        const [px, py] = points[i - 1];
        const cx = (px + x) / 2;
        return `Q ${cx},${py} ${x},${y}`;
      })
      .join(' ');

  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  const gradId = `spark-grad-${reactId.replace(/[:]/g, '')}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <circle
        cx={points[points.length - 1][0]}
        cy={points[points.length - 1][1]}
        r={2}
        fill={color}
      />
    </svg>
  );
}
