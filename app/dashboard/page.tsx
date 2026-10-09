import type { Metadata } from 'next';
import Link from 'next/link';
import { getSessionUser } from '@/lib/actions/auth.actions';
import { getEvents } from '@/lib/actions/events.actions';
import { getResources } from '@/lib/actions/resources.actions';
import { getHelpdeskQueries } from '@/lib/actions/helpdesk.actions';
import { getLostFoundItems } from '@/lib/actions/lost-found.actions';
import { EventCard } from '@/components/modules/EventCard';
import { ResourceRow } from '@/components/modules/ResourceRow';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, ArrowUpRight, BookOpen, CircleHelp, Search, Users, PartyPopper, CalendarDays, Clock3, FileText, GraduationCap, MapPin } from 'lucide-react';

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
  const displayName = user?.profile?.full_name?.split(' ')[0] ?? (user?.isGuest ? 'campus explorer' : 'Student');

  const campusLinks = [
    { href: '/clubs', title: 'Events', icon: CalendarDays },
    { href: '/resources', title: 'Resources', icon: FileText },
    { href: '/helpdesk', title: 'Helpdesk', icon: CircleHelp },
    { href: '/clubs', title: 'Clubs', icon: Users },
    { href: '/lost-found', title: 'Lost & found', icon: Search },
    { href: '/resources', title: 'Courses', icon: GraduationCap },
    { href: '/lost-found', title: 'Campus map', icon: MapPin },
    { href: '/resources', title: 'Library', icon: BookOpen },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-7 pb-4">
      <section className="relative isolate flex min-h-[255px] items-end overflow-hidden rounded-xl bg-[#321c20] px-6 py-7 sm:min-h-[300px] sm:px-9 sm:py-9 lg:min-h-[325px] lg:px-12">
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(30,9,15,.94)_0%,rgba(49,15,24,.86)_54%,rgba(49,15,24,.57)_100%),url('/images/campus-hero.svg')] bg-cover bg-center" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-3/4 bg-gradient-to-t from-[#210d12]/60 via-[#210d12]/20 to-transparent" />
        <div className="max-w-3xl rounded-lg border border-white/15 bg-[#2b1018]/35 p-4 text-white shadow-lg backdrop-blur-[2px] sm:p-5">
          <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] !text-white"><PartyPopper size={13} /> City University · Student portal</div>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight !text-white sm:text-4xl">Welcome, {displayName}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed !text-white sm:text-base">Find your next campus event, pick up a study resource, or get help with the little things that make student life easier.</p>
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Link href="/clubs" className="inline-flex items-center gap-2 rounded-md bg-[#a51f37] px-4 py-2.5 text-xs font-bold !text-white shadow-sm transition hover:bg-[#8d1a2f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#521e29]">See what’s happening <ArrowUpRight size={14} /></Link>
            {user?.isGuest && <span className="rounded-md border border-white/30 bg-white/10 px-3 py-2 text-[10px] font-semibold text-white">Previewing as guest</span>}
          </div>
        </div>
        <div className="absolute right-8 top-7 hidden rounded-md border border-white/35 bg-[#2b1018]/75 px-3 py-2 text-right text-white shadow-sm backdrop-blur-sm md:block"><p className="text-[9px] font-semibold uppercase tracking-wider !text-white">Your campus</p><p className="mt-0.5 text-xs font-semibold !text-white">Community · Learning · Support</p></div>
      </section>

      <section aria-label="Campus overview" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Campus events', value: events.length, detail: 'See what’s coming up', icon: CalendarDays, href: '/clubs' },
          { label: 'Upcoming', value: events.filter((event) => event.status === 'upcoming').length, detail: 'Save your place', icon: Clock3, href: '/clubs' },
          { label: 'Study resources', value: resources.length, detail: 'Notes, guides and more', icon: BookOpen, href: '/resources' },
          { label: 'Student societies', value: 6, detail: 'Find your community', icon: Users, href: '/clubs' },
        ].map(({ label, value, detail, icon: Icon, href }) => (
          <Link key={label} href={href} className="group flex min-h-[94px] items-center gap-3 rounded-lg border border-[#e7e1e0] bg-white p-3.5 transition hover:border-[#d4b9bd] hover:shadow-sm sm:p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f7ecee] text-[#8f263a]"><Icon size={18} /></span>
            <span className="min-w-0 flex-1"><span className="block text-[10px] font-semibold uppercase tracking-wide text-[#62585a]">{label}</span><span className="mt-0.5 block text-xl font-bold leading-none text-[#292425]">{value}</span><span className="mt-1 hidden truncate text-[9px] text-[#62585a] sm:block">{detail}</span></span>
            <ArrowRight size={13} className="shrink-0 text-[#716567] group-hover:text-[#8f263a]" />
          </Link>
        ))}
      </section>

      <section aria-label="Campus resources" className="grid gap-5 rounded-xl border border-[#e7e1e0] bg-white p-4 sm:p-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(250px,.8fr)] lg:gap-8">
        <div>
          <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold text-[#292425]">Campus shortcuts</h2><span className="text-[10px] text-[#62585a]">Quick access</span></div>
          <div className="grid grid-cols-4 gap-x-2 gap-y-3 sm:gap-x-4">
            {campusLinks.map(({ href, title, icon: Icon }, index) => (
              <Link key={`${title}-${index}`} href={href} className="group flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-lg px-1.5 py-2 text-center transition hover:bg-[#fbf5f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#792c3b]/30">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#eadcde] bg-[#fbf5f5] text-[#8f263a] transition group-hover:border-[#d7b6bc] group-hover:bg-[#f5e9eb]"><Icon size={19} strokeWidth={1.8} /></span>
                <span className="text-[10px] font-medium leading-tight text-[#51484a] group-hover:text-[#792c3b]">{title}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="border-t border-[#eee8e7] pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold text-[#292425]">Popular resources</h2><Link href="/resources" className="text-[10px] font-semibold text-[#792c3b] hover:underline">View all</Link></div>
          <div className="space-y-2">
            {recentResources.slice(0, 3).map((resource) => <Link key={resource.id} href="/resources" className="block rounded-md border border-[#eee8e7] bg-[#fcfbfa] px-3 py-2 transition hover:border-[#d7b6bc] hover:bg-[#fbf5f5]"><span className="block truncate text-[11px] font-semibold text-[#332c2d]">{resource.title}</span><span className="mt-1 block truncate text-[9px] text-[#62585a]">{resource.course_code ?? resource.department ?? 'Campus resource'} · {resource.year}</span></Link>)}
          </div>
        </div>
      </section>

      <section className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,.8fr)]">
        <div className="min-w-0 space-y-4">
          <div className="flex items-end justify-between gap-3 border-b border-blue-100/10 pb-3">
            <div><p className="eyebrow">Meet, learn, take part</p><h2 className="mt-1 text-xl font-bold tracking-tight">Coming up on campus</h2></div>
            <Link href="/clubs" className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-[#792c3b] hover:text-[#612331]">All events <ArrowRight size={13} /></Link>
          </div>
          {featuredEvents.length === 0 ? <div className="rounded-2xl border border-blue-100/10 bg-[#101a37]/70 p-8 text-center text-xs text-slate-400">No events at this moment.</div> : <div className="grid gap-3 md:grid-cols-2">{featuredEvents.map((event) => <EventCard key={event.id} event={event} showRsvp={true} isGuest={Boolean(user?.isGuest)} />)}</div>}
        </div>

        <div className="min-w-0 space-y-4">
          <div className="flex items-end justify-between gap-3 border-b border-blue-100/10 pb-3">
            <div><p className="eyebrow">For your next study session</p><h2 className="mt-1 text-xl font-bold tracking-tight">New study resources</h2></div>
            <Link href="/resources" className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-[#792c3b] hover:text-[#612331]">Open hub <ArrowRight size={13} /></Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#e3e8df] bg-white divide-y divide-[#edf0eb]">
            {recentResources.map((resource) => <ResourceRow key={resource.id} resource={resource} />)}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#e3e8df] bg-white p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between border-b border-blue-100/10 pb-3"><div><p className="eyebrow">Student support</p><h2 className="mt-1 text-sm font-semibold">Recent helpdesk tickets</h2></div><Link href="/helpdesk" className="text-[10px] font-semibold text-[#792c3b] hover:underline">View all →</Link></div>
          <div className="space-y-2">{recentQueries.map((q) => <div key={q.id} className="rounded-xl border border-[#e7e1e0] bg-[#fcfbfa] p-3"><div className="flex items-center justify-between gap-2"><span className="truncate text-xs font-semibold text-[#292425]">{q.title}</span><Badge variant={q.status === 'answered' ? 'success' : 'warning'} size="sm">{q.status}</Badge></div><p className="mt-1 text-[10px] leading-relaxed text-[#5f5556] line-clamp-2">{q.content}</p></div>)}</div>
        </div>
        <div className="rounded-2xl border border-[#e3e8df] bg-white p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between border-b border-blue-100/10 pb-3"><div><p className="eyebrow">Community board</p><h2 className="mt-1 text-sm font-semibold">Lost & found feed</h2></div><Link href="/lost-found" className="text-[10px] font-semibold text-[#792c3b] hover:underline">View all →</Link></div>
          <div className="space-y-2">{recentLostFound.map((item) => <div key={item.id} className="rounded-xl border border-[#e7e1e0] bg-[#fcfbfa] p-3"><div className="flex items-center gap-2"><Badge variant={item.item_type === 'found' ? 'info' : 'warning'} size="sm">{item.item_type.toUpperCase()}</Badge><span className="min-w-0 flex-1 truncate text-xs font-semibold text-[#292425]">{item.title}</span></div><p className="mt-1 text-[10px] text-[#5f5556] line-clamp-1">{item.location} · {item.description}</p></div>)}</div>
        </div>
      </section>
    </div>
  );
}
