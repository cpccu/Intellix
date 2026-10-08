# CampusOS

CampusOS is a student portal prototype for campus events, clubs, academic resources, helpdesk questions, and lost-and-found reports. Guest mode supports interactive demos saved only in the current browser. Sign in with Google to save data to Supabase.

## Requirements

- Node.js 20.9 or newer
- npm
- A Supabase project
- A Google OAuth client configured as a Supabase sign-in provider

## Run locally

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Copy `.env.example` to `.env.local` and set:

   - `NEXT_PUBLIC_SUPABASE_URL`: your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the project’s publishable/anon key
   - `NEXT_PUBLIC_APP_URL`: `http://localhost:3000` for local development

3. In the Supabase SQL Editor, run these files in order:

   1. `supabase/migrations/001_initial_schema.sql`
   2. `supabase/migrations/002_secure_access_policies.sql`
   3. `supabase/seed.sql`

   The seed file uses relative dates for its sample events, so rerunning it refreshes upcoming dates.

4. In Supabase Authentication, enable Google and add `http://localhost:3000/auth/callback` to the allowed redirect URLs. For a deployed site, add its `/auth/callback` URL and set `NEXT_PUBLIC_APP_URL` to the deployed origin.

5. Start the app:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Choose **Continue as Guest** to try the demo interactions; demo RSVPs and submissions stay in that browser. Sign in with Google to save RSVPs, inquiries, complaints, and reports to Supabase.

## Production deployment

Before deploying to a Next.js-compatible host:

1. Set these environment variables in the hosting project:
   - `NEXT_PUBLIC_SUPABASE_URL`: the URL for the Supabase project used by this deployment
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: that project's publishable/anon key
   - `NEXT_PUBLIC_APP_URL`: the deployed site's HTTPS origin, with no trailing path (for example, `https://campus.example.edu`)
2. In the matching Supabase project, run `supabase/migrations/001_initial_schema.sql` and then `supabase/migrations/002_secure_access_policies.sql`. Run `supabase/seed.sql` only when the deployment should include the supplied demo records.
3. In Supabase Authentication URL Configuration, set the Site URL to the deployed origin and add `https://<deployed-domain>/auth/callback` to the redirect URL allowlist.
4. Confirm Google is enabled as an Auth provider and that its authorized redirect URI points to the Supabase Auth callback shown in that project's provider settings.
5. Deploy, then smoke-check guest navigation and demo submissions, Google sign-in, an RSVP, helpdesk submission, lost-and-found submission, and resource downloads.

Use the same Supabase project for the hosting environment and its Auth URLs. Do not apply the demo seed to a live campus database unless those sample records are intended there.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

Lost-and-found posts include their contact details in the public campus feed. Only sign-in users can create or update records. Profiles, helpdesk inquiries, complaints, and RSVPs are scoped to their owner by row-level security. Apply the secure access migration before using any existing database with real accounts.
