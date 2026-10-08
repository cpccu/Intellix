import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Supabase OAuth callback handler.
 * After Google sign-in, Supabase redirects here with a code.
 * We exchange it for a session and redirect to the dashboard.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  // Avoid open redirects by ensuring the next path starts with a slash
  let next = searchParams.get('next') ?? '/dashboard';
  if (!next.startsWith('/')) {
    next = '/dashboard';
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = next;
      redirectUrl.search = '';
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Something went wrong — redirect to login with an error hint
  const errorUrl = request.nextUrl.clone();
  errorUrl.pathname = '/login';
  errorUrl.search = '?error=auth_callback_failed';
  return NextResponse.redirect(errorUrl);
}
