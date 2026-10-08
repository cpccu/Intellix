'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, CalendarDays, CircleHelp, LayoutDashboard, Search } from 'lucide-react';

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
    <nav aria-label="Primary navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-blue-200/10 bg-[#080d20]/95 px-1 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-2 backdrop-blur-2xl lg:hidden">
      {NAV_ITEMS.map(({ href, alias, label, shortLabel, icon: Icon }) => {
        const active = pathname === href || pathname === alias || (href !== '/dashboard' && pathname.startsWith(href)) || Boolean(alias && pathname.startsWith(alias));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            aria-label={label}
            className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-1 text-[9px] font-semibold transition-colors ${active ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <span className={`flex h-7 w-9 items-center justify-center rounded-lg ${active ? 'bg-blue-400/15 text-sky-200 ring-1 ring-blue-300/15' : ''}`}>
              <Icon size={16} strokeWidth={1.8} />
            </span>
            <span className="max-w-full truncate">{shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
