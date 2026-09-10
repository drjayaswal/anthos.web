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
    <div data-tour="inbox-tabs" className="absolute sm:top-2 top-18 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 p-1.5">
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
                className="absolute inset-0 border-b-2 border-green-600"
              />
            )}
            <span className="relative z-10 text-black">{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={cn(
                  'absolute top-0 right-1 z-10 h-2 w-2 -mr-1 text-[10px] p-1 font-bold text-white rounded-full transition-colors duration-200',
                  tab.count > 0 && 'bg-green-600'
                )}/>
            )}
          </button>
        );
      })}
    </div>
  );
}