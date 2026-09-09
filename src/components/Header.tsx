'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { UserIcon, Sparkles, RotateCw, CheckCircle2, BadgeCheckIcon, LoaderCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  analyzing: boolean;
  loading: boolean;
  onAnalyze: () => void;
  onInsight?: () => void;
  onLoadDataFromDatabase: () => void;
  selectedCount?: number;
  analyzeDisabled?: boolean;
  insightDisabled?: boolean;
  onFetch: () => void;
  onAccount: () => void;
  hasAnalysisProgress?: boolean;
  isAnalysisStreaming?: boolean;
  isAnalysisDone?: boolean;
  onToggleProgressDrawer?: () => void;
  progressDrawerOpen?: boolean;
  sessionUserEmail?: string | null;
  hasCategories?: boolean;
}

export default function Header({
  analyzing,
  loading,
  onAnalyze,
  onInsight,
  onLoadDataFromDatabase,
  selectedCount = 0,
  analyzeDisabled = false,
  insightDisabled = false,
  onAccount,
  onFetch,
  hasAnalysisProgress = false,
  isAnalysisStreaming = false,
  isAnalysisDone = false,
  onToggleProgressDrawer,
  progressDrawerOpen = false,
  hasCategories = true,
}: HeaderProps) {
  const [optionsOpen, setOptionsOpen] = useState(false);

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
    if (optionsOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [optionsOpen]);

  const hasSelectedMails = selectedCount > 0;

  return (
    <>
      <header className="flex w-full items-center justify-between gap-3">
        {!optionsOpen && !loading && (
          <div data-tour="options-button" className="fixed top-3 right-3 z-40 flex items-center gap-2">
            <AnimatePresence>
              {hasAnalysisProgress && (
                <motion.button
                  key="progress-button"
                  type="button"
                  onClick={onToggleProgressDrawer}
                  initial={{ opacity: 0, scale: 0.9, x: 6 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-semibold outline-none cursor-pointer select-none flex items-center gap-1.5',
                  )}
                  aria-label="Toggle Progress Drawer"
                >
                  {isAnalysisStreaming ? (
                    <LoaderCircleIcon className="size-3.5 text-green-600 animate-spin" />
                  ) : isAnalysisDone ? (
                    <BadgeCheckIcon className="size-3.5 text-green-600" />
                  ) : (
                    <Sparkles className="size-3.5 text-[#4F46E5] fill-[#4F46E5]/30" />
                  )}
                  <span>Processing...</span>
                </motion.button>
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={() => setOptionsOpen(true)}
              aria-expanded={optionsOpen}
              aria-label="Open options menu"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-black bg-linear-to-b from-white to-gray-100 border shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.08)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] transition-all duration-200 outline-none cursor-pointer select-none"
            >
              Options
            </button>
          </div>
        )}
      </header>

      <AnimatePresence>
        {optionsOpen && !loading && (
          <>
            <motion.div
              key="options-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              onClick={closeOptions}
            />

            <motion.div
              key="options-dock"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="fixed top-3 right-2 z-50 bg-black/5 backdrop-blur-md rounded-4xl flex items-center gap-1 p-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]"
            >
              {hasAnalysisProgress && (
                <motion.button
                  type="button"
                  onClick={() => {
                    onToggleProgressDrawer?.();
                    closeOptions();
                  }}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-semibold border shadow-[inset_0_-3px_6px_rgba(79,70,229,0.15),0_2px_4px_rgba(0,0,0,0.08)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] transition-all cursor-pointer select-none flex items-center gap-1.5',
                    progressDrawerOpen
                      ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                      : 'bg-linear-to-b from-indigo-50 to-white text-[#4F46E5] border-indigo-200'
                  )}
                  aria-label="Toggle Progress Drawer"
                >
                  <span>Progress</span>
                </motion.button>
              )}

              {hasCategories && hasSelectedMails && (
                <motion.button
                  type="button"
                  onClick={() => {
                    onInsight?.();
                    closeOptions();
                  }}
                  disabled={analyzing || loading || insightDisabled}
                  className="px-3.5 py-1.5 disabled:cursor-not-allowed rounded-full text-xs font-semibold text-black bg-linear-to-b from-white to-gray-100 border shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.08)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] transition-all cursor-pointer select-none disabled:opacity-40"
                  aria-label="Insight Mail"
                  >
                  Insight
                </motion.button>
              )}

              {hasCategories && hasSelectedMails && (
                <motion.button
                type="button"
                onClick={() => {
                  onAnalyze();
                  closeOptions();
                }}
                  disabled={analyzing || analyzeDisabled}
                  className="px-3.5 py-1.5 disabled:cursor-not-allowed rounded-full text-xs font-semibold text-black bg-linear-to-b from-white to-gray-100 border shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.08)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] transition-all cursor-pointer select-none disabled:opacity-40"
                  aria-label="Analyze Mails"
                >
                  {analyzing ? 'Analysing...' : 'Analyse'}
                </motion.button>
              )}

              <motion.button
                type="button"
                onClick={() => {
                  onFetch();
                  closeOptions();
                }}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-black bg-linear-to-b from-white to-gray-100 border shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.08)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] transition-all cursor-pointer select-none disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Fetch from Gmail"
              >
                {loading ? 'Fetching...' : 'ESPs'}
              </motion.button>

              <motion.button
                type="button"
                onClick={() => {
                  onLoadDataFromDatabase();
                  closeOptions();
                }}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-black bg-linear-to-b from-white to-gray-100 border shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.08)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] transition-all cursor-pointer select-none disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Load from Database"
              >
                {loading ? 'Loading...' : 'Storage'}
              </motion.button>

              <motion.button
                type="button"
                onClick={() => {
                  onAccount();
                  closeOptions();
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-black bg-linear-to-b from-white to-gray-100 border shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.08)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] transition-all cursor-pointer select-none disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Account Settings"
              >
                Account
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
