'use client';

import React, { useState } from 'react';
import type { Club, ClubActivity, EventWithClub, SessionUser } from '@/types';
import { EventCard } from '@/components/modules/EventCard';
import { ClubActivitiesFeed } from '@/components/modules/ClubActivitiesFeed';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';

interface ClubsClientPageProps {
  clubs: Club[];
  events: EventWithClub[];
  activities: ClubActivity[];
  user?: SessionUser | null;
}

export function ClubsClientPage({
  clubs,
  events,
  activities,
  user,
}: ClubsClientPageProps) {
  const [activeTab, setActiveTab] = useState<'events' | 'clubs' | 'activities'>('events');
  const [eventFilter, setEventFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredEvents = events.filter((e) => {
    const statusNorm = (e.status || 'upcoming').toLowerCase();
    const filterNorm = eventFilter.toLowerCase();
    const matchesStatus = filterNorm === 'all' || statusNorm === filterNorm;

    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      e.title.toLowerCase().includes(q) ||
      (e.description ?? '').toLowerCase().includes(q) ||
      (e.location ?? '').toLowerCase().includes(q) ||
      (e.clubs?.name ?? '').toLowerCase().includes(q);

    // Selected club filter (with robust fallback matching for Gym & student societies)
    const matchesClub =
      !selectedClubId ||
      e.club_id === selectedClubId ||
      e.clubs?.id === selectedClubId ||
      (selectedClubId === 'club-gym' && (
        (e.location ?? '').toLowerCase().includes('gym') ||
        (e.title ?? '').toLowerCase().includes('gym') ||
        (e.title ?? '').toLowerCase().includes('basketball') ||
        (e.title ?? '').toLowerCase().includes('fitness') ||
        (e.clubs?.name ?? '').toLowerCase().includes('gym')
      )) ||
      (e.clubs?.name &&
        clubs.find((c) => c.id === selectedClubId)?.name &&
        e.clubs.name.toLowerCase().includes(
          clubs.find((c) => c.id === selectedClubId)!.name.toLowerCase().substring(0, 8)
        ));

    // Category filter
    const matchesCategory =
      !selectedCategory ||
      (selectedCategory === 'Sports & Gym' && (
        (e.location ?? '').toLowerCase().includes('gym') ||
        (e.location ?? '').toLowerCase().includes('stadium') ||
        (e.title ?? '').toLowerCase().includes('basketball') ||
        (e.title ?? '').toLowerCase().includes('fitness') ||
        (e.clubs?.name ?? '').toLowerCase().includes('gym') ||
        (e.clubs?.name ?? '').toLowerCase().includes('sport')
      )) ||
      (selectedCategory === 'Technology' && (
        (e.title ?? '').toLowerCase().includes('hackathon') ||
        (e.title ?? '').toLowerCase().includes('bootcamp') ||
        (e.title ?? '').toLowerCase().includes('programming') ||
        (e.title ?? '').toLowerCase().includes('ctf') ||
        (e.title ?? '').toLowerCase().includes('code')
      )) ||
      (selectedCategory === 'Arts & Culture' && (
        (e.title ?? '').toLowerCase().includes('photo') ||
        (e.title ?? '').toLowerCase().includes('art') ||
        (e.title ?? '').toLowerCase().includes('monologue')
      )) ||
      (selectedCategory === 'Academic' && (
        (e.title ?? '').toLowerCase().includes('debate')
      ));

    return matchesStatus && matchesSearch && matchesClub && matchesCategory;
  });

  const filteredClubs = clubs.filter((c) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.description ?? '').toLowerCase().includes(q) ||
      (c.category ?? '').toLowerCase().includes(q)
    );
  });

  const activeClubObj = selectedClubId ? clubs.find((c) => c.id === selectedClubId) : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── Page Header ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Club & Event Engine
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Explore verified student societies, register for campus hackathons, gym tournaments, and generate instant passes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="default" size="sm">
            {events.length} Campus Events
          </Badge>
          <Badge variant="info" size="sm">
            {clubs.length} Societies & Gym
          </Badge>
        </div>
      </div>

      {/* ── Tabs Navigation ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs
          activeTab={activeTab}
          onChange={(t) => setActiveTab(t as 'events' | 'clubs' | 'activities')}
          tabs={[
            { id: 'events', label: 'Events & Registration', count: events.length },
            { id: 'clubs', label: 'Student Societies Directory', count: clubs.length },
            { id: 'activities', label: 'Club Updates & Feed', count: activities.length },
          ]}
        />

        <div className="w-full sm:w-72">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events, gym, venues, clubs..."
            className="py-1.5 text-xs"
          />
        </div>
      </div>

      {/* ════════ TAB 1: EVENTS ═════════════════════════════ */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {/* Active Club or Category Banner */}
          {(selectedClubId || selectedCategory) && (
            <div className="flex items-center justify-between p-3 bg-slate-900 text-white rounded-xl shadow-xs text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Filtering events for:</span>
                <span className="font-semibold text-white">
                  {activeClubObj ? activeClubObj.name : selectedCategory}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  ({filteredEvents.length} records found)
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedClubId(null);
                  setSelectedCategory(null);
                  setEventFilter('all');
                }}
                className="px-2.5 py-1 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded text-white cursor-pointer transition-colors"
              >
                Clear Filter ✕
              </button>
            </div>
          )}

          {/* Filter Controls Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
            {/* Status Tabs with Live Counts */}
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'upcoming', 'ongoing', 'completed'] as const).map((s) => {
                const count =
                  s === 'all'
                    ? events.length
                    : events.filter((e) => (e.status || 'upcoming').toLowerCase() === s).length;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setEventFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-colors border flex items-center gap-1.5 ${
                      eventFilter === s
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span>{s === 'all' ? 'All Events' : s}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        eventFilter === s ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Filter Tag Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="text-[11px] text-slate-400 font-medium">Topic:</span>
              {[
                { label: '🏋️ Gym & Sports', category: 'Sports & Gym' },
                { label: '💻 Hackathons & Tech', category: 'Technology' },
                { label: '📸 Arts & Culture', category: 'Arts & Culture' },
                { label: '🎓 Debates', category: 'Academic' },
              ].map((tag) => (
                <button
                  key={tag.category}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(selectedCategory === tag.category ? null : tag.category);
                    setSelectedClubId(null);
                    setEventFilter('all');
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                    selectedCategory === tag.category
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                showRsvp={true}
                isGuest={Boolean(user?.isGuest)}
              />
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <EmptyState
              title="No events found"
              description="No events match your current filter or search criteria. Try switching to 'All Events' or clearing filters."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setEventFilter('all');
                    setSelectedClubId(null);
                    setSelectedCategory(null);
                    setSearch('');
                  }}
                  className="text-xs font-semibold text-slate-800 underline underline-offset-2 cursor-pointer"
                >
                  Show All Campus Events
                </button>
              }
            />
          )}
        </div>
      )}

      {/* ════════ TAB 2: CLUBS ══════════════════════════════ */}
      {activeTab === 'clubs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClubs.map((club) => (
              <div
                key={club.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="neutral" size="sm">
                      {club.category || 'Society'}
                    </Badge>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {club.member_count ?? 150} members
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-900 text-sm mb-1.5">
                    {club.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">
                    {club.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate">{club.lead_name ?? 'Executive Council'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClubId(club.id);
                      setSelectedCategory(null);
                      setEventFilter('all');
                      setSearch('');
                      setActiveTab('events');
                    }}
                    className="text-xs font-semibold text-slate-900 hover:text-blue-600 underline underline-offset-2 cursor-pointer shrink-0"
                  >
                    View Events →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredClubs.length === 0 && (
            <EmptyState
              title="No clubs found"
              description="No student clubs match your search keywords."
              action={
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-xs font-semibold text-slate-800 underline underline-offset-2 cursor-pointer"
                >
                  Clear search
                </button>
              }
            />
          )}
        </div>
      )}

      {/* ════════ TAB 3: ACTIVITIES ═════════════════════════ */}
      {activeTab === 'activities' && (
        <div className="space-y-4">
          <ClubActivitiesFeed activities={activities} />
        </div>
      )}
    </div>
  );
}
