import { RiskLevel } from '@/lib/types';

const config: Record<RiskLevel, { num: string; label: string; text: string }> = {
  critical: { num: 'text-red-600', label: 'text-red-700', text: 'High concern' },
  medium: { num: 'text-amber-600', label: 'text-amber-700', text: 'Some concern' },
  low: { num: 'text-emerald-600', label: 'text-emerald-700', text: 'Looks safe' },
};

export default function ScoreDisplay({ score, riskLevel }: { score: number; riskLevel: RiskLevel }) {
  const c = config[riskLevel];
  return (
    <div className="flex flex-col items-center my-8">
      <div className={`text-[120px] leading-none font-bold tabular-nums ${c.num}`}>{score}</div>
      <div className={`text-xl font-semibold mt-2 ${c.label}`}>{c.text}</div>
      <div className="text-base text-slate-500">out of 100</div>
    </div>
  );
}
