import type { Metadata } from 'next';
import { getSessionUser } from '@/lib/actions/auth.actions';
import { getClubs, getClubActivities, getEvents } from '@/lib/actions/events.actions';
import { ClubsClientPage } from '@/components/modules/ClubsClientPage';

export const metadata: Metadata = { title: 'Club & Event Engine · CampusOS' };
export const dynamic = 'force-dynamic';

export default async function ClubsPage() {
  const [user, clubsResult, eventsResult, activitiesResult] = await Promise.all([
    getSessionUser(),
    getClubs(),
    getEvents(),
    getClubActivities(),
  ]);

  return (
    <ClubsClientPage
      user={user}
      clubs={clubsResult.data ?? []}
      events={eventsResult.data ?? []}
      activities={activitiesResult.data ?? []}
    />
  );
}