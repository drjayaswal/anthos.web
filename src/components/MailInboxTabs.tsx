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
    <div className="fixed sm:top-3 top-13 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 p-1.5 rounded-full bg-white/90 backdrop-blur-2xl border border-gray-200/80 shadow-xl ring-1 ring-black/5 transition-all duration-300">
      {tabs.map((tab) => {
        const isActive = active === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer outline-none select-none',
              isActive
                ? 'bg-[#ff3131] text-white shadow-sm shadow-[#ff3131]/30'
                : 'text-zinc-700 hover:text-[#ff3131] hover:bg-zinc-100/80'
            )}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && <span
              className={cn(
                'px-1.5 py-0.5 text-[10px] font-bold rounded-full transition-colors',
                isActive ? 'bg-white/25 text-white' : 'bg-zinc-200/80 text-zinc-700'
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