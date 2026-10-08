// ─────────────────────────────────────────────────────────────
//  CampusOS — strict TypeScript interfaces (maps 1:1 to DB)
// ─────────────────────────────────────────────────────────────

// ── Enums ────────────────────────────────────────────────────
export type UserRole = 'student' | 'admin' | 'guest';
export type EventStatus = 'upcoming' | 'ongoing' | 'cancelled' | 'completed';
export type RsvpStatus = 'registered' | 'cancelled' | 'attended';
export type ResourceCategory = 'notes' | 'notices' | 'past_questions' | 'other';

export type HelpdeskCategory =
  | 'bus_schedule'
  | 'campus_rules'
  | 'exam_logistics'
  | 'facilities'
  | 'academic'
  | 'general';

export type HelpdeskQueryStatus = 'pending' | 'answered' | 'closed';

export type LostFoundType = 'lost' | 'found';
export type LostFoundStatus = 'open' | 'claimed' | 'resolved';
export type LostFoundCategory =
  | 'electronics'
  | 'id_cards'
  | 'books_notes'
  | 'clothing'
  | 'keys'
  | 'accessories'
  | 'other';

export type ComplaintCategory =
  | 'facility'
  | 'academic'
  | 'hostel'
  | 'administrative'
  | 'security'
  | 'other';

export type ComplaintStatus =
  | 'pending'
  | 'in_investigation'
  | 'resolved'
  | 'dismissed';

// ── Tables: Users & Profiles ───────────────────────────────────
export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  matric_number: string | null;
  department: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// ── Tables: Module 1 — Clubs & Events ──────────────────────────
export interface Club {
  id: string;
  name: string;
  description: string | null;
  category?: string | null;
  logo_url: string | null;
  banner_url: string | null;
  lead_name?: string | null;
  member_count?: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  club_id: string | null;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  status: EventStatus;
  max_capacity: number | null;
  cover_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClubActivity {
  id: string;
  club_id: string;
  title: string;
  description: string;
  activity_date: string;
  created_at: string;
}

export interface Rsvp {
  id: string;
  event_id: string;
  user_id: string;
  status: RsvpStatus;
  pass_code: string | null;
  created_at: string;
}

// ── Tables: Module 2 — Resource Hub ────────────────────────────
export interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: ResourceCategory;
  file_url: string | null;
  file_type: string | null;
  course_code: string | null;
  department: string | null;
  year: number | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── Tables: Module 3 — Smart Helpdesk ──────────────────────────
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: HelpdeskCategory;
  tags?: string[];
  created_at: string;
}

export interface HelpdeskQuery {
  id: string;
  title: string;
  content: string;
  category: HelpdeskCategory;
  status: HelpdeskQueryStatus;
  answer: string | null;
  resolved_at: string | null;
  created_by: string | null;
  created_at: string;
}

// ── Tables: Module 4 — Lost & Found & Complaints ────────────────
export interface LostFoundItem {
  id: string;
  title: string;
  description: string;
  category: LostFoundCategory;
  item_type: LostFoundType;
  location: string;
  incident_date: string;
  status: LostFoundStatus;
  contact_info: string;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ComplaintItem {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  department: string | null;
  tracking_number: string;
  resolution_notes: string | null;
  is_anonymous: boolean;
  created_by: string | null;
  created_at: string;
}

// ── Enriched / joined views ───────────────────────────────────
export interface EventWithClub extends Event {
  clubs: Pick<Club, 'id' | 'name' | 'logo_url'> | null;
}

export interface RsvpWithEvent extends Rsvp {
  events: Pick<Event, 'id' | 'title' | 'starts_at' | 'location'> | null;
}

// ── Server Action response wrapper ────────────────────────────
export interface ActionResponse<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

// ── Session / auth context ─────────────────────────────────────
export interface SessionUser {
  id: string;
  email: string | null;
  profile: Profile | null;
  isGuest: boolean;
}
