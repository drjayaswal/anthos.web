'use client';

import { useState, useEffect } from 'react';
import {
  RefreshCw,
  User,
  DatabaseBackupIcon,
  CloudDownloadIcon,
  Sparkles,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
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
  sessionUserEmail,
  hasCategories = true,
}: HeaderProps) {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);

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

  const closeOptions = () => {
    setOptionsOpen(false);
    setHoveredTooltip(null);
  };

  return (
    <>
      <header className="flex w-full items-center justify-between gap-3">
        {!optionsOpen && (
          <div className="fixed top-2 right-2 z-40">
            <button
              type="button"
              onClick={() => setOptionsOpen(true)}
              aria-expanded={optionsOpen}
              aria-label="Open options menu"
              className={cn(
                'group relative flex items-center justify-center gap-2 px-3 py-2 rounded-full transition-all duration-300 outline-none cursor-pointer'
              )}
            >
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold tracking-tight text-white/50 group-hover:text-white transition-colors">
                  Options
                </span>
              </div>
            </button>
          </div>
        )}
      </header>

      <AnimatePresence>
        {optionsOpen && (
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
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="fixed top-2 right-2 z-50 flex items-center gap-2 p-2"
              onMouseLeave={() => setHoveredTooltip(null)}
            >
              {hasCategories && (
                <div className="relative">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      onAnalyze();
                      closeOptions();
                    }}
                    onMouseEnter={() => setHoveredTooltip('Analyze Mails')}
                    onMouseLeave={() => setHoveredTooltip(null)}
                    disabled={analyzing || analyzeDisabled}
                    className="flex items-center justify-center w-10 h-10 rounded-2xl [html.light_&]:text-black dark:text-white cursor-pointer disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    aria-label="Analyze Mails"
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.button>
                </div>
              )}

              <div className="relative">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    onFetch();
                    closeOptions();
                  }}
                  onMouseEnter={() => setHoveredTooltip(loading ? 'Fetching...' : 'Fetch from Gmail')}
                  onMouseLeave={() => setHoveredTooltip(null)}
                  disabled={loading}
                  className="flex items-center justify-center w-10 h-10 rounded-2xl [html.light_&]:text-black dark:text-white cursor-pointer disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  aria-label="Fetch from Gmail"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin text-[#ff3131]" />
                  ) : (
                    <CloudDownloadIcon className="w-5 h-5" />
                  )}
                </motion.button>
              </div>

              <div className="relative">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    onLoadDataFromDatabase();
                    closeOptions();
                  }}
                  onMouseEnter={() => setHoveredTooltip(loading ? 'Loading...' : 'Load Database')}
                  onMouseLeave={() => setHoveredTooltip(null)}
                  disabled={loading}
                  className="flex items-center justify-center w-10 h-10 rounded-2xl [html.light_&]:text-black dark:text-white cursor-pointer disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  aria-label="Load from Database"
                >
                  <DatabaseBackupIcon className={`w-5 h-5 ${loading ? 'animate-pulse' : ''}`} />
                </motion.button>
              </div>

              <div className="relative">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    onAccount();
                    closeOptions();
                  }}
                  onMouseEnter={() => setHoveredTooltip('Account')}
                  onMouseLeave={() => setHoveredTooltip(null)}
                  className="flex items-center justify-center w-10 h-10 rounded-2xl [html.light_&]:text-black dark:text-white cursor-pointer disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  aria-label="Account Settings"
                >
                  <User className="w-5 h-5" />
                </motion.button>
              </div>

              <AnimatePresence>
                {hoveredTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-14 right-2 pointer-events-none z-60 whitespace-nowrap bg-blue-600 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg"
                  >
                    {hoveredTooltip}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}