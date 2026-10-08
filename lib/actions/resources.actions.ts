'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionResponse, Resource, ResourceCategory } from '@/types';

// ── Fallback Resources ───────────────────────────────────────
const FALLBACK_RESOURCES: Resource[] = [
  {
    id: 'res-1',
    title: 'Data Structures & Algorithms — Complete Lecture Notes',
    description:
      'Full semester compilation: Arrays, Linked Lists, Trees, Heaps, Hash Tables, Dynamic Programming, and Graph Traversals with Python/C++ code samples.',
    category: 'notes',
    course_code: 'CSE-2201',
    department: 'Computer Science & Engineering',
    year: 2026,
    file_url: 'https://example.com/cse2201-dsa.pdf',
    file_type: 'PDF',
    uploaded_by: null,
    created_at: '2026-02-15T10:00:00Z',
    updated_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 'res-2',
    title: 'Database Management Systems Lab Manual & SQL Scripts',
    description:
      'Relational algebra, ER-to-relational schema mapping, B+ Trees indexing, 3NF normalization, and PostgreSQL stored procedures.',
    category: 'notes',
    course_code: 'CSE-3104',
    department: 'Computer Science & Engineering',
    year: 2026,
    file_url: 'https://example.com/cse3104-dbms.pdf',
    file_type: 'PDF',
    uploaded_by: null,
    created_at: '2026-02-18T10:00:00Z',
    updated_at: '2026-02-18T10:00:00Z',
  },
  {
    id: 'res-3',
    title: 'Operating Systems Final Past Exam Questions (2024–2025)',
    description:
      'Archived midterm and semester final papers covering process scheduling, mutex deadlocks, virtual memory page replacement algorithms, and kernel architecture.',
    category: 'past_questions',
    course_code: 'CSE-3102',
    department: 'Computer Science & Engineering',
    year: 2025,
    file_url: 'https://example.com/cse3102-pq.pdf',
    file_type: 'PDF',
    uploaded_by: null,
    created_at: '2026-02-20T10:00:00Z',
    updated_at: '2026-02-20T10:00:00Z',
  },
  {
    id: 'res-4',
    title: 'Midterm Exam Schedule & Seat Plan — Spring Semester 2026',
    description:
      'Official Dean of Engineering timetable detailing dates, room allocations, invigilator rosters, and conflict resolution protocols.',
    category: 'notices',
    course_code: 'NOTICE-GEN',
    department: 'Academic Affairs',
    year: 2026,
    file_url: 'https://example.com/exam-schedule-spring2026.pdf',
    file_type: 'PDF',
    uploaded_by: null,
    created_at: '2026-02-22T10:00:00Z',
    updated_at: '2026-02-22T10:00:00Z',
  },
  {
    id: 'res-5',
    title: 'Notice Regarding Semester Final Registration Deadlines',
    description:
      'Mandatory registration deadlines for regular and clearance examinations. Portal access guidelines and late fine schedules.',
    category: 'notices',
    course_code: 'ADMIN-01',
    department: 'Registrar Office',
    year: 2026,
    file_url: 'https://example.com/reg-deadline.pdf',
    file_type: 'PDF',
    uploaded_by: null,
    created_at: '2026-02-24T10:00:00Z',
    updated_at: '2026-02-24T10:00:00Z',
  },
  {
    id: 'res-6',
    title: 'Calculus II & Differential Equations — Midterm Past Questions (2020–2024)',
    description:
      'Five years of comprehensive past question papers with step-by-step marking rubrics and solved Fourier transform exercises.',
    category: 'past_questions',
    course_code: 'MTH-2101',
    department: 'Mathematics & Physical Sciences',
    year: 2024,
    file_url: 'https://example.com/mth2101-pq.pdf',
    file_type: 'PDF',
    uploaded_by: null,
    created_at: '2026-02-25T10:00:00Z',
    updated_at: '2026-02-25T10:00:00Z',
  },
  {
    id: 'res-7',
    title: 'City University Student Handbook & Academic Code of Conduct',
    description:
      'Full guide covering GPA calculations, disciplinary policies, hostel regulations, and library borrowing privileges.',
    category: 'other',
    course_code: 'GUIDE-2026',
    department: 'Student Affairs',
    year: 2026,
    file_url: 'https://example.com/handbook-2026.pdf',
    file_type: 'PDF',
    uploaded_by: null,
    created_at: '2026-02-26T10:00:00Z',
    updated_at: '2026-02-26T10:00:00Z',
  },
];

function normalizeCategory(raw: string | null | undefined): ResourceCategory {
  if (!raw) return 'other';
  const lower = raw.toLowerCase().trim();
  if (lower.includes('note')) return 'notes';
  if (lower.includes('notice')) return 'notices';
  if (lower.includes('question') || lower.includes('past') || lower.includes('pq')) return 'past_questions';
  return 'other';
}

function demoDocumentUrl(resource: Pick<Resource, 'title' | 'course_code'>): string | null {
  const code = resource.course_code?.toUpperCase();
  const title = resource.title.toLowerCase();
  if (code === 'CSE-2201' || title.includes('data structures')) {
    return '/documents/cse-2201-data-structures-notes.md';
  }
  if (code === 'CSE-3104' || title.includes('database management')) {
    return '/documents/cse-3104-database-lab-notes.md';
  }
  if (code === 'CSE-3102' || title.includes('operating systems')) {
    return '/documents/cse-3102-os-past-questions.md';
  }
  return null;
}

