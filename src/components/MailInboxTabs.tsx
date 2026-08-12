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
              'relative flex items-center active:bg-gray-200 active:shadow-inner gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer outline-none select-none',
              isActive
                ? 'shadow-inner bg-gray-200/50'
                : 'text-black hover:text-[#ff3131]'
            )}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && <span
              className={cn(
                'px-1.5 py-0.5 -mr-1 text-[10px] font-bold rounded-full transition-colors',
                isActive ? 'bg-[#ff3131] text-white' : 'text-[#ff3131]'
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