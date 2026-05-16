'use client';
import { useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps';
import { CATEGORY_COLOR, CATEGORY_LABEL, ScamReport } from '@/lib/scamFeed';

const GEO_URL = '/us-states-10m.json';

type Props = {
  reports: ScamReport[];
};

function bubbleRadius(count: number, max: number) {
  const min = 4;
  const top = 14;
  return min + (count / max) * (top - min);
}

export default function ScamMap({ reports }: Props) {
  const [hovered, setHovered] = useState<ScamReport | null>(null);

  const max = useMemo(
    () => Math.max(...reports.map((r) => r.count), 1),
    [reports]
  );

  return (
    <div className="relative w-full">
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 900 }}
        width={780}
        height={460}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#F5EFE0"
                stroke="#EFE6D2"
                strokeWidth={0.6}
                style={{
                  default: { outline: 'none' },
                  hover: { outline: 'none', fill: '#EFE6D2' },
                  pressed: { outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>

        {reports.map((r) => {
          const radius = bubbleRadius(r.count, max);
          const color = CATEGORY_COLOR[r.category];
          return (
            <Marker key={r.id} coordinates={[r.lng, r.lat]}>
              <circle
                r={radius * 1.8}
                fill={color}
                opacity={0.15}
                style={{ pointerEvents: 'none' }}
              >
                <animate
                  attributeName="r"
                  values={`${radius};${radius * 2.4};${radius}`}
                  dur="2.2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.3;0;0.3"
                  dur="2.2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                r={radius}
                fill={color}
                stroke="#FBF7EE"
                strokeWidth={1.4}
                onMouseEnter={() => setHovered(r)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}
              />
            </Marker>
          );
        })}
      </ComposableMap>

      {/* Tooltip card */}
      <div className="absolute top-3 right-3 w-56 bg-cream border border-cream-deep rounded-2xl px-4 py-3 shadow-sm">
        {hovered ? (
          <>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted mb-1">
              {CATEGORY_LABEL[hovered.category]}
            </div>
            <div className="font-display text-lg text-ink">
              {hovered.city}, {hovered.state}
            </div>
            <div className="mt-1 text-sm text-ink-soft numerals">
              <span className="text-bordeaux font-semibold">{hovered.count}</span>{' '}
              reports this week
            </div>
          </>
        ) : (
          <>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted mb-1">
              Hover a city
            </div>
            <div className="text-sm text-ink-soft leading-snug">
              Bubble size scales with reports this week. Color groups by scam type.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
