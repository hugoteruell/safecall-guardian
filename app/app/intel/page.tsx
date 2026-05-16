import {
  Activity,
  TrendingUp,
  Users,
  ShieldAlert,
  MessageSquareWarning,
  Globe,
} from 'lucide-react';
import { getTopScammers, getTopSignatures } from '@/lib/queries';

export const dynamic = 'force-dynamic';

const CATEGORY_COLOR: Record<string, string> = {
  bank: 'bg-red-100 text-red-700 border-red-200',
  family: 'bg-rose-100 text-rose-700 border-rose-200',
  romance: 'bg-pink-100 text-pink-700 border-pink-200',
  irs: 'bg-orange-100 text-orange-700 border-orange-200',
  medicare: 'bg-amber-100 text-amber-700 border-amber-200',
  package: 'bg-purple-100 text-purple-700 border-purple-200',
};

function CategoryPill({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
        CATEGORY_COLOR[value] ?? 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      {value}
    </span>
  );
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = value >= 0.9 ? 'bg-red-600' : value >= 0.75 ? 'bg-amber-500' : 'bg-emerald-600';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold tabular-nums text-slate-600">{pct}%</span>
    </div>
  );
}

export default async function IntelPage() {
  const [scammers, signatures] = await Promise.all([
    getTopScammers(20),
    getTopSignatures(20),
  ]);

  const totalReports = scammers.reduce((acc, s) => acc + s.reports_count, 0);
  const totalVictims = scammers.reduce((acc, s) => acc + s.victims_count, 0);
  const totalSignatureMatches = signatures.reduce((acc, s) => acc + s.matches_count, 0);
  const highConfidenceScammers = scammers.filter((s) => Number(s.confidence) >= 0.9).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold uppercase tracking-wider mb-3">
          <Globe className="w-3.5 h-3.5" />
          Network intelligence
        </div>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight max-w-3xl">
          Every block teaches SafeCall. This is the threat library it&apos;s built.
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
          When a new number calls Mom, SafeCall checks here first. The more
          families on SafeCall, the smarter this layer gets.
        </p>
      </div>

      {/* Network stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          icon={<ShieldAlert className="w-4 h-4" />}
          label="Known scammer numbers"
          value={scammers.length.toString()}
          delta={`${highConfidenceScammers} high-confidence`}
          tone="bad"
        />
        <Stat
          icon={<Activity className="w-4 h-4" />}
          label="Reports across network"
          value={totalReports.toLocaleString('en-US')}
          delta="Last 30 days"
        />
        <Stat
          icon={<Users className="w-4 h-4" />}
          label="Victims protected"
          value={totalVictims.toLocaleString('en-US')}
          delta="Across all families"
          tone="good"
        />
        <Stat
          icon={<MessageSquareWarning className="w-4 h-4" />}
          label="Pattern matches"
          value={totalSignatureMatches.toLocaleString('en-US')}
          delta={`${signatures.length} unique patterns`}
        />
      </div>

      {/* Top scammers table */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Top scammer numbers
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by reports across the entire SafeCall network.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500">
            <TrendingUp className="w-3 h-3 text-red-600" />
            Updating live
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100">
                <th className="px-5 py-3 text-left">#</th>
                <th className="px-5 py-3 text-left">Number</th>
                <th className="px-5 py-3 text-left">Category</th>
                <th className="px-5 py-3 text-right">Reports</th>
                <th className="px-5 py-3 text-right">Victims</th>
                <th className="px-5 py-3 text-left">Confidence</th>
                <th className="px-5 py-3 text-right hidden lg:table-cell">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {scammers.map((s, i) => (
                <tr
                  key={s.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-5 py-3 text-xs font-bold text-slate-400 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </td>
                  <td className="px-5 py-3 font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                    {s.phone}
                  </td>
                  <td className="px-5 py-3">
                    <CategoryPill value={s.primary_category} />
                  </td>
                  <td className="px-5 py-3 text-right font-bold tabular-nums text-red-700">
                    {s.reports_count}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                    {s.victims_count}
                  </td>
                  <td className="px-5 py-3">
                    <ConfidenceBar value={Number(s.confidence)} />
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-slate-500 hidden lg:table-cell">
                    {formatDateShort(s.last_seen_at)}
                  </td>
                </tr>
              ))}
              {scammers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-500">
                    No scammer numbers tracked yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top signatures */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Most common scam patterns
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Recurring text fingerprints SafeCall recognizes across messages and
            calls. New scams matching these are blocked instantly.
          </p>
        </div>
        <ul className="divide-y divide-slate-100">
          {signatures.map((s, i) => (
            <li key={s.id} className="px-5 py-4 flex items-start gap-4">
              <span className="text-xs font-bold text-slate-400 tabular-nums shrink-0 pt-0.5 w-6">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <CategoryPill value={s.category} />
                  <span className="font-mono text-xs text-slate-500">
                    {s.fingerprint}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-snug italic">
                  &ldquo;{s.example_text}&rdquo;
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-bold tabular-nums text-red-600 leading-none">
                  {s.matches_count}
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider mt-1">
                  matches
                </div>
              </div>
            </li>
          ))}
          {signatures.length === 0 && (
            <li className="px-5 py-12 text-center text-sm text-slate-500">
              No patterns tracked yet.
            </li>
          )}
        </ul>
      </section>

      <div className="bg-gradient-to-br from-blue-900 to-purple-800 text-white rounded-2xl p-6 lg:p-8">
        <div className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-2">
          Network effect
        </div>
        <h3 className="text-xl lg:text-2xl font-bold leading-tight mb-2">
          Every block makes the next family safer.
        </h3>
        <p className="text-sm text-blue-100 leading-relaxed max-w-2xl">
          When Margaret&apos;s SafeCall caught a fake bank caller this morning, the
          number was added to this list within seconds. Next time that scammer
          dials any of the {totalVictims.toLocaleString('en-US')}+ protected seniors on
          our network, we already know.
        </p>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  delta,
  tone = 'neutral',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta?: string;
  tone?: 'good' | 'bad' | 'neutral';
}) {
  const valueColor =
    tone === 'good'
      ? 'text-emerald-700'
      : tone === 'bad'
      ? 'text-red-600'
      : 'text-slate-900';
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
        {icon}
        {label}
      </div>
      <div className={`text-3xl font-bold tabular-nums ${valueColor}`}>{value}</div>
      {delta && <div className="text-xs text-slate-500 mt-1">{delta}</div>}
    </div>
  );
}
