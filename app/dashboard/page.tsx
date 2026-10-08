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
import { ArrowRight, ArrowUpRight, BookOpen, CircleHelp, Search, Sparkles, Users } from 'lucide-react';

export const metadata: Metadata = { title: 'CampusOS · Dashboard Overview' };
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [user, eventsResult, resourcesResult, helpdeskResult, lostFoundResult] = await Promise.all([
    getSessionUser(), getEvents(), getResources(), getHelpdeskQueries(), getLostFoundItems(),
  ]);

  const events = eventsResult.data ?? [];
  const resources = resourcesResult.data ?? [];
  const queries = helpdeskResult.data ?? [];
  const lostFound = lostFoundResult.data ?? [];
  const featuredEvents = events.filter((e) => e.status === 'upcoming' || e.status === 'ongoing').slice(0, 4);
  const recentResources = resources.slice(0, 4);
  const recentQueries = queries.slice(0, 3);
  const recentLostFound = lostFound.slice(0, 3);
  const displayName = user?.profile?.full_name?.split(' ')[0] ?? (user?.isGuest ? 'Guest Judge' : 'Student');

  const shortcuts = [
    { href: '/clubs', title: 'Clubs & events', caption: 'Meet your campus', icon: Users, color: 'text-sky-200' },
    { href: '/resources', title: 'Resource hub', caption: 'Notes and past papers', icon: BookOpen, color: 'text-violet-200' },
    { href: '/helpdesk', title: 'Helpdesk', caption: 'Find a quick answer', icon: CircleHelp, color: 'text-blue-200' },
    { href: '/lost-found', title: 'Lost & found', caption: 'Items and reports', icon: Search, color: 'text-indigo-200' },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-7">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
        <div className="astra-observatory relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-[28px] border border-blue-200/15 p-6 sm:p-8">
          <div className="relative z-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200"><Sparkles size={14} /> Campus overview <span className="h-px w-8 bg-sky-200/40" /> 01 / 05</div>
          <div className="relative z-10 mt-8 max-w-2xl">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">Good day, {displayName}<span className="text-sky-300">.</span></h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-blue-100/75">Your campus, seen from one place. Find what is happening, pick up where you left off, and stay connected to City University.</p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Link href="/clubs" className="inline-flex items-center gap-2 rounded-xl bg-blue-100 px-4 py-2.5 text-xs font-bold text-[#0e1b3b] transition hover:bg-white">Explore events <ArrowUpRight size={14} /></Link>
              {user?.isGuest && <Badge variant="warning" size="md">Guest Mode</Badge>}
              <span className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-[10px] text-blue-100/70">Semester 1 · 2025/2026</span>
            </div>
          </div>
          <span className="absolute bottom-5 right-7 z-10 hidden text-[9px] font-semibold uppercase tracking-[0.22em] text-blue-100/40 sm:block">City University · CPCCU</span>
        </div>

        <div className="astra-star-map relative min-h-[260px] overflow-hidden rounded-[28px] border border-blue-200/10 p-5 sm:p-6">
          <div className="relative z-10 flex items-center justify-between">
            <div><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-200/70">Campus signal</p><p className="mt-1 text-sm font-semibold text-white">All systems connected</p></div>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-200/15 bg-emerald-300/10 px-2 py-1 text-[9px] font-semibold text-emerald-100"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /> Live</span>
          </div>
          <div className="orbit-diagram" aria-hidden="true">
            <span className="orbit-core"><Sparkles size={18} /></span>
            <i className="orbit-dot orbit-dot-a" /><i className="orbit-dot orbit-dot-b" /><i className="orbit-dot orbit-dot-c" /><i className="orbit-dot orbit-dot-d" />
          </div>
          <div className="relative z-10 mt-auto grid grid-cols-2 gap-2 pt-36">
            <div className="rounded-xl border border-white/10 bg-[#09142f]/65 px-3 py-2"><p className="text-lg font-semibold text-white">{events.length + resources.length}</p><p className="text-[9px] uppercase tracking-wider text-blue-100/50">Campus updates</p></div>
            <div className="rounded-xl border border-white/10 bg-[#09142f]/65 px-3 py-2"><p className="text-lg font-semibold text-white">{queries.length + lostFound.length}</p><p className="text-[9px] uppercase tracking-wider text-blue-100/50">Community posts</p></div>
          </div>
        </div>
      </section>

      <section aria-label="Campus activity summary" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Active & Upcoming Events" value={events.filter((e) => e.status === 'upcoming' || e.status === 'ongoing').length} tone="peach" />
        <StatCard label="Study Resources & PQs" value={resources.length} tone="blue" />
        <StatCard label="Helpdesk Knowledge Base" value={8} tone="lavender" />
        <StatCard label="Active Lost & Found Items" value={lostFound.filter((i) => i.status === 'open').length} tone="mint" />
      </section>

      <section aria-label="Campus modules" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {shortcuts.map(({ href, title, caption, icon: Icon, color }, index) => (
          <Link key={href} href={href} className="group flex min-w-0 items-center gap-3 rounded-2xl border border-blue-100/10 bg-[#101a37]/75 p-3 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200/30 hover:bg-[#152247] sm:p-4">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] ${color}`}><Icon size={18} /></span>
            <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-100">{title}</span><span className="mt-1 hidden truncate text-[10px] text-slate-500 sm:block">{caption}</span></span>
            <span className="hidden text-[9px] text-slate-600 md:block">0{index + 1}</span>
            <ArrowRight size={13} className="shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-sky-200" />
          </Link>
        ))}
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,.8fr)]">
        <div className="min-w-0 space-y-4">
          <div className="flex items-end justify-between gap-3 border-b border-blue-100/10 pb-3">
            <div><p className="eyebrow">On the horizon</p><h2 className="mt-1 text-lg font-semibold tracking-tight">Featured campus events</h2></div>
            <Link href="/clubs" className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-sky-200 hover:text-white">All events <ArrowRight size={13} /></Link>
          </div>
          {featuredEvents.length === 0 ? <div className="rounded-2xl border border-blue-100/10 bg-[#101a37]/70 p-8 text-center text-xs text-slate-400">No events at this moment.</div> : <div className="grid gap-3 md:grid-cols-2">{featuredEvents.map((event) => <EventCard key={event.id} event={event} showRsvp={true} isGuest={Boolean(user?.isGuest)} />)}</div>}
        </div>

        <div className="min-w-0 space-y-4">
          <div className="flex items-end justify-between gap-3 border-b border-blue-100/10 pb-3">
            <div><p className="eyebrow">Academic archive</p><h2 className="mt-1 text-lg font-semibold tracking-tight">Recently added</h2></div>
            <Link href="/resources" className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-sky-200 hover:text-white">Open hub <ArrowRight size={13} /></Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-blue-100/10 bg-[#101a37]/75 divide-y divide-blue-100/10">
            {recentResources.map((resource) => <ResourceRow key={resource.id} resource={resource} />)}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-blue-100/10 bg-[#101a37]/75 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between border-b border-blue-100/10 pb-3"><div><p className="eyebrow">Student support</p><h2 className="mt-1 text-sm font-semibold">Recent helpdesk tickets</h2></div><Link href="/helpdesk" className="text-[10px] font-semibold text-sky-200">View all →</Link></div>
          <div className="space-y-2">{recentQueries.map((q) => <div key={q.id} className="rounded-xl border border-blue-100/10 bg-[#0a1430]/60 p-3"><div className="flex items-center justify-between gap-2"><span className="truncate text-xs font-semibold text-slate-100">{q.title}</span><Badge variant={q.status === 'answered' ? 'success' : 'warning'} size="sm">{q.status}</Badge></div><p className="mt-1 text-[10px] leading-relaxed text-slate-400 line-clamp-2">{q.content}</p></div>)}</div>
        </div>
        <div className="rounded-2xl border border-blue-100/10 bg-[#101a37]/75 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between border-b border-blue-100/10 pb-3"><div><p className="eyebrow">Community board</p><h2 className="mt-1 text-sm font-semibold">Lost & found feed</h2></div><Link href="/lost-found" className="text-[10px] font-semibold text-sky-200">View all →</Link></div>
          <div className="space-y-2">{recentLostFound.map((item) => <div key={item.id} className="rounded-xl border border-blue-100/10 bg-[#0a1430]/60 p-3"><div className="flex items-center gap-2"><Badge variant={item.item_type === 'found' ? 'info' : 'warning'} size="sm">{item.item_type.toUpperCase()}</Badge><span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-100">{item.title}</span></div><p className="mt-1 text-[10px] text-slate-400 line-clamp-1">{item.location} · {item.description}</p></div>)}</div>
        </div>
      </section>
    </div>
  );
}
