export default function ResourcesLoading() {
  return (
    <div className="mx-auto max-w-[1320px] animate-pulse space-y-6" aria-label="Loading resource archive">
      <div className="flex items-center justify-between border-b border-blue-100/10 pb-5"><div><div className="h-3 w-44 rounded bg-blue-100/10" /><div className="mt-3 h-8 w-60 rounded bg-blue-100/10" /><div className="mt-2 h-4 w-[34rem] max-w-full rounded bg-blue-100/[0.06]" /></div><div className="h-8 w-36 rounded-xl bg-blue-100/10" /></div>
      <div className="grid items-start gap-5 lg:grid-cols-[230px_minmax(0,1fr)]"><div className="h-72 rounded-2xl border border-blue-100/10 bg-blue-100/[0.04]" /><div className="space-y-3"><div className="h-16 rounded-2xl border border-blue-100/10 bg-blue-100/[0.04]" /><div className="h-[30rem] rounded-2xl border border-blue-100/10 bg-blue-100/[0.04]" /></div></div>
    </div>
  );
}
