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
    <section className="page-intro flex flex-col gap-5 border-b border-blue-100/10 pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
      <div className="flex min-w-0 items-start gap-4">
        <span className="page-intro-mark mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-200/15 text-sky-200">{icon}</span>
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-sky-200/75">{kicker}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-[28px]">{title}</h1>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-400 sm:text-[13px]">{description}</p>
        </div>
      </div>
      {aside && <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{aside}</div>}
    </section>
  );
}
