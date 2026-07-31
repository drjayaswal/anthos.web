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
    <div className="overflow-x-auto no-scrollbar">
      <Table>
        <TableHeader>
          <TableRow>
            {selectable ? (
              <TableHead className="w-10">
                {selectedIds?.size || allSelected ?
                  <Checkbox checked={allSelected} onCheckedChange={() => onToggleAll?.()} aria-label="Select all" />
                  : null}
              </TableHead>
            ) : null}
            {mails.length !== 0 && 
            <>
            <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-[12px] sm:tracking-widest">Status</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-[12px] sm:tracking-widest">Origin</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-[12px] sm:tracking-widest">Subject</TableHead>
            <TableHead className="hidden text-[10px] uppercase tracking-wider text-muted-foreground md:table-cell sm:text-[12px] sm:tracking-widest">Body</TableHead>
            <TableHead className="hidden text-[10px] uppercase tracking-wider text-muted-foreground sm:table-cell sm:text-[12px] sm:tracking-widest">Time</TableHead>
            </>
            }
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="">
                  {selectable ? (
                    <TableCell>
                      <Skeleton className="h-4 w-4 bg-white/5" />
                    </TableCell>
                  ) : null}
                  <TableCell>
                    <Skeleton className="h-4 w-16 bg-white/5" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32 bg-white/5" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32 bg-white/5" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32 bg-white/5" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-24 bg-white/5" />
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
                      'group cursor-pointer rounded-xl transition-colors text-black hover:bg-black/3',
                      selected && 'bg-accent/10 hover:bg-accent/10 text-black',
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
                      <TableCell className="py-2 sm:py-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected}
                          className='data-checked:bg-accent data-checked:border-accent'
                          onCheckedChange={() => onToggleSelect?.(mail.id)}
                          aria-label={`Select ${mail.subject}`}
                        />
                      </TableCell>
                    ) : null}
                    <TableCell className="py-2 sm:py-4">
                      <Badge variant={mail.status === 'unread' ? 'failure_light' : 'success_light'} className="px-1.5 py-0 text-[9px] capitalize sm:px-2 sm:text-[10px]">
                        {mail.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[28vw] py-2 text-xs tracking-tight sm:max-w-none sm:py-4 sm:text-sm">
                      <span className="block truncate sm:max-w-[280px]">{mail.sender.split('<')[0]}</span>
                    </TableCell>
                    <TableCell className="max-w-[36vw] py-2 text-xs tracking-tight sm:max-w-none sm:py-4 sm:text-sm">
                      <span className="block truncate sm:max-w-[280px]">{mail.subject}</span>
                    </TableCell>
                    <TableCell className="hidden max-w-[40vw] py-2 text-xs tracking-tight md:table-cell sm:py-4 sm:text-sm sm:max-w-none">
                      <span className="block truncate sm:max-w-[280px]">{formatEmailContent(mail.body)}</span>
                    </TableCell>
                    <TableCell className="hidden py-2 text-right text-[10px] text-muted-foreground sm:table-cell sm:py-4 sm:text-xs">
                      {new Date(mail.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </TableCell>
                  </motion.tr>
                );
              })
            )}
          </AnimatePresence>
        </TableBody>
      </Table>

      {/* Right-Click Context Menu */}
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

            {/* 1. Analyze (Disabled) */}
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

            {/* 2. Refresh Page */}
            <button
              type="button"
              onClick={() => {
                setContextMenu(null);
                window.location.reload();
              }}
              className="group flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 hover:text-[#ff3131] hover:bg-[#ff3131]/10 transition-colors cursor-pointer"
            >
              <RotateCw className="w-4 h-4 text-zinc-500 group-hover:text-[#ff3131] transition-colors" />
              <span>Refresh Page</span>
            </button>

            {/* 3. Store Encrypted in DB */}
            <button
              type="button"
              onClick={() => {
                const targetMail = contextMenu.mail;
                setContextMenu(null);
                onStoreEncryptedMail?.(targetMail);
              }}
              className="group flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 hover:text-[#ff3131] hover:bg-[#ff3131]/10 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-zinc-500 group-hover:text-[#ff3131] transition-colors" />
              <span>Store Encrypted in DB</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}