'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { ActionResponse, Profile, SessionUser } from '@/types';

// ─── Schemas ──────────────────────────────────────────────────
const ProfileUpdateSchema = z.object({
  full_name: z.string().min(2).max(120).optional(),
  matric_number: z.string().max(20).optional(),
  department: z.string().max(80).optional(),
});

// ─── signInWithGoogle ─────────────────────────────────────────
export async function signInWithGoogle(): Promise<ActionResponse<{ url: string }>> {
  try {
    const supabase = await createClient();

    // Safely determine the origin for the callback URL (auto-detects production host)
    let origin = process.env.NEXT_PUBLIC_APP_URL;
    if (!origin || (process.env.NODE_ENV === 'production' && origin.includes('localhost'))) {
      const headersList = await headers();
      const host = headersList.get('x-forwarded-host') || headersList.get('host');
      const protocol = headersList.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
      origin = host ? `${protocol}://${host}` : 'http://localhost:3000';
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });

    if (error) return { success: false, error: error.message };
    return { success: true, data: { url: data.url } };
  } catch {
    return { success: false, error: 'Unexpected error during sign-in.' };
  }
}

// ─── enterGuestMode ───────────────────────────────────────────
export async function enterGuestMode(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('guest_mode', 'true', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
    sameSite: 'lax',
  });
  redirect('/dashboard');
}

// ─── signOut ──────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  const cookieStore = await cookies();

  await supabase.auth.signOut();
  cookieStore.delete('guest_mode');
  redirect('/login');
}

// ─── getSessionUser ───────────────────────────────────────────
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const isGuest = cookieStore.get('guest_mode')?.value === 'true';

    if (isGuest) {
      return {
        id: 'guest',
        email: null,
        profile: null,
        isGuest: true,
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email ?? null,
      profile: profile as Profile | null,
      isGuest: false,
    };
  } catch {
    return null;
  }
}

// ─── updateProfile ────────────────────────────────────────────
export async function updateProfile(
  formData: FormData
): Promise<ActionResponse<Profile>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'You must be signed in to update your profile.' };
    }

    const raw = {
      full_name: formData.get('full_name') as string | undefined,
      matric_number: formData.get('matric_number') as string | undefined,
      department: formData.get('department') as string | undefined,
    };

    const parsed = ProfileUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/dashboard');
    return { success: true, data: data as Profile };
  } catch {
    return { success: false, error: 'Unexpected error updating profile.' };
  }
}
