'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, CalendarDays, CircleHelp, LayoutDashboard, Search, GraduationCap } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', shortLabel: 'Home', icon: LayoutDashboard },
  { href: '/clubs', alias: '/dashboard/clubs', label: 'Clubs & Events', shortLabel: 'Clubs', icon: CalendarDays },
  { href: '/resources', alias: '/dashboard/resources', label: 'Resource Hub', shortLabel: 'Resources', icon: BookOpen },
  { href: '/helpdesk', alias: '/dashboard/helpdesk', label: 'Smart Helpdesk', shortLabel: 'Helpdesk', icon: CircleHelp },
  { href: '/lost-found', alias: '/dashboard/lost-found', label: 'Lost & Found / Box', shortLabel: 'Lost & Found', icon: Search },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[#e3e8df] bg-white px-1 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-2 shadow-[0_-4px_18px_rgba(33,48,38,.07)] lg:sticky lg:top-0 lg:col-start-1 lg:row-start-1 lg:flex lg:h-screen lg:min-h-[560px] lg:flex-col lg:overflow-y-auto lg:border-r lg:border-t-0 lg:px-4 lg:py-6 lg:shadow-none">
      <Link href="/dashboard" className="mb-8 hidden items-center gap-3 px-2 lg:flex" aria-label="CampusOS Home">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#792c3b] text-xs font-black text-white">CU</span>
        <span><span className="block text-sm font-extrabold tracking-tight text-[#252b27]">CampusOS</span><span className="mt-0.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#78847a]"><GraduationCap size={11} /> City University</span></span>
      </Link>
      <p className="mb-2 hidden px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-[#9aa39b] lg:block">Your campus</p>
      {NAV_ITEMS.map(({ href, alias, label, shortLabel, icon: Icon }) => {
        const active = pathname === href || pathname === alias || (href !== '/dashboard' && pathname.startsWith(href)) || Boolean(alias && pathname.startsWith(alias));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            aria-label={label}
            className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-1 text-[9px] font-semibold transition-colors lg:mb-1 lg:min-h-11 lg:flex-row lg:shrink-0 lg:gap-3 lg:rounded-xl lg:px-3 lg:py-3 lg:text-xs ${active ? 'bg-[#f5e9eb] text-[#792c3b] lg:font-bold' : 'text-[#778178] hover:bg-[#f4f6f1] hover:text-[#252b27]'}`}
          >
            <span className={`flex h-7 w-9 items-center justify-center rounded-lg lg:h-5 lg:w-5 ${active ? 'bg-[#f5e9eb] text-[#792c3b] ring-1 ring-[#ead3d8] lg:bg-transparent lg:ring-0' : ''}`}>
              <Icon size={17} strokeWidth={1.8} />
            </span>
            <span className="max-w-full truncate lg:hidden">{shortLabel}</span>
            <span className="hidden lg:block">{label}</span>
          </Link>
        );
      })}
      <div className="mt-auto hidden rounded-2xl border border-[#ead3d8] bg-[#fdf8f8] p-4 lg:mt-6 lg:block"><p className="text-xs font-bold text-[#792c3b]">Made for campus life</p><p className="mt-1 text-[10px] leading-relaxed text-[#62585a]">Find your people, stay on top of events, and get help when you need it.</p></div>
    </nav>
  );
}
