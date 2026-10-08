'use client';

import React, { useMemo, useState, useTransition } from 'react';
import type { FAQItem, HelpdeskCategory, HelpdeskQuery } from '@/types';
import { submitHelpdeskQuery } from '@/lib/actions/helpdesk.actions';
import { createDemoId, readDemoRecords, useDemoRecords, writeDemoRecords } from '@/lib/demo-storage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageIntro } from '@/components/ui/PageIntro';
import { CircleHelp, Search } from 'lucide-react';

interface HelpdeskClientPageProps {
  initialFaqs: FAQItem[];
  initialQueries: HelpdeskQuery[];
  isGuest?: boolean;
}

const CATEGORIES: { id: HelpdeskCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All Topics', icon: '📋' },
  { id: 'bus_schedule', label: 'Bus & Transit', icon: '🚌' },
  { id: 'exam_logistics', label: 'Exam Logistics', icon: '📝' },
  { id: 'campus_rules', label: 'Campus Rules', icon: '⚖️' },
  { id: 'facilities', label: 'Facilities & WiFi', icon: '🏢' },
  { id: 'academic', label: 'Academic Affairs', icon: '🎓' },
];

const QUICK_TOPICS = [
  { icon: '🚌', label: 'Shuttle Routes', category: 'bus_schedule' as const },
  { icon: '📝', label: 'Exam Rules', category: 'exam_logistics' as const },
  { icon: '📚', label: 'Library Hours', category: 'facilities' as const },
  { icon: '📶', label: 'Campus WiFi', category: 'facilities' as const },
  { icon: '⚖️', label: 'Student Policies', category: 'campus_rules' as const },
  { icon: '🎓', label: 'Academic Affairs', category: 'academic' as const },
];

