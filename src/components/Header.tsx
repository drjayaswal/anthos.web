'use client';

import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  UserIcon,
  SearchIcon,
  BadgeCheckIcon,
  LoaderCircleIcon,
  MailIcon,
  Database,
  DatabaseBackup,
  Loader2,
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

  const options = useMemo(() => {
    const list = [];

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
          ? BadgeCheckIcon
          : SearchIcon,
        iconClassName: isAnalysisStreaming
          ? 'text-green-600 animate-spin'
          : isAnalysisDone
          ? 'text-green-600'
          : 'text-[#4F46E5] fill-[#4F46E5]/30',
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
        label: loading ? 'Storing…' : 'Store',
        description: `Encrypt & save ${selectedAnalyzedCount} selected mail(s)`,
        show: true,
        disabled: loading,
        icon: DatabaseBackup,
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
      icon: MailIcon,
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
      icon: Database,
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
            'fixed top-2 z-40 flex items-center gap-1.5 transition-all duration-300',
            optionsOpen ? 'right-20' : 'right-1'
          )}
        >
          <AnimatePresence mode="popLayout">
            {isFetching && (
              <motion.button
                key="fetching-button"
                type="button"
                disabled
                initial={{ opacity: 0, scale: 0.9, x: 8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 8 }}
                transition={{ duration: 0.15 }}
                className="relative px-3 py-1.5 text-xs font-semibold tracking-tight text-black flex items-center gap-1.5 select-none cursor-default disabled:opacity-100"
                aria-label="Fetching mails"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Fetching...</span>
              </motion.button>
            )}
            {loading && (
              <motion.button
                key="loading-button"
                type="button"
                disabled
                initial={{ opacity: 0, scale: 0.9, x: 8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 8 }}
                transition={{ duration: 0.15 }}
                className="relative px-3 py-1.5 text-xs font-semibold tracking-tight text-black flex items-center gap-1.5 select-none cursor-default disabled:opacity-100"
                aria-label="Loading"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                <span>Loading...</span>
              </motion.button>
            )}
          </AnimatePresence>

          {!optionsOpen && (
            <button
              type="button"
              onClick={() => setOptionsOpen(true)}
              aria-expanded={optionsOpen}
              aria-label="Open options menu"
              className={cn(
                'relative px-3 py-2 cursor-pointer flex items-center gap-1.5 group select-none',
              )}
            >
              <div className="text-xs font-semibold tracking-tight text-black transition-colors flex items-center gap-1.5">
                <span>Options</span>
                {isAnalysisStreaming && (
                  <span className="size-1.5 rounded-full bg-green-600 animate-pulse" />
                )}
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
              className="fixed top-0 right-0 bottom-0 z-70 w-18 h-screen bg-white border-l flex flex-col overflow-visible"
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
                          'relative z-10 flex items-center border-b-2 justify-center transition-all duration-200 p-1 bg-white',
                          item.active ? 'border-green-600' : 'border-transparent'
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
                              'w-5 h-5 transition-colors',
                              item.iconClassName
                                ? item.iconClassName
                                : item.active
                                ? 'text-black'
                                : 'text-black/60 hover:text-black'
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
