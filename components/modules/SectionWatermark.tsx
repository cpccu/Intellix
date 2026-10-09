'use client';

import { BookOpenText, Compass, GraduationCap, Headset, Sparkles, UsersRound } from 'lucide-react';
import { usePathname } from 'next/navigation';

const SECTION_MARKS = [
  { matches: ['/clubs', '/dashboard/clubs'], name: 'clubs', Icon: UsersRound },
  { matches: ['/resources', '/dashboard/resources'], name: 'resources', Icon: BookOpenText },
  { matches: ['/helpdesk', '/dashboard/helpdesk'], name: 'helpdesk', Icon: Headset },
  { matches: ['/lost-found', '/dashboard/lost-found'], name: 'lost-found', Icon: Compass },
] as const;

export function SectionWatermark({ section: requestedSection }: { section?: 'clubs' | 'resources' | 'helpdesk' | 'lost-found' }) {
  const pathname = usePathname();
  const section = requestedSection
    ? SECTION_MARKS.find(({ name }) => name === requestedSection)
    : SECTION_MARKS.find(({ matches }) => matches.some((match) => pathname === match || pathname.startsWith(`${match}/`)));
  const Icon = section?.Icon ?? GraduationCap;
  const name = section?.name ?? 'learning';

  return (
    <aside className="section-watermark" data-section={name} aria-label={`${name.replace('-', ' ')} tip`}>
      <svg className="section-watermark__orbit" viewBox="0 0 360 360" fill="none">
        <circle cx="180" cy="180" r="142" />
        <ellipse cx="180" cy="180" rx="155" ry="69" transform="rotate(-34 180 180)" />
        <ellipse cx="180" cy="180" rx="155" ry="69" transform="rotate(34 180 180)" />
        <path d="M42 180h46m184 0h46M180 42v46m0 184v46" />
        <circle className="section-watermark__node section-watermark__node--one" cx="180" cy="38" r="4" />
        <circle className="section-watermark__node section-watermark__node--two" cx="321" cy="180" r="4" />
        <circle className="section-watermark__node section-watermark__node--three" cx="84" cy="84" r="3" />
      </svg>
      <div className="section-watermark__core">
        <Icon strokeWidth={1} />
      </div>
      <span className="section-watermark__caption">{name.replace('-', ' ')}</span>
      <div className="section-watermark__sticker">
        <span className="section-watermark__sticker-icon"><Icon strokeWidth={1.5} /></span>
        <span className="section-watermark__sticker-label">{name.replace('-', ' ')}</span>
      </div>
      <Sparkles className="section-watermark__sparkle section-watermark__sparkle--left" strokeWidth={1.4} />
      <Sparkles className="section-watermark__sparkle section-watermark__sparkle--right" strokeWidth={1.4} />
      <p className="section-watermark__message">
        {name === 'clubs' ? 'Find your next campus thing.' : name === 'resources' ? 'Your next study win starts here.' : name === 'helpdesk' ? 'Quick answers, less campus confusion.' : name === 'lost-found' ? 'Small clues help things find their way home.' : 'Make campus life your own.'}
      </p>
    </aside>
  );
}
