'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Bell, BookOpen, CalendarDays, CircleHelp, LayoutDashboard, LogOut, Search } from 'lucide-react';
import { signOut } from '@/lib/actions/auth.actions';
import { searchCampus, type CampusSearchResult } from '@/lib/actions/search.actions';
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchState, setSearchState] = useState<{ query: string; results: CampusSearchResult[]; loading: boolean } | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!notificationsOpen) return;
    const dismissOnOutsideClick = (event: PointerEvent) => {
      if (!notificationRef.current?.contains(event.target as Node)) setNotificationsOpen(false);
    };
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNotificationsOpen(false);
    };
    document.addEventListener('pointerdown', dismissOnOutsideClick);
    document.addEventListener('keydown', dismissOnEscape);
    return () => {
      document.removeEventListener('pointerdown', dismissOnOutsideClick);
      document.removeEventListener('keydown', dismissOnEscape);
    };
  }, [notificationsOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const dismissOnOutsideClick = (event: PointerEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) setSearchOpen(false);
    };
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('pointerdown', dismissOnOutsideClick);
    document.addEventListener('keydown', dismissOnEscape);
    searchInputRef.current?.focus();
    return () => {
      document.removeEventListener('pointerdown', dismissOnOutsideClick);
      document.removeEventListener('keydown', dismissOnEscape);
    };
  }, [searchOpen]);

  useEffect(() => {
    const openSearchShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setNotificationsOpen(false);
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', openSearchShortcut);
    return () => document.removeEventListener('keydown', openSearchShortcut);
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!searchOpen || query.length < 2) return;

    let canceled = false;
    const timeout = window.setTimeout(async () => {
      setSearchState({ query, results: [], loading: true });
      try {
        const results = await searchCampus(query);
        if (!canceled) setSearchState({ query, results, loading: false });
      } catch {
        if (!canceled) setSearchState({ query, results: [], loading: false });
      }
    }, 250);
    return () => {
      canceled = true;
      window.clearTimeout(timeout);
    };
  }, [searchOpen, searchQuery]);

  const currentSearchState = searchState?.query === searchQuery.trim() ? searchState : null;
  const searchResults = currentSearchState?.results ?? [];
  const searchLoading = currentSearchState?.loading ?? false;

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
      <div className="mx-auto flex min-h-[68px] max-w-[1760px] items-center justify-between gap-3">
        <Link href="/dashboard" className="flex min-w-0 shrink-0 items-center gap-2.5" aria-label="CampusOS home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#792c3b] text-[10px] font-black text-white">CU</span>
          <span className="min-w-0"><span className="block truncate text-sm font-extrabold tracking-tight text-[#252b27]">CampusOS</span><span className="hidden text-[8px] font-semibold uppercase tracking-[0.14em] text-[#78847a] sm:block">City University</span></span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden min-w-0 flex-1 items-center justify-start gap-1 overflow-x-auto lg:flex xl:justify-center">
          {NAV_ITEMS.map(({ href, alias, label, icon: Icon }) => {
            const active = pathname === href || pathname === alias || (href !== '/dashboard' && pathname.startsWith(href)) || Boolean(alias && pathname.startsWith(alias));
            return (
              <Link key={href} href={href} aria-current={active ? 'page' : undefined}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-2.5 py-2.5 text-[11px] font-semibold transition-colors xl:px-3 xl:text-xs ${active ? 'bg-[#f5e9eb] text-[#792c3b] ring-1 ring-[#ead3d8]' : 'text-[#68736a] hover:bg-[#f7f8f5] hover:text-[#252b27]'}`}>
                <Icon size={15} strokeWidth={1.8} /><span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div ref={searchRef} className="relative hidden xl:block">
            <button type="button" aria-label="Search campus" aria-expanded={searchOpen} aria-controls="campus-search-results" onClick={() => { setNotificationsOpen(false); setSearchOpen((open) => !open); }} className={`flex w-44 items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#792c3b]/30 ${searchOpen ? 'border-[#ead3d8] bg-[#fdf8f8] text-[#792c3b]' : 'border-[#e3e8df] bg-[#f7f8f5] text-[#68736a] hover:border-[#d7c3c7] hover:bg-white'}`}>
              <Search size={14} />
              <span className="text-[10px]">Search campus</span>
              <kbd className="ml-auto rounded border border-[#eadfdd] bg-white px-1 text-[9px] text-[#76696b]">⌘ K</kbd>
            </button>
            {searchOpen && (
              <div id="campus-search-results" className="absolute right-0 top-full z-50 mt-2 w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#e3e8df] bg-white shadow-[0_16px_42px_rgba(37,43,39,.16)]">
                <label className="flex items-center gap-2 border-b border-[#edf0eb] px-4 py-3 text-[#68736a]">
                  <Search size={16} />
                  <input ref={searchInputRef} type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search events, resources, answers…" className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[#252b27] outline-none placeholder:text-[#9aa39b]" />
                  {searchLoading && <span className="text-[10px] text-[#78847a]">Searching…</span>}
                </label>
                <div className="max-h-[min(60vh,24rem)] overflow-y-auto p-2">
                  {searchQuery.trim().length < 2 ? (
                    <p className="px-3 py-6 text-center text-xs text-[#78847a]">Type at least 2 characters to search campus.</p>
                  ) : searchLoading ? (
                    <p className="px-3 py-6 text-center text-xs text-[#78847a]">Looking across campus…</p>
                  ) : searchResults.length ? (
                    <ul className="space-y-1">{searchResults.map((result) => <li key={result.id}><Link href={result.href} onClick={() => setSearchOpen(false)} className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-[#fbf5f5] focus-visible:bg-[#fbf5f5] focus-visible:outline-none"><span className="block truncate text-xs font-semibold text-[#30292a]">{result.title}</span><span className="mt-1 flex items-center justify-between gap-3"><span className="truncate text-[10px] text-[#6e7770]">{result.detail}</span><span className="shrink-0 rounded-full bg-[#f5e9eb] px-2 py-0.5 text-[9px] font-semibold text-[#792c3b]">{result.section}</span></span></Link></li>)}</ul>
                  ) : (
                    <p className="px-3 py-6 text-center text-xs text-[#78847a]">No campus results found. Try another keyword.</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <div ref={notificationRef} className="relative">
            <button type="button" aria-label="Notifications" aria-expanded={notificationsOpen} aria-controls="campus-notifications" onClick={() => setNotificationsOpen((open) => !open)} className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#792c3b]/30 ${notificationsOpen ? 'border-[#ead3d8] bg-[#f5e9eb] text-[#792c3b]' : 'border-[#e3e8df] bg-white text-[#68736a] hover:bg-[#f4f6f1] hover:text-[#792c3b]'}`}>
              <Bell size={15} />
            </button>
            {notificationsOpen && (
              <section id="campus-notifications" aria-label="Notifications" className="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-[#e3e8df] bg-white p-4 shadow-[0_16px_42px_rgba(37,43,39,.16)]">
                <div className="flex items-center justify-between border-b border-[#edf0eb] pb-3">
                  <div><h2 className="text-sm font-bold text-[#252b27]">Notifications</h2><p className="mt-0.5 text-[10px] text-[#78847a]">Campus updates</p></div>
                  <span className="rounded-full bg-[#f2f5ef] px-2 py-1 text-[9px] font-semibold text-[#68736a]">All caught up</span>
                </div>
                <div className="flex flex-col items-center px-3 py-7 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5e9eb] text-[#792c3b]"><Bell size={18} strokeWidth={1.8} /></span>
                  <p className="mt-3 text-xs font-semibold text-[#3c3435]">You’re all caught up</p>
                  <p className="mt-1 max-w-[15rem] text-[10px] leading-relaxed text-[#6e7770]">New campus announcements and activity updates will appear here.</p>
                </div>
              </section>
            )}
          </div>
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
