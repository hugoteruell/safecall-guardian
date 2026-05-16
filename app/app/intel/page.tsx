import {
  Activity,
  TrendingUp,
  Users,
  ShieldAlert,
  MessageSquareWarning,
  Globe,
} from 'lucide-react';
import { getTopScammers, getTopSignatures } from '@/lib/queries';
import AnimatedNumber from '@/components/AnimatedNumber';

export const dynamic = 'force-dynamic';

const CATEGORY_COLOR: Record<string, string> = {
  bank: 'bg-bordeaux-soft text-bordeaux border-bordeaux/20',
  family: 'bg-coral-soft text-coral-deep border-coral/30',
  romance: 'bg-coral-soft text-coral-deep border-coral/30',
  irs: 'bg-gold-soft text-coral-deep border-gold/30',
  medicare: 'bg-gold-soft text-coral-deep border-gold/30',
  package: 'bg-bordeaux-soft text-bordeaux border-bordeaux/20',
};

function CategoryPill({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.15em] border ${
        CATEGORY_COLOR[value] ?? 'bg-cream-deep text-ink-muted border-cream-deep'
      }`}
    >
      {value}
    </span>
  );
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ConfidenceDial({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const color = value >= 0.9 ? '#9B2C2C' : value >= 0.75 ? '#E07856' : '#7FA486';
  return (
    <div className="flex items-center gap-2">
      <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
        <circle cx="22" cy="22" r={radius} fill="none" stroke="#EFE6D2" strokeWidth="4" />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span className="text-xs font-bold numerals text-ink">{pct}%</span>
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
      <div className="animate-fade-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-soft text-ink-soft border border-cream-deep text-[11px] font-semibold uppercase tracking-[0.18em] mb-4">
          <Globe className="w-3.5 h-3.5" strokeWidth={1.8} />
          Network intelligence
        </div>
        <h1 className="font-display text-4xl lg:text-5xl text-ink leading-[1.05] max-w-3xl">
          Every block teaches SafeCall. <span className="text-ink-muted italic">This is the threat library it&apos;s built.</span>
        </h1>
        <p className="text-base text-ink-soft mt-3 max-w-2xl leading-relaxed">
          When a new number calls Mom, SafeCall checks here first. The more families on
          SafeCall, the smarter this layer gets.
        </p>
      </div>

      {/* Network stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          icon={<ShieldAlert className="w-4 h-4" strokeWidth={1.8} />}
          label="Known scammer numbers"
          target={scammers.length}
          delta={`${highConfidenceScammers} high-confidence`}
          tone="bad"
        />
        <Stat
          icon={<Activity className="w-4 h-4" strokeWidth={1.8} />}
          label="Reports across network"
          target={totalReports}
          delta="Last 30 days"
        />
        <Stat
          icon={<Users className="w-4 h-4" strokeWidth={1.8} />}
          label="Victims protected"
          target={totalVictims}
          delta="Across all families"
          tone="good"
        />
        <Stat
          icon={<MessageSquareWarning className="w-4 h-4" strokeWidth={1.8} />}
          label="Pattern matches"
          target={totalSignatureMatches}
          delta={`${signatures.length} unique patterns`}
        />
      </div>

      {/* Top scammers table */}
      <section className="bg-paper border border-cream-deep rounded-3xl overflow-hidden card-lift">
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-deep">
          <div>
            <h2 className="text-[11px] font-bold text-ink uppercase tracking-[0.18em]">
              Top scammer numbers
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Ranked by reports across the entire SafeCall network.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-ink-muted">
            <TrendingUp className="w-3 h-3 text-bordeaux" strokeWidth={2} />
            Updating live
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted border-b border-cream-deep bg-cream-soft/40">
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">Number</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-right">Reports</th>
                <th className="px-6 py-3 text-right">Victims</th>
                <th className="px-6 py-3 text-left">Confidence</th>
                <th className="px-6 py-3 text-right hidden lg:table-cell">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {scammers.map((s, i) => (
                <tr
                  key={s.id}
                  className="border-b border-cream-deep last:border-0 hover:bg-cream-soft transition-colors"
                >
                  <td className="px-6 py-3 text-xs font-bold text-ink-muted numerals">
                    {String(i + 1).padStart(2, '0')}
                  </td>
                  <td className="px-6 py-3 font-display text-ink numerals whitespace-nowrap">
                    {s.phone}
                  </td>
                  <td className="px-6 py-3">
                    <CategoryPill value={s.primary_category} />
                  </td>
                  <td className="px-6 py-3 text-right font-bold numerals text-bordeaux">
                    {s.reports_count}
                  </td>
                  <td className="px-6 py-3 text-right numerals text-ink-soft">
                    {s.victims_count}
                  </td>
                  <td className="px-6 py-3">
                    <ConfidenceDial value={Number(s.confidence)} />
                  </td>
                  <td className="px-6 py-3 text-right text-xs text-ink-muted hidden lg:table-cell">
                    {formatDateShort(s.last_seen_at)}
                  </td>
                </tr>
              ))}
              {scammers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-ink-muted">
                    No scammer numbers tracked yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top signatures */}
      <section className="bg-paper border border-cream-deep rounded-3xl overflow-hidden card-lift">
        <div className="px-6 py-4 border-b border-cream-deep">
          <h2 className="text-[11px] font-bold text-ink uppercase tracking-[0.18em]">
            Most common scam patterns
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Recurring text fingerprints SafeCall recognizes across messages and calls.
          </p>
        </div>
        <ul className="divide-y divide-cream-deep">
          {signatures.map((s, i) => (
            <li key={s.id} className="px-6 py-5 flex items-start gap-4 hover:bg-cream-soft transition-colors">
              <span className="text-xs font-bold text-ink-muted numerals shrink-0 pt-1 w-6">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <CategoryPill value={s.category} />
                  <span className="font-mono text-[11px] text-ink-muted">{s.fingerprint}</span>
                </div>
                <p className="text-sm text-ink leading-snug italic font-display">
                  &ldquo;{s.example_text}&rdquo;
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-display text-3xl numerals text-bordeaux leading-none">
                  {s.matches_count}
                </div>
                <div className="text-[10px] text-ink-muted uppercase font-semibold tracking-[0.15em] mt-1">
                  matches
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="relative bg-ink text-cream rounded-3xl p-8 lg:p-10 overflow-hidden card-lift">
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-coral/20 blur-3xl" />
        <div className="absolute -left-16 bottom-0 w-56 h-56 rounded-full bg-sage/20 blur-3xl" />
        <div className="relative">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cream/70 mb-3">
            Network effect
          </div>
          <h3 className="font-display text-3xl lg:text-4xl leading-tight mb-3">
            Every block makes the next family safer.
          </h3>
          <p className="text-cream/80 leading-relaxed max-w-2xl">
            When Margaret&apos;s SafeCall caught a fake bank caller this morning, the
            number was added to this list within seconds. Next time that scammer dials
            any of the {totalVictims.toLocaleString('en-US')}+ protected seniors on our
            network, we already know.
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  target,
  delta,
  tone = 'neutral',
}: {
  icon: React.ReactNode;
  label: string;
  target: number;
  delta?: string;
  tone?: 'good' | 'bad' | 'neutral';
}) {
  const valueColor =
    tone === 'good' ? 'text-sage-deep' : tone === 'bad' ? 'text-bordeaux' : 'text-ink';
  return (
    <div className="bg-paper border border-cream-deep rounded-3xl p-6 card-lift">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted mb-3">
        {icon}
        {label}
      </div>
      <div className={`font-display text-4xl leading-none ${valueColor}`}>
        <AnimatedNumber target={target} />
      </div>
      {delta && <div className="text-xs text-ink-muted mt-2">{delta}</div>}
    </div>
  );
}
