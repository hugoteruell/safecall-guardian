'use client';
import * as Icons from 'lucide-react';
import { ActionButton as ActionType } from '@/lib/types';

type IconMap = Record<string, React.ComponentType<{ className?: string }>>;

export default function ActionButton({ action }: { action: ActionType }) {
  const Icon = (Icons as unknown as IconMap)[action.icon] ?? Icons.Circle;

  if (action.primary) {
    return (
      <button className="w-full min-h-[72px] bg-blue-900 hover:bg-blue-950 text-white text-xl font-bold rounded-2xl flex items-center justify-center gap-3 px-8 transition-colors">
        <Icon className="w-6 h-6" />
        {action.label}
      </button>
    );
  }
  return (
    <button className="flex-1 min-h-[64px] bg-white border-2 border-slate-300 hover:border-slate-500 text-slate-900 text-lg font-semibold rounded-2xl flex items-center justify-center gap-3 px-6 transition-colors">
      <Icon className="w-5 h-5" />
      {action.label}
    </button>
  );
}
