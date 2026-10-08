import React from 'react';
import type { ClubActivity } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface ClubActivitiesFeedProps {
  activities: ClubActivity[];
}

export function ClubActivitiesFeed({ activities }: ClubActivitiesFeedProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Live Club Activities & Updates</h3>
          <p className="text-xs text-slate-500">Recent milestones and announcements from student societies.</p>
        </div>
        <Badge variant="neutral" size="sm">
          {activities.length} Updates
        </Badge>
      </div>

      <div className="divide-y divide-slate-100 space-y-3">
        {activities.map((act) => (
          <div key={act.id} className="pt-3 first:pt-0 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-900 text-xs">{act.title}</span>
              <span className="text-[10px] text-slate-400">
                {new Date(act.activity_date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
