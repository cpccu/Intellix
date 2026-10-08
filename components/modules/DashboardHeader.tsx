'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/actions/auth.actions';
import type { SessionUser } from '@/types';

interface Props {
  user: SessionUser;
}

export function DashboardHeader({ user }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      try {
        await signOut();
      } catch {
        // Fallback for client navigation
      }
      router.push('/login');
    });
  };

  return (
    <header className="flex items-center justify-between px-6 lg:px-8 py-3 bg-white border-b border-slate-200 shrink-0">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="w-7 h-7 bg-slate-900 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold tracking-tight">CU</span>
        </div>
        <span className="text-slate-900 font-semibold text-sm">CampusOS</span>
      </div>

      {/* Desktop breadcrumb placeholder */}
      <div className="hidden lg:block" />

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Guest badge */}
        {user.isGuest && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium rounded-full">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
            Guest Mode
          </span>
        )}

        {/* Avatar */}
        <div className="flex items-center gap-2.5">
          {user.profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.profile.avatar_url}
              alt={user.profile.full_name ?? 'User'}
              className="w-8 h-8 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-slate-600 text-xs font-semibold">
                {user.isGuest
                  ? 'G'
                  : (user.profile?.full_name?.[0] ?? user.email?.[0] ?? 'S').toUpperCase()}
              </span>
            </div>
          )}
          <div className="hidden sm:block">
            <p className="text-slate-900 text-sm font-medium leading-none">
              {user.isGuest
                ? 'Guest User'
                : (user.profile?.full_name ?? user.email ?? 'Student')}
            </p>
            {!user.isGuest && user.profile?.matric_number && (
              <p className="text-slate-400 text-xs mt-0.5">
                {user.profile.matric_number}
              </p>
            )}
          </div>
        </div>

        {/* Sign out button */}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
          </svg>
          {isPending ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </header>
  );
}
