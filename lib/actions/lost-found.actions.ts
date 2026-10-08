'use server';

import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type {
  ActionResponse,
  ComplaintCategory,
  ComplaintItem,
  LostFoundCategory,
  LostFoundItem,
  LostFoundType,
} from '@/types';

// ── Fallback Mock Data ───────────────────────────────────────
const FALLBACK_LOST_FOUND: LostFoundItem[] = [
  {
    id: 'lf-1',
    title: 'Casio Scientific Calculator fx-991EX ClassWiz',
    description:
      'Left on Desk 14 in Computing Lab A after CSC301 practicals. Has a small sticker with "CS-2025" on the rear battery lid.',
    category: 'electronics',
    item_type: 'found',
    location: 'Computing Lab A — Desk 14',
    incident_date: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'open',
    contact_info: 'Security Post 2 / Lab Attendant (Mr. Emmanuel)',
    image_url: null,
    created_by: 'guest',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'lf-2',
    title: 'Blue Student ID Card with Navy Lanyard',
    description:
      'Student ID for Ibrahim Alabi (Matric: CU/2023/4192, Faculty of Law). Dropped near the Central Library turnstile.',
    category: 'id_cards',
    item_type: 'found',
    location: 'Central Library Main Entrance',
    incident_date: new Date(Date.now() - 3600000 * 18).toISOString(),
    status: 'open',
    contact_info: 'Library Reception Desk',
    image_url: null,
    created_by: 'guest',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'lf-3',
    title: 'Black Lenovo USB-C 65W Laptop Charger',
    description:
      'Lost during the Python Workshop in Faculty of Computing Lab B. Black braided cord with a red zip tie.',
    category: 'electronics',
    item_type: 'lost',
    location: 'Faculty of Computing Lab B',
    incident_date: new Date(Date.now() - 3600000 * 28).toISOString(),
    status: 'open',
    contact_info: 'chinedu.k@student.cityuni.edu.ng / 08012345678',
    image_url: null,
    created_by: 'guest',
    created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
  },
  {
    id: 'lf-4',
    title: 'Spiral Bound MTH202 & CSC301 Handwritten Notes',
    description:
      'Hardcover yellow spiral notebook containing all midterm lecture summaries and practice test questions.',
    category: 'books_notes',
    item_type: 'lost',
    location: 'Cafeteria Annex Benches',
    incident_date: new Date(Date.now() - 3600000 * 42).toISOString(),
    status: 'open',
    contact_info: 'WhatsApp: 08198765432',
    image_url: null,
    created_by: 'guest',
    created_at: new Date(Date.now() - 3600000 * 42).toISOString(),
  },
  {
    id: 'lf-5',
    title: 'Set of 3 Keys with Honda Logo Keychain',
    description:
      'Found near the Sports Complex basketball court bleachers after the intramural match.',
    category: 'keys',
    item_type: 'found',
    location: 'Sports Complex Basketball Court',
    incident_date: new Date(Date.now() - 3600000 * 70).toISOString(),
    status: 'claimed',
    contact_info: 'Sports Office — Coach Williams',
    image_url: null,
    created_by: 'guest',
    created_at: new Date(Date.now() - 3600000 * 70).toISOString(),
  },
];

const FALLBACK_COMPLAINTS: ComplaintItem[] = [
  {
    id: 'cmp-1',
    title: 'Air conditioning malfunction in Lecture Theatre 3 (LT-3)',
    description:
      'The central AC units in LT-3 have been blowing warm air during afternoon lectures, making classes difficult for 200+ students.',
    category: 'facility',
    status: 'in_investigation',
    department: 'Works & Physical Planning',
    tracking_number: 'CU-CMP-8421',
    resolution_notes:
      'Maintenance team dispatched for HVAC filter replacement and compressor diagnostics.',
    is_anonymous: false,
    created_by: 'guest',
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    id: 'cmp-2',
    title: 'Intermittent campus WiFi dropouts in Block B Hostel study rooms',
    description:
      'Students on the 2nd and 3rd floors experience frequent disconnects between 7 PM and 11 PM.',
    category: 'facility',
    status: 'resolved',
    department: 'Information Communication Technology (ICT)',
    tracking_number: 'CU-CMP-7102',
    resolution_notes:
      'Access points restarted and firmware upgraded on Block B mesh nodes. Bandwidth allocation doubled.',
    is_anonymous: true,
    created_by: 'guest',
    created_at: new Date(Date.now() - 3600000 * 60).toISOString(),
  },
  {
    id: 'cmp-3',
    title: 'Defective digital projector in Science Complex Room 102',
    description:
      'Projector display flickers and shuts down after 15 minutes of operation.',
    category: 'academic',
    status: 'pending',
    department: 'Audio-Visual Support Unit',
    tracking_number: 'CU-CMP-9034',
    resolution_notes: null,
    is_anonymous: false,
    created_by: 'guest',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

// ── Validation Schemas ───────────────────────────────────────
const LostFoundReportSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(8).max(1000),
  category: z.enum([
    'electronics',
    'id_cards',
    'books_notes',
    'clothing',
    'keys',
    'accessories',
    'other',
  ]),
  item_type: z.enum(['lost', 'found']),
  location: z.string().min(2).max(120),
  contact_info: z.string().min(3).max(150),
});

const ComplaintSubmitSchema = z.object({
  title: z.string().min(5).max(150),
  description: z.string().min(15).max(1500),
  category: z.enum(['facility', 'academic', 'hostel', 'administrative', 'security', 'other']),
  department: z.string().max(80).optional(),
  is_anonymous: z.boolean().default(false),
});

