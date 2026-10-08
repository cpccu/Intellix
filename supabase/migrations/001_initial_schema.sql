-- ============================================================
--  CampusOS · City University — Supabase SQL Migration
--  Covers all 4 Core Modules:
--    1. Club & Event Engine (clubs, events, club_activities, rsvps)
--    2. Resource Hub (resources)
--    3. Smart Helpdesk (faqs, helpdesk_queries)
--    4. Lost & Found / Complaint Box (lost_found_items, complaints)
-- ============================================================

-- ─────────────────────────────────────────
-- 0. Extensions
-- ─────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─────────────────────────────────────────
-- 1. ENUM types
-- ─────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role           AS ENUM ('student','admin','guest');
  CREATE TYPE event_status        AS ENUM ('upcoming','ongoing','cancelled','completed');
  CREATE TYPE rsvp_status         AS ENUM ('registered','cancelled','attended');
  CREATE TYPE resource_category   AS ENUM ('notes','notices','past_questions','other');
  CREATE TYPE helpdesk_category   AS ENUM ('bus_schedule','campus_rules','exam_logistics','facilities','academic','general');
  CREATE TYPE helpdesk_status     AS ENUM ('pending','answered','closed');
  CREATE TYPE lost_found_type     AS ENUM ('lost','found');
  CREATE TYPE lost_found_status   AS ENUM ('open','claimed','resolved');
  CREATE TYPE lost_found_cat      AS ENUM ('electronics','id_cards','books_notes','clothing','keys','accessories','other');
  CREATE TYPE complaint_category  AS ENUM ('facility','academic','hostel','administrative','security','other');
  CREATE TYPE complaint_status    AS ENUM ('pending','in_investigation','resolved','dismissed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────
-- 2. PROFILES (extends auth.users)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  avatar_url    TEXT,
  matric_number TEXT UNIQUE,
  department    TEXT,
  role          user_role NOT NULL DEFAULT 'student',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─────────────────────────────────────────
-- 3. MODULE 1: CLUBS, EVENTS & ACTIVITIES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clubs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT,
  logo_url    TEXT,
  banner_url  TEXT,
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id      UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  location     TEXT,
  starts_at    TIMESTAMPTZ NOT NULL,
  ends_at      TIMESTAMPTZ,
  status       event_status NOT NULL DEFAULT 'upcoming',
  max_capacity INT CHECK (max_capacity > 0),
  cover_url    TEXT,
  created_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.club_activities (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id       UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  activity_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rsvps (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id   UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status     rsvp_status NOT NULL DEFAULT 'registered',
  pass_code  TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- ─────────────────────────────────────────
-- 4. MODULE 2: RESOURCE HUB
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.resources (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  category    resource_category NOT NULL DEFAULT 'other',
  file_url    TEXT,
  file_type   TEXT DEFAULT 'PDF',
  course_code TEXT,
  department  TEXT,
  year        INT CHECK (year BETWEEN 1900 AND 2100),
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fts         TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(course_code,''))
  ) STORED
);

-- ─────────────────────────────────────────
-- 5. MODULE 3: SMART HELPDESK & FAQS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.faqs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  category    helpdesk_category NOT NULL DEFAULT 'general',
  tags        TEXT[],
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.helpdesk_queries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  category    helpdesk_category NOT NULL DEFAULT 'general',
  status      helpdesk_status NOT NULL DEFAULT 'pending',
  answer      TEXT,
  resolved_at TIMESTAMPTZ,
  created_by  TEXT DEFAULT 'guest',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 6. MODULE 4: LOST & FOUND / COMPLAINTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lost_found_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  category      lost_found_cat NOT NULL DEFAULT 'other',
  item_type     lost_found_type NOT NULL DEFAULT 'found',
  location      TEXT NOT NULL,
  incident_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status        lost_found_status NOT NULL DEFAULT 'open',
  contact_info  TEXT NOT NULL,
  image_url     TEXT,
  created_by    TEXT DEFAULT 'guest',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.complaints (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  description      TEXT NOT NULL,
  category         complaint_category NOT NULL DEFAULT 'other',
  status           complaint_status NOT NULL DEFAULT 'pending',
  department       TEXT,
  tracking_number  TEXT UNIQUE NOT NULL,
  resolution_notes TEXT,
  is_anonymous     BOOLEAN NOT NULL DEFAULT FALSE,
  created_by       TEXT DEFAULT 'guest',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 7. INDEXES
-- ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_events_club_id        ON public.events(club_id);
CREATE INDEX IF NOT EXISTS idx_events_starts_at      ON public.events(starts_at DESC);
CREATE INDEX IF NOT EXISTS idx_rsvps_event_id        ON public.rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_resources_category    ON public.resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_fts         ON public.resources USING GIN(fts);
CREATE INDEX IF NOT EXISTS idx_faqs_category         ON public.faqs(category);
CREATE INDEX IF NOT EXISTS idx_helpdesk_status       ON public.helpdesk_queries(status);
CREATE INDEX IF NOT EXISTS idx_lost_found_status     ON public.lost_found_items(status);
CREATE INDEX IF NOT EXISTS idx_complaints_track      ON public.complaints(tracking_number);

-- ─────────────────────────────────────────
-- 8. RLS POLICIES
-- ─────────────────────────────────────────
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_activities  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (id = (SELECT auth.uid()));
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, avatar_url, matric_number, department, updated_at)
  ON public.profiles TO authenticated;

CREATE POLICY "clubs_read" ON public.clubs
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "events_read" ON public.events
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "act_read" ON public.club_activities
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "rsvps_select_own" ON public.rsvps
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "rsvps_insert_own" ON public.rsvps
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "rsvps_update_own" ON public.rsvps
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "res_read" ON public.resources
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "res_insert_own" ON public.resources
  FOR INSERT TO authenticated WITH CHECK (uploaded_by = (SELECT auth.uid()));
CREATE POLICY "res_delete_own" ON public.resources
  FOR DELETE TO authenticated USING (uploaded_by = (SELECT auth.uid()));

CREATE POLICY "faqs_read" ON public.faqs
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "help_select_own" ON public.helpdesk_queries
  FOR SELECT TO authenticated USING (created_by = (SELECT auth.uid())::text);
CREATE POLICY "help_insert_own" ON public.helpdesk_queries
  FOR INSERT TO authenticated WITH CHECK (created_by = (SELECT auth.uid())::text);

CREATE POLICY "lf_read" ON public.lost_found_items
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "lf_insert_own" ON public.lost_found_items
  FOR INSERT TO authenticated WITH CHECK (created_by = (SELECT auth.uid())::text);
CREATE POLICY "lf_update_own" ON public.lost_found_items
  FOR UPDATE TO authenticated
  USING (created_by = (SELECT auth.uid())::text)
  WITH CHECK (created_by = (SELECT auth.uid())::text);

CREATE POLICY "cmp_select_own" ON public.complaints
  FOR SELECT TO authenticated USING (created_by = (SELECT auth.uid())::text);
CREATE POLICY "cmp_insert_own" ON public.complaints
  FOR INSERT TO authenticated WITH CHECK (created_by = (SELECT auth.uid())::text);

-- ─────────────────────────────────────────
-- 9. RICH SEED DATA (Ready to Run)
-- ─────────────────────────────────────────

-- Clubs
INSERT INTO public.clubs (id, name, description, logo_url) VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Computer Science Society (CSS)', 'The premier tech community for CS students — hackathons, coding bootcamps, and AI talks.', NULL),
  ('a1b2c3d4-0000-0000-0000-000000000008', 'Robotics & Engineering Club', 'Build, program and compete with autonomous rovers and drones.', NULL),
  ('a1b2c3d4-0000-0000-0000-000000000002', 'Debate & Public Speaking Club', 'Sharpen rhetoric, critical thinking and stage presence.', NULL),
  ('a1b2c3d4-0000-0000-0000-000000000003', 'Drama & Arts Guild', 'Theatre productions, spoken word poetry, and visual arts.', NULL),
  ('a1b2c3d4-0000-0000-0000-000000000006', 'Music & Performing Arts Society', 'Acoustic sessions, ensembles, and annual campus concerts.', NULL),
  ('a1b2c3d4-0000-0000-0000-000000000004', 'Sports Federation', 'Inter-faculty leagues: football, basketball, athletics.', NULL),
  ('a1b2c3d4-0000-0000-0000-000000000007', 'Chess & Strategy Club', 'Blitz chess, rating workshops, and strategic game nights.', NULL),
  ('a1b2c3d4-0000-0000-0000-000000000005', 'Entrepreneurship & Innovation Hub', 'Pitch demo days, startup mentorship, and student seed funding.', NULL)
ON CONFLICT (id) DO NOTHING;

-- Events
INSERT INTO public.events (club_id, title, description, location, starts_at, ends_at, status, max_capacity) VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', 'CampusOS Hackathon 2026', 'Flagship 48-hour hackathon themed "AI for Education". ₦500k in prizes.', 'Faculty of Computing — Lab A', NOW() + INTERVAL '3 days', NOW() + INTERVAL '5 days', 'upcoming', 150),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Hands-on AI Workshop: LLMs & Modern Web', 'Integrating function calling and full-stack Next.js apps.', 'Online — Google Meet', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '3 hours', 'upcoming', 80),
  ('a1b2c3d4-0000-0000-0000-000000000002', 'Inter-Faculty Debate Championship', 'Eight faculties compete in knockout rounds.', 'Senate Hall', NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days' + INTERVAL '4 hours', 'upcoming', 200),
  ('a1b2c3d4-0000-0000-0000-000000000004', 'Inter-Faculty Football Derby: Computing vs Law', 'The classic rivalry derby kicks off the semester championship.', 'University Sports Stadium', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '4 hours', 'upcoming', 800)
ON CONFLICT DO NOTHING;

-- Resources
INSERT INTO public.resources (title, description, category, course_code, department, year) VALUES
  ('Data Structures & Algorithms — Complete Lecture Notes', 'Arrays, linked lists, trees, graphs, dynamic programming.', 'notes', 'CSC301', 'Computer Science', 2025),
  ('Calculus II & Differential Equations — Study Guide', 'Integration by parts, Laplace transforms, and series expansions.', 'notes', 'MTH202', 'Mathematics', 2025),
  ('Database Systems Past Questions 2019–2024', 'Five years of CSC401 past exam questions with selected solutions.', 'past_questions', 'CSC401', 'Computer Science', 2024),
  ('Faculty Notice: First Semester Examination Schedule 2025/2026', 'Official exam timetable for Faculty of Computing.', 'notices', NULL, 'Computer Science', 2025)
ON CONFLICT DO NOTHING;

-- FAQs
INSERT INTO public.faqs (question, answer, category, tags) VALUES
  ('What are the campus shuttle bus hours and routes?', 'Shuttles operate Mon–Fri 6:30 AM – 9:30 PM and Sat 8:00 AM – 5:00 PM. Route A (Main Gate ↔ Library ↔ Computing, every 15 mins). Free with Student ID.', 'bus_schedule', ARRAY['bus','shuttle','transport']),
  ('What are the official library operating hours and quiet zone policies?', 'Mon–Sat 8:00 AM – 10:00 PM; 24/7 during exam weeks. Floors 3–4 are Absolute Silent Zones.', 'campus_rules', ARRAY['library','hours','rules']),
  ('What are the examination hall admission rules and prohibited items?', 'Arrive 30 mins before start with printed Docket and ID. Mobile phones and smartwatches are strictly barred.', 'exam_logistics', ARRAY['exams','hall rules','docket'])
ON CONFLICT DO NOTHING;
