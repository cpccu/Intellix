export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-[1440px] animate-pulse space-y-5" aria-label="Loading dashboard">
      <div className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
        <div className="min-h-[260px] rounded-[28px] border border-blue-100/10 bg-blue-300/[0.045] p-7"><div className="h-3 w-36 rounded bg-blue-100/10" /><div className="mt-12 h-9 w-80 max-w-full rounded bg-blue-100/10" /><div className="mt-4 h-4 w-96 max-w-full rounded bg-blue-100/[0.06]" /><div className="mt-7 h-10 w-36 rounded-xl bg-blue-100/10" /></div>
        <div className="min-h-[260px] rounded-[28px] border border-blue-100/10 bg-blue-300/[0.035] p-6"><div className="h-4 w-32 rounded bg-blue-100/10" /><div className="mx-auto mt-6 h-32 w-48 rounded-full border border-blue-100/10" /><div className="mt-5 grid grid-cols-2 gap-2"><div className="h-12 rounded-xl bg-blue-100/[0.06]" /><div className="h-12 rounded-xl bg-blue-100/[0.06]" /></div></div>
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-2xl border border-blue-100/10 bg-blue-100/[0.04]" />)}</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-2xl border border-blue-100/10 bg-blue-100/[0.04]" />)}</div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]"><div className="h-80 rounded-2xl border border-blue-100/10 bg-blue-100/[0.04]" /><div className="h-80 rounded-2xl border border-blue-100/10 bg-blue-100/[0.04]" /></div>
    </div>
  );
}
