'use client';

import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex min-w-0 items-center gap-1 border-b border-[#eadfdd] overflow-x-auto overscroll-x-contain ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            type="button"
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 -mb-[1px] transition-colors whitespace-nowrap cursor-pointer ${
              isActive
                ? 'border-[#7b2435] text-[#7b2435] font-semibold'
                : 'border-transparent text-slate-400 hover:text-[#35282a] hover:border-[#d7b5bb]'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            {tab.label}
            {typeof tab.count === 'number' && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive
                    ? 'bg-[#f5e9eb] text-[#7b2435]'
                    : 'bg-[#f4efed] text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
