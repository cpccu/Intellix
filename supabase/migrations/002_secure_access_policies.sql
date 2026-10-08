-- Replace the permissive policies from earlier CampusOS deployments.
-- Apply after 001_initial_schema.sql before enabling real student accounts.

DROP POLICY IF EXISTS "profiles_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "clubs_read" ON public.clubs;
DROP POLICY IF EXISTS "events_read" ON public.events;
DROP POLICY IF EXISTS "act_read" ON public.club_activities;
DROP POLICY IF EXISTS "rsvps_read" ON public.rsvps;
DROP POLICY IF EXISTS "rsvps_insert" ON public.rsvps;
DROP POLICY IF EXISTS "rsvps_select_own" ON public.rsvps;
DROP POLICY IF EXISTS "rsvps_insert_own" ON public.rsvps;
DROP POLICY IF EXISTS "rsvps_update_own" ON public.rsvps;
DROP POLICY IF EXISTS "res_read" ON public.resources;
DROP POLICY IF EXISTS "res_insert" ON public.resources;
DROP POLICY IF EXISTS "res_insert_own" ON public.resources;
DROP POLICY IF EXISTS "res_delete_own" ON public.resources;
DROP POLICY IF EXISTS "faqs_read" ON public.faqs;
DROP POLICY IF EXISTS "help_read" ON public.helpdesk_queries;
DROP POLICY IF EXISTS "help_insert" ON public.helpdesk_queries;
DROP POLICY IF EXISTS "help_select_own" ON public.helpdesk_queries;
DROP POLICY IF EXISTS "help_insert_own" ON public.helpdesk_queries;
DROP POLICY IF EXISTS "lf_read" ON public.lost_found_items;
DROP POLICY IF EXISTS "lf_insert" ON public.lost_found_items;
DROP POLICY IF EXISTS "lf_update" ON public.lost_found_items;
DROP POLICY IF EXISTS "lf_insert_own" ON public.lost_found_items;
DROP POLICY IF EXISTS "lf_update_own" ON public.lost_found_items;
DROP POLICY IF EXISTS "cmp_read" ON public.complaints;
DROP POLICY IF EXISTS "cmp_insert" ON public.complaints;
DROP POLICY IF EXISTS "cmp_select_own" ON public.complaints;
DROP POLICY IF EXISTS "cmp_insert_own" ON public.complaints;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (id = (SELECT auth.uid()));
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

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

-- A row policy alone would let a user change their own role column.
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, avatar_url, matric_number, department, updated_at)
  ON public.profiles TO authenticated;
