'use client';
import * as Icons from 'lucide-react';
import { ActionButton as ActionType } from '@/lib/types';

type IconMap = Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>>;

export default function ActionButton({ action }: { action: ActionType }) {
  const Icon = (Icons as unknown as IconMap)[action.icon] ?? Icons.Circle;

  if (action.primary) {
    return (
      <button className="w-full min-h-[72px] bg-ink hover:bg-ink-soft text-cream text-xl font-bold rounded-2xl flex items-center justify-center gap-3 px-8 transition-colors">
        <Icon className="w-6 h-6" strokeWidth={2} />
        {action.label}
      </button>
    );
  }
  return (
    <button className="flex-1 min-h-[64px] bg-paper border-2 border-cream-deep hover:border-ink-muted text-ink text-lg font-semibold rounded-2xl flex items-center justify-center gap-3 px-6 transition-colors">
      <Icon className="w-5 h-5" strokeWidth={1.8} />
      {action.label}
    </button>
  );
}
