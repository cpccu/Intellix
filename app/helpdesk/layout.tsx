import { AppShell } from '@/components/modules/AppShell';

export const dynamic = 'force-dynamic';

export default function HelpdeskLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
