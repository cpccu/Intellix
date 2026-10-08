'use client';

import { useState, useMemo } from 'react';
import { ResourceRow } from '@/components/modules/ResourceRow';
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
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* ── Page Header ────────────────────────────────────── */}
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Resource Hub & Academic Archive
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Centralized categorical archive for lecture notes, examination timetables, and past questions.
        </p>
      </div>

      {/* ── Search + Filter Bar ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setActiveCategory(cat.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                activeCategory === cat.value
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-80">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="search"
            placeholder="Search by title, course code (e.g. CSC301)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg placeholder-slate-400 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors shadow-2xs"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>Showing {filtered.length} of {initialResources.length} verified documents</span>
        {(query || activeCategory !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setActiveCategory('all');
            }}
            className="text-slate-700 hover:text-slate-900 font-medium underline underline-offset-2 cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* ── Results Table ──────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-sm">No resources found matching your query.</p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveCategory('all');
              }}
              className="mt-3 text-xs text-slate-700 hover:text-slate-900 font-semibold underline underline-offset-2 cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filtered.map((resource) => (
            <ResourceRow key={resource.id} resource={resource} />
          ))
        )}
      </div>
    </div>
  );
}
