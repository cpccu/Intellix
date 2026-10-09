import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/actions/auth.actions';
import { DashboardSidebar } from '@/components/modules/DashboardSidebar';
import { DashboardHeader } from '@/components/modules/DashboardHeader';

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-[100dvh] bg-[#f6f7f3]">
      <DashboardSidebar />
      <div className="min-w-0">
        <DashboardHeader user={user} />
        <main className="campus-canvas relative isolate min-w-0 overflow-x-clip px-4 pb-20 pt-6 sm:px-6 sm:pt-8 md:pb-24 lg:px-8 lg:pb-28">
          <div className="relative z-10 mx-auto w-full max-w-[1680px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
