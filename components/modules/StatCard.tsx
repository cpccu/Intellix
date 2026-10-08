interface Props {
  label: string;
  value: string | number;
  mono?: boolean;
  tone?: 'mint' | 'peach' | 'blue' | 'lavender';
}

const TONES = {
  mint: 'bg-[#d8e8ff] text-[#254676]',
  peach: 'bg-[#f0efff] text-[#6656df]',
  blue: 'bg-[#e6f2ff] text-[#3678ba]',
  lavender: 'bg-[#fff0e9] text-[#b65a3f]',
};

export function StatCard({ label, value, mono = false, tone = 'mint' }: Props) {
  return (
    <div className="group relative flex min-h-[112px] items-center justify-between gap-3 overflow-hidden rounded-2xl border border-blue-100/10 bg-[#101a37]/75 p-4 transition hover:border-blue-200/20 sm:p-5">
      <div className="relative z-10 min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">{label}</p>
        <p className={`mt-2 text-3xl font-semibold leading-none tracking-tight text-white ${mono ? 'font-mono text-xl' : ''}`}>
          {value}
        </p>
        <p className="mt-2 text-[9px] text-slate-500">Across your campus hub</p>
      </div>
      <span className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 ${TONES[tone]}`}>
        <span className="h-2 w-2 rounded-full bg-current shadow-[0_0_12px_currentColor]" />
      </span>
      <span aria-hidden="true" className="absolute -bottom-9 -right-5 h-24 w-24 rounded-full bg-blue-400/[0.035] blur-2xl transition group-hover:bg-blue-300/[0.09]" />
    </div>
  );
}
