'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionResponse, Club, ClubActivity, EventWithClub, Rsvp } from '@/types';

// ── Fallback Clubs ───────────────────────────────────────────
const FALLBACK_CLUBS: Club[] = [
  {
    id: 'club-gym',
    name: 'Campus Gymnasium & Sports Federation',
    description:
      'The central campus fitness and athletic hub. Offering fully equipped weight rooms, cardio suites, indoor basketball courts, and intramural leagues.',
    category: 'Sports & Gym',
    logo_url: null,
    banner_url: null,
    lead_name: 'Director: Coach Williams / Lead Trainer Sarah',
    member_count: 650,
    created_by: null,
    created_at: '2026-01-18T10:00:00Z',
    updated_at: '2026-01-18T10:00:00Z',
  },
  {
    id: 'club-1',
    name: 'CPCCU — Computer Programming & Computing Club',
    description:
      'The premier competitive programming, hackathon, and software engineering community at City University.',
    category: 'Technology',
    logo_url: null,
    banner_url: null,
    lead_name: 'President: David Adeleke',
    member_count: 420,
    created_by: null,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'club-2',
    name: 'CPCC — Photographic & Cultural Circle',
    description:
      'Capturing vibrant campus life, cultural celebrations, digital photography workshops, and film screenings.',
    category: 'Arts & Culture',
    logo_url: null,
    banner_url: null,
    lead_name: 'Lead Curator: Zainab Danjuma',
    member_count: 210,
    created_by: null,
    created_at: '2026-01-12T10:00:00Z',
    updated_at: '2026-01-12T10:00:00Z',
  },
  {
    id: 'club-3',
    name: 'IT Security & Ethical Hacking Society',
    description:
      'Hands-on vulnerability assessments, CTF hacking competitions, and web security defense labs.',
    category: 'Cybersecurity',
    logo_url: null,
    banner_url: null,
    lead_name: 'Security Lead: Alex Kalu',
    member_count: 185,
    created_by: null,
    created_at: '2026-01-14T10:00:00Z',
    updated_at: '2026-01-14T10:00:00Z',
  },
  {
    id: 'club-4',
    name: 'Robotics & Hardware Engineering Club',
    description:
      'Autonomous micro-rovers, Arduino drone avionics, telemetry, and 3D prototyping for national competitions.',
    category: 'Engineering',
    logo_url: null,
    banner_url: null,
    lead_name: 'Lead Engineer: Fatima Bello',
    member_count: 160,
    created_by: null,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'club-5',
    name: 'City University Debate & Oratory Guild',
    description:
      'Parliamentary debates, public policy analysis, and rhetoric tournaments across inter-faculty championships.',
    category: 'Academic & Rhetoric',
    logo_url: null,
    banner_url: null,
    lead_name: 'Captain: Chinedu Okafor',
    member_count: 130,
    created_by: null,
    created_at: '2026-01-16T10:00:00Z',
    updated_at: '2026-01-16T10:00:00Z',
  },
];

