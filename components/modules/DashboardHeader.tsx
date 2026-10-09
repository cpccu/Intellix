'use client';

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
    <header className="sticky top-0 z-30 border-b border-[#e3e8df] bg-white px-4 sm:px-6 xl:px-8">
      <div className="mx-auto flex min-h-[68px] max-w-[1600px] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3 lg:hidden"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#792c3b] text-[10px] font-black text-white">CU</span><span className="truncate text-sm font-extrabold tracking-tight text-[#252b27]">CampusOS</span></div>
        <div className="hidden min-w-0 lg:block"><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#7b887d]">City University · Student community</p><p className="mt-0.5 text-sm font-bold text-[#252b27]">{NAV_ITEMS.find(({ href, alias }) => pathname === href || pathname === alias || pathname.startsWith(href) || Boolean(alias && pathname.startsWith(alias)))?.label ?? 'Campus overview'}</p></div>
        <div className="hidden flex-1 lg:block" aria-hidden="true" />

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden w-44 items-center gap-2 rounded-xl border border-[#e3e8df] bg-[#f7f8f5] px-2.5 py-2 text-[#879087] xl:flex">
            <Search size={14} />
            <span className="text-[10px]">Search campus</span>
            <kbd className="ml-auto rounded border border-[#eadfdd] bg-white px-1 text-[9px] text-[#938588]">⌘ K</kbd>
          </div>
          <button type="button" aria-label="Notifications" className="relative hidden h-9 w-9 items-center justify-center rounded-xl border border-[#e3e8df] bg-white text-[#68736a] transition-colors hover:bg-[#f4f6f1] hover:text-[#792c3b] sm:flex">
            <Bell size={15} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#9b3e4d] ring-2 ring-white" />
          </button>
          {user.isGuest && <span className="hidden rounded-full border border-[#dce8dd] bg-[#eaf1eb] px-2.5 py-1 text-[10px] font-semibold text-[#315d4a] sm:inline-flex">Demo account</span>}
          <div className="flex items-center gap-2">
            {user.profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.profile.avatar_url} alt={user.profile.full_name ?? 'User'} className="h-8 w-8 rounded-full border border-white/20 object-cover" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ead3d8] bg-[#f5e9eb] text-[11px] font-bold text-[#792c3b]">
                {(user.isGuest ? 'G' : (user.profile?.full_name?.[0] ?? user.email?.[0] ?? 'S')).toUpperCase()}
              </span>
            )}
            <span className="hidden max-w-28 truncate text-xs font-medium text-[#556057] xl:block">
              {user.isGuest ? 'Guest User' : (user.profile?.full_name ?? user.email ?? 'Student')}
            </span>
          </div>
          <button type="button" onClick={handleSignOut} disabled={isPending} aria-label="Sign out" title="Sign out" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e3e8df] bg-white text-[#68736a] transition-colors hover:border-[#d3ded2] hover:bg-[#f4f6f1] hover:text-[#792c3b] disabled:opacity-50 sm:w-auto sm:gap-1.5 sm:px-3">
            <LogOut size={14} />
            <span className="hidden text-[10px] font-medium sm:inline">{isPending ? 'Signing out' : 'Sign out'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
