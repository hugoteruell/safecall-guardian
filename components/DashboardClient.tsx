'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Pause,
  Play,
  ArrowRight,
  TrendingUp,
  PlusCircle,
} from 'lucide-react';
import {
  type Caretaker,
  type Senior,
  type FamilyContact,
  type ProtectionEvent,
} from '@/lib/userData';
import { formatMoney, formatDate } from '@/lib/format';
import ActivityTimeline from './ActivityTimeline';
import Avatar from './Avatar';
import AnimatedNumber from './AnimatedNumber';
import Sparkline from './Sparkline';
import { useToast } from './Toast';

type Props = {
  caretaker: Caretaker;
  senior: Senior;
  contacts: FamilyContact[];
  events: ProtectionEvent[];
  initialPausedUntilIso: string | null;
};

function isFuture(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() > Date.now();
}

export default function DashboardClient({
  caretaker,
  senior,
  contacts,
  events,
  initialPausedUntilIso,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [pausedUntil, setPausedUntil] = useState<string | null>(initialPausedUntilIso);
  const [pending, startTransition] = useTransition();
  const paused = isFuture(pausedUntil);

  const TODAY_ISO = '2026-05-16T17:00:00Z';
  const TODAY_MS = new Date(TODAY_ISO).getTime();
  const oneWeekAgo = TODAY_MS - 7 * 24 * 60 * 60 * 1000;

  const blockedThisWeek = events.filter(
    (e) => e.status === 'blocked' && new Date(e.timestampIso).getTime() >= oneWeekAgo
  ).length;
  const blockedAllTime = events.filter((e) => e.status === 'blocked').length;
  const moneySavedTotal = events.reduce(
    (acc, e) => acc + (e.status === 'blocked' ? e.moneyAtRiskUsd ?? 0 : 0),
    0
  );

  const lastBlocked = events.find((e) => e.status === 'blocked');

  // Build a 7-day series of blocked counts for the sparkline.
  const weeklySeries = (() => {
    const series = new Array(7).fill(0);
    const dayMs = 24 * 60 * 60 * 1000;
    for (const e of events) {
      if (e.status !== 'blocked') continue;
      const t = new Date(e.timestampIso).getTime();
      const dayIdx = 6 - Math.floor((TODAY_MS - t) / dayMs);
      if (dayIdx >= 0 && dayIdx < 7) series[dayIdx] += 1;
    }
    // Boost zeros minimally so the spark looks alive even on quiet weeks.
    return series.map((v) => v + 0.4);
  })();

  // Monthly series for all-time and money-saved cards: fake but plausible.
  const monthlySeriesAllTime = [3, 5, 4, 7, 6, 8, blockedAllTime];
  const monthlySeriesMoney = [1200, 2400, 1800, 3500, 4200, 5500, moneySavedTotal];

  async function togglePause() {
    const willPause = !paused;
    const newUntil = paused ? null : new Date(Date.now() + 60 * 60 * 1000).toISOString();
    setPausedUntil(newUntil);
    startTransition(async () => {
      try {
        await fetch('/api/pause', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ until: newUntil }),
        });
        router.refresh();
        toast({
          title: willPause ? 'Protection paused' : 'Protection resumed',
          description: willPause
            ? `${senior.shortName} is exposed for the next hour.`
            : `${senior.shortName} is fully protected again.`,
          variant: willPause ? 'error' : 'success',
        });
      } catch {
        /* optimistic */
      }
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Greeting */}
      <div className="flex items-end justify-between gap-4 flex-wrap animate-fade-up">
        <div>
          <h1 className="font-display text-4xl text-ink leading-none">
            Good afternoon, {caretaker.shortName}.
          </h1>
          <p className="text-sm text-ink-muted mt-2">
            Here&apos;s what happened with {senior.shortName} today.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={togglePause}
            disabled={pending}
            className={`min-h-[40px] px-4 border text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${
              paused
                ? 'bg-coral-soft border-coral/40 text-coral-deep hover:bg-coral-soft/80'
                : 'bg-paper border-cream-deep text-ink-soft hover:border-ink-muted'
            } disabled:opacity-50`}
          >
            {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {paused ? 'Resume protection' : 'Pause for 1 hour'}
          </button>
        </div>
      </div>

      {paused && pausedUntil && (
        <div className="bg-coral-soft border border-coral/40 rounded-xl px-4 py-3 flex items-center gap-3 text-sm animate-fade-up">
          <div className="w-2 h-2 rounded-full bg-coral animate-pulse" />
          <span className="text-coral-deep font-semibold">
            Protection paused until{' '}
            {new Date(pausedUntil).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
          <span className="text-coral-deep/80">No calls or messages are being filtered.</span>
        </div>
      )}

      {/* Hero status */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
        <div
          className={`relative rounded-3xl border p-7 overflow-hidden card-lift ${
            paused
              ? 'bg-coral-soft border-coral/30'
              : 'bg-ink border-ink text-cream'
          }`}
        >
          {!paused && (
            <>
              <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-cream/5 blur-3xl" />
              <div className="absolute -right-24 top-8 w-48 h-48 rounded-full bg-coral/15 blur-3xl" />
            </>
          )}
          <div
            className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] mb-4 ${
              paused ? 'text-coral-deep' : 'text-cream/70'
            }`}
          >
            {!paused && (
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-sage animate-ping opacity-75" />
                <span className="relative rounded-full bg-sage w-2 h-2" />
              </span>
            )}
            {paused ? 'Protection paused' : 'Protection active'}
          </div>
          <div className="font-display text-4xl lg:text-5xl leading-[1.05] mb-3">
            {senior.shortName} is{' '}
            {paused ? 'temporarily exposed.' : 'protected right now.'}
          </div>
          {!paused && lastBlocked && (
            <p className="text-sm leading-relaxed text-cream/80 max-w-md">
              Last block: <span className="font-semibold text-cream">{lastBlocked.summary}</span>
              {' · '}from {lastBlocked.from}.
            </p>
          )}
          <p
            className={`text-xs mt-4 ${
              paused ? 'text-coral-deep/80' : 'text-cream/60'
            }`}
          >
            Watching since {formatDate(senior.protectedSinceIso)}
          </p>

          <Link
            href="/app/events"
            className={`inline-flex mt-6 items-center gap-1 text-sm font-semibold ${
              paused ? 'text-coral-deep' : 'text-cream'
            } hover:gap-2 transition-all`}
          >
            View activity <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mom's profile card */}
        <div className="bg-paper border border-cream-deep rounded-3xl p-6 card-lift">
          <div className="flex items-center gap-3 mb-5">
            <Avatar seed={senior.name} size="lg" ring />
            <div className="min-w-0">
              <div className="font-display text-xl text-ink leading-tight">
                {senior.name}
              </div>
              <div className="text-xs text-ink-muted mt-0.5">
                {senior.relationship} · {senior.age} · {senior.location}
              </div>
            </div>
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-muted">Phone</span>
              <span className="font-semibold text-ink numerals">{senior.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Trusted contacts</span>
              <span className="font-semibold text-ink numerals">{contacts.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Protected since</span>
              <span className="font-semibold text-ink">
                {formatDate(senior.protectedSinceIso)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat
          label="Blocked this week"
          target={blockedThisWeek}
          tone="bad"
          delta="+2 from last week"
          spark={weeklySeries}
          sparkColor="#9B2C2C"
        />
        <Stat
          label="Blocked all time"
          target={blockedAllTime}
          tone="neutral"
          delta={`Since ${formatDate(senior.protectedSinceIso)}`}
          spark={monthlySeriesAllTime}
          sparkColor="#0A1A3B"
        />
        <Stat
          label="Money saved"
          target={moneySavedTotal}
          tone="good"
          delta="Across all events"
          formatter={formatMoney}
          spark={monthlySeriesMoney}
          sparkColor="#4F7659"
        />
      </div>

      {/* Activity + family contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
        <div className="bg-paper border border-cream-deep rounded-3xl overflow-hidden card-lift">
          <div className="flex items-center justify-between px-6 py-4 border-b border-cream-deep">
            <h2 className="text-[11px] font-bold text-ink uppercase tracking-[0.18em]">
              Recent activity
            </h2>
            <Link
              href="/app/events"
              className="text-xs font-semibold text-ink-soft hover:text-ink flex items-center gap-1"
            >
              See all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ActivityTimeline events={events} limit={5} />
        </div>

        <div className="space-y-4">
          <div className="bg-paper border border-cream-deep rounded-3xl overflow-hidden card-lift">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-deep">
              <h2 className="text-[11px] font-bold text-ink uppercase tracking-[0.18em]">
                Family
              </h2>
              <Link
                href="/app/family"
                className="text-xs font-semibold text-ink-soft hover:text-ink flex items-center gap-1"
              >
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <ul className="divide-y divide-cream-deep">
              {contacts.slice(0, 3).map((c) => (
                <li key={c.id} className="px-6 py-3 flex items-center gap-3">
                  <Avatar seed={c.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink truncate">{c.name}</div>
                    <div className="text-xs text-ink-muted">
                      {c.relationship} · {c.interactions} msgs
                    </div>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-sage-deep" />
                </li>
              ))}
            </ul>
            <div className="px-6 py-3 border-t border-cream-deep">
              <Link
                href="/app/family"
                className="text-xs font-semibold text-ink-soft hover:text-ink flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add a contact
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-sage-soft to-cream-soft border border-sage/30 rounded-3xl p-6 card-lift">
            <div className="flex items-center gap-2 text-sage-deep text-[11px] font-bold uppercase tracking-[0.18em] mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              This month
            </div>
            <div className="font-display text-2xl text-ink leading-tight mb-2">
              SafeCall caught {blockedAllTime} scams targeting your mom.
            </div>
            <div className="text-sm text-ink-soft leading-relaxed">
              That&apos;s {formatMoney(moneySavedTotal)} in attempted theft, intercepted
              before {senior.shortName} had to think about it.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  target,
  tone,
  delta,
  formatter,
  spark,
  sparkColor,
}: {
  label: string;
  target: number;
  tone: 'good' | 'bad' | 'neutral';
  delta?: string;
  formatter?: (n: number) => string;
  spark?: number[];
  sparkColor?: string;
}) {
  const valueColor =
    tone === 'good' ? 'text-sage-deep' : tone === 'bad' ? 'text-bordeaux' : 'text-ink';
  return (
    <div className="bg-paper border border-cream-deep rounded-3xl p-6 card-lift">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted mb-2">
        {label}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className={`font-display text-5xl leading-none ${valueColor}`}>
          <AnimatedNumber target={target} formatter={formatter} />
        </div>
        {spark && (
          <Sparkline
            data={spark}
            color={sparkColor ?? '#0A1A3B'}
            width={72}
            height={28}
            className="opacity-90 shrink-0"
          />
        )}
      </div>
      {delta && <div className="text-xs text-ink-muted mt-2">{delta}</div>}
    </div>
  );
}
