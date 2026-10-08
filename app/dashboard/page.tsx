import type { Metadata } from 'next';
import Link from 'next/link';
import { getSessionUser } from '@/lib/actions/auth.actions';
import { getEvents } from '@/lib/actions/events.actions';
import { getResources } from '@/lib/actions/resources.actions';
import { getHelpdeskQueries } from '@/lib/actions/helpdesk.actions';
import { getLostFoundItems } from '@/lib/actions/lost-found.actions';
import { StatCard } from '@/components/modules/StatCard';
import { EventCard } from '@/components/modules/EventCard';
import { ResourceRow } from '@/components/modules/ResourceRow';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = { title: 'CampusOS · Dashboard Overview' };
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [
    user,
    eventsResult,
    resourcesResult,
    helpdeskResult,
    lostFoundResult,
  ] = await Promise.all([
    getSessionUser(),
    getEvents(),
    getResources(),
    getHelpdeskQueries(),
    getLostFoundItems(),
  ]);

  const events = eventsResult.data ?? [];
  const resources = resourcesResult.data ?? [];
  const queries = helpdeskResult.data ?? [];
  const lostFound = lostFoundResult.data ?? [];

  const featuredEvents = events
    .filter((e) => e.status === 'upcoming' || e.status === 'ongoing')
    .slice(0, 4);
  const recentResources = resources.slice(0, 4);
  const recentQueries = queries.slice(0, 3);
  const recentLostFound = lostFound.slice(0, 3);

  const displayName =
    user?.profile?.full_name?.split(' ')[0] ??
    (user?.isGuest ? 'Guest Judge' : 'Student');

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* ── Greeting & Welcome Header ────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Good day, {displayName} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            City University centralized campus operations and academic hub.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.isGuest && (
            <Badge variant="warning" size="md">
              ⚡ Guest Mode (Evaluation)
            </Badge>
          )}
          <span className="text-xs text-slate-400 font-mono">
            Semester 1 · 2025/2026
          </span>
        </div>
      </div>

      {/* ── 4 Module Metric Overview ──────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active & Upcoming Events"
          value={events.filter((e) => e.status === 'upcoming' || e.status === 'ongoing').length}
        />
        <StatCard label="Study Resources & PQs" value={resources.length} />
        <StatCard label="Helpdesk Knowledge Base" value={8} />
        <StatCard
          label="Active Lost & Found Items"
          value={lostFound.filter((i) => i.status === 'open').length}
        />
      </div>

      {/* ── Quick Action Module Shortcuts ─────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/clubs"
          className="flex flex-col p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all group"
        >
          <span className="text-xl mb-1.5">👥</span>
          <span className="font-semibold text-xs text-slate-900 group-hover:text-slate-700">
            Clubs & Events
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">8 active societies</span>
        </Link>

        <Link
          href="/resources"
          className="flex flex-col p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all group"
        >
          <span className="text-xl mb-1.5">📚</span>
          <span className="font-semibold text-xs text-slate-900 group-hover:text-slate-700">
            Resource Hub
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">Notes & past questions</span>
        </Link>

        <Link
          href="/helpdesk"
          className="flex flex-col p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all group"
        >
          <span className="text-xl mb-1.5">💡</span>
          <span className="font-semibold text-xs text-slate-900 group-hover:text-slate-700">
            Smart Helpdesk
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">Buses, rules, exams</span>
        </Link>

        <Link
          href="/lost-found"
          className="flex flex-col p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all group"
        >
          <span className="text-xl mb-1.5">🔍</span>
          <span className="font-semibold text-xs text-slate-900 group-hover:text-slate-700">
            Lost & Found / Box
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">Claim items & complaints</span>
        </Link>
      </div>

      {/* ── Section 1: Upcoming Events ─────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Featured Campus Events</h2>
            <p className="text-xs text-slate-500">Upcoming hackathons, seminars, and championships.</p>
          </div>
          <Link
            href="/clubs"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
          >
            All Events & Passes →
          </Link>
        </div>

        {featuredEvents.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
            No events at this moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} showRsvp={true} isGuest={Boolean(user?.isGuest)} />
            ))}
          </div>
        )}
      </section>

      {/* ── Section 2: Resource Hub & Academic Notes ───────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Academic Archives</h2>
            <p className="text-xs text-slate-500">Verified lecture notes, timetables, and past exam questions.</p>
          </div>
          <Link
            href="/resources"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
          >
            Open Resource Hub →
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden shadow-xs">
          {recentResources.map((resource) => (
            <ResourceRow key={resource.id} resource={resource} />
          ))}
        </div>
      </section>

      {/* ── Section 3 & 4: Helpdesk & Lost/Found Side-by-Side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Helpdesk Activity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Smart Helpdesk Tickets</h3>
              <p className="text-[11px] text-slate-400">Recent campus logistics inquiries & auto-responses.</p>
            </div>
            <Link href="/helpdesk" className="text-xs text-slate-500 hover:text-slate-900 font-medium">
              View all →
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentQueries.map((q) => (
              <div key={q.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-slate-900 truncate">{q.title}</span>
                  <Badge variant={q.status === 'answered' ? 'success' : 'warning'} size="sm">
                    {q.status}
                  </Badge>
                </div>
                <p className="text-slate-500 text-[11px] line-clamp-2">{q.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lost & Found Activity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Lost & Found Feed</h3>
              <p className="text-[11px] text-slate-400">Recent misplaced items reported across campus.</p>
            </div>
            <Link href="/lost-found" className="text-xs text-slate-500 hover:text-slate-900 font-medium">
              View all →
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentLostFound.map((item) => (
              <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Badge variant={item.item_type === 'found' ? 'info' : 'warning'} size="sm">
                      {item.item_type.toUpperCase()}
                    </Badge>
                    <span className="font-semibold text-slate-900 truncate">{item.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{item.location}</span>
                </div>
                <p className="text-slate-500 text-[11px] line-clamp-1">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
