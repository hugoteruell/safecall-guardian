'use client';
import { useState, useRef } from 'react';
import { CreditCard, Trash2 } from 'lucide-react';
import type { Caretaker, Senior } from '@/lib/userData';
import type { SettingsRow } from '@/lib/queries';

type Props = {
  caretaker: Caretaker;
  senior: Senior;
  initial: SettingsRow;
};

export default function SettingsClient({ caretaker, senior, initial }: Props) {
  const [state, setState] = useState({
    notif_push: initial.notif_push,
    notif_email: initial.notif_email,
    notif_sms: initial.notif_sms,
    risk_threshold: initial.risk_threshold,
    quiet_hours: initial.quiet_hours,
    voice_enabled: initial.voice_enabled,
  });

  // Debounce risk_threshold writes — slider fires many times.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function persist(patch: Partial<typeof state>) {
    fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch),
    }).catch(() => {
      /* ignore — UI already updated optimistically */
    });
  }

  function update<K extends keyof typeof state>(key: K, value: (typeof state)[K]) {
    setState((s) => ({ ...s, [key]: value }));
    persist({ [key]: value } as Partial<typeof state>);
  }

  function updateThresholdDebounced(value: number) {
    setState((s) => ({ ...s, risk_threshold: value }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      persist({ risk_threshold: value });
    }, 300);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Tune SafeCall the way that works for you and {senior.shortName}.
        </p>
      </div>

      <Card title="Your account">
        <Row label="Name" value={caretaker.name} />
        <Row label="Email" value={caretaker.email} />
        <Row label="Protecting" value={`${senior.name} (${senior.relationship})`} />
      </Card>

      <Card title="When SafeCall should ping you">
        <Toggle
          label="Push notifications"
          desc="Real-time alerts on your phone"
          on={state.notif_push}
          onToggle={() => update('notif_push', !state.notif_push)}
        />
        <Toggle
          label="Email"
          desc="A weekly summary of what was blocked"
          on={state.notif_email}
          onToggle={() => update('notif_email', !state.notif_email)}
        />
        <Toggle
          label="SMS"
          desc="Text alerts for high-severity events only"
          on={state.notif_sms}
          onToggle={() => update('notif_sms', !state.notif_sms)}
        />
      </Card>

      <Card title="How SafeCall responds">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-slate-900">Risk threshold</span>
            <span className="text-sm font-bold tabular-nums text-blue-700">
              {state.risk_threshold}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Calls and messages scoring above this are blocked. Lower = more cautious.
          </p>
          <input
            type="range"
            min={0}
            max={100}
            value={state.risk_threshold}
            onChange={(e) => updateThresholdDebounced(Number(e.target.value))}
            className="w-full accent-blue-700"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">
            <span>Trust most</span>
            <span>Block most</span>
          </div>
        </div>
        <Toggle
          label="Quiet hours (10 PM – 7 AM)"
          desc="Critical scams still ping immediately. Everything else waits until morning."
          on={state.quiet_hours}
          onToggle={() => update('quiet_hours', !state.quiet_hours)}
        />
        <Toggle
          label="SafeCall voice intervention"
          desc={`Sarah speaks the warning out loud to ${senior.shortName} when a scam is detected.`}
          on={state.voice_enabled}
          onToggle={() => update('voice_enabled', !state.voice_enabled)}
        />
      </Card>

      <Card title="Plan & billing">
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
          <div>
            <div className="text-sm font-semibold text-slate-900">SafeCall Family</div>
            <div className="text-xs text-slate-500 mt-0.5">
              $9 per month · renews June 12, 2026
            </div>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="w-4 h-4 text-slate-400" />
            <div className="text-sm text-slate-700">Visa ending in 4242</div>
          </div>
          <button className="text-xs font-semibold text-blue-700 hover:text-blue-900">
            Update
          </button>
        </div>
      </Card>

      <Card title="Danger zone" tone="danger">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Delete SafeCall account
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Removes Mom&apos;s protection immediately. This is not reversible.
            </div>
          </div>
          <button className="text-xs font-semibold text-red-700 hover:text-red-900 flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </Card>
    </div>
  );
}

function Card({
  title,
  children,
  tone = 'neutral',
}: {
  title: string;
  children: React.ReactNode;
  tone?: 'neutral' | 'danger';
}) {
  return (
    <section
      className={`bg-white border rounded-2xl overflow-hidden ${
        tone === 'danger' ? 'border-red-200' : 'border-slate-200'
      }`}
    >
      <div className="px-5 py-3 border-b border-slate-100">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-3 flex items-center justify-between border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function Toggle({
  label,
  desc,
  on,
  onToggle,
}: {
  label: string;
  desc?: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="px-5 py-4 flex items-start gap-4 border-b border-slate-100 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-900">{label}</div>
        {desc && <div className="text-xs text-slate-500 mt-0.5">{desc}</div>}
      </div>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          on ? 'bg-blue-700' : 'bg-slate-300'
        }`}
        aria-pressed={on}
      >
        <span
          className="absolute top-0.5 left-0 w-5 h-5 bg-white rounded-full shadow transition-transform"
          style={{ transform: on ? 'translateX(22px)' : 'translateX(2px)' }}
        />
      </button>
    </div>
  );
}
