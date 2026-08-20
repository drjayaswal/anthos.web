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
    <div data-tour="inbox-tabs" className="fixed sm:top-3 [html.light_&]:bg-black/5 backdrop-blur-md rounded-4xl dark:bg-white/10 top-13 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 p-1.5 transition-all duration-300 shadow-inner">
      {tabs.map((tab) => {
        const isActive = active === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer outline-none select-none [html.light_&]:text-black dark:text-white'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-mail-inbox-tab"
                className="absolute inset-0 rounded-full dark:backdrop-blur-md dark:bg-white/5 [html.light_&]:bg-white shadow-sm"
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={cn(
                  'absolute top-0 right-1 z-10 h-2 w-2 -mr-1 text-[10px] font-bold rounded-full transition-colors duration-200',
                  isActive || "animate-pulse",
                  tab.id === 'fetched' && 'bg-blue-600',
                  tab.id === 'analyzed' && 'bg-green-600',
                  tab.id === 'encrypted' && 'bg-teal-600'
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}