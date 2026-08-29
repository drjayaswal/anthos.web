'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  RotateCw,
  ShieldCheck,
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomButton } from '@/components/ui/button';
import { Mail } from '@/types';
import { formatEmailContent, cn } from '@/lib/utils';
import type { MailInboxTab } from './MailInboxTabs';

const HOLD_MS = 450;

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
  hasCategories?: boolean;
  activeTab?: MailInboxTab;
  onFetch?: () => void;
  onLoadDataFromDatabase?: () => void;
  onGoToFetched?: () => void;
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
  hasCategories = true,
  activeTab = 'fetched',
  onFetch,
  onLoadDataFromDatabase,
}: MailTableProps) {
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdFired = useRef(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; mail: Mail } | null>(null);
  const allSelected = selectable && mails.length > 0 && mails.every((m) => selectedIds?.has(m.id));

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
    <div className="w-full sm:m-0 mt-10 overflow-x-auto no-scrollbar">
      <Table className="w-full min-w-125 sm:min-w-full table-fixed">
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
                <TableHead className="w-20 sm:w-24 px-2 text-[10px] sm:text-[12px] uppercase tracking-wider sm:tracking-widest text-black font-semibold">Status</TableHead>
                <TableHead className="w-[30%] sm:w-[24%] md:w-[18%] px-2 text-[10px] sm:text-[12px] uppercase tracking-wider sm:tracking-widest text-black font-semibold">Origin</TableHead>
                <TableHead className="w-[50%] sm:w-[56%] md:w-[32%] px-2 text-[10px] sm:text-[12px] uppercase tracking-wider sm:tracking-widest text-black font-semibold">Subject</TableHead>
                <TableHead className="hidden md:table-cell md:w-[38%] px-2 text-[10px] sm:text-[12px] uppercase tracking-wider sm:tracking-widest text-black font-semibold">Body</TableHead>
                <TableHead className="hidden sm:table-cell sm:w-[20%] md:w-[12%] px-2 text-right text-[10px] sm:text-[12px] uppercase tracking-wider sm:tracking-widest text-black font-semibold">Time</TableHead>
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
                    <TableCell className="w-20 sm:w-24 px-2 py-2.5 sm:py-3.5">
                      <Badge variant={mail.status === 'unread' ? 'failure_light' : 'success_light'} className="px-2 py-0.5 text-[9px] capitalize sm:px-2.5 sm:text-[10px] font-semibold shadow-xs">
                        {mail.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-[30%] sm:w-[24%] md:w-[18%] px-2 py-2.5 text-xs tracking-tight sm:py-3.5 sm:text-sm overflow-hidden">
                      <span className="block truncate font-semibold text-black/75">{mail.sender.split('<')[0]}</span>
                    </TableCell>
                    <TableCell className="w-[50%] sm:w-[56%] md:w-[32%] px-2 py-2.5 text-xs tracking-tight sm:py-3.5 sm:text-sm overflow-hidden">
                      <span className="block truncate font-semibold text-black/75">{mail.subject}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell md:w-[38%] px-2 py-2.5 text-xs tracking-tight sm:py-3.5 sm:text-sm overflow-hidden">
                      <span className="block truncate font-semibold text-black/75">{formatEmailContent(mail.body)}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell sm:w-[20%] md:w-[12%] px-2 py-2.5 text-right text-[10px] text-black/75 sm:py-3.5 sm:text-xs">
                      {new Date(mail.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </TableCell>
                  </motion.tr>
                );
              })
            )}
          </AnimatePresence>
        </TableBody>
      </Table>

      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ left: contextMenu.x, top: contextMenu.y }}
            className="fixed z-70 w-56 rounded-4xl rounded-tl-none bg-white backdrop-blur-2xl border border-gray-200/80 shadow-2xl p-1.5 ring-1 ring-black/5 flex flex-col gap-0.5 text-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            {hasCategories && (
              <button
                type="button"
                onClick={() => {
                  const targetMail = contextMenu.mail;
                  setContextMenu(null);
                  onAnalyzeMail?.(targetMail);
                }}
                className="group flex w-full items-center justify-between px-3 py-2 rounded-xl text-xs font-medium hover:bg-black/5 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-black" />
                  <span className="text-black">Analyze</span>
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setContextMenu(null);
                window.location.reload();
              }}
              className="group flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-black/5 cursor-pointer"
            >
              <RotateCw className="w-4 h-4 text-black" />
              <span className='text-black'>Refresh Page</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const targetMail = contextMenu.mail;
                setContextMenu(null);
                onStoreEncryptedMail?.(targetMail);
              }}
              className="group flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-black/5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-black" />
              <span className="text-black">Store</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}