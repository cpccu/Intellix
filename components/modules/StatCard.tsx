interface Props {
  label: string;
  value: string | number;
  mono?: boolean;
  tone?: 'mint' | 'peach' | 'blue' | 'lavender';
}

const TONES = {
  mint: 'bg-[#eaf1eb] text-[#315d4a]',
  peach: 'bg-[#f5e9eb] text-[#792c3b]',
  blue: 'bg-[#edf2ed] text-[#315d4a]',
  lavender: 'bg-[#f7f0e5] text-[#a36b2d]',
};

export function StatCard({ label, value, mono = false, tone = 'mint' }: Props) {
  return (
    <div className="group relative flex min-h-[112px] items-center justify-between gap-3 overflow-hidden rounded-2xl border border-[#e3e8df] bg-white p-4 shadow-[0_3px_12px_rgba(33,48,38,.045)] transition hover:-translate-y-0.5 hover:border-[#cbd9cc] hover:shadow-[0_8px_22px_rgba(33,48,38,.065)] sm:p-5">
      <div className="relative z-10 min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">{label}</p>
        <p className={`mt-2 text-3xl font-semibold leading-none tracking-tight text-[#35282a] ${mono ? 'font-mono text-xl' : ''}`}>
          {value}
        </p>
        <p className="mt-2 text-[9px] text-slate-500">Across your campus hub</p>
      </div>
      <span className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e3e8df] ${TONES[tone]}`}>
        <span className="h-2 w-2 rounded-full bg-current shadow-[0_0_12px_currentColor]" />
      </span>
      <span aria-hidden="true" className="absolute -bottom-9 -right-5 h-24 w-24 rounded-full bg-[#315d4a]/[0.035] blur-2xl transition group-hover:bg-[#315d4a]/[0.08]" />
    </div>
  );
}
