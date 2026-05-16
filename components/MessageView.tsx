import StatusBar from './StatusBar';
import { ChevronLeft, Video } from 'lucide-react';
import { Scenario } from '@/lib/types';

type Props = {
  scenario: Scenario;
  showMessage: boolean;
  showTyping: boolean;
};

function senderHeader(scenario: Scenario) {
  if (scenario.id === 'legitimate') {
    return { name: 'Peter ❤️', subtitle: '', avatar: 'P', avatarBg: 'bg-emerald-500', trusted: true };
  }
  return { name: 'Unknown', subtitle: scenario.message.from, avatar: '?', avatarBg: 'bg-slate-400', trusted: false };
}

const priorChat: Record<string, { from: 'them' | 'you'; text: string; time: string }[]> = {
  legitimate: [
    { from: 'you', text: 'Have a good day sweetie!', time: 'Yesterday 8:14 AM' },
    { from: 'them', text: 'You too mom 💙', time: 'Yesterday 8:15 AM' },
  ],
  fake_son: [],
  fake_bank: [],
};

export default function MessageView({ scenario, showMessage, showTyping }: Props) {
  const header = senderHeader(scenario);
  const prior = priorChat[scenario.id] ?? [];

  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      <StatusBar />

      {/* iMessage header */}
      <div className="flex flex-col items-center px-4 pt-2 pb-3 border-b border-slate-200">
        <div className="w-full flex justify-between items-center mb-1">
          <ChevronLeft className="w-6 h-6 text-blue-500" />
          <Video className="w-5 h-5 text-blue-500" />
        </div>
        <div className={`w-14 h-14 rounded-full ${header.avatarBg} text-white text-xl font-semibold flex items-center justify-center mb-1`}>
          {header.avatar}
        </div>
        <div className="text-sm font-semibold text-slate-900">{header.name}</div>
        {header.subtitle && <div className="text-[11px] text-slate-500">{header.subtitle}</div>}
      </div>

      {/* Chat area */}
      <div className="flex-1 px-3 py-3 overflow-hidden flex flex-col gap-2">
        {prior.length > 0 && (
          <div className="text-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
            {prior[0].time}
          </div>
        )}
        {prior.map((m, i) =>
          m.from === 'you' ? (
            <div key={i} className="self-end max-w-[80%] bg-blue-500 text-white text-sm px-3 py-2 rounded-2xl rounded-br-md">
              {m.text}
            </div>
          ) : (
            <div key={i} className="self-start max-w-[80%] bg-slate-200 text-slate-900 text-sm px-3 py-2 rounded-2xl rounded-bl-md">
              {m.text}
            </div>
          )
        )}

        {prior.length > 0 && <div className="text-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-2 mb-1">Today</div>}

        {showTyping && !showMessage && (
          <div className="self-start bg-slate-200 px-4 py-3 rounded-2xl rounded-bl-md flex gap-1">
            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}

        {showMessage && (
          <div className="self-start max-w-[85%] bg-slate-200 text-slate-900 text-sm px-3 py-2 rounded-2xl rounded-bl-md animate-[slideIn_0.35s_ease-out]">
            {scenario.message.text}
          </div>
        )}
      </div>

      {/* Bottom input bar */}
      <div className="px-3 py-2 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
        <div className="flex-1 bg-white border border-slate-300 rounded-full px-3 py-1.5 text-xs text-slate-400">
          iMessage
        </div>
      </div>
    </div>
  );
}
