'use client';

import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  UserIcon,
  SearchIcon,
  CheckIcon,
  LoaderCircleIcon,
  MailSearchIcon,
  DatabaseSearch,
  CircleAlertIcon,
  SettingsIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MailInboxTab } from './MailInboxTabs';

interface HeaderProps {
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  analyzing: boolean;
  loading: boolean;
  onAnalyze: () => void;
  onLoadDataFromDatabase: () => void;
  selectedCount?: number;
  analyzeDisabled?: boolean;
  onFetch: () => void;
  onAccount: () => void;
  hasAnalysisProgress?: boolean;
  isAnalysisStreaming?: boolean;
  isAnalysisDone?: boolean;
  onToggleProgressDrawer?: () => void;
  progressDrawerOpen?: boolean;
  sessionUserEmail?: string | null;
  hasCategories?: boolean;
  isFetching?: boolean;
  activeTab?: MailInboxTab;
  selectedAnalyzedCount?: number;
  onStoreAnalyzed?: () => void;
}

type IconComponent = React.ComponentType<{ className?: string }>;

function DatabaseArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m16 19 3 3 3-3" />
      <path d="M19 16v6" />
      <path d="M21 12.536V5" />
      <path d="M3 12A9 3 0 0 0 15.182 14.806" />
      <path d="M3 5V19A9 3 0 0 0 13.318 21.968" />
      <ellipse cx="12" cy="5" rx="9" ry="3" />
    </svg>
  );
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  return isDesktop;
}

