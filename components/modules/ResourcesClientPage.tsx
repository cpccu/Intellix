'use client';

import { useState, useMemo } from 'react';
import { ResourceRow } from '@/components/modules/ResourceRow';
import { PageIntro } from '@/components/ui/PageIntro';
import { BookOpen, Files, LibraryBig } from 'lucide-react';
import type { Resource, ResourceCategory } from '@/types';

const CATEGORIES: { value: 'all' | ResourceCategory; label: string }[] = [
  { value: 'all', label: 'All Resources' },
  { value: 'notes', label: 'Lecture Notes' },
  { value: 'notices', label: 'Faculty Notices' },
  { value: 'past_questions', label: 'Past Questions (PQs)' },
  { value: 'other', label: 'Guides & Maps' },
];

interface Props {
  initialResources: Resource[];
}

export function ResourcesClientPage({ initialResources }: Props) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | ResourceCategory>('all');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return initialResources.filter((r) => {
      const matchesCategory =
        activeCategory === 'all' || r.category === activeCategory;
      const matchesQuery =
        !q ||
        r.title.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q) ||
        (r.course_code ?? '').toLowerCase().includes(q) ||
        (r.department ?? '').toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [initialResources, query, activeCategory]);

  return (
    <div className="mx-auto max-w-[1320px] space-y-6">
      <PageIntro
        icon={<LibraryBig size={19} />}
        kicker="Knowledge constellation"
        title="Resource archive"
        description="Browse lecture notes, past questions, faculty notices, and campus guides from one searchable library."
        aside={<span className="inline-flex items-center gap-2 rounded-xl border border-blue-100/10 bg-[#111b38]/75 px-3 py-2 text-[10px] text-slate-300"><Files size={14} className="text-sky-200" /> {initialResources.length} verified documents</span>}
      />

      <div className="grid items-start gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-blue-100/10 bg-[#101a37]/75 p-3 sm:p-4">
          <div className="mb-3 flex items-center gap-2 px-2 pt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500"><BookOpen size={13} /> Browse library</div>
          <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-1">
            {CATEGORIES.map((cat, index) => {
              const count = cat.value === 'all' ? initialResources.length : initialResources.filter((resource) => resource.category === cat.value).length;
              const active = activeCategory === cat.value;
              return (
                <button key={cat.value} type="button" onClick={() => setActiveCategory(cat.value)} aria-pressed={active}
                  className={`flex min-w-0 items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[11px] font-semibold transition ${active ? 'bg-blue-400/12 text-sky-100 ring-1 ring-blue-300/20' : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'}`}>
                  <span className="text-[9px] font-mono text-slate-600">0{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{cat.label}</span>
                  <span className={`text-[9px] ${active ? 'text-sky-200' : 'text-slate-600'}`}>{count}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 hidden rounded-xl border border-blue-100/10 bg-[#0a1430]/60 p-3 lg:block">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">About this library</p>
            <p className="mt-1.5 text-[10px] leading-relaxed text-slate-400">Materials are organized by category and course. Use the search to find a title or department.</p>
          </div>
        </aside>

        <section className="min-w-0 space-y-3">
          <div className="flex flex-col gap-3 rounded-2xl border border-blue-100/10 bg-[#101a37]/75 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <div className="min-w-0"><p className="text-xs font-semibold text-slate-100">{CATEGORIES.find((category) => category.value === activeCategory)?.label}</p><p className="mt-1 text-[10px] text-slate-500">Showing {filtered.length} of {initialResources.length} resources</p></div>
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-md">
              <input type="search" placeholder="Search title, course code, department…" value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-blue-100/10 bg-[#080f25]/80 px-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-blue-300/40 focus:outline-none" />
              {(query || activeCategory !== 'all') && <button type="button" onClick={() => { setQuery(''); setActiveCategory('all'); }} className="shrink-0 rounded-lg px-2.5 py-2 text-[10px] font-semibold text-sky-200 hover:bg-white/[0.05]">Reset</button>}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-blue-100/10 bg-[#101a37]/75 divide-y divide-blue-100/10">
            {filtered.length === 0 ? (
              <div className="p-12 text-center"><p className="text-sm text-slate-400">No resources found matching your query.</p><button type="button" onClick={() => { setQuery(''); setActiveCategory('all'); }} className="mt-3 text-xs font-semibold text-sky-200 underline underline-offset-2">Clear filters</button></div>
            ) : filtered.map((resource) => <ResourceRow key={resource.id} resource={resource} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
