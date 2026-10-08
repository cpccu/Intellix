import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/actions/auth.actions';
import { DashboardSidebar } from '@/components/modules/DashboardSidebar';
import { DashboardHeader } from '@/components/modules/DashboardHeader';
import { SectionWatermark } from '@/components/modules/SectionWatermark';

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-[100dvh] bg-[#080d20]">
      <DashboardSidebar />
      <DashboardHeader user={user} />
      <main className="campus-canvas relative isolate min-w-0 overflow-x-hidden px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pb-10">
        <SectionWatermark />
        <div className="relative z-10 mx-auto w-full max-w-[1440px]">{children}</div>
      </main>
    </div>
  );
}
