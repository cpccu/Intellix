export default function ResourcesLoading() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="space-y-2">
        <div className="h-7 w-44 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-96 bg-slate-100 rounded animate-pulse" />
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-3">
        <div className="flex-1 h-10 bg-slate-200 rounded-lg animate-pulse" />
        <div className="w-40 h-10 bg-slate-100 rounded-lg animate-pulse" />
      </div>

      {/* Resource rows */}
      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="w-9 h-9 bg-slate-100 rounded-lg animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-1/3 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="w-16 h-6 bg-slate-100 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
