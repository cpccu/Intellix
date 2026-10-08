import type { Metadata } from 'next';
import { getSessionUser } from '@/lib/actions/auth.actions';
import { getComplaints, getLostFoundItems } from '@/lib/actions/lost-found.actions';
import { LostFoundClientPage } from '@/components/modules/LostFoundClientPage';

export const metadata: Metadata = { title: 'Lost & Found / Complaint Box · CampusOS' };
export const dynamic = 'force-dynamic';

export default async function LostFoundDashboardPage() {
  const [user, itemsResult, complaintsResult] = await Promise.all([
    getSessionUser(),
    getLostFoundItems(),
    getComplaints(),
  ]);

  return (
    <LostFoundClientPage
      isGuest={user?.isGuest}
      initialItems={itemsResult.data ?? []}
      initialComplaints={complaintsResult.data ?? []}
    />
  );
}
