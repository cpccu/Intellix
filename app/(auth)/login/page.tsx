'use client';

import { signInWithGoogle, enterGuestMode } from '@/lib/actions/auth.actions';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, CalendarDays, CircleHelp, Search, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = () => {
    startTransition(async () => {
      setError(null);
      try {
        const result = await signInWithGoogle();
        if (!result.success || !result.data?.url) {
          setError(result.error ?? 'Failed to start sign-in. Please try again.');
          return;
        }
        window.location.href = result.data.url;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to start Google sign-in.';
        setError(message);
      }
    });
  };

  const handleGuestMode = () => {
    startTransition(async () => {
      setError(null);
      try {
        await enterGuestMode();
        router.push('/dashboard');
      } catch {
        router.push('/dashboard');
      }
    });
  };

  return (
    <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-2xl border border-blue-200/15 bg-[#0c1530]/90 shadow-[0_24px_100px_rgba(1,5,20,0.55)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
      <div className="astra-panel relative hidden min-h-[600px] flex-col justify-between overflow-hidden p-10 text-white lg:flex">
        <div className="absolute -right-24 -top-12 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -right-6 top-8 h-56 w-56 rounded-full border border-white/10" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-300 to-indigo-400 text-sm font-black text-[#10172f] shadow-[0_0_24px_rgba(94,164,255,.25)]">CU</div>
          <div><p className="text-sm font-bold">CampusOS</p><p className="mt-0.5 text-[10px] tracking-wide text-slate-400">CITY UNIVERSITY</p></div>
        </div>
        <div className="relative max-w-sm py-8">
          <span className="mb-5 inline-flex items-center gap-2 rounded-lg border border-blue-200/20 bg-blue-300/10 px-3 py-1.5 text-[10px] font-semibold text-sky-200"><Sparkles size={13} /> YOUR CAMPUS, CONNECTED</span>
          <h2 className="text-4xl font-semibold leading-[1.12] tracking-tight">Make campus life feel a little closer.</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">The people, places, and resources that make your university experience yours.</p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {[[CalendarDays, 'Campus events'], [BookOpen, 'Study resources'], [CircleHelp, 'Quick answers'], [Search, 'Lost & found']].map(([Icon, label]) => {
              const ItemIcon = Icon as typeof CalendarDays;
              return <div key={label as string} className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-3 text-[11px] text-slate-200"><ItemIcon size={15} className="text-sky-300" />{label as string}</div>;
            })}
          </div>
        </div>
        <div className="relative flex items-center justify-between text-[10px] text-slate-400"><span>CPCCU · 2026</span><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Campus network online</span></div>
      </div>
      <div className="flex flex-col justify-center bg-[#0b1430]/75 px-6 py-10 sm:px-10 lg:px-12">
      {/* Wordmark */}
      <div className="mb-7 text-center lg:hidden">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sky-300 to-indigo-400 rounded-xl mb-4 shadow-[0_0_24px_rgba(94,164,255,.25)]">
          <span className="text-[#10172f] text-sm font-black tracking-tight">CU</span>
        </div>
        <h1 className="text-white font-bold text-xl tracking-tight">CampusOS</h1>
        <p className="text-slate-500 text-sm mt-1">City University Student Portal</p>
      </div>

      {/* Card */}
      <div>
        <p className="eyebrow mb-2 hidden lg:block">Welcome to CampusOS</p>
        <h2 className="text-white font-semibold text-2xl tracking-tight mb-2">Sign in to your account</h2>
        <p className="text-slate-300 text-[13px] mb-7 leading-relaxed">
          Sign in with Google to save to CampusOS, or continue as a guest to try demo features saved only in this browser.
        </p>

        {error && (
          <div className="mb-5 rounded-lg bg-red-400/10 border border-red-300/20 px-4 py-3">
            <p className="text-red-200 text-xs">{error}</p>
          </div>
        )}

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-3 bg-[#1c2433] hover:bg-[#2c3749] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl px-4 py-3.5 transition-colors duration-150 mb-3 cursor-pointer shadow-[0_8px_16px_rgba(28,36,51,0.16)]"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#34A853" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {isPending ? 'Redirecting…' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 border-t border-white/10" />
          <span className="text-slate-400 text-xs font-medium">or</span>
          <div className="flex-1 border-t border-white/10" />
        </div>

        {/* Guest Demo Mode */}
        <button
          type="button"
          onClick={handleGuestMode}
          disabled={isPending}
          className="group w-full flex items-center justify-center gap-2 border border-blue-200/20 hover:border-blue-200/40 hover:bg-white/[0.06] disabled:opacity-60 disabled:cursor-not-allowed text-slate-100 font-medium text-sm rounded-xl px-4 py-3.5 transition-colors duration-150 cursor-pointer"
        >
          <svg
            className="w-4 h-4 text-slate-300 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          Continue as Guest (Demo Mode)
          <ArrowRight size={14} className="ml-1 text-slate-300 transition-transform group-hover:translate-x-0.5" />
        </button>

      </div>

      <p className="text-center text-slate-400 text-[10px] mt-7">
        © 2026 City University · CampusOS · CPCCU Hackathon
      </p>
      </div>
    </div>
  );
}
