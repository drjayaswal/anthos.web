'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface HeaderProps {
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  analyzing: boolean;
  loading: boolean;
  onAnalyze: () => void;
  onLoadDataFromDatabase: () => void;
  analyzeDisabled?: boolean;
  onFetch: () => void;
  onAccount: () => void;
  sessionUserEmail?: string | null;
  hasCategories?: boolean;
}

export default function Header({
  analyzing,
  loading,
  onAnalyze,
  onLoadDataFromDatabase,
  analyzeDisabled = false,
  onAccount,
  onFetch,
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

  return (
    <>
      <header className="flex w-full items-center justify-between gap-3">
        {!optionsOpen && !loading && (
          <div data-tour="options-button" className="fixed top-2 right-2 z-40">
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
              className="fixed top-2 right-2 z-50 bg-black/5 backdrop-blur-md rounded-4xl flex items-center gap-1 p-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]"
            >
              {hasCategories && (
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
                  {analyzing ? 'Analyzing…' : 'Analysis'}
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
                {loading ? 'Fetching…' : 'ESPs'}
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
                {loading ? 'Loading…' : 'Storage'}
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