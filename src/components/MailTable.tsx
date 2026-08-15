'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCw, ShieldCheck } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail } from '@/types';
import { formatEmailContent, cn } from '@/lib/utils';

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
  hasCategories?: boolean;
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
  hasCategories = true,
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

  return (
    <div className="w-full sm:m-0 mt-10 overflow-x-auto no-scrollbar">
      <Table className="w-full min-w-125 sm:min-w-full table-fixed">
        <TableHeader>
          <TableRow className="border-b border-black/5 hover:bg-transparent">
            {selectable ? (
              <TableHead className="w-10 sm:w-12 px-2 sm:px-3 text-center">
                <div className="flex items-center justify-center">
                  <Checkbox checked={allSelected}
                    className="[html.light_&]:data-checked:bg-accent [html.light_&]:data-checked:border-accent dark:data-checked:bg-white dark:data-checked:border-white dark:data-checked:text-black [html.light_&]:data-checked:text-white"
                    onCheckedChange={() => onToggleAll?.()} aria-label="Select all" />
                </div>
              </TableHead>
            ) : null}
            {mails.length !== 0 &&
              <>
                <TableHead className="w-20 sm:w-24 px-2 text-[10px] sm:text-[12px] uppercase tracking-wider sm:tracking-widest dark:text-white [html.light_&]:text-black font-semibold">Status</TableHead>
                <TableHead className="w-[30%] sm:w-[24%] md:w-[18%] px-2 text-[10px] sm:text-[12px] uppercase tracking-wider sm:tracking-widest dark:text-white [html.light_&]:text-black font-semibold">Origin</TableHead>
                <TableHead className="w-[50%] sm:w-[56%] md:w-[32%] px-2 text-[10px] sm:text-[12px] uppercase tracking-wider sm:tracking-widest dark:text-white [html.light_&]:text-black font-semibold">Subject</TableHead>
                <TableHead className="hidden md:table-cell md:w-[38%] px-2 text-[10px] sm:text-[12px] uppercase tracking-wider sm:tracking-widest dark:text-white [html.light_&]:text-black font-semibold">Body</TableHead>
                <TableHead className="hidden sm:table-cell sm:w-[20%] md:w-[12%] px-2 text-right text-[10px] sm:text-[12px] uppercase tracking-wider sm:tracking-widest dark:text-white [html.light_&]:text-black font-semibold">Time</TableHead>
              </>
            }
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="border-b border-black/5">
                  {selectable ? (
                    <TableCell className="w-10 sm:w-12 px-2 sm:px-3">
                      <div className="flex items-center justify-center">
                        <Skeleton className="h-4 w-4 bg-black/10 rounded" />
                      </div>
                    </TableCell>
                  ) : null}
                  <TableCell className="w-20 sm:w-24 px-2">
                    <Skeleton className="h-4 w-14 sm:w-16 bg-black/10 rounded-full" />
                  </TableCell>
                  <TableCell className="w-[30%] sm:w-[24%] md:w-[18%] px-2">
                    <Skeleton className="h-4 w-24 sm:w-32 bg-black/10 rounded" />
                  </TableCell>
                  <TableCell className="w-[50%] sm:w-[56%] md:w-[32%] px-2">
                    <Skeleton className="h-4 w-32 sm:w-48 bg-black/10 rounded" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell md:w-[38%] px-2">
                    <Skeleton className="h-4 w-40 sm:w-64 bg-black/10 rounded" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell sm:w-[20%] md:w-[12%] px-2 text-right">
                    <Skeleton className="ml-auto h-4 w-16 sm:w-20 bg-black/10 rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : mails.length === 0 ? (
              <TableRow className="border-gray-200/75 hover:bg-transparent">
                <TableCell colSpan={selectable ? 6 : 5} className="h-32 text-center text-[10px] uppercase tracking-wider text-muted-foreground sm:h-48 sm:text-xs sm:tracking-widest">
                  No Mails Found
                </TableCell>
              </TableRow>
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
                      'group cursor-pointer rounded-xl transition-colors dark:text-white hover:bg-black/5',
                      selected && 'bg-accent/10 hover:bg-accent/10 dark:text-white',
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
                    {selectable ? (
                      <TableCell className="w-10 sm:w-12 px-2 sm:px-3 py-2.5 sm:py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={selected}
                            className="[html.light_&]:data-checked:bg-accent [html.light_&]:data-checked:border-accent dark:data-checked:bg-white dark:data-checked:border-white dark:data-checked:text-black [html.light_&]:data-checked:text-white"
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
                      <span className="block truncate font-semibold dark:text-white/75 [html.light_&]:text-black/75">{mail.sender.split('<')[0]}</span>
                    </TableCell>
                    <TableCell className="w-[50%] sm:w-[56%] md:w-[32%] px-2 py-2.5 text-xs tracking-tight sm:py-3.5 sm:text-sm overflow-hidden">
                      <span className="block truncate font-semibold dark:text-white/75 [html.light_&]:text-black/75">{mail.subject}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell md:w-[38%] px-2 py-2.5 text-xs tracking-tight sm:py-3.5 sm:text-sm overflow-hidden">
                      <span className="block truncate font-semibold dark:text-white/75 [html.light_&]:text-black/75">{formatEmailContent(mail.body)}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell sm:w-[20%] md:w-[12%] px-2 py-2.5 text-right text-[10px] dark:text-white/75 [html.light_&]:text-black/75 sm:py-3.5 sm:text-xs">
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
            className="fixed z-70 w-56 rounded-2xl bg-white/95 backdrop-blur-2xl border border-gray-200/80 shadow-2xl p-1.5 ring-1 ring-black/5 flex flex-col gap-0.5 text-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate border-b border-zinc-100 mb-1">
              {contextMenu.mail.subject || 'Mail Options'}
            </div>

            {hasCategories && (
              <button
                type="button"
                disabled
                className="group flex w-full items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 opacity-50 cursor-not-allowed select-none"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-zinc-400" />
                  <span>Analyze</span>
                </div>
                <span className="text-[9px] bg-zinc-100 text-zinc-400 px-1.5 py-0.5 rounded font-semibold uppercase">Disabled</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setContextMenu(null);
                window.location.reload();
              }}
              className="group flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 hover:text-[#2c0237] hover:bg-[#2c0237]/10 transition-colors cursor-pointer"
            >
              <RotateCw className="w-4 h-4 text-zinc-500 group-hover:text-[#2c0237] transition-colors" />
              <span>Refresh Page</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const targetMail = contextMenu.mail;
                setContextMenu(null);
                onStoreEncryptedMail?.(targetMail);
              }}
              className="group flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 hover:text-[#2c0237] hover:bg-[#2c0237]/10 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-zinc-500 group-hover:text-[#2c0237] transition-colors" />
              <span>Store Encrypted in DB</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}