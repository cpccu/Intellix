import type { Metadata } from 'next';
import { getResources } from '@/lib/actions/resources.actions';
import { ResourcesClientPage } from '@/components/modules/ResourcesClientPage';

export const metadata: Metadata = { title: 'Resource Hub · CampusOS' };
export const dynamic = 'force-dynamic';

export default async function ResourcesRootPage() {
  const result = await getResources();
  return <ResourcesClientPage initialResources={result.data ?? []} />;
}
