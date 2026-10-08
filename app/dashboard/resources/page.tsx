import type { Metadata } from 'next';
import { getResources } from '@/lib/actions/resources.actions';
import { ResourcesClientPage } from '@/components/modules/ResourcesClientPage';

export const metadata: Metadata = { title: 'Resource Hub' };
export const dynamic = 'force-dynamic';

export default async function ResourcesPage() {
  const result = await getResources();
  return <ResourcesClientPage initialResources={result.data ?? []} />;
}
