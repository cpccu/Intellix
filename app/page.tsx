import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/actions/auth.actions';

/** Root → redirect based on session */
export const dynamic = 'force-dynamic';

export default async function RootPage() {
  const user = await getSessionUser();
  if (user) redirect('/dashboard');
  redirect('/login');
}