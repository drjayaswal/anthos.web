'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CloudDownload,
  DatabaseBackup,
  Inbox,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomButton } from '@/components/ui/button';
import { Mail } from '@/types';
import { formatEmailContent, cn } from '@/lib/utils';
import { getSenderCategory } from '@/lib/sender-category';
import type { MailInboxTab } from './MailInboxTabs';

const HOLD_MS = 450;

const CATEGORY_BADGE_COLORS = [
  'bg-purple-600/10 text-purple-700',
  'bg-indigo-600/10 text-indigo-700',
  'bg-blue-600/10 text-blue-700',
  'bg-emerald-600/10 text-emerald-700',
  'bg-rose-600/10 text-rose-700',
  'bg-amber-600/10 text-amber-700',
  'bg-cyan-600/10 text-cyan-700',
  'bg-teal-600/10 text-teal-700',
  'bg-fuchsia-600/10 text-fuchsia-700',
  'bg-violet-600/10 text-violet-700',
  'bg-orange-600/10 text-orange-700',
  'bg-pink-600/10 text-pink-700',
];

const categoryColorRegistry = new Map<string, string>();
let nextCategoryColorIdx = 0;

export function getCategoryBadgeColor(category: string): string {
  const key = category.trim().toLowerCase();
  if (!categoryColorRegistry.has(key)) {
    categoryColorRegistry.set(
      key,
      CATEGORY_BADGE_COLORS[nextCategoryColorIdx % CATEGORY_BADGE_COLORS.length]
    );
    nextCategoryColorIdx++;
  }
  return categoryColorRegistry.get(key)!;
}

export function getPriorityBadgeColor(pct: number): string {
  if (pct <= 80) {
    return 'bg-green-600/10 text-green-700';
  }
  if (pct <= 60) {
    return 'bg-yellow-600/10 text-yellow-700';
  }
  if (pct <= 40) {
    return 'bg-amber-600/10 text-amber-700';
  }
  if (pct <= 20) {
    return 'bg-orange-600/10 text-orange-700';
  }
  return 'bg-red-600/10 text-red-700';
}

interface MailTableProps {
  mails: Mail[];
  loading: boolean;
  onMailClick: (mail: Mail) => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleAll?: () => void;
  onRowHoldSelect?: (mail: Mail) => void;
  onStoreEncryptedMail?: (mail: Mail) => void;
  onAnalyzeMail?: (mail: Mail) => void;
  onInsightMail?: (mail: Mail) => void;
  hasCategories?: boolean;
  activeTab?: MailInboxTab;
  onFetch?: () => void;
  onLoadDataFromDatabase?: () => void;
  onGoToFetched?: () => void;
  generatingDescriptions?: boolean;
}