// ── getLostFoundItems ────────────────────────────────────────
export async function getLostFoundItems(
  type?: LostFoundType,
  category?: LostFoundCategory
): Promise<ActionResponse<LostFoundItem[]>> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    let items = FALLBACK_LOST_FOUND;
    if (type) items = items.filter((item) => item.item_type === type);
    if (category) items = items.filter((item) => item.category === category);
    return { success: true, data: items };
  }
  try {
    const supabase = await createClient();
    let query = supabase
      .from('lost_found_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (type) query = query.eq('item_type', type);
    if (category) query = query.eq('category', category);

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      let items = FALLBACK_LOST_FOUND;
      if (type) items = items.filter((i) => i.item_type === type);
      if (category) items = items.filter((i) => i.category === category);
      return { success: true, data: items };
    }

    return { success: true, data: data as LostFoundItem[] };
  } catch {
    let items = FALLBACK_LOST_FOUND;
    if (type) items = items.filter((i) => i.item_type === type);
    if (category) items = items.filter((i) => i.category === category);
    return { success: true, data: items };
  }
}

// ── reportLostFoundItem ──────────────────────────────────────
export async function reportLostFoundItem(
  formData: FormData
): Promise<ActionResponse<LostFoundItem>> {
  try {
    const raw = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as LostFoundCategory,
      item_type: formData.get('item_type') as LostFoundType,
      location: formData.get('location') as string,
      contact_info: formData.get('contact_info') as string,
    };

    const parsed = LostFoundReportSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Sign in with Google to save a lost or found report.' };
    }

    const newItem: Partial<LostFoundItem> = {
      ...parsed.data,
      incident_date: new Date().toISOString(),
      status: 'open',
      image_url: null,
      created_by: user.id,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('lost_found_items')
      .insert(newItem)
      .select()
      .single();

    revalidatePath('/lost-found');
    revalidatePath('/dashboard/lost-found');

    if (error || !data) {
      return { success: false, error: error?.message ?? 'Could not save this report.' };
    }

    return { success: true, data: data as LostFoundItem };
  } catch {
    return { success: false, error: 'Could not save this report. Please try again.' };
  }
}

// ── claimItem ────────────────────────────────────────────────
export async function claimItem(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Sign in with Google to update an item.' };
    }
    const { data, error } = await supabase
      .from('lost_found_items')
      .update({ status: 'claimed' })
      .eq('id', id)
      .eq('created_by', user.id)
      .select('id')
      .maybeSingle();

    revalidatePath('/lost-found');
    revalidatePath('/dashboard/lost-found');

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Only the person who reported this item can update it.' };
    return { success: true };
  } catch {
    return { success: false, error: 'Could not update this item. Please try again.' };
  }
}

// ── getComplaints ────────────────────────────────────────────
export async function getComplaints(): Promise<ActionResponse<ComplaintItem[]>> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { success: true, data: FALLBACK_COMPLAINTS };
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return { success: true, data: FALLBACK_COMPLAINTS };
    }

    return { success: true, data: data as ComplaintItem[] };
  } catch {
    return { success: true, data: FALLBACK_COMPLAINTS };
  }
}

// ── submitComplaint ──────────────────────────────────────────
export async function submitComplaint(
  formData: FormData
): Promise<ActionResponse<ComplaintItem>> {
  try {
    const isAnon = formData.get('is_anonymous') === 'true';
    const raw = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as ComplaintCategory,
      department: (formData.get('department') as string) || undefined,
      is_anonymous: isAnon,
    };

    const parsed = ComplaintSubmitSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const tracking_number = `CU-CMP-${randomBytes(6).toString('hex').toUpperCase()}`;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Sign in with Google to save a complaint.' };
    }

    const newComplaint: Partial<ComplaintItem> = {
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      department: parsed.data.department || 'Student Affairs & Facilities',
      status: 'pending',
      tracking_number,
      resolution_notes: null,
      is_anonymous: parsed.data.is_anonymous,
      // Keep ownership for access control; the UI still hides the identity when anonymous.
      created_by: user.id,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('complaints')
      .insert(newComplaint)
      .select()
      .single();

    revalidatePath('/lost-found');
    revalidatePath('/dashboard/lost-found');

    if (error || !data) {
      return { success: false, error: error?.message ?? 'Could not save this complaint.' };
    }

    return { success: true, data: data as ComplaintItem };
  } catch {
    return { success: false, error: 'Could not save this complaint. Please try again.' };
  }
}

// ── trackComplaint ───────────────────────────────────────────
export async function trackComplaint(
  trackingNumber: string
): Promise<ActionResponse<ComplaintItem>> {
  try {
    const num = trackingNumber.trim().toUpperCase();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('tracking_number', num)
      .single();

    if (error || !data) {
      const match = FALLBACK_COMPLAINTS.find((c) => c.tracking_number.toUpperCase() === num);
      if (match) return { success: true, data: match };
      return { success: false, error: `No record found for tracking code "${trackingNumber}".` };
    }

    return { success: true, data: data as ComplaintItem };
  } catch {
    const match = FALLBACK_COMPLAINTS.find((c) => c.tracking_number.toUpperCase() === trackingNumber.trim().toUpperCase());
    if (match) return { success: true, data: match };
    return { success: false, error: `No record found for tracking code "${trackingNumber}".` };
  }
}
