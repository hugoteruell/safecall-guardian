import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  width?: number;
  height?: number;
  glow?: 'warm' | 'cool';
};

export default function PhoneFrame({
  children,
  width = 320,
  height = 660,
  glow = 'warm',
}: Props) {
  const glowClass =
    glow === 'cool'
      ? 'bg-gradient-to-br from-emerald-400/20 via-blue-500/10 to-purple-500/20'
      : 'bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-emerald-500/20';

  return (
    <div className="relative mx-auto" style={{ width }}>
      {/* Glow */}
      <div className={`absolute -inset-8 ${glowClass} blur-3xl rounded-full -z-10`} />

      {/* Phone body */}
      <div className="relative bg-slate-950 rounded-[3rem] p-3 shadow-2xl ring-1 ring-slate-800">
        {/* Side buttons */}
        <div className="absolute -left-1 top-24 w-1 h-10 bg-slate-800 rounded-l" />
        <div className="absolute -left-1 top-40 w-1 h-16 bg-slate-800 rounded-l" />
        <div className="absolute -left-1 top-60 w-1 h-16 bg-slate-800 rounded-l" />
        <div className="absolute -right-1 top-36 w-1 h-24 bg-slate-800 rounded-r" />

        {/* Screen */}
        <div
          className="relative bg-white rounded-[2.4rem] overflow-hidden"
          style={{ height }}
        >
          {/* Notch / Dynamic Island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-50" />
          {children}
        </div>
      </div>
    </div>
  );
}