export default function MailTable({
  mails,
  loading,
  onMailClick,
  selectable = false,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  onRowHoldSelect,
  onStoreEncryptedMail,
  onAnalyzeMail,
  onInsightMail,
  hasCategories = true,
  activeTab = 'fetched',
  onFetch,
  onLoadDataFromDatabase,
  generatingDescriptions = false,
}: MailTableProps) {
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdFired = useRef(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; mail: Mail } | null>(null);
  const allSelected =
    selectable &&
    mails.length > 0 &&
    (mails.length > 10 && activeTab === 'fetched'
      ? mails.slice(0, 10).every((m) => selectedIds?.has(m.id))
      : mails.every((m) => selectedIds?.has(m.id)));

  const hasAnyCategoryOrPriority = useMemo(() => {
    return (
      activeTab === 'analyzed' ||
      mails.some(
        (m) =>
          Boolean(m.category || (Array.isArray(m.categories) && m.categories.length > 0)) ||
          (m.priority_score !== undefined && m.priority_score !== null)
      )
    );
  }, [mails, activeTab]);

  const colWidths = useMemo(() => {
    if (hasAnyCategoryOrPriority) {
      return {
        origin: 'w-[48%] sm:w-[34%] md:w-[28%] lg:w-[26%]',
        subject: 'w-[52%] sm:w-[46%] md:w-[26%] lg:w-[26%]',
        description: 'hidden md:table-cell md:w-[34%] lg:w-[36%]',
        time: 'hidden sm:table-cell sm:w-[20%] md:w-[12%] lg:w-[12%]',
      };
    }
    return {
      origin: 'w-[24%] sm:w-[18%] md:w-[14%]',
      subject: 'w-[76%] sm:w-[62%] md:w-[34%]',
      description: 'hidden md:table-cell md:w-[40%]',
      time: 'hidden sm:table-cell sm:w-[20%] md:w-[12%]',
    };
  }, [hasAnyCategoryOrPriority]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    if (contextMenu) {
      window.addEventListener('click', handleClick);
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('scroll', handleClick, true);
    }
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleClick, true);
    };
  }, [contextMenu]);
  const clearHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  const startHold = (mail: Mail) => {
    if (!onRowHoldSelect) return;
    holdFired.current = false;
    clearHold();
    holdTimer.current = setTimeout(() => {
      holdFired.current = true;
      onRowHoldSelect(mail);
    }, HOLD_MS);
  };

  if (!loading && mails.length === 0) {
    return (
      <div data-tour="empty-state-card" className="w-full flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mb-4 text-black/70">
          {activeTab === 'encrypted' ? (
            <DatabaseBackup className="w-6 h-6 sm:w-10 sm:h-10" />
          ) : activeTab === 'analyzed' ? (
            <Sparkles className="w-6 h-6 sm:w-10 fill-border sm:h-10" />
          ) : (
            <Inbox className="w-6 h-6 sm:w-10 sm:h-10" />
          )}
        </div>

        <h3 className="text-base sm:text-lg font-bold text-black tracking-tight mb-1.5">
          {activeTab === 'encrypted'
            ? 'No Encrypted Mails Loaded'
            : activeTab === 'analyzed'
              ? 'No Prioritized Mails Yet'
              : 'Your Inbox is Ready'}
        </h3>

        <p className="text-xs sm:text-sm text-black/60 max-w-md leading-relaxed mb-5">
          {activeTab === 'encrypted'
            ? 'Load your securely stored emails from database with AES-256 client-side decryption.'
            : activeTab === 'analyzed'
              ? 'Select fetched emails and run AI Priority Analysis to classify topics and calculate priority scores.'
              : 'Fetch your latest emails from Gmail to view, categorize, and run AI Priority Analysis.'}
        </p>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          {activeTab === 'encrypted' && onLoadDataFromDatabase ? (
            <div data-tour="load-action-btn">
              <CustomButton onClick={onLoadDataFromDatabase}>
                <DatabaseBackup className="w-3.5 h-3.5" />
                <span>Load Mails</span>
              </CustomButton>
            </div>
          ) : activeTab === 'analyzed' ? (
            null
          ) : onFetch ? (
            <div data-tour="fetch-action-btn">
              <CustomButton onClick={onFetch}>
                <CloudDownload className="w-3.5 h-3.5" />
                <span>Fetch Mails</span>
              </CustomButton>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full sm:m-0 mt-15 overflow-x-auto no-scrollbar">
      {loading || <Table className="w-full min-w-125 sm:min-w-full table-fixed text-left!">
        <TableHeader>
          <TableRow className="border-b hover:bg-transparent">
            {selectable ? (
              <TableHead className="w-10 sm:w-12 px-2 sm:px-3 text-center">
                <div className="flex items-center justify-center">
                  <Checkbox checked={allSelected}
                    onCheckedChange={() => onToggleAll?.()} aria-label="Select all" />
                </div>
              </TableHead>
            ) : null}
            {mails.length !== 0 &&
              <>
                <TableHead className={cn(colWidths.origin, "px-2 text-[10px] sm:text-[12px] uppercase tracking-wider sm:tracking-widest text-black font-semibold")}>Origin</TableHead>
                <TableHead className={cn(colWidths.subject, "px-2 text-[10px] sm:text-[12px] uppercase tracking-wider sm:tracking-widest text-black font-semibold")}>Subject</TableHead>
                <TableHead className={cn(colWidths.description, "px-2 text-[10px] sm:text-[12px] uppercase tracking-wider sm:tracking-widest text-black font-semibold")}>Description</TableHead>
                <TableHead className={cn(colWidths.time, "px-2 text-[10px] sm:text-[12px] uppercase tracking-wider sm:tracking-widest text-black font-semibold")}>Time</TableHead>
              </>
            }
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {loading ? (
              null
            ) : (
              mails.map((mail) => {
                const selected = selectedIds?.has(mail.id) ?? false;
                const isAnyMailSelected = (selectedIds?.size ?? 0) > 0;
                const category = getSenderCategory(mail.sender);

                return (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    key={mail.id}
                    className={cn(
                      'group cursor-pointer rounded-xl transition-colors text-black hover:bg-black/5'
                    )}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const x = Math.min(e.clientX, window.innerWidth - 240);
                      const y = Math.min(e.clientY, window.innerHeight - 180);
                      setContextMenu({ x, y, mail });
                    }}
                    onPointerDown={() => startHold(mail)}
                    onPointerUp={() => clearHold()}
                    onPointerLeave={() => clearHold()}
                    onPointerCancel={() => clearHold()}
                    onClick={() => {
                      if (holdFired.current) {
                        holdFired.current = false;
                        return;
                      }

                      if (isAnyMailSelected) {
                        onToggleSelect?.(mail.id);
                      } else {
                        onMailClick(mail);
                      }
                    }}
                  >
                    {selectable && !loading ? (
                      <TableCell className="w-10 sm:w-12 px-2 sm:px-3 py-2.5 sm:py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={selected}
                            onCheckedChange={() => onToggleSelect?.(mail.id)}
                            aria-label={`Select ${mail.subject}`}
                          />
                        </div>
                      </TableCell>
                    ) : null}
                    <TableCell className={cn(colWidths.origin, "px-2 py-2.5 text-xs tracking-tight sm:py-3.5 sm:text-sm overflow-hidden")}>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={cn("inline-flex shrink-0 rounded-2xl items-center p-1 leading-none", mail.status === "unread" ? "bg-red-600 text-white" : "bg-green-600 text-white")}/>
                        <span className="truncate font-semibold text-black/75" title={mail.sender}>
                          {mail.sender.split('<')[0].trim() || mail.sender}
                        </span>
                        {category && (!mail.category || category.label.toLowerCase() !== mail.category.toLowerCase()) && (
                          <span
                            className={cn(
                              'inline-flex shrink-0 items-center px-1.5 py-0.5 rounded text-[9px] font-medium leading-none',
                              category.className
                            )}
                          >
                            {category.label}
                          </span>
                        )}
                        {mail.category && (
                          <span
                            className={cn(
                              'inline-flex shrink-0 items-center px-1.5 py-0.5 rounded text-[9px] font-medium leading-none',
                              getCategoryBadgeColor(mail.category)
                            )}
                          >
                            {mail.category}
                          </span>
                        )}
                        {mail.priority_score !== undefined && mail.priority_score !== null && (() => {
                          const pct = (mail.priority_score * 100) / 10;
                          return (
                            <span
                              title={`Priority: ${pct.toFixed(0)}%`}
                              className={cn(
                                'inline-flex shrink-0 items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-medium leading-none',
                                getPriorityBadgeColor(pct)
                              )}
                            >
                              {pct % 1 === 0 ? `${pct.toFixed(0)}%` : `${pct.toFixed(1)}%`}
                            </span>
                          );
                        })()}
                      </div>
                    </TableCell>
                    <TableCell className={cn(colWidths.subject, "px-2 py-2.5 text-xs tracking-tight sm:py-3.5 sm:text-sm overflow-hidden")}>
                      <span className="block truncate font-semibold text-black/75">{mail.subject}</span>
                      <div className="block md:hidden mt-0.5 text-[11px] text-black/55 truncate">
                        {generatingDescriptions && !mail.description && !mail.summary ? (
                          <div className="h-3 w-3/4 animate-pulse rounded bg-black/10 mt-1" />
                        ) : (
                          <span>{mail.summary || mail.description || formatEmailContent(mail.body)}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={cn(colWidths.description, "px-2 py-2.5 text-xs tracking-tight sm:py-3.5 sm:text-sm overflow-hidden")}>
                      {generatingDescriptions && !mail.description && !mail.summary ? (
                        <div className="flex items-center">
                          <div className="h-3.5 w-4/5 animate-pulse rounded-md bg-black/10" />
                        </div>
                      ) : (
                        <span
                          className="block truncate font-normal text-black/50"
                          title={mail.summary || mail.description || mail.body}
                        >
                          {mail.summary || mail.description || formatEmailContent(mail.body)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className={cn(colWidths.time, "px-2 py-2.5 text-[10px] text-black/75 sm:py-3.5 sm:text-xs")}>
                      {new Date(mail.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </TableCell>
                  </motion.tr>
                );
              })
            )}
          </AnimatePresence>
        </TableBody>
      </Table>
      }

      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ left: contextMenu.x, top: contextMenu.y }}
            className="fixed z-70 w-40 rounded-lg rounded-tl-none bg-white backdrop-blur-2xl border border-gray-200/80 shadow-md p-1.5 ring-1 ring-black/5 flex flex-col gap-0.5 text-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            {hasCategories && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const targetMail = contextMenu.mail;
                    setContextMenu(null);
                    onInsightMail?.(targetMail);
                  }}
                  className="group flex w-full items-center justify-between px-3 py-2 rounded-md text-xs font-medium hover:bg-black/5 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-black">Insight</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const targetMail = contextMenu.mail;
                    setContextMenu(null);
                    onAnalyzeMail?.(targetMail);
                  }}
                  className="group flex w-full items-center justify-between px-3 py-2 rounded-md text-xs font-medium hover:bg-black/5 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-black">Analysis</span>
                  </div>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => {
                const targetMail = contextMenu.mail;
                setContextMenu(null);
                onStoreEncryptedMail?.(targetMail);
              }}
              className="group flex w-full items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium hover:bg-black/5 cursor-pointer"
            >
              <span className="text-black">Store</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}