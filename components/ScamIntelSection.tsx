'use client';
import { useMemo, useState } from 'react';
import { Globe, RefreshCw } from 'lucide-react';
import {
  CATEGORY_LABEL,
  CATEGORY_COLOR,
  SCAM_FEED,
  ScamCategory,
} from '@/lib/scamFeed';
import ScamMap from './ScamMap';
import ScamTicker from './ScamTicker';

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
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-16">
        {/* Hero: the problem */}
        <div className="max-w-4xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold uppercase tracking-wider mb-5">
            <Globe className="w-3.5 h-3.5" />
            The problem
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.05] tracking-tight mb-5">
            <span className="text-red-600 tabular-nums">$3.4 billion</span> stolen
            from US seniors last year.
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
            Every 8 minutes, someone over 65 falls for a scam. The pattern is the
            same — urgent SMS, fake bank call, fake grandchild. Here&apos;s where
            it&apos;s happening right now.
          </p>
        </div>

        {/* Sub-header for the map */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Live scam intelligence
          </div>
          <div className="flex flex-col items-start lg:items-end gap-1 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Refreshed {timeAgoLabel(SCAM_FEED.refreshedAtIso)}
            </div>
            <div>
              Powered by{' '}
              <span className="font-semibold text-slate-700">Bright Data</span> ·
              FTC Consumer Sentinel
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Stat label="Reports this week" value={formatNumber(stats.reportsThisWeek)} />
          <Stat label="Seniors targeted" value={formatNumber(stats.seniorsTargeted)} />
          <Stat label="Weekly growth" value={`+${stats.weeklyGrowthPct}%`} tone="bad" />
          <Stat label="Victims over 65" value={`${stats.over65SharePct}%`} tone="bad" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            const dotColor =
              f.id === 'all' ? '#475569' : CATEGORY_COLOR[f.id as ScamCategory];
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border-2 flex items-center gap-2 transition-colors ${
                  active
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: dotColor,
                    opacity: active ? 1 : 0.85,
                    boxShadow: active ? '0 0 0 1.5px rgba(255,255,255,0.7)' : 'none',
                  }}
                />
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Map + ticker */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 lg:p-6">
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
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'bad';
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4">
      <div
        className={`text-3xl lg:text-4xl font-bold tabular-nums ${
          tone === 'bad' ? 'text-red-600' : 'text-slate-900'
        }`}
      >
        {value}
      </div>
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
        {label}
      </div>
    </div>
  );
}
