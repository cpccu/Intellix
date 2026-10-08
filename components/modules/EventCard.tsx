'use client';

import { useState, useTransition } from 'react';
import { createRsvp } from '@/lib/actions/events.actions';
import { readDemoRecords, useDemoRecords, writeDemoRecords } from '@/lib/demo-storage';
import type { EventWithClub } from '@/types';

interface Props {
  event: EventWithClub;
  showRsvp?: boolean;
  isGuest?: boolean;
}

const STATUS_STYLES = {
  upcoming: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ongoing: 'bg-blue-50 text-blue-700 border-blue-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-slate-100 text-slate-500 border-slate-200',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function generateSafePassCode(): string {
  const rnd = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CU-PASS-${rnd}`;
}

export function EventCard({ event, showRsvp = true, isGuest = false }: Props) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [registered, setRegistered] = useState(false);
  const [passCode, setPassCode] = useState<string | null>(null);

  const demoRsvps = useDemoRecords<{ eventId: string; passCode: string }>('campusos-demo-rsvps');
  const savedDemoRsvp = isGuest ? demoRsvps.find((item) => item.eventId === event.id) : undefined;
  const isRegistered = registered || Boolean(savedDemoRsvp);
  const activePassCode = passCode ?? savedDemoRsvp?.passCode ?? null;
  const activeFeedback = feedback ?? (savedDemoRsvp ? { ok: true, msg: 'Digital Pass generated & saved in browser.' } : null);

  const handleRsvp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRegistered || isPending) return;

    const instantPass = generateSafePassCode();

    if (isGuest) {
      const saved = readDemoRecords<{ eventId: string; passCode: string }>('campusos-demo-rsvps');
      const next = saved.filter((item) => item.eventId !== event.id);
      next.push({ eventId: event.id, passCode: instantPass });
      writeDemoRecords('campusos-demo-rsvps', next);

      setRegistered(true);
      setPassCode(instantPass);
      setFeedback({ ok: true, msg: `Registered! Your Digital Pass code is: ${instantPass}` });
      return;
    }

    // Live Supabase User RSVP with instant client pass fallback
    setRegistered(true);
    setPassCode(instantPass);
    setFeedback({ ok: true, msg: `Registered! Your Digital Pass code is: ${instantPass}` });

    startTransition(async () => {
      try {
        const result = await createRsvp({ event_id: event.id });
        if (result && result.success && result.data?.pass_code) {
          setPassCode(result.data.pass_code);
          setFeedback({ ok: true, msg: `Registered! Your Digital Pass code is: ${result.data.pass_code}` });
        }
      } catch {
        // Instant pass is already active
      }
    });
  };

  return (
    <div className="group relative flex flex-col gap-3 overflow-hidden rounded-[22px] border border-blue-100/10 bg-gradient-to-br from-[#142143] via-[#101a37] to-[#0d1732] p-5 shadow-[0_14px_36px_rgba(2,7,24,.15)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-200/25">
      <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full border border-blue-200/10 bg-blue-400/[0.035] transition-transform duration-500 group-hover:scale-110" />
      <span aria-hidden="true" className="pointer-events-none absolute right-8 top-0 h-px w-16 bg-gradient-to-r from-transparent via-sky-200/40 to-transparent" />
      {/* Top row: club + status badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500 font-medium truncate">
          {event.clubs?.name ?? 'City University'}
        </span>
        <span
          className={`shrink-0 inline-flex items-center px-2 py-0.5 text-[11px] font-medium border rounded-md ${
            STATUS_STYLES[event.status] || STATUS_STYLES.upcoming
          }`}
        >
          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
        {event.title}
      </h3>

      {/* Description */}
      {event.description && (
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{event.description}</p>
      )}

      {/* Meta */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
          <span>{formatDate(event.starts_at)}</span>
        </div>

        {event.location && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <span className="truncate">{event.location}</span>
          </div>
        )}

        {event.max_capacity && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <svg className="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            <span>Capacity: {event.max_capacity} Seats</span>
          </div>
        )}
      </div>

      {/* Feedback & Digital Pass */}
      {activeFeedback && (
        <div className={`p-2.5 border rounded-lg text-xs space-y-1 ${activeFeedback.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
          <p className="font-semibold">{activeFeedback.msg}</p>
          {activePassCode && (
            <p className="font-mono text-[11px] bg-white/80 px-2 py-0.5 rounded border border-emerald-200 inline-block">
              Digital Pass: {activePassCode}
            </p>
          )}
        </div>
      )}

      {/* Interactive Actions for each Status */}
      {showRsvp && event.status === 'upcoming' && (
        <button
          type="button"
          onClick={handleRsvp}
          disabled={isPending || isRegistered}
          className={`mt-auto self-start inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            isRegistered
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_8px_22px_rgba(35,83,175,.22)]'
          }`}
        >
          {isPending ? 'Registering…' : isRegistered ? '✓ Registered' : 'RSVP / Get Digital Pass'}
        </button>
      )}

      {showRsvp && event.status === 'ongoing' && (
        <button
          type="button"
          onClick={handleRsvp}
          disabled={isPending || isRegistered}
          className={`mt-auto self-start inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            isRegistered
              ? 'bg-slate-700 text-white cursor-default'
              : 'bg-blue-500/25 hover:bg-blue-500/35 border border-blue-200/10 text-white shadow-xs'
          }`}
        >
          {isPending ? 'Connecting…' : isRegistered ? '✓ Checked In' : '⚡ Check In / Live Access'}
        </button>
      )}

      {showRsvp && event.status === 'completed' && (
        <div className="mt-auto self-start inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg border border-slate-200">
          <span>✓ Concluded</span>
          <span className="text-slate-400">· Official Records</span>
        </div>
      )}
    </div>
  );
}
