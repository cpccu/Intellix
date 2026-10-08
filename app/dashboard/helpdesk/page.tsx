import type { Metadata } from 'next';
import { getSessionUser } from '@/lib/actions/auth.actions';
import { getFaqs, getHelpdeskQueries } from '@/lib/actions/helpdesk.actions';
import { HelpdeskClientPage } from '@/components/modules/HelpdeskClientPage';

export const metadata: Metadata = { title: 'Smart Helpdesk · CampusOS' };
export const dynamic = 'force-dynamic';

export default async function HelpdeskDashboardPage() {
  const [user, faqsResult, queriesResult] = await Promise.all([
    getSessionUser(),
    getFaqs(),
    getHelpdeskQueries(),
  ]);

  return (
    <HelpdeskClientPage
      isGuest={user?.isGuest}
      initialFaqs={faqsResult.data ?? []}
      initialQueries={queriesResult.data ?? []}
    />
  );
}
