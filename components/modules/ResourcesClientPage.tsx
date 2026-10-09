'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResourceRow } from '@/components/modules/ResourceRow';
import { SectionWatermark } from '@/components/modules/SectionWatermark';
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
  const searchParams = useSearchParams();
  const routeSearch = searchParams.get('search') ?? '';
  const [localQuery, setLocalQuery] = useState<{ route: string; value: string } | null>(null);
  const query = localQuery?.route === routeSearch ? localQuery.value : routeSearch;
  const setQuery = (value: string) => setLocalQuery({ route: routeSearch, value });
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
    <div className="section-page section-page--resources mx-auto max-w-[1680px] space-y-6">
      <PageIntro
        icon={<LibraryBig size={19} />}
        kicker="Knowledge constellation"
        title="Resource archive"
        description="Browse lecture notes, past questions, faculty notices, and campus guides from one searchable library."
        aside={<span className="inline-flex items-center gap-2 rounded-xl border border-[#ead3d8] bg-[#fdf8f8] px-3 py-2 text-[10px] font-semibold text-[#5f5556]"><Files size={14} className="text-[#792c3b]" /> {initialResources.length} verified documents</span>}
      />

      <div className="grid min-w-0 items-stretch gap-5 lg:grid-cols-[230px_minmax(0,1fr)] 2xl:grid-cols-[250px_minmax(0,1fr)]">
        <div className="min-w-0">
        <aside className="rounded-2xl border border-[#e3e8df] bg-white p-3 sm:p-4">
          <div className="mb-3 flex items-center gap-2 px-2 pt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500"><BookOpen size={13} /> Browse library</div>
          <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-1">
            {CATEGORIES.map((cat, index) => {
              const count = cat.value === 'all' ? initialResources.length : initialResources.filter((resource) => resource.category === cat.value).length;
              const active = activeCategory === cat.value;
              return (
                <button key={cat.value} type="button" onClick={() => setActiveCategory(cat.value)} aria-pressed={active}
                  className={`flex min-w-0 items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[11px] font-semibold transition ${active ? 'bg-[#f5e9eb] !text-[#792c3b] ring-1 ring-[#ead3d8]' : '!text-[#58645a] hover:bg-[#fbf5f5] hover:!text-[#252b27]'}`}>
                  <span className="text-[9px] font-mono text-slate-600">0{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{cat.label}</span>
                  <span className={`text-[9px] ${active ? 'text-[#792c3b]' : 'text-slate-600'}`}>{count}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 hidden rounded-xl border border-[#e7e1e0] bg-[#fcfbfa] p-3 lg:block">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">About this library</p>
            <p className="mt-1.5 text-[10px] leading-relaxed text-slate-400">Materials are organized by category and course. Use the search to find a title or department.</p>
          </div>
        </aside>

        <div className="section-watermark-rail sticky top-[28vh] hidden min-h-[390px] items-center justify-center lg:flex">
          <SectionWatermark section="resources" />
        </div>
        </div>

        <section className="min-w-0 space-y-3">
          <div className="flex flex-col gap-3 rounded-2xl border border-[#e3e8df] bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <div className="min-w-0"><p className="text-xs font-semibold text-slate-100">{CATEGORIES.find((category) => category.value === activeCategory)?.label}</p><p className="mt-1 text-[10px] text-slate-500">Showing {filtered.length} of {initialResources.length} resources</p></div>
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-md">
              <input type="search" placeholder="Search title, course code, department…" value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-blue-100/10 bg-[#080f25]/80 px-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-blue-300/40 focus:outline-none" />
              {(query || activeCategory !== 'all') && <button type="button" onClick={() => { setQuery(''); setActiveCategory('all'); }} className="shrink-0 rounded-lg px-2.5 py-2 text-[10px] font-semibold text-[#792c3b] hover:bg-[#f5e9eb]">Reset</button>}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e3e8df] bg-white divide-y divide-[#edf0eb]">
            {filtered.length === 0 ? (
              <div className="p-12 text-center"><p className="text-sm text-slate-400">No resources found matching your query.</p><button type="button" onClick={() => { setQuery(''); setActiveCategory('all'); }} className="mt-3 text-xs font-semibold text-[#792c3b] underline underline-offset-2">Clear filters</button></div>
            ) : filtered.map((resource) => <ResourceRow key={resource.id} resource={resource} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
