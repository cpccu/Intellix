import type { ReactNode } from 'react';

interface PageIntroProps {
  icon: ReactNode;
  kicker: string;
  title: string;
  description: string;
  aside?: ReactNode;
}

export function PageIntro({ icon, kicker, title, description, aside }: PageIntroProps) {
  return (
    <section className="page-intro flex flex-col gap-5 border-b border-[#eadfdd] pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
      <div className="flex min-w-0 items-start gap-4">
        <span className="page-intro-mark mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#eadfdd] text-[#7b2435]">{icon}</span>
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#7b2435]">{kicker}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#2b2022] sm:text-[28px]">{title}</h1>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-500 sm:text-[13px]">{description}</p>
        </div>
      </div>
      {aside && <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{aside}</div>}
    </section>
  );
}