// ── Fallback Events ──────────────────────────────────────────
const FALLBACK_EVENTS: EventWithClub[] = [
  // ── UPCOMING EVENTS
  {
    id: 'ev-gym-1',
    club_id: 'club-gym',
    title: 'Intramural 3v3 Basketball Tournament',
    description:
      'Fast-paced half-court knockout tournament across 16 student teams. Trophies, sport store vouchers, and live commentary.',
    location: 'Indoor Gymnasium — Court 1',
    starts_at: '2026-05-20T14:00:00Z',
    ends_at: '2026-05-20T20:00:00Z',
    status: 'upcoming',
    max_capacity: 120,
    cover_url: null,
    created_by: null,
    created_at: '2026-01-18T10:00:00Z',
    updated_at: '2026-01-18T10:00:00Z',
    clubs: { id: 'club-gym', name: 'Campus Gymnasium & Sports Federation', logo_url: null },
  },
  {
    id: 'ev-1',
    club_id: 'club-1',
    title: 'CPCCU Annual GenAI Hackathon 2026 — 48H Innovation Sprint',
    description:
      'Build generative AI applications to solve campus fragmentation. Mentors from top tech firms, nonstop power, free meals, and ₦500k in prize grants.',
    location: 'Auditorium Complex & Computing Labs A/B',
    starts_at: '2026-05-15T10:00:00Z',
    ends_at: '2026-05-17T12:00:00Z',
    status: 'upcoming',
    max_capacity: 150,
    cover_url: null,
    created_by: null,
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-01-20T10:00:00Z',
    clubs: { id: 'club-1', name: 'CPCCU — Computer Programming Club', logo_url: null },
  },
  {
    id: 'ev-2',
    club_id: 'club-2',
    title: 'CPCC Shutter Bug Photography & Visual Arts Exhibition',
    description:
      'Showcasing breathtaking campus architectural photography, student portraiture, and short film screenings.',
    location: 'Central Gallery Hall — Library Ground Floor',
    starts_at: '2026-05-22T11:00:00Z',
    ends_at: '2026-05-22T17:00:00Z',
    status: 'upcoming',
    max_capacity: 200,
    cover_url: null,
    created_by: null,
    created_at: '2026-01-22T10:00:00Z',
    updated_at: '2026-01-22T10:00:00Z',
    clubs: { id: 'club-2', name: 'CPCC — Photographic Circle', logo_url: null },
  },
  {
    id: 'ev-3',
    club_id: 'club-1',
    title: 'CPCCU Competitive Programming & Graph Algorithms Bootcamp',
    description:
      'Master dynamic programming, tree traversals, and greedy heuristics for the upcoming inter-university ICPC regionals.',
    location: 'Computer Lab 402 — Faculty of Science',
    starts_at: '2026-05-25T15:30:00Z',
    ends_at: '2026-05-25T18:30:00Z',
    status: 'upcoming',
    max_capacity: 75,
    cover_url: null,
    created_by: null,
    created_at: '2026-01-24T10:00:00Z',
    updated_at: '2026-01-24T10:00:00Z',
    clubs: { id: 'club-1', name: 'CPCCU — Computer Programming Club', logo_url: null },
  },
  {
    id: 'ev-4',
    club_id: 'club-3',
    title: 'Live CTF Ethical Hacking: Web Vulnerabilities & Exploits',
    description:
      'Hands-on Capture The Flag challenge covering SQLi, XSS, and reverse engineering with live scoreboard.',
    location: 'Cyber Security Lab — Tech Complex Room 108',
    starts_at: '2026-05-28T14:00:00Z',
    ends_at: '2026-05-28T18:00:00Z',
    status: 'upcoming',
    max_capacity: 60,
    cover_url: null,
    created_by: null,
    created_at: '2026-01-25T10:00:00Z',
    updated_at: '2026-01-25T10:00:00Z',
    clubs: { id: 'club-3', name: 'IT Security Club', logo_url: null },
  },
  {
    id: 'ev-6',
    club_id: 'club-5',
    title: 'Inter-Faculty Parliamentary Debate Semi-Finals',
    description:
      'Motion: "This House Would Mandate Explainable AI Systems in Public University Grading."',
    location: 'Senate Chambers — Main Administration',
    starts_at: '2026-06-05T13:00:00Z',
    ends_at: '2026-06-05T16:00:00Z',
    status: 'upcoming',
    max_capacity: 180,
    cover_url: null,
    created_by: null,
    created_at: '2026-01-27T10:00:00Z',
    updated_at: '2026-01-27T10:00:00Z',
    clubs: { id: 'club-5', name: 'Debate Guild', logo_url: null },
  },

  // ── ONGOING EVENTS & SPRINT ACTIVITIES
  {
    id: 'ev-gym-2',
    club_id: 'club-gym',
    title: 'Gymnasium Strength, Cardio & Powerlifting League',
    description:
      'Daily supervised gym training sessions, bench press benchmarks, aerobic conditioning, and personal trainer check-ins at the central campus gym.',
    location: 'Indoor Gymnasium — Fitness & Weight Room',
    starts_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    ends_at: new Date(Date.now() + 3600000 * 240).toISOString(),
    status: 'ongoing',
    max_capacity: 150,
    cover_url: null,
    created_by: null,
    created_at: '2026-01-28T10:00:00Z',
    updated_at: '2026-01-28T10:00:00Z',
    clubs: { id: 'club-gym', name: 'Campus Gymnasium & Sports Federation', logo_url: null },
  },
  {
    id: 'ev-gym-3',
    club_id: 'club-gym',
    title: 'Campus Fitness & Wellbeing Sprint',
    description:
      'University-wide 30-day health sprint featuring daily guided morning runs, indoor gym fitness classes, and nutrition tracking.',
    location: 'Indoor Gymnasium & Sports Pavilion Track',
    starts_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    ends_at: new Date(Date.now() + 3600000 * 300).toISOString(),
    status: 'ongoing',
    max_capacity: 300,
    cover_url: null,
    created_by: null,
    created_at: '2026-01-29T10:00:00Z',
    updated_at: '2026-01-29T10:00:00Z',
    clubs: { id: 'club-gym', name: 'Campus Gymnasium & Sports Federation', logo_url: null },
  },
  {
    id: 'ev-7',
    club_id: 'club-1',
    title: 'Open Source Month: City University Code Lab',
    description:
      'Continuous mentorship and code reviews for students contributing to university open-source tools and civic projects.',
    location: 'Computing Lab C & Discord Server',
    starts_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    ends_at: new Date(Date.now() + 3600000 * 180).toISOString(),
    status: 'ongoing',
    max_capacity: 100,
    cover_url: null,
    created_by: null,
    created_at: '2026-01-30T10:00:00Z',
    updated_at: '2026-01-30T10:00:00Z',
    clubs: { id: 'club-1', name: 'CPCCU — Computer Programming Club', logo_url: null },
  },

  // ── COMPLETED ACTIVITIES & ARCHIVES
  {
    id: 'ev-gym-4',
    club_id: 'club-gym',
    title: 'Inter-Faculty Football Championship: Computing vs Law Derby',
    description:
      'The classic rivalry derby that kicked off the semester sports season. Full stadium attendance, trophy presentation, and student commentary.',
    location: 'University Sports Stadium & Gymnasium Arena',
    starts_at: new Date(Date.now() - 3600000 * 240).toISOString(),
    ends_at: new Date(Date.now() - 3600000 * 236).toISOString(),
    status: 'completed',
    max_capacity: 800,
    cover_url: null,
    created_by: null,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
    clubs: { id: 'club-gym', name: 'Campus Gymnasium & Sports Federation', logo_url: null },
  },
  {
    id: 'ev-8',
    club_id: 'club-5',
    title: 'Annual Freshman Debate Showcase 2026',
    description:
      'Introductory exhibition tournament welcoming first-year students to British Parliamentary style debate and rhetoric.',
    location: 'Faculty of Arts — Lecture Hall 3',
    starts_at: new Date(Date.now() - 3600000 * 360).toISOString(),
    ends_at: new Date(Date.now() - 3600000 * 356).toISOString(),
    status: 'completed',
    max_capacity: 180,
    cover_url: null,
    created_by: null,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
    clubs: { id: 'club-5', name: 'Debate Guild', logo_url: null },
  },
  {
    id: 'ev-9',
    club_id: 'club-2',
    title: 'Shakespeare Remixed: Student Monologue Fest',
    description:
      'Contemporary campus adaptations of classical dramatic soliloquies performed live at the amphitheatre.',
    location: 'Arts Quadrangle Amphitheatre',
    starts_at: new Date(Date.now() - 3600000 * 480).toISOString(),
    ends_at: new Date(Date.now() - 3600000 * 476).toISOString(),
    status: 'completed',
    max_capacity: 220,
    cover_url: null,
    created_by: null,
    created_at: '2026-01-05T10:00:00Z',
    updated_at: '2026-01-05T10:00:00Z',
    clubs: { id: 'club-2', name: 'CPCC — Photographic & Cultural Circle', logo_url: null },
  },
];