export default function Header({
  analyzing,
  loading,
  onAnalyze,
  onLoadDataFromDatabase,
  selectedCount = 0,
  analyzeDisabled = false,
  onAccount,
  onFetch,
  hasAnalysisProgress = false,
  isAnalysisStreaming = false,
  isAnalysisDone = false,
  onToggleProgressDrawer,
  progressDrawerOpen = false,
  hasCategories = true,
  sessionUserEmail,
  isFetching = false,
  activeTab = 'fetched',
  selectedAnalyzedCount = 0,
  onStoreAnalyzed,
}: HeaderProps) {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const isDesktop = useIsDesktop();

  const closeOptions = () => {
    setOptionsOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeOptions();
    };
    if (optionsOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [optionsOpen]);

  useEffect(() => {
    if (optionsOpen && !isDesktop) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [optionsOpen, isDesktop]);

  const hasSelectedMails = selectedCount > 0;

  type OptionItem = {
    id: string;
    label: string;
    description: string;
    show: boolean;
    active?: boolean;
    disabled: boolean;
    icon: IconComponent;
    iconClassName?: string;
    onClick: () => void;
  };

  const options = useMemo<OptionItem[]>(() => {
    const list: OptionItem[] = [];

    if (hasAnalysisProgress) {
      list.push({
        id: 'progress',
        label: 'Progress',
        description: isAnalysisStreaming
          ? 'Streaming live AI analysis logs'
          : isAnalysisDone
            ? 'Analysis completed - view logs'
            : 'Live progress and logs',
        show: true,
        active: progressDrawerOpen,
        disabled: false,
        icon: isAnalysisStreaming
          ? LoaderCircleIcon
          : isAnalysisDone
            ? CheckIcon
            : CircleAlertIcon,
        iconClassName: isAnalysisStreaming
          ? 'text-foreground animate-spin'
          : isAnalysisDone
            ? 'text-foreground'
            : 'text-foreground',
        onClick: () => {
          onToggleProgressDrawer?.();
          closeOptions();
        },
      });
    }

    if (hasCategories && hasSelectedMails) {
      list.push({
        id: 'analyze',
        label: analyzing ? 'Analysing...' : 'Analyse',
        description: 'Classify and score priority with AI',
        show: true,
        disabled: analyzing || analyzeDisabled,
        icon: SearchIcon,
        iconClassName: analyzing ? 'animate-spin text-[#4F46E5]' : undefined,
        onClick: () => {
          onAnalyze();
          closeOptions();
        },
      });
    }

    if (activeTab === 'analyzed' && selectedAnalyzedCount > 0 && onStoreAnalyzed) {
      list.push({
        id: 'store-analyzed',
        label: loading ? 'Storing\u2026' : 'Store',
        description: `Encrypt & save ${selectedAnalyzedCount} selected mail(s)`,
        show: true,
        disabled: loading,
        icon: DatabaseArrowDownIcon,
        iconClassName: loading ? 'animate-spin text-emerald-600' : undefined,
        onClick: () => {
          onStoreAnalyzed();
          closeOptions();
        },
      });
    }

    list.push({
      id: 'fetch',
      label: isFetching ? 'Fetching...' : 'ESPs',
      description: 'Fetch new messages from Gmail',
      show: true,
      disabled: isFetching || loading,
      icon: MailSearchIcon,
      iconClassName: isFetching ? 'animate-spin text-blue-600' : undefined,
      onClick: () => {
        onFetch();
        closeOptions();
      },
    });

    list.push({
      id: 'storage',
      label: loading ? 'Loading...' : 'Storage',
      description: 'Load encrypted vault from database',
      show: true,
      disabled: loading,
      icon: DatabaseSearch,
      iconClassName: undefined,
      onClick: () => {
        onLoadDataFromDatabase();
        closeOptions();
      },
    });

    list.push({
      id: 'account',
      label: 'Account',
      description: sessionUserEmail || 'Profile settings and sign out',
      show: true,
      disabled: false,
      icon: UserIcon,
      iconClassName: undefined,
      onClick: () => {
        onAccount();
        closeOptions();
      },
    });

    return list;
  }, [
    isFetching,
    hasAnalysisProgress,
    isAnalysisStreaming,
    isAnalysisDone,
    progressDrawerOpen,
    hasCategories,
    hasSelectedMails,
    analyzing,
    loading,
    analyzeDisabled,
    sessionUserEmail,
    activeTab,
    selectedAnalyzedCount,
    onToggleProgressDrawer,
    onAnalyze,
    onFetch,
    onLoadDataFromDatabase,
    onAccount,
    onStoreAnalyzed,
  ]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: isDesktop ? -20 : 0, y: isDesktop ? 0 : -10 },
    show: { opacity: 1, x: 0, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  } as const;

  return (
    <>
      <header className="flex w-full items-center justify-between gap-3">
        <div
          data-tour="options-button"
          className={cn(
            'fixed top-1 z-40 flex items-center gap-1.5 transition-all duration-300',
            optionsOpen ? 'right-20' : 'right-1'
          )}
        >
          {!optionsOpen && (
            <button
              type="button"
              onClick={() => setOptionsOpen(true)}
              aria-expanded={optionsOpen}
              aria-label="Open options menu"
              className={cn(
                'relative pr-3 py-2 cursor-pointer flex items-center gap-1.5 group select-none',
              )}
            >
              <div className="text-xs font-semibold tracking-tight text-foreground transition-colors flex items-center gap-1.5">
                <span className='sm:inline hidden'>Options</span>
                <span className='inline sm:hidden'><SettingsIcon className='w-4 h-4' /></span>
              </div>
            </button>
          )}
        </div>
      </header>

      <AnimatePresence>
        {optionsOpen && (
          <>
            <motion.div
              key="options-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="fixed inset-0 z-60"
              onClick={closeOptions}
            />

            <motion.div
              key="options-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 z-70 w-18 h-screen bg-foreground/12 backdrop-blur-md flex flex-col overflow-visible"
            >
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex-1 p-2 space-y-1.5 overflow-visible"
              >
                {options.map((item) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      className="relative"
                    >
                      <div
                        className={cn(
                          'relative z-10 flex items-center rounded-4xl justify-center transition-all duration-200 px-1 py-2.25',
                          item.active && 'bg-background/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]'
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            item.onClick();
                          }}
                          disabled={item.disabled}
                          className="flex items-center justify-center p-1.5 rounded-xl transition-colors cursor-pointer flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                          title={item.label}
                        >
                          <Icon
                            className={cn(
                              'w-5.5 h-5.5 transition-colors text-foreground',
                              item.iconClassName
                                ? item.iconClassName
                                : item.active
                            )}
                          />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
