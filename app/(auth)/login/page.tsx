'use client';

import { signInWithGoogle, enterGuestMode } from '@/lib/actions/auth.actions';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="w-full max-w-sm">
      {/* Wordmark */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 rounded-xl shadow-sm mb-4">
          <span className="text-white text-sm font-bold tracking-tight">CU</span>
        </div>
        <h1 className="text-slate-900 font-bold text-xl tracking-tight">CampusOS</h1>
        <p className="text-slate-500 text-sm mt-1">City University Student Portal</p>
      </div>

      {/* Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h2 className="text-slate-900 font-semibold text-base mb-1">Sign in to your account</h2>
        <p className="text-slate-500 text-xs mb-6 leading-relaxed">
          Sign in with Google to save to CampusOS, or continue as a guest to try demo features saved only in this browser.
        </p>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-red-700 text-xs">{error}</p>
          </div>
        )}

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl px-4 py-3 transition-colors duration-150 mb-3 cursor-pointer"
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
          <div className="flex-1 border-t border-slate-100" />
          <span className="text-slate-400 text-xs font-medium">or</span>
          <div className="flex-1 border-t border-slate-100" />
        </div>

        {/* Guest Demo Mode */}
        <button
          type="button"
          onClick={handleGuestMode}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed text-slate-700 font-medium text-sm rounded-xl px-4 py-3 transition-colors duration-150 cursor-pointer"
        >
          <svg
            className="w-4 h-4 text-slate-500 shrink-0"
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
        </button>

      </div>

      <p className="text-center text-slate-400 text-xs mt-6">
        © 2026 City University · CampusOS · CPCCU Hackathon
      </p>
    </div>
  );
}
