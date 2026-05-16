import { Signal, Wifi, BatteryFull } from 'lucide-react';

export default function StatusBar({ dark = false }: { dark?: boolean }) {
  const color = dark ? 'text-white' : 'text-slate-900';
  return (
    <div className={`flex justify-between items-center px-7 pt-3 text-xs font-semibold ${color}`}>
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <Signal className="w-3.5 h-3.5" />
        <Wifi className="w-3.5 h-3.5" />
        <BatteryFull className="w-4 h-4" />
      </div>
    </div>
  );
}