function attachDemoDocuments(resources: Resource[]): Resource[] {
  return resources.map((resource) => {
    const isPlaceholder =
      !resource.file_url ||
      resource.file_url === '#' ||
      resource.file_url.includes('example.com');
    return {
      ...resource,
      file_url: isPlaceholder ? demoDocumentUrl(resource) : resource.file_url,
    };
  });
}

// ─── getResources ─────────────────────────────────────────────
export async function getResources(params?: {
  query?: string;
  category?: string;
}): Promise<ActionResponse<Resource[]>> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    let items = FALLBACK_RESOURCES;
    if (params?.category && params.category !== 'all') {
      const target = normalizeCategory(params.category);
      items = items.filter((resource) => resource.category === target);
    }
    if (params?.query?.trim()) {
      const query = params.query.trim().toLowerCase();
      items = items.filter((resource) =>
        resource.title.toLowerCase().includes(query) ||
        (resource.description ?? '').toLowerCase().includes(query) ||
        (resource.course_code ?? '').toLowerCase().includes(query) ||
        (resource.department ?? '').toLowerCase().includes(query)
      );
    }
    return { success: true, data: attachDemoDocuments(items) };
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('resources').select('*');

    let items: Resource[] = FALLBACK_RESOURCES;

    if (!error && data && data.length > 0) {
      const dbItems: Resource[] = data.map((rRecord: unknown) => {
        const r = rRecord as Record<string, unknown>;
        return {
          id: String(r.id),
          title: (r.title as string) || 'Resource',
          description: (r.description as string) || `Verified study resource for ${(r.course_code as string) || 'City University'}.`,
          category: normalizeCategory(r.category as string),
          file_url: (r.file_url as string) || '#',
          file_type: (r.file_type as string) || 'PDF',
          course_code: (r.course_code as string) || null,
          department: (r.department as string) || 'Academic Department',
          year: typeof r.year === 'number' ? r.year : 2026,
          uploaded_by: (r.uploaded_by as string) || null,
          created_at: (r.created_at as string) || '2026-01-01T00:00:00Z',
          updated_at: (r.updated_at as string) || '2026-01-01T00:00:00Z',
        };
      });

      // Combine with fallback resources ensuring distinct titles
      const combined = [...dbItems];
      for (const fb of FALLBACK_RESOURCES) {
        if (!combined.some((c) => c.title.toLowerCase() === fb.title.toLowerCase())) {
          combined.push(fb);
        }
      }
      items = combined;
    }

    // Apply parameters if provided
    if (params?.category && params.category !== 'all') {
      const target = normalizeCategory(params.category);
      items = items.filter((r) => r.category === target);
    }

    if (params?.query && params.query.trim()) {
      const q = params.query.toLowerCase().trim();
      items = items.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.description ?? '').toLowerCase().includes(q) ||
          (r.course_code ?? '').toLowerCase().includes(q) ||
          (r.department ?? '').toLowerCase().includes(q)
      );
    }

    return { success: true, data: attachDemoDocuments(items) };
  } catch {
    return { success: true, data: attachDemoDocuments(FALLBACK_RESOURCES) };
  }
}

// ─── getResourceById ──────────────────────────────────────────
export async function getResourceById(id: string): Promise<ActionResponse<Resource>> {
  const all = await getResources();
  const match = all.data?.find((r) => r.id === id) || FALLBACK_RESOURCES[0];
  return { success: true, data: match };
}

// ─── uploadResource ───────────────────────────────────────────
export async function uploadResource(payload: Record<string, unknown>): Promise<ActionResponse<Resource>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Sign in with Google to add a resource.' };
    }

    const title = typeof payload.title === 'string' ? payload.title.trim() : '';
    if (title.length < 3 || title.length > 160) {
      return { success: false, error: 'Resource titles must be between 3 and 160 characters.' };
    }

    const row = {
      title,
      description: typeof payload.description === 'string' ? payload.description : null,
      category: normalizeCategory(typeof payload.category === 'string' ? payload.category : 'other'),
      course_code: typeof payload.course_code === 'string' ? payload.course_code : null,
      department: typeof payload.department === 'string' ? payload.department : null,
      year: typeof payload.year === 'number' ? payload.year : new Date().getFullYear(),
      file_url: typeof payload.file_url === 'string' ? payload.file_url : null,
      file_type: typeof payload.file_type === 'string' ? payload.file_type : 'PDF',
      uploaded_by: user.id,
    };

    const { data, error } = await supabase.from('resources').insert(row).select().single();
    if (error || !data) {
      return { success: false, error: error?.message ?? 'Could not save this resource.' };
    }

    revalidatePath('/resources');
    revalidatePath('/dashboard/resources');
    return { success: true, data: data as Resource };
  } catch {
    return { success: false, error: 'Could not save this resource. Please try again.' };
  }
}

// ─── deleteResource ───────────────────────────────────────────
export async function deleteResource(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Sign in with Google to remove a resource you added.' };
    }
    const { data, error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id)
      .eq('uploaded_by', user.id)
      .select('id')
      .maybeSingle();
    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'You can only remove resources you added.' };
    revalidatePath('/resources');
    revalidatePath('/dashboard/resources');
    return { success: true };
  } catch {
    return { success: false, error: 'Could not remove this resource. Please try again.' };
  }
}
