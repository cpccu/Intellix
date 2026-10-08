'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Bell, BookOpen, CalendarDays, CircleHelp, LayoutDashboard, LogOut, Search } from 'lucide-react';
import { signOut } from '@/lib/actions/auth.actions';
import type { SessionUser } from '@/types';

interface Props {
  user: SessionUser;
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/clubs', alias: '/dashboard/clubs', label: 'Clubs & Events', icon: CalendarDays },
  { href: '/resources', alias: '/dashboard/resources', label: 'Resources', icon: BookOpen },
  { href: '/helpdesk', alias: '/dashboard/helpdesk', label: 'Helpdesk', icon: CircleHelp },
  { href: '/lost-found', alias: '/dashboard/lost-found', label: 'Lost & Found', icon: Search },
];

export function DashboardHeader({ user }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      try {
        await signOut();
      } catch {
        // Fallback for client navigation.
      }
      router.push('/login');
    });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-blue-200/10 bg-[#080d20]/90 px-4 backdrop-blur-2xl sm:px-6 xl:px-8">
      <div className="mx-auto flex min-h-[72px] max-w-[1600px] items-center justify-between gap-4">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5" aria-label="CampusOS overview">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-300 to-indigo-400 text-[11px] font-black text-[#10172f] shadow-[0_0_24px_rgba(94,164,255,.25)]">
            CU
          </span>
          <span className="hidden sm:block">
            <span className="block text-sm font-bold leading-none tracking-tight text-white">CampusOS</span>
            <span className="mt-1 block text-[8px] font-semibold uppercase tracking-[0.2em] text-slate-500">City University</span>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
          {NAV_ITEMS.map(({ href, alias, label, icon: Icon }) => {
            const active = pathname === href || pathname === alias || (href !== '/dashboard' && pathname.startsWith(href)) || Boolean(alias && pathname.startsWith(alias));
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`group flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-[11px] font-semibold transition-all xl:px-3.5 xl:text-xs ${
                  active
                    ? 'bg-blue-400/10 text-sky-100 ring-1 ring-blue-300/20'
                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <Icon size={15} strokeWidth={1.8} className={active ? 'text-sky-300' : 'text-slate-500 group-hover:text-slate-300'} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden w-44 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-2.5 py-2 text-slate-500 xl:flex">
            <Search size={14} />
            <span className="text-[10px]">Search campus</span>
            <kbd className="ml-auto rounded border border-white/10 bg-white/5 px-1 text-[9px] text-slate-400">⌘ K</kbd>
          </div>
          <button type="button" aria-label="Notifications" className="relative hidden h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-white sm:flex">
            <Bell size={15} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-sky-300 ring-2 ring-[#0b1230]" />
          </button>
          {user.isGuest && <span className="hidden rounded-full border border-amber-200/20 bg-amber-300/10 px-2.5 py-1 text-[10px] font-semibold text-amber-100 sm:inline-flex">Guest</span>}
          <div className="flex items-center gap-2">
            {user.profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.profile.avatar_url} alt={user.profile.full_name ?? 'User'} className="h-8 w-8 rounded-full border border-white/20 object-cover" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-sky-300 to-indigo-400 text-[11px] font-bold text-[#10172f]">
                {(user.isGuest ? 'G' : (user.profile?.full_name?.[0] ?? user.email?.[0] ?? 'S')).toUpperCase()}
              </span>
            )}
            <span className="hidden max-w-28 truncate text-xs font-medium text-slate-200 xl:block">
              {user.isGuest ? 'Guest User' : (user.profile?.full_name ?? user.email ?? 'Student')}
            </span>
          </div>
          <button type="button" onClick={handleSignOut} disabled={isPending} aria-label="Sign out" title="Sign out" className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-slate-300 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:opacity-50 sm:w-auto sm:gap-1.5 sm:px-3">
            <LogOut size={14} />
            <span className="hidden text-[10px] font-medium sm:inline">{isPending ? 'Signing out' : 'Sign out'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
