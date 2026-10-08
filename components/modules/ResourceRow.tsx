'use client';

import type { Resource } from '@/types';

interface Props {
  resource: Resource;
}

const CATEGORY_META: Record<
  string,
  { label: string; classes: string; icon: React.ReactNode }
> = {
  notes: {
    label: 'Lecture Notes',
    classes: 'bg-blue-50 text-blue-700 border-blue-200/80',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
  notices: {
    label: 'Official Notice',
    classes: 'bg-amber-50 text-amber-700 border-amber-200/80',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
      </svg>
    ),
  },
  past_questions: {
    label: 'Past Question',
    classes: 'bg-violet-50 text-violet-700 border-violet-200/80',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
      </svg>
    ),
  },
  other: {
    label: 'Campus Guide',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
};

export function ResourceRow({ resource }: Props) {
  const meta = CATEGORY_META[resource.category] ?? CATEGORY_META.other;

  return (
    <div className="group flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-white/[0.025] sm:flex-row sm:items-center sm:gap-4 sm:px-5">
      {/* Category icon */}
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${meta.classes}`}>
        {meta.icon}
      </div>

      {/* Text info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-100 sm:text-sm">{resource.title}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {resource.course_code && (
            <span className="text-[11px] font-mono font-medium text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/80">
              {resource.course_code}
            </span>
          )}
          {resource.department && (
            <span className="text-xs text-slate-500">{resource.department}</span>
          )}
          {resource.year && (
            <span className="text-xs text-slate-400">· {resource.year}</span>
          )}
        </div>
      </div>

      {/* Category badge */}
      <div className="flex items-center justify-between gap-2 border-t border-blue-100/10 pt-2 sm:border-0 sm:pt-0">
        <span className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[10px] font-medium ${meta.classes}`}>
          {meta.label}
        </span>

        {/* Download action button */}
        {resource.file_url ? (
          <a
            href={resource.file_url}
            download={resource.file_url.startsWith('/') ? true : undefined}
            target={resource.file_url.startsWith('/') ? undefined : '_blank'}
            rel={resource.file_url.startsWith('/') ? undefined : 'noreferrer'}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-blue-100/10 bg-white/[0.025] px-2.5 py-1.5 text-[10px] font-semibold text-slate-300 transition-colors hover:border-blue-200/25 hover:bg-blue-400/10 hover:text-white"
            title="Download document"
          >
            <svg className="h-3.5 w-3.5 text-sky-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Download</span>
          </a>
        ) : (
          <button type="button" disabled title="No document is attached to this resource yet" className="shrink-0 rounded-lg border border-blue-100/10 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 cursor-not-allowed">
            No file
          </button>
        )}
      </div>
    </div>
  );
}
