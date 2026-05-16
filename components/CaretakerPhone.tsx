import StatusBar from './StatusBar';
import LockScreenNotification from './LockScreenNotification';
import { Flashlight, Camera, Lock } from 'lucide-react';
import { Scenario } from '@/lib/types';

type NotifContent = { title: string; body: string };

const notifPerScenario: Record<string, NotifContent | null> = {
  fake_son: {
    title: 'Scam intercepted',
    body: "We held back a message asking Mom for $4,800. Tap to call her.",
  },
  fake_bank: {
    title: 'Scam call ended',
    body: 'We hung up on a fake Bank of America caller targeting Mom.',
  },
  legitimate: null, // Stay quiet — proof the system doesn't cry wolf.
};

export default function CaretakerPhone({
  scenario,
  alertVisible,
}: {
  scenario: Scenario;
  alertVisible: boolean;
}) {
  const notif = notifPerScenario[scenario.id];

  return (
    <div className="absolute inset-0 flex flex-col text-white overflow-hidden">
      {/* Wallpaper — family portrait (grandma with grandkids) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/wallpaper-family.jpg')" }}
      />
      {/* Slight dim so the white text on lock screen stays legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/45" />
      {/* Fallback color in case the image fails to load */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-rose-400 via-orange-300 to-amber-200" />

      {/* Foreground */}
      <div className="relative flex-1 flex flex-col">
        <StatusBar dark />

        {/* Lock icon */}
        <div className="flex justify-center mt-3">
          <div className="w-6 h-6 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
            <Lock className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Time */}
        <div className="text-center mt-4">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-white/85">
            Friday, May 16
          </div>
          <div className="text-[78px] leading-none font-thin tracking-tight mt-1 drop-shadow">
            9:41
          </div>
        </div>

        {/* "Ana" label - the caretaker's name */}
        <div className="text-center text-xs text-white/80 font-medium mt-1">
          Ana&apos;s iPhone
        </div>

        {/* Notification area */}
        <div className="flex-1 flex flex-col justify-end pb-32 gap-2">
          {notif && (
            <LockScreenNotification
              title={notif.title}
              body={notif.body}
              visible={alertVisible}
            />
          )}

          {/* Ambient existing notification — calendar reminder for realism */}
          <div className="mx-3 mt-1 opacity-70">
            <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl px-3 py-2 text-white">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-red-500/90" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-white/80">
                  Calendar
                </span>
                <span className="ml-auto text-[10px] text-white/60">2:00 pm</span>
              </div>
              <div className="text-[12px] leading-snug text-white/90 mt-0.5">
                Pick up Mom for her checkup
              </div>
            </div>
          </div>
        </div>

        {/* Bottom utility row */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-between items-center px-8">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
            <Flashlight className="w-4 h-4 text-white" />
          </div>
          <div className="text-[10px] text-white/70">swipe up to open</div>
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
            <Camera className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/80 rounded-full" />
      </div>
    </div>
  );
}
