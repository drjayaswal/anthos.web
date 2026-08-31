'use client';

import { motion } from 'framer-motion';
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
    <div data-tour="inbox-tabs" className="fixed sm:top-3 bg-black/5 backdrop-blur-md rounded-4xl top-13 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 p-1.5 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]">
      {tabs.map((tab) => {
        const isActive = active === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer outline-none select-none text-black'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-mail-inbox-tab"
                className="absolute inset-0 rounded-full bg-linear-to-b from-white to-gray-100 border shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.08)]"
              />
            )}
            <span className="relative z-10">{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={cn(
                  'absolute top-0 right-1 z-10 h-3 w-3 -mr-1 text-[10px] font-bold text-white rounded-full transition-colors duration-200',
                  tab.count > 0 && isActive ? 'bg-green-600' : 'bg-gray-400'
                )}
              >{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}