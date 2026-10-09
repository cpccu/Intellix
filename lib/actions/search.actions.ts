'use server';

import { getEvents } from '@/lib/actions/events.actions';
import { getFaqs } from '@/lib/actions/helpdesk.actions';
import { getLostFoundItems } from '@/lib/actions/lost-found.actions';
import { getResources } from '@/lib/actions/resources.actions';

export interface CampusSearchResult {
  id: string;
  title: string;
  detail: string;
  section: string;
  href: string;
}

export async function searchCampus(input: string): Promise<CampusSearchResult[]> {
  const query = input.trim().toLocaleLowerCase().slice(0, 120);
  if (query.length < 2) return [];

  const [eventsResult, resourcesResult, faqsResult, itemsResult] = await Promise.all([
    getEvents(),
    getResources(),
    getFaqs(),
    getLostFoundItems(),
  ]);
  const encodedQuery = encodeURIComponent(input.trim().slice(0, 120));
  const results: CampusSearchResult[] = [];
  const add = (entry: CampusSearchResult, searchable: Array<string | null | undefined>) => {
    if (searchable.some((value) => value?.toLocaleLowerCase().includes(query))) results.push(entry);
  };

  for (const event of eventsResult.data ?? []) {
    add({ id: `event-${event.id}`, title: event.title, detail: event.location ?? 'Campus event', section: 'Clubs & Events', href: `/clubs?search=${encodedQuery}` }, [event.title, event.description, event.location, event.clubs?.name]);
  }
  for (const resource of resourcesResult.data ?? []) {
    add({ id: `resource-${resource.id}`, title: resource.title, detail: [resource.course_code, resource.department].filter(Boolean).join(' · ') || 'Study resource', section: 'Resources', href: `/resources?search=${encodedQuery}` }, [resource.title, resource.description, resource.course_code, resource.department]);
  }
  for (const faq of faqsResult.data ?? []) {
    add({ id: `faq-${faq.id}`, title: faq.question, detail: faq.category.replace(/_/g, ' '), section: 'Helpdesk', href: `/helpdesk?search=${encodedQuery}` }, [faq.question, faq.answer, ...(faq.tags ?? [])]);
  }
  for (const item of itemsResult.data ?? []) {
    add({ id: `item-${item.id}`, title: item.title, detail: `${item.item_type === 'lost' ? 'Lost' : 'Found'} · ${item.location}`, section: 'Lost & Found', href: `/lost-found?search=${encodedQuery}` }, [item.title, item.description, item.location, item.category]);
  }

  return results.slice(0, 10);
}
