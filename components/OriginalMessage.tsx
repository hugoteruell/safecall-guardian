import { Scenario } from '@/lib/types';

export default function OriginalMessage({ message }: { message: Scenario['message'] }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-10">
      <div className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-3">
        Message received
      </div>
      <div className="text-base text-slate-600 mb-3">From {message.from}</div>
      <div className="text-xl text-slate-900 leading-relaxed">{message.text}</div>
    </div>
  );
}