function getFallbackEvents(): EventWithClub[] {
  const now = Date.now();
  return FALLBACK_EVENTS.map((event, index) => {
    const startOffset =
      event.status === 'upcoming'
        ? (index + 1) * 24 * 60 * 60 * 1000
        : event.status === 'ongoing'
          ? -60 * 60 * 1000
          : -10 * 24 * 60 * 60 * 1000;
    const startsAt = new Date(now + startOffset);
    const endsAt = new Date(
      startsAt.getTime() + (event.status === 'ongoing' ? 24 : 3) * 60 * 60 * 1000
    );
    return {
      ...event,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    };
  });
}

// ── Fallback Club Activities ─────────────────────────────────
const FALLBACK_ACTIVITIES: ClubActivity[] = [
  {
    id: 'act-gym-1',
    club_id: 'club-gym',
    title: 'Gymnasium Intramural 3v3 Registrations Now Open',
    description: '16 team slots available for next week knockout tourney in Court 1. Free sport jerseys for participants.',
    activity_date: new Date(Date.now() - 3600000 * 12).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'act-1',
    club_id: 'club-1',
    title: 'CPCCU Hackathon Registration Crosses 120 Teams',
    description: 'Teams from 8 faculties have registered for the 48-hour challenge. Problem statements drop this Friday.',
    activity_date: '2026-05-10T14:00:00Z',
    created_at: '2026-05-10T14:00:00Z',
  },
  {
    id: 'act-2',
    club_id: 'club-4',
    title: 'Robotics Autonomous Rover Achieves 100% Obstacle Avoidance',
    description: 'Successful test runs in the Engineering Quad. Hardware documentation posted to GitHub.',
    activity_date: '2026-05-08T16:30:00Z',
    created_at: '2026-05-08T16:30:00Z',
  },
  {
    id: 'act-3',
    club_id: 'club-2',
    title: 'CPCC Gallery Photo Submissions Shortlist Finalized',
    description: '35 winning student photographs printed and mounted for the exhibition opening.',
    activity_date: '2026-05-06T11:00:00Z',
    created_at: '2026-05-06T11:00:00Z',
  },
];

