'use client';

import { cn } from '@/lib/utils';

export type MailInboxTab = 'fetched' | 'analyzed' | 'encrypted';

type Props = {
  active: MailInboxTab;
  fetchedCount: number;
  analyzedCount: number;
  encryptedCount: number;
  onChange: (tab: MailInboxTab) => void;
};

export default function MailInboxTabs({
  active,
  fetchedCount,
  analyzedCount,
  encryptedCount,
  onChange,
}: Props) {
  const tabs: { id: MailInboxTab; label: string; count: number }[] = [
    { id: 'fetched', label: 'Fetched', count: fetchedCount },
    { id: 'analyzed', label: 'Analyzed', count: analyzedCount },
    { id: 'encrypted', label: 'Encrypted', count: encryptedCount },
  ];

  return (
    <div className="fixed sm:top-3 top-13 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 p-1.5  transition-all duration-300">
      {tabs.map((tab) => {
        const isActive = active === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center active:shadow-inner gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold dark:text-white transition-all duration-200 cursor-pointer outline-none select-none',
              isActive
                ? 'shadow-inner bg-gray-200/30 text-white [html.light_&]:bg-[#2c0237] [html.light_&]:text-white'
                : '[html.light_&]:text-black'
            )}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && <span
              className={cn(
                'px-1.5 py-0.5 -mr-1 text-[10px] font-bold rounded-full transition-colors',
                isActive
                  ? 'bg-[#ff3131] text-white [html.light_&]:bg-white/25 [html.light_&]:text-white'
                  : 'text-[#2c0237] dark:text-white/70 [html.light_&]:text-black/70'
              )}
            >
              {tab.count}
            </span>}
          </button>
        );
      })}
    </div>
  );
}