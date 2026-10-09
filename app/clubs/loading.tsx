export default function ClubsLoading() {
  return (
    <div className="mx-auto max-w-[1320px] animate-pulse space-y-6" aria-label="Loading clubs and events">
      <div className="flex items-center justify-between border-b border-[#eadfdd] pb-5"><div><div className="h-3 w-40 rounded bg-[#eadfdd]" /><div className="mt-3 h-8 w-64 rounded bg-[#eadfdd]" /><div className="mt-2 h-4 w-[34rem] max-w-full rounded bg-[#f2e9e7]" /></div><div className="flex gap-2"><div className="h-7 w-28 rounded-full bg-[#eadfdd]" /><div className="h-7 w-28 rounded-full bg-[#eadfdd]" /></div></div>
      <div className="h-12 rounded-xl bg-[#f5efed]" />
      <div className="grid items-start gap-5 xl:grid-cols-[250px_minmax(0,1fr)]"><div className="h-[340px] rounded-2xl border border-[#eadfdd] bg-[#f5efed]" /><div className="grid gap-3 xl:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-56 rounded-2xl border border-[#eadfdd] bg-[#f5efed]" />)}</div></div>
    </div>
  );
}
