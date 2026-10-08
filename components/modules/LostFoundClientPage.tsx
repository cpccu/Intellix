'use client';

import React, { useMemo, useState, useTransition } from 'react';
import type {
  ComplaintItem,
  LostFoundCategory,
  LostFoundItem,
  LostFoundType,
} from '@/types';
import {
  claimItem,
  reportLostFoundItem,
  submitComplaint,
  trackComplaint,
} from '@/lib/actions/lost-found.actions';
import { createDemoId, readDemoRecords, useDemoRecords, writeDemoRecords } from '@/lib/demo-storage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';

interface LostFoundClientPageProps {
  initialItems: LostFoundItem[];
  initialComplaints: ComplaintItem[];
  isGuest?: boolean;
}

const SAMPLE_TRACKING_CODES = ['CU-CMP-8421', 'CU-CMP-7102', 'CU-CMP-9034'];

export function LostFoundClientPage({
  initialItems,
  initialComplaints,
  isGuest,
}: LostFoundClientPageProps) {
  const [activeTab, setActiveTab] = useState<'lost_found' | 'complaints'>('lost_found');
  const [createdItems, setCreatedItems] = useState<LostFoundItem[]>([]);
  const [createdComplaints, setCreatedComplaints] = useState<ComplaintItem[]>([]);
  const demoItems = useDemoRecords<LostFoundItem>('campusos-demo-lost-found');
  const demoComplaints = useDemoRecords<ComplaintItem>('campusos-demo-complaints');
  const items = useMemo(() => {
    const byId = new Map(initialItems.map((item) => [item.id, item]));
    demoItems.forEach((item) => byId.set(item.id, item));
    createdItems.forEach((item) => byId.set(item.id, item));
    return [...byId.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [createdItems, demoItems, initialItems]);
  const complaints = useMemo(() => {
    const byId = new Map(initialComplaints.map((item) => [item.id, item]));
    demoComplaints.forEach((item) => byId.set(item.id, item));
    createdComplaints.forEach((item) => byId.set(item.id, item));
    return [...byId.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [createdComplaints, demoComplaints, initialComplaints]);

  // Lost & Found filters
  const [typeFilter, setTypeFilter] = useState<'all' | LostFoundType>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | LostFoundCategory>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Modals
  const [showItemModal, setShowItemModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  // Tracking
  const [trackingCode, setTrackingCode] = useState('');
  const [trackedResult, setTrackedResult] = useState<ComplaintItem | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // Transitions
  const [isSubmittingItem, startSubmittingItem] = useTransition();
  const [isSubmittingComplaint, startSubmittingComplaint] = useTransition();
  const [isTracking, startTracking] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  // Filtered Items
  const filteredItems = items.filter((item) => {
    const matchesType = typeFilter === 'all' || item.item_type === typeFilter;
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSearch =
      searchFilter.trim() === '' ||
      item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.location.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesType && matchesCat && matchesSearch;
  });

  const handleItemSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startSubmittingItem(async () => {
      if (isGuest) {
        const now = new Date().toISOString();
        const newItem: LostFoundItem = {
          id: createDemoId('demo-lf'),
          title: String(formData.get('title') ?? ''),
          description: String(formData.get('description') ?? ''),
          category: formData.get('category') as LostFoundCategory,
          item_type: formData.get('item_type') as LostFoundType,
          location: String(formData.get('location') ?? ''),
          contact_info: String(formData.get('contact_info') ?? ''),
          status: 'open',
          image_url: null,
          incident_date: now,
          created_by: 'guest',
          created_at: now,
        };
        const saved = readDemoRecords<LostFoundItem>('campusos-demo-lost-found');
        if (!writeDemoRecords('campusos-demo-lost-found', [newItem, ...saved])) {
          setFeedback({ ok: false, msg: 'This browser could not save demo data. Check local storage settings.' });
          return;
        }
        setFeedback({ ok: true, msg: 'Demo report saved in this browser.' });
        form.reset();
        return;
      }

      const result = await reportLostFoundItem(formData);
      if (!result.success || !result.data) {
        setFeedback({ ok: false, msg: result.error ?? 'Could not save this report.' });
        return;
      }

      setCreatedItems((current) => [result.data!, ...current]);
      setFeedback({ ok: true, msg: 'Item reported and broadcasted to campus network!' });
      form.reset();

      setTimeout(() => {
        setShowItemModal(false);
        setFeedback(null);
      }, 1200);
    });
  };

  const handleComplaintSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startSubmittingComplaint(async () => {
      if (isGuest) {
        const now = new Date().toISOString();
        const tracking_number = `CU-DEMO-${createDemoId('CMP').split('-').at(-1)?.toUpperCase()}`;
        const newComplaint: ComplaintItem = {
          id: createDemoId('demo-cmp'),
          title: String(formData.get('title') ?? ''),
          description: String(formData.get('description') ?? ''),
          category: formData.get('category') as ComplaintItem['category'],
          department: String(formData.get('department') ?? 'Student Affairs & Facilities'),
          status: 'pending',
          tracking_number,
          resolution_notes: null,
          is_anonymous: formData.get('is_anonymous') === 'true',
          created_by: 'guest',
          created_at: now,
        };
        const saved = readDemoRecords<ComplaintItem>('campusos-demo-complaints');
        if (!writeDemoRecords('campusos-demo-complaints', [newComplaint, ...saved])) {
          setFeedback({ ok: false, msg: 'This browser could not save demo data. Check local storage settings.' });
          return;
        }
        setTrackedResult(newComplaint);
        setFeedback({ ok: true, msg: `Demo complaint saved here. Tracking reference: ${tracking_number}` });
        form.reset();
        return;
      }

      const result = await submitComplaint(formData);
      if (!result.success || !result.data) {
        setFeedback({ ok: false, msg: result.error ?? 'Could not save this complaint.' });
        return;
      }

      setCreatedComplaints((current) => [result.data!, ...current]);
      setTrackedResult(result.data);
      setFeedback({
        ok: true,
        msg: `Complaint lodged! Your tracking reference is: ${result.data.tracking_number}`,
      });
      form.reset();

      setTimeout(() => {
        setShowComplaintModal(false);
        setFeedback(null);
      }, 1600);
    });
  };

  const handleClaim = (id: string) => {
    if (isGuest) {
      const next = items.map((item) => (item.id === id ? { ...item, status: 'claimed' as const } : item));
      if (!writeDemoRecords('campusos-demo-lost-found', next)) {
        setFeedback({ ok: false, msg: 'This browser could not save demo data. Check local storage settings.' });
        return;
      }
      setFeedback({ ok: true, msg: 'Demo item status saved in this browser.' });
      return;
    }
    startSubmittingItem(async () => {
      const result = await claimItem(id);
      if (!result.success) {
        setFeedback({ ok: false, msg: result.error ?? 'Could not update this item.' });
        return;
      }
      const claimedItem = items.find((item) => item.id === id);
      if (claimedItem) {
        setCreatedItems((current) => [
          { ...claimedItem, status: 'claimed' },
          ...current.filter((item) => item.id !== id),
        ]);
      }
      setFeedback({ ok: true, msg: 'Item status updated.' });
    });
  };

  const runTrackComplaint = (codeToTrack: string) => {
    const code = codeToTrack.trim().toUpperCase();
    if (!code) return;
    setTrackingCode(code);
    setTrackingError(null);
    setTrackedResult(null);

    startTracking(async () => {
      const localMatch = complaints.find((c) => c.tracking_number.toUpperCase() === code);
      if (localMatch) {
        setTrackedResult(localMatch);
        return;
      }

      try {
        const res = await trackComplaint(code);
        if (res && res.success && res.data) {
          setTrackedResult(res.data);
        } else {
          setTrackingError(`No record found for tracking code "${codeToTrack}".`);
        }
      } catch {
        setTrackingError(`No record found for tracking code "${codeToTrack}".`);
      }
    });
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runTrackComplaint(trackingCode);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── Top Header ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Lost & Found / Complaint Box
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Post and recover misplaced items or file administrative facility and academic complaints.
          </p>
        </div>

        <div className="flex gap-2">
          {activeTab === 'lost_found' ? (
            <Button
              type="button"
              onClick={() => setShowItemModal(true)}
              variant="primary"
              size="sm"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Report Item
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => setShowComplaintModal(true)}
              variant="primary"
              size="sm"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Lodge Complaint
            </Button>
          )}
        </div>
      </div>

      {/* ── Tabs Navigation ───────────────────────────────── */}
      <Tabs
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as 'lost_found' | 'complaints')}
        tabs={[
          { id: 'lost_found', label: 'Lost & Found Feed', count: items.length },
          { id: 'complaints', label: 'Administrative Complaint Box', count: complaints.length },
        ]}
      />

      {/* ════════ TAB 1: LOST & FOUND ═══════════════════════ */}
      {activeTab === 'lost_found' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
                {(['all', 'lost', 'found'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold capitalize cursor-pointer transition-colors ${
                      typeFilter === t
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t === 'all' ? 'All Items' : t}
                  </button>
                ))}
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as 'all' | LostFoundCategory)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="all">All Categories</option>
                <option value="electronics">Electronics & Gadgets</option>
                <option value="id_cards">Student ID & Cards</option>
                <option value="books_notes">Books & Notebooks</option>
                <option value="keys">Keys & Lanyards</option>
                <option value="clothing">Clothing & Gear</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="w-full md:w-64">
              <Input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search items, locations..."
                className="py-1.5 text-xs"
              />
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const isFound = item.item_type === 'found';
              const isClaimed = item.status === 'claimed';

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant={isFound ? 'info' : 'warning'} size="sm">
                        {isFound ? '🔍 FOUND' : '⚠️ LOST'}
                      </Badge>
                      <Badge variant={isClaimed ? 'success' : 'outline'} size="sm">
                        {isClaimed ? '✓ Claimed' : 'Open'}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 mb-3 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">📍 Location:</span>
                      <span className="font-medium text-slate-700">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">📞 Contact:</span>
                      <span className="font-medium text-slate-700 truncate">{item.contact_info}</span>
                    </div>

                    {!isClaimed && (
                      <div className="pt-2">
                        <Button
                          type="button"
                          onClick={() => handleClaim(item.id)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          Mark as Claimed / Recovered
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <EmptyState
              title="No items found"
              description="No lost or found items match your current filter criteria."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('all');
                    setCategoryFilter('all');
                    setSearchFilter('');
                  }}
                  className="text-xs font-semibold text-slate-800 underline underline-offset-2 cursor-pointer"
                >
                  Reset all filters
                </button>
              }
            />
          )}
        </div>
      )}

      {/* ════════ TAB 2: COMPLAINT BOX ══════════════════════ */}
      {activeTab === 'complaints' && (
        <div className="space-y-6">
          {/* Tracking Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Track an Existing Complaint Status
            </h3>
            <p className="text-xs text-slate-500 mb-2">
              Enter your tracking reference number or click a sample code below:
            </p>

            {/* Sample reference chips */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              <span className="text-[11px] text-slate-400">Quick Test:</span>
              {SAMPLE_TRACKING_CODES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => runTrackComplaint(code)}
                  className="font-mono text-[11px] bg-white border border-slate-300 hover:border-slate-400 text-slate-700 px-2 py-0.5 rounded cursor-pointer transition-colors"
                >
                  {code}
                </button>
              ))}
            </div>

            <form onSubmit={handleTrackSubmit} className="flex gap-2 max-w-md">
              <Input
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="e.g. CU-CMP-8421"
                className="text-xs"
              />
              <Button type="submit" variant="primary" size="sm" isLoading={isTracking}>
                Track
              </Button>
            </form>

            {trackingError && (
              <p className="text-xs text-red-600 mt-2">{trackingError}</p>
            )}

            {trackedResult && (
              <div className="mt-4 p-4 rounded-lg bg-white border border-slate-200 text-xs space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 text-sm">
                    {trackedResult.title}
                  </span>
                  <Badge
                    variant={
                      trackedResult.status === 'resolved'
                        ? 'success'
                        : trackedResult.status === 'in_investigation'
                        ? 'info'
                        : 'warning'
                    }
                  >
                    {trackedResult.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <p className="text-slate-600">{trackedResult.description}</p>
                <div className="text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>Department: {trackedResult.department}</span>
                  <span className="font-mono">Ref: {trackedResult.tracking_number}</span>
                </div>
                {trackedResult.resolution_notes && (
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-800">
                    <span className="font-medium text-slate-900">Administrative Update: </span>
                    {trackedResult.resolution_notes}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Complaints Feed */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Official Campus Complaints & Incident Log
              </h3>
              <Badge variant="neutral">{complaints.length} Total Logs</Badge>
            </div>

            <div className="space-y-3">
              {complaints.map((c) => (
                <div
                  key={c.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{c.title}</span>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                        {c.tracking_number}
                      </span>
                    </div>

                    <Badge
                      variant={
                        c.status === 'resolved'
                          ? 'success'
                          : c.status === 'in_investigation'
                          ? 'info'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {c.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{c.description}</p>

                  {c.resolution_notes && (
                    <div className="bg-slate-50/80 rounded-lg p-3 text-xs border border-slate-200/80 text-slate-700">
                      <p className="font-medium text-slate-900 text-[11px] mb-0.5">
                        Officer Resolution Note:
                      </p>
                      {c.resolution_notes}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <span>
                      {c.is_anonymous ? 'Anonymous Student' : 'Verified Student'} · Dept: {c.department}
                    </span>
                    <span>{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Report Lost/Found Modal ───────────────────────── */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm">Report Lost or Found Item</h3>
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {feedback && (
              <div
                className={`mb-4 p-3 rounded-lg text-xs font-medium ${
                  feedback.ok
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {feedback.msg}
              </div>
            )}

            <form onSubmit={handleItemSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700">Item Status</label>
                  <select
                    name="item_type"
                    defaultValue="found"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
                  >
                    <option value="found">I Found Something</option>
                    <option value="lost">I Lost Something</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700">Category</label>
                  <select
                    name="category"
                    defaultValue="electronics"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
                  >
                    <option value="electronics">Electronics & Gadgets</option>
                    <option value="id_cards">Student ID & Cards</option>
                    <option value="books_notes">Books & Notebooks</option>
                    <option value="keys">Keys & Lanyards</option>
                    <option value="clothing">Clothing & Gear</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <Input
                name="title"
                label="Item Name / Title"
                placeholder="e.g. Blue Casio Scientific Calculator"
                required
              />

              <Input
                name="location"
                label="Location (Where lost or found)"
                placeholder="e.g. Computing Lab A, Desk 12"
                required
              />

              <Input
                name="contact_info"
                label="Contact Info / Collection Post"
                placeholder="e.g. Security Post 2 / 08012345678"
                required
              />

              <Textarea
                name="description"
                label="Detailed Description"
                placeholder="Distinctive marks, stickers, color, model details..."
                rows={3}
                required
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowItemModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingItem}>
                  Post Item
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── File Complaint Modal ──────────────────────────── */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm">
                Lodge Administrative / Facility Complaint
              </h3>
              <button
                type="button"
                onClick={() => setShowComplaintModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {feedback && (
              <div
                className={`mb-4 p-3 rounded-lg text-xs font-medium ${
                  feedback.ok
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {feedback.msg}
              </div>
            )}

            <form onSubmit={handleComplaintSubmit} className="space-y-4">
              <Input
                name="title"
                label="Complaint Summary"
                placeholder="e.g. Projector failure in Lecture Theatre 2"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700">Category</label>
                  <select
                    name="category"
                    defaultValue="facility"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
                  >
                    <option value="facility">Facility & Infrastructure</option>
                    <option value="academic">Academic & Lecture Venues</option>
                    <option value="hostel">Hostel & Accommodation</option>
                    <option value="administrative">Administrative Affairs</option>
                    <option value="security">Campus Security</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <Input
                  name="department"
                  label="Department / Area"
                  placeholder="e.g. Works Planning / ICT"
                />
              </div>

              <Textarea
                name="description"
                label="Detailed Complaint Description"
                placeholder="State the location, duration, and severity of the issue..."
                rows={4}
                required
              />

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <input
                  type="checkbox"
                  id="is_anonymous"
                  name="is_anonymous"
                  value="true"
                  className="rounded text-slate-900 focus:ring-slate-400 cursor-pointer"
                />
                <label htmlFor="is_anonymous" className="text-xs text-slate-700 cursor-pointer">
                  Submit anonymously (Hides your identity from campus staff)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComplaintModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingComplaint}>
                  Lodge Complaint
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
