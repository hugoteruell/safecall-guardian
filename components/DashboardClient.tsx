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
  const [pausedUntil, setPausedUntil] = useState<string | null>(initialPausedUntilIso);
  const [pending, startTransition] = useTransition();
  const paused = isFuture(pausedUntil);

  // App "today" is fixed for demo consistency.
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

  async function togglePause() {
    const newUntil = paused ? null : new Date(Date.now() + 60 * 60 * 1000).toISOString();
    setPausedUntil(newUntil); // optimistic
    startTransition(async () => {
      try {
        await fetch('/api/pause', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ until: newUntil }),
        });
        router.refresh();
      } catch {
        // ignore — UI already updated optimistically
      }
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Greeting */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Good afternoon, {caretaker.shortName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here&apos;s what happened with {senior.shortName} today.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={togglePause}
            disabled={pending}
            className={`min-h-[40px] px-4 border text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${
              paused
                ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
            } disabled:opacity-50`}
          >
            {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {paused ? 'Resume protection' : 'Pause for 1 hour'}
          </button>
        </div>
      </div>

      {paused && pausedUntil && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-amber-900 font-semibold">
            Protection paused until{' '}
            {new Date(pausedUntil).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
          <span className="text-amber-700">
            No calls or messages are being filtered.
          </span>
        </div>
      )}

      {/* Hero status */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
        <div
          className={`relative rounded-2xl border p-6 overflow-hidden ${
            paused
              ? 'bg-amber-50 border-amber-200'
              : 'bg-gradient-to-br from-blue-900 to-blue-700 border-blue-900 text-white'
          }`}
        >
          {!paused && (
            <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-white/5 blur-2xl" />
          )}
          <div
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3 ${
              paused ? 'text-amber-700' : 'text-blue-200'
            }`}
          >
            {!paused && (
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                <span className="relative rounded-full bg-emerald-400 w-2 h-2" />
              </span>
            )}
            {paused ? 'Protection paused' : 'Protection active'}
          </div>
          <div className="text-3xl lg:text-4xl font-bold leading-tight mb-2">
            {senior.shortName} is{' '}
            {paused ? 'temporarily exposed.' : 'protected right now.'}
          </div>
          {!paused && lastBlocked && (
            <p className="text-sm leading-relaxed text-blue-100 max-w-md">
              Last block: <span className="font-semibold">{lastBlocked.summary}</span>
              {' · '}
              from {lastBlocked.from}.
            </p>
          )}
          <p
            className={`text-xs mt-3 ${
              paused ? 'text-amber-700' : 'text-blue-200/80'
            }`}
          >
            Watching since {formatDate(senior.protectedSinceIso)}
          </p>

          <Link
            href="/app/events"
            className={`inline-flex mt-5 items-center gap-1 text-sm font-semibold ${
              paused ? 'text-amber-900' : 'text-white'
            } hover:underline`}
          >
            View activity <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mom's profile card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-orange-300 text-white font-bold flex items-center justify-center">
              {senior.initials}
            </div>
            <div className="min-w-0">
              <div className="text-base font-bold text-slate-900 leading-tight">
                {senior.name}
              </div>
              <div className="text-xs text-slate-500">
                {senior.relationship} · {senior.age} · {senior.location}
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Phone</span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {senior.phone}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Trusted contacts</span>
              <span className="font-semibold text-slate-900">{contacts.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Protected since</span>
              <span className="font-semibold text-slate-900">
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
          value={blockedThisWeek.toString()}
          tone="bad"
          delta="+2 from last week"
        />
        <Stat
          label="Blocked all time"
          value={blockedAllTime.toString()}
          tone="neutral"
          delta={`Since ${formatDate(senior.protectedSinceIso)}`}
        />
        <Stat
          label="Money saved"
          value={formatMoney(moneySavedTotal)}
          tone="good"
          delta="Across all events"
        />
      </div>

      {/* Activity + family contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recent activity
            </h2>
            <Link
              href="/app/events"
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              See all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ActivityTimeline events={events} limit={5} />
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Family
              </h2>
              <Link
                href="/app/family"
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <ul className="divide-y divide-slate-100">
              {contacts.slice(0, 3).map((c) => (
                <li key={c.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-semibold flex items-center justify-center text-xs">
                    {c.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {c.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {c.relationship} · {c.interactions} msgs
                    </div>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </li>
              ))}
            </ul>
            <div className="px-5 py-3 border-t border-slate-100">
              <Link
                href="/app/family"
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add a contact
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              This month
            </div>
            <div className="text-2xl font-bold text-emerald-900 leading-tight mb-1">
              SafeCall caught {blockedAllTime} scams targeting your mom.
            </div>
            <div className="text-sm text-emerald-800/80 leading-relaxed">
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
  value,
  tone,
  delta,
}: {
  label: string;
  value: string;
  tone: 'good' | 'bad' | 'neutral';
  delta?: string;
}) {
  const valueColor =
    tone === 'good'
      ? 'text-emerald-700'
      : tone === 'bad'
      ? 'text-red-600'
      : 'text-slate-900';
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
        {label}
      </div>
      <div className={`text-3xl font-bold tabular-nums ${valueColor}`}>{value}</div>
      {delta && <div className="text-xs text-slate-500 mt-1">{delta}</div>}
    </div>
  );
}
