'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { ActionResponse, FAQItem, HelpdeskCategory, HelpdeskQuery } from '@/types';

// ── Fallback Knowledge Base (Instant Demo & Offline Resilience) ──
const FALLBACK_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'bus_schedule',
    question: 'What are the campus shuttle bus hours and routes?',
    answer:
      'Campus shuttles operate Monday through Friday from 6:30 AM to 9:30 PM, and Saturdays from 8:00 AM to 5:00 PM. Routes: Route A (Main Gate ↔ Central Library ↔ Computing Complex, every 15 mins), Route B (Hostel Quad ↔ Sports Complex ↔ Engineering Annex, every 20 mins). Night security escort shuttles run 9:30 PM – 11:30 PM upon request from Main Gate.',
    tags: ['transport', 'shuttle', 'bus', 'timings', 'routes'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'faq-2',
    category: 'bus_schedule',
    question: 'How do I pay for the university shuttle bus?',
    answer:
      'The university intra-campus shuttle is 100% free for all registered City University students with a valid Student ID card or CampusOS digital pass. Off-campus transit buses accept the Campus Smart Card or mobile tap payment (₦150 flat fare).',
    tags: ['bus', 'fare', 'free', 'payment', 'card'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'faq-3',
    category: 'campus_rules',
    question: 'What are the official library operating hours and quiet zone policies?',
    answer:
      'Central Library is open Mon–Sat 8:00 AM – 10:00 PM; 24/7 during midterm and final examination weeks. Floors 1–2 allow quiet collaborative study; Floors 3–4 are designated Absolute Silent Zones. Food is strictly prohibited; covered beverage containers only.',
    tags: ['library', 'hours', 'rules', 'study', 'quiet'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'faq-4',
    category: 'campus_rules',
    question: 'What is the university policy on dress code and identification badges?',
    answer:
      'All students must visibly wear their student ID card or have their digital CampusOS credential active when entering academic buildings, laboratories, and examination halls. Business casual / decent academic attire is mandatory in official university facilities.',
    tags: ['dress code', 'id card', 'rules', 'policy', 'badges'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'faq-5',
    category: 'exam_logistics',
    question: 'What are the examination hall admission rules and prohibited items?',
    answer:
      'Students must arrive at least 30 minutes before the scheduled exam start time with their printed Examination Docket and valid Student ID. Smartwatches, programmable calculators, bags, and mobile phones are strictly prohibited. Only non-programmable scientific calculators approved by the invigilator are permitted.',
    tags: ['exams', 'hall rules', 'calculator', 'admissions', 'docket'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'faq-6',
    category: 'exam_logistics',
    question: 'How do I request an exam clash resolution or medical deferral?',
    answer:
      'If two scheduled examinations overlap, submit an Exam Clash Resolution form via the Academic Affairs portal or Helpdesk at least 5 business days before the exam date. For emergency medical deferrals, present a certified medical report from the University Health Centre within 48 hours of the missed exam.',
    tags: ['exam clash', 'deferral', 'medical', 'schedule', 'conflict'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'faq-7',
    category: 'facilities',
    question: 'How do I report high-speed campus WiFi issues or request lab access?',
    answer:
      'Connect to "CityUni-Secure" using your student portal login credentials. For connectivity issues in specific halls or to request after-hours access to Computing Lab C, lodge a ticket in the Helpdesk or report via the Complaint Box.',
    tags: ['wifi', 'internet', 'lab access', 'computing', 'facility'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'faq-gym',
    category: 'facilities',
    question: 'What are the campus gymnasium operating hours and equipment facilities?',
    answer:
      'The Indoor Gymnasium & Sports Complex operates Monday through Friday from 6:00 AM to 9:00 PM, and Saturdays from 7:00 AM to 6:00 PM (Closed Sundays for sanitization). Facilities include free weights, powerlifting racks, cardio decks, basketball Court 1, and locker rooms. Free admission with valid Student ID or CampusOS digital pass.',
    tags: ['gym', 'gymnasium', 'fitness', 'sports', 'workout', 'basketball'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'faq-8',
    category: 'academic',
    question: 'What is the deadline for course add/drop and semester registration?',
    answer:
      'The standard course registration and add/drop period closes at the end of Week 3 of every academic semester. Late course registration with Dean approval incurs a nominal administrative fee.',
    tags: ['registration', 'add drop', 'courses', 'deadline', 'academic'],
    created_at: new Date().toISOString(),
  },
];

const FALLBACK_QUERIES: HelpdeskQuery[] = [
  {
    id: 'q-1',
    title: 'Bus schedule on weekends from Hostel B to Main Gate',
    content: 'Does the green shuttle bus run on Saturday mornings before 8 AM for sports events?',
    category: 'bus_schedule',
    status: 'answered',
    answer:
      'On Saturdays, the sports shuttle starts special early service at 7:00 AM from Hostel B directly to the Sports Complex and Main Gate.',
    resolved_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    created_by: 'guest',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'q-2',
    title: 'CSC301 Midterm Examination Venue Confirmation',
    content: 'Please confirm if CSC301 Data Structures exam is in Lab A or Audimax.',
    category: 'exam_logistics',
    status: 'answered',
    answer:
      'CSC301 exam will hold in Computing Labs A & B for practical batch 1 and Audimax for theoretical batch 2. Please check your docket.',
    resolved_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    created_by: 'guest',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'q-3',
    title: 'Hostel visitor policy during examination week',
    content: 'Are non-resident students allowed in the study lounges past 8 PM?',
    category: 'campus_rules',
    status: 'pending',
    answer: null,
    resolved_at: null,
    created_by: 'guest',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

// ── Schemas ──────────────────────────────────────────────────
const QuerySubmitSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  content: z.string().min(10, 'Details must be at least 10 characters').max(1000),
  category: z.enum([
    'bus_schedule',
    'campus_rules',
    'exam_logistics',
    'facilities',
    'academic',
    'general',
  ]),
});

// ── getFaqs ──────────────────────────────────────────────────
export async function getFaqs(category?: HelpdeskCategory): Promise<ActionResponse<FAQItem[]>> {
  try {
    const supabase = await createClient();
    let query = supabase.from('faqs').select('*').order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      const filtered = category
        ? FALLBACK_FAQS.filter((f) => f.category === category)
        : FALLBACK_FAQS;
      return { success: true, data: filtered };
    }

    return { success: true, data: data as FAQItem[] };
  } catch {
    const filtered = category
      ? FALLBACK_FAQS.filter((f) => f.category === category)
      : FALLBACK_FAQS;
    return { success: true, data: filtered };
  }
}

// ── getHelpdeskQueries ───────────────────────────────────────
export async function getHelpdeskQueries(): Promise<ActionResponse<HelpdeskQuery[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('helpdesk_queries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return { success: true, data: FALLBACK_QUERIES };
    }

    return { success: true, data: data as HelpdeskQuery[] };
  } catch {
    return { success: true, data: FALLBACK_QUERIES };
  }
}

// ── submitHelpdeskQuery ──────────────────────────────────────
export async function submitHelpdeskQuery(
  formData: FormData
): Promise<ActionResponse<HelpdeskQuery>> {
  try {
    const raw = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      category: (formData.get('category') as HelpdeskCategory) || 'general',
    };

    const parsed = QuerySubmitSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Sign in with Google to save a helpdesk inquiry.' };
    }

    // Generate immediate smart auto-response if matching key campus topics
    let autoAnswer: string | null = null;
    const lower = (raw.title + ' ' + raw.content).toLowerCase();

    if (lower.includes('bus') || lower.includes('shuttle') || lower.includes('transport')) {
      autoAnswer =
        'Automated Assistant: Campus shuttles run every 15 mins between 6:30 AM – 9:30 PM (Mon-Fri) and 8:00 AM – 5:00 PM (Sat). Free with student ID!';
    } else if (lower.includes('exam') || lower.includes('docket') || lower.includes('calculator')) {
      autoAnswer =
        'Automated Assistant: For exams, bring your valid ID & Docket. Arrive 30 mins early. Programmable calculators and phones are prohibited.';
    } else if (lower.includes('library') || lower.includes('quiet') || lower.includes('books')) {
      autoAnswer =
        'Automated Assistant: Central Library is open 8:00 AM - 10:00 PM (24/7 during exam weeks). Floors 3 & 4 are silent study zones.';
    }

    const newQuery: Partial<HelpdeskQuery> = {
      title: parsed.data.title,
      content: parsed.data.content,
      category: parsed.data.category,
      status: autoAnswer ? 'answered' : 'pending',
      answer: autoAnswer,
      resolved_at: autoAnswer ? new Date().toISOString() : null,
      created_by: user.id,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('helpdesk_queries')
      .insert(newQuery)
      .select()
      .single();

    revalidatePath('/helpdesk');
    revalidatePath('/dashboard/helpdesk');

    if (error || !data) {
      return { success: false, error: error?.message ?? 'Could not save your inquiry.' };
    }

    return { success: true, data: data as HelpdeskQuery };
  } catch {
    return { success: false, error: 'Could not save your inquiry. Please try again.' };
  }
}

// ── askSmartAssistant ─────────────────────────────────────────
export async function askSmartAssistant(
  prompt: string
): Promise<ActionResponse<{ answer: string; relatedFaqs: FAQItem[] }>> {
  try {
    const query = prompt.trim().toLowerCase();
    if (!query) {
      return { success: false, error: 'Please provide a valid question.' };
    }

    // Match keywords against knowledge base
    const matchedFaqs = FALLBACK_FAQS.filter((faq) => {
      const qText = (faq.question + ' ' + faq.answer + ' ' + (faq.tags?.join(' ') || '')).toLowerCase();
      const tokens = query.split(/\s+/).filter((t) => t.length > 2);
      return tokens.some((token) => qText.includes(token));
    });

    let answer = '';
    if (query.includes('gym') || query.includes('fitness') || query.includes('sport') || query.includes('workout') || query.includes('court')) {
      answer =
        '🏋️ **Campus Gymnasium & Sports Complex**: Indoor Gymnasium operates Mon–Fri 6:00 AM – 9:00 PM and Sat 7:00 AM – 6:00 PM. Features cardio decks, weight room, and basketball Court 1. Free admission with your student ID or CampusOS digital pass.';
    } else if (query.includes('bus') || query.includes('shuttle') || query.includes('transit') || query.includes('transport')) {
      answer =
        '🚌 **Campus Shuttle Info**: Shuttles operate Mon–Fri 6:30 AM – 9:30 PM & Sat 8:00 AM – 5:00 PM. Route A connects Main Gate, Library, and Computing Complex every 15 mins. Service is free with your student ID or CampusOS digital pass.';
    } else if (query.includes('exam') || query.includes('test') || query.includes('hall') || query.includes('calculator') || query.includes('docket')) {
      answer =
        '📝 **Exam Logistics**: Arrive 30 minutes prior to exam start. You MUST bring your printed Examination Docket and Student ID. Smartwatches, programmable devices, and mobile phones are strictly barred from halls.';
    } else if (query.includes('library') || query.includes('borrow') || query.includes('hours') || query.includes('silent')) {
      answer =
        '📚 **Library Hours & Rules**: Central Library opens 8:00 AM – 10:00 PM on weekdays, and 24/7 during exam weeks. Floors 3 & 4 are silent study zones with power desks.';
    } else if (query.includes('wifi') || query.includes('internet') || query.includes('network')) {
      answer =
        '📶 **Campus WiFi**: Use SSID "CityUni-Secure" with your matric number and portal password. High-speed coverage is available across all lecture theatres, hostels, and libraries.';
    } else if (query.includes('rule') || query.includes('dress') || query.includes('code') || query.includes('discipline')) {
      answer =
        '⚖️ **Campus Conduct & Dress Code**: Academic attire is required in lecture halls and labs. Student ID badges must be visible when entering campus facilities.';
    } else {
      answer =
        `💡 Based on City University policies: for **"${prompt}"**, please consult the relevant departmental office or submit a ticket directly to the Student Affairs Desk below.`;
    }

    return {
      success: true,
      data: {
        answer,
        relatedFaqs: matchedFaqs.slice(0, 3),
      },
    };
  } catch {
    return {
      success: true,
      data: {
        answer: 'City University Helpdesk: Shuttles, library hours, and exam logistics are available in the FAQ tabs.',
        relatedFaqs: FALLBACK_FAQS.slice(0, 2),
      },
    };
  }
}
