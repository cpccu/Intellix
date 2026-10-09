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
    <nav aria-label="Primary navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[#e3e8df] bg-white px-1 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-2 shadow-[0_-4px_18px_rgba(33,48,38,.07)] lg:hidden">
      {NAV_ITEMS.map(({ href, alias, label, shortLabel, icon: Icon }) => {
        const active = pathname === href || pathname === alias || (href !== '/dashboard' && pathname.startsWith(href)) || Boolean(alias && pathname.startsWith(alias));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            aria-label={label}
            className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-1 text-[9px] font-semibold transition-colors ${active ? 'bg-[#f5e9eb] text-[#792c3b] font-bold' : 'text-[#778178] hover:bg-[#f4f6f1] hover:text-[#252b27]'}`}
          >
            <span className={`flex h-7 w-9 items-center justify-center rounded-lg ${active ? 'bg-[#f5e9eb] text-[#792c3b] ring-1 ring-[#ead3d8]' : ''}`}>
              <Icon size={17} strokeWidth={1.8} />
            </span>
            <span className="max-w-full truncate">{shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
