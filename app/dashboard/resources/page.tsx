import type { Metadata } from 'next';
import { getResources } from '@/lib/actions/resources.actions';
import { ResourcesClientPage } from '@/components/modules/ResourcesClientPage';

export const metadata: Metadata = { title: 'Resource Hub' };
export const dynamic = 'force-dynamic';

export default async function ResourcesPage() {
  const result = await getResources();
  const resources = result.data ?? [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Resource Hub</h1>
        <p className="text-slate-500 text-sm mt-1">
          Browse notes, notices, and past exam questions by department or course.
        </p>
      </div>

      {/* Client component handles reactive search & filter */}
      <ResourcesClientPage initialResources={resources} />
    </div>
  );
}
