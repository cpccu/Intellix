export default function ClubsLoading() {
  return (
    <div className="mx-auto max-w-[1320px] animate-pulse space-y-6" aria-label="Loading clubs and events">
      <div className="flex items-center justify-between border-b border-blue-100/10 pb-5"><div><div className="h-3 w-40 rounded bg-blue-100/10" /><div className="mt-3 h-8 w-64 rounded bg-blue-100/10" /><div className="mt-2 h-4 w-[34rem] max-w-full rounded bg-blue-100/[0.06]" /></div><div className="flex gap-2"><div className="h-7 w-28 rounded-full bg-blue-100/10" /><div className="h-7 w-28 rounded-full bg-blue-100/10" /></div></div>
      <div className="h-12 rounded-xl bg-blue-100/[0.04]" />
      <div className="grid items-start gap-5 xl:grid-cols-[250px_minmax(0,1fr)]"><div className="h-[340px] rounded-2xl border border-blue-100/10 bg-blue-100/[0.04]" /><div className="grid gap-3 xl:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-56 rounded-2xl border border-blue-100/10 bg-blue-100/[0.04]" />)}</div></div>
    </div>
  );
}