function getFallbackActivities(): ClubActivity[] {
  const now = Date.now();
  return FALLBACK_ACTIVITIES.map((activity, index) => {
    const createdAt = new Date(now - (index + 1) * 24 * 60 * 60 * 1000).toISOString();
    return { ...activity, activity_date: createdAt, created_at: createdAt };
  });
}

// ─── getEvents ───────────────────────────────────────────────
export async function getEvents(): Promise<ActionResponse<EventWithClub[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('events').select('*');

    if (error || !data || data.length === 0) {
      return { success: true, data: getFallbackEvents() };
    }

    // Adapt database records to standard EventWithClub format
    const adapted: EventWithClub[] = data.map((rowRecord: unknown) => {
      const row = rowRecord as Record<string, unknown>;
      const titleStr = typeof row.title === 'string' ? row.title : '';
      const descStr = typeof row.description === 'string' ? row.description : '';
      const clubNameStr = typeof row.club_name === 'string' ? row.club_name : '';
      const locationStr = typeof row.location === 'string' ? row.location : '';
      const startsAtStr = typeof row.starts_at === 'string' ? row.starts_at : typeof row.date === 'string' ? row.date : '2026-05-15T10:00:00Z';
      const endsAtStr = typeof row.ends_at === 'string' ? row.ends_at : null;
      const coverUrlStr = typeof row.cover_url === 'string' ? row.cover_url : null;
      const createdByStr = typeof row.created_by === 'string' ? row.created_by : null;
      const createdAtStr = typeof row.created_at === 'string' ? row.created_at : '2026-01-01T00:00:00Z';
      const updatedAtStr = typeof row.updated_at === 'string' ? row.updated_at : '2026-01-01T00:00:00Z';
      const maxCap = typeof row.max_capacity === 'number' ? row.max_capacity : 100;

      const storedStatus = typeof row.status === 'string' ? row.status.toLowerCase() : '';
      const startsAt = Date.parse(startsAtStr);
      const endsAt = endsAtStr ? Date.parse(endsAtStr) : startsAt + 3 * 60 * 60 * 1000;
      const status: EventWithClub['status'] =
        storedStatus === 'cancelled'
          ? 'cancelled'
          : storedStatus === 'completed' || endsAt < Date.now()
            ? 'completed'
            : startsAt <= Date.now()
              ? 'ongoing'
              : 'upcoming';

      const isGym =
        clubNameStr.toLowerCase().includes('gym') ||
        locationStr.toLowerCase().includes('gym') ||
        titleStr.toLowerCase().includes('gym') ||
        titleStr.toLowerCase().includes('basketball') ||
        titleStr.toLowerCase().includes('fitness');

      const clubId = isGym ? 'club-gym' : String(row.club_id || clubNameStr || 'club-1');
      const resolvedClubName = isGym
        ? 'Campus Gymnasium & Sports Federation'
        : (clubNameStr || 'City University Club');

      return {
        id: String(row.id),
        club_id: clubId,
        title: titleStr || 'Campus Event',
        description: descStr || null,
        location: locationStr || 'City University Campus',
        starts_at: startsAtStr,
        ends_at: endsAtStr,
        status,
        max_capacity: maxCap,
        cover_url: coverUrlStr,
        created_by: createdByStr,
        created_at: createdAtStr,
        updated_at: updatedAtStr,
        clubs: {
          id: clubId,
          name: resolvedClubName,
          logo_url: null,
        },
      };
    });

    // Merge with full catalog of events across all statuses (upcoming, ongoing, completed)
    const combined = [...adapted];
    for (const fb of getFallbackEvents()) {
      if (!combined.some((e) => e.title.toLowerCase().trim() === fb.title.toLowerCase().trim())) {
        combined.push(fb);
      }
    }

    return { success: true, data: combined };
  } catch {
    return { success: true, data: getFallbackEvents() };
  }
}

