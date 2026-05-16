import { RiskLevel } from '@/lib/types';

const config: Record<RiskLevel, { num: string; label: string; text: string }> = {
  critical: { num: 'text-bordeaux', label: 'text-bordeaux-deep', text: 'High concern' },
  medium: { num: 'text-coral-deep', label: 'text-coral-deep', text: 'Some concern' },
  low: { num: 'text-sage-deep', label: 'text-sage-deep', text: 'Looks safe' },
};

export default function ScoreDisplay({
  score,
  riskLevel,
}: {
  score: number;
  riskLevel: RiskLevel;
}) {
  const c = config[riskLevel];
  return (
    <div className="flex flex-col items-center my-8">
      <div className={`font-display text-[120px] leading-none numerals ${c.num}`}>
        {score}
      </div>
      <div className={`text-xl font-semibold mt-2 ${c.label}`}>{c.text}</div>
      <div className="text-base text-ink-muted">out of 100</div>
    </div>
  );
}