export function HelpdeskClientPage({
  initialFaqs,
  initialQueries,
  isGuest,
}: HelpdeskClientPageProps) {
  const [activeCategory, setActiveCategory] = useState<HelpdeskCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQueries, setSubmittedQueries] = useState<HelpdeskQuery[]>([]);
  const demoQueries = useDemoRecords<HelpdeskQuery>('campusos-demo-helpdesk');
  const queries = useMemo(() => {
    const byId = new Map(initialQueries.map((query) => [query.id, query]));
    demoQueries.forEach((query) => byId.set(query.id, query));
    submittedQueries.forEach((query) => byId.set(query.id, query));
    return [...byId.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [demoQueries, initialQueries, submittedQueries]);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [isSubmitting, startSubmitting] = useTransition();
  const [submitFeedback, setSubmitFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  // Filter FAQs
  const filteredFaqs = initialFaqs.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleQuerySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startSubmitting(async () => {
      if (isGuest) {
        const newTicket: HelpdeskQuery = {
          id: createDemoId('demo-query'),
          title: String(formData.get('title') ?? ''),
          content: String(formData.get('content') ?? ''),
          category: (formData.get('category') as HelpdeskCategory) || 'general',
          status: 'pending',
          answer: null,
          resolved_at: null,
          created_by: 'guest',
          created_at: new Date().toISOString(),
        };
        const saved = readDemoRecords<HelpdeskQuery>('campusos-demo-helpdesk');
        if (!writeDemoRecords('campusos-demo-helpdesk', [newTicket, ...saved])) {
          setSubmitFeedback({ ok: false, msg: 'This browser could not save demo data. Check local storage settings.' });
          return;
        }
        setSubmitFeedback({ ok: true, msg: 'Demo inquiry saved in this browser.' });
        form.reset();
        return;
      }

      const result = await submitHelpdeskQuery(formData);
      if (!result.success || !result.data) {
        setSubmitFeedback({ ok: false, msg: result.error ?? 'Could not save your inquiry.' });
        return;
      }

      setSubmittedQueries((current) => [result.data!, ...current]);
      setSubmitFeedback({ ok: true, msg: 'Inquiry submitted successfully. Our team will review shortly.' });
      form.reset();

      setTimeout(() => {
        setShowQueryModal(false);
        setSubmitFeedback(null);
      }, 1400);
    });
  };

  return (
    <div className="mx-auto max-w-[1320px] space-y-7">
      <PageIntro
        icon={<CircleHelp size={19} />}
        kicker="Student support network"
        title="Campus helpdesk"
        description="Search official guidance for transit, exams, library policies, and campus logistics."
        aside={<Button type="button" onClick={() => setShowQueryModal(true)} variant="primary" size="sm"><span className="mr-1 text-base leading-none">+</span> Submit inquiry</Button>}
      />

      <div className="grid items-start gap-5 xl:grid-cols-[270px_minmax(0,1fr)]">
        <aside className="space-y-5 rounded-2xl border border-blue-100/10 bg-[#101a37]/75 p-3 sm:p-4">
          <div>
            <p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Quick topics</p>
            <div className="space-y-1">
              {QUICK_TOPICS.map((topic, index) => (
                <button key={topic.label} type="button" onClick={() => { setActiveCategory(topic.category); setSearchQuery(''); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${activeCategory === topic.category ? 'bg-blue-400/12 text-sky-100 ring-1 ring-blue-300/20' : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'}`}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-base">{topic.icon}</span>
                  <span className="min-w-0 flex-1 text-[11px] font-semibold">{topic.label}</span>
                  <span className="text-[9px] font-mono text-slate-600">0{index + 1}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-blue-100/10 pt-4">
            <p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Browse by department</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)} aria-pressed={activeCategory === cat.id}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition ${activeCategory === cat.id ? 'border-blue-200/20 bg-blue-400/12 text-sky-100' : 'border-blue-100/10 bg-[#0a1430]/60 text-slate-500 hover:text-slate-200'}`}>
                  <span>{cat.icon}</span>{cat.label}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search answers..." className="py-2 pl-9 text-xs" />
          </div>
        </aside>

        <section className="min-w-0 space-y-3">
          <div className="flex items-end justify-between border-b border-blue-100/10 pb-3"><div><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Knowledge base</p><p className="mt-1 text-sm font-semibold text-slate-100">{filteredFaqs.length} answers in {CATEGORIES.find((cat) => cat.id === activeCategory)?.label}</p></div><span className="text-[10px] text-slate-500">Official campus guidance</span></div>
          {filteredFaqs.length === 0 ? (
          <EmptyState
            title="No matching FAQs"
            description="Try a different category or search keyword."
            action={
              <button
                type="button"
                onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                className="text-xs font-semibold text-slate-800 underline underline-offset-2 cursor-pointer"
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="group rounded-2xl border border-blue-100/10 bg-[#101a37]/75 p-5 transition hover:border-blue-200/25"
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <h3 className="text-sm font-semibold text-slate-100 leading-snug">
                    {faq.question}
                  </h3>
                  <Badge variant="neutral" size="sm">
                    {faq.category.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                {faq.tags && faq.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-blue-100/10">
                    {faq.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] text-slate-500 bg-white/[0.035] px-1.5 py-0.5 rounded border border-blue-100/10"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        </section>
      </div>

      {/* ── Recent Tickets ─────────────────────────────────── */}
      <div className="pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent Inquiries</h2>
            <p className="text-xs text-slate-500 mt-0.5">Community questions reviewed by the administration office.</p>
          </div>
          <Badge variant="default" size="sm">{queries.length} Tickets</Badge>
        </div>

        <div className="space-y-3">
          {queries.map((q) => (
            <div
              key={q.id}
              className="bg-white border border-slate-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900">{q.title}</span>
                  <Badge variant="neutral" size="sm">
                    {q.category.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <Badge variant={q.status === 'answered' ? 'success' : 'warning'} size="sm">
                  {q.status === 'answered' ? '✓ Answered' : '⏳ In Review'}
                </Badge>
              </div>

              <p className="text-xs text-slate-600 mb-2">{q.content}</p>

              {q.answer && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800">
                  <p className="font-medium text-slate-900 mb-0.5 text-[11px] flex items-center gap-1">
                    <span className="text-emerald-600">●</span> Resolution:
                  </p>
                  {q.answer}
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-100">
                <span>Submitted by: {q.created_by === 'guest' ? 'Student / Guest' : 'Verified Student'}</span>
                <span>{new Date(q.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Submit Inquiry Modal ───────────────────────────── */}
      {showQueryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Submit a Helpdesk Inquiry</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Your inquiry will be reviewed by the Student Affairs office.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowQueryModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer p-1 rounded hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {submitFeedback && (
              <div
                className={`mb-4 p-3 rounded-lg text-xs font-medium ${
                  submitFeedback.ok
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {submitFeedback.msg}
              </div>
            )}

            <form onSubmit={handleQuerySubmit} className="space-y-4">
              <Input
                name="title"
                label="Subject / Topic"
                placeholder="e.g. Shuttle bus departure time for Annex hostel"
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">Category</label>
                <select
                  name="category"
                  defaultValue="bus_schedule"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/40 cursor-pointer"
                >
                  <option value="bus_schedule">Bus Schedule & Transit</option>
                  <option value="exam_logistics">Exam Logistics & Venues</option>
                  <option value="campus_rules">Campus Rules & Handbook</option>
                  <option value="facilities">Facilities, Lab & WiFi</option>
                  <option value="academic">Academic Affairs & Add/Drop</option>
                  <option value="general">General Inquiry</option>
                </select>
              </div>

              <Textarea
                name="content"
                label="Details"
                placeholder="Describe your question or required information..."
                rows={4}
                required
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQueryModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                  Submit Inquiry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