// ─── getClubs ─────────────────────────────────────────────────
export async function getClubs(): Promise<ActionResponse<Club[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('clubs').select('*');

    if (error || !data || data.length === 0) {
      return { success: true, data: FALLBACK_CLUBS };
    }

    const adapted: Club[] = data.map((rowRecord: unknown) => {
      const row = rowRecord as Record<string, unknown>;
      return {
        id: String(row.id),
        name: (row.name as string) || 'Club',
        description: (row.description as string) || null,
        category: (row.category as string) || 'General',
        logo_url: (row.logo_url as string) || null,
        banner_url: (row.banner_url as string) || null,
        lead_name: (row.lead_name as string) || 'Executive Committee',
        member_count: typeof row.member_count === 'number' ? row.member_count : 150,
        created_by: (row.created_by as string) || null,
        created_at: (row.created_at as string) || '2026-01-01T00:00:00Z',
        updated_at: (row.updated_at as string) || '2026-01-01T00:00:00Z',
      };
    });

    // Merge with full directory
    const combined = [...adapted];
    for (const fb of FALLBACK_CLUBS) {
      if (!combined.some((c) => c.name.toLowerCase().includes(fb.name.toLowerCase().substring(0, 10)))) {
        combined.push(fb);
      }
    }

    return { success: true, data: combined };
  } catch {
    return { success: true, data: FALLBACK_CLUBS };
  }
}

// ─── getClubActivities ────────────────────────────────────────
export async function getClubActivities(): Promise<ActionResponse<ClubActivity[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('club_activities').select('*');

    if (error || !data || data.length === 0) {
      return { success: true, data: getFallbackActivities() };
    }
    return { success: true, data: data as ClubActivity[] };
  } catch {
    return { success: true, data: getFallbackActivities() };
  }
}

// ─── createRsvp ───────────────────────────────────────────────
export async function createRsvp(payload: { event_id: string }): Promise<ActionResponse<Rsvp>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Sign in with Google to save an RSVP and receive a pass.' };
    }
    if (!payload.event_id) {
      return { success: false, error: 'Choose a valid event before registering.' };
    }

    const { data, error } = await supabase.from('rsvps').insert({
      event_id: payload.event_id,
      user_id: user.id,
      status: 'registered',
    }).select().single();

    if (error || !data) {
      return { success: false, error: error?.message ?? 'Could not save your RSVP.' };
    }

    revalidatePath('/clubs');
    revalidatePath('/dashboard/clubs');
    return { success: true, data: data as Rsvp };
  } catch {
    return { success: false, error: 'Could not save your RSVP. Please try again.' };
  }
}

// ─── cancelRsvp ───────────────────────────────────────────────
export async function cancelRsvp(rsvp_id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Sign in to cancel your RSVP.' };
    }
    const { error } = await supabase
      .from('rsvps')
      .update({ status: 'cancelled' })
      .eq('id', rsvp_id)
      .eq('user_id', user.id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/clubs');
    return { success: true };
  } catch {
    return { success: false, error: 'Could not cancel your RSVP. Please try again.' };
  }
}

// ─── getUserRsvps ─────────────────────────────────────────────
export async function getUserRsvps(): Promise<ActionResponse<Rsvp[]>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Sign in to view your RSVPs.' };
    }
    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as Rsvp[] };
  } catch {
    return { success: false, error: 'Could not load your RSVPs.' };
  }
}
