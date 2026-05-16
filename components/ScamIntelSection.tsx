'use client';
import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  CATEGORY_LABEL,
  CATEGORY_COLOR,
  SCAM_FEED,
  ScamCategory,
} from '@/lib/scamFeed';
import ScamMap from './ScamMap';
import ScamTicker from './ScamTicker';
import AnimatedNumber from './AnimatedNumber';

const FILTERS: { id: 'all' | ScamCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'bank', label: CATEGORY_LABEL.bank },
  { id: 'family', label: CATEGORY_LABEL.family },
  { id: 'medicare', label: CATEGORY_LABEL.medicare },
  { id: 'irs', label: CATEGORY_LABEL.irs },
  { id: 'romance', label: CATEGORY_LABEL.romance },
  { id: 'package', label: CATEGORY_LABEL.package },
];

function timeAgoLabel(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(diffMs / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  return `${h}h ago`;
}

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('en-US');
}

export default function ScamIntelSection() {
  const [filter, setFilter] = useState<'all' | ScamCategory>('all');

  const reports = useMemo(
    () =>
      filter === 'all'
        ? SCAM_FEED.reports
        : SCAM_FEED.reports.filter((r) => r.category === filter),
    [filter]
  );

  const events = useMemo(
    () =>
      filter === 'all'
        ? SCAM_FEED.recent
        : SCAM_FEED.recent.filter((e) => e.category === filter),
    [filter]
  );

  const { stats } = SCAM_FEED;

  return (
    <section className="bg-cream">
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-20">
        {/* Hero: the problem */}
        <div className="max-w-4xl mb-12 animate-fade-up">
          <h1 className="font-display text-5xl lg:text-6xl text-ink leading-[1.02] tracking-tight mb-4">
            <span className="text-bordeaux numerals">$81.5 billion</span> stolen from US
            seniors last year.
          </h1>
          <div className="text-xs text-ink-muted mb-6">
            Source:{' '}
            <a
              href="https://www.ic3.gov/AnnualReport/Reports/2024_IC3ElderFraudReport.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ink-soft hover:text-ink underline underline-offset-2"
            >
              FBI · 2024 Elder Fraud Report
            </a>
          </div>
          <p className="text-xl text-ink-soft leading-relaxed max-w-2xl">
            Every <span className="font-semibold text-ink">8 minutes</span>, someone
            over 65 falls for a scam. The pattern is the same — urgent SMS, fake bank
            call, fake grandchild. Here&apos;s where it&apos;s happening right now.
          </p>
        </div>

        {/* Sub-header for the map */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-muted">
            Live scam intelligence
          </div>
          <div className="flex flex-col items-start lg:items-end gap-1 text-xs text-ink-muted">
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.8} />
              Refreshed {timeAgoLabel(SCAM_FEED.refreshedAtIso)}
            </div>
            <div>
              Powered by <span className="font-semibold text-ink-soft">Bright Data</span>{' '}
              · FTC Consumer Sentinel
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Stat label="Reports this week" target={stats.reportsThisWeek} formatter={formatNumber} />
          <Stat label="Seniors targeted" target={stats.seniorsTargeted} formatter={formatNumber} />
          <Stat
            label="Weekly growth"
            target={stats.weeklyGrowthPct}
            formatter={(n) => `+${n.toFixed(1)}%`}
            tone="bad"
          />
          <Stat
            label="Victims over 65"
            target={stats.over65SharePct}
            formatter={(n) => `${Math.round(n)}%`}
            tone="bad"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            const dotColor =
              f.id === 'all' ? '#5B6B8C' : CATEGORY_COLOR[f.id as ScamCategory];
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-colors flex items-center gap-2 ${
                  active
                    ? 'border-ink bg-ink text-cream'
                    : 'border-cream-deep bg-paper text-ink-soft hover:border-ink-muted'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: dotColor,
                    opacity: active ? 1 : 0.85,
                  }}
                />
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Map + ticker */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="bg-paper border border-cream-deep rounded-3xl p-4 lg:p-6 card-lift">
            <ScamMap reports={reports} />
          </div>
          <ScamTicker events={events} />
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  target,
  formatter,
  tone = 'neutral',
}: {
  label: string;
  target: number;
  formatter?: (n: number) => string;
  tone?: 'neutral' | 'bad';
}) {
  return (
    <div className="bg-paper border border-cream-deep rounded-3xl px-6 py-5 card-lift">
      <div
        className={`font-display text-4xl lg:text-5xl leading-none ${
          tone === 'bad' ? 'text-bordeaux' : 'text-ink'
        }`}
      >
        <AnimatedNumber target={target} formatter={formatter} />
      </div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted mt-2">
        {label}
      </div>
    </div>
  );
}
