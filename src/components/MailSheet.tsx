'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ExternalLink, ChevronRightIcon } from 'lucide-react';
import { Mail } from '@/types';
import { cn, formatEmailContent } from '@/lib/utils';
import { getSenderCategory } from '@/lib/sender-category';
import QueryDrawer from './QueryDrawer';

interface MailDetailSheetProps {
  mail: Mail | null;
  onClose: () => void;
}

function parseSender(senderStr: string) {
  if (!senderStr) return { name: 'Unknown', email: null, initials: '??' };
  const match = senderStr.match(/^(.*?)\s*<(.+?)>$/);
  if (match) {
    const rawName = match[1].replace(/^["']|["']$/g, '').trim();
    const email = match[2].trim();
    const name = rawName || email.split('@')[0];
    const initials = name.slice(0, 2).toUpperCase();
    return { name, email, initials };
  }
  const email = senderStr.trim();
  const name = email.split('@')[0];
  const initials = name.slice(0, 2).toUpperCase();
  return { name, email, initials };
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 640);
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  return isDesktop;
}

export default function MailSheet({ mail, onClose }: MailDetailSheetProps) {
  const isDesktop = useIsDesktop();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (mail) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mail, onClose]);

  useEffect(() => {
    if (mail && !isDesktop) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mail, isDesktop]);

  if (!mail) return null;

  const { name, email, initials } = parseSender(mail.sender);
  const category = getSenderCategory(mail.sender);

  const formattedDate = new Date(mail.createdAt).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const gmailUrl = `https://mail.google.com/mail/u/0/#all/${mail.id}`;

  const contentMarkup = (
    <div className="space-y-2.5">
      {/* Sender row */}
      <div className="flex items-center gap-2.5 pb-2">
        <div className="shrink-0 h-9 w-9 rounded-full bg-background border border-foreground/50 border-dashed flex items-center justify-center">
          <span className="text-xs font-bold text-foreground">{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold text-foreground truncate">{name}</span>
            <span
              className={cn(
                'text-[9px] font-semibold px-2 py-0.5 rounded capitalize shrink-0',
                mail.status === 'unread'
                  ? 'bg-red-600/10 text-red-600'
                  : 'bg-green-600/10 text-green-600'
              )}
            >
              {mail.status}
            </span>
            {category && (
              <span className={cn('text-[9px] font-medium px-2 py-0.5 rounded shrink-0 leading-none', category.className)}>
                {category.label}
              </span>
            )}
          </div>
          {email && (
            <p className="text-[10px] text-foreground/50 truncate font-mono leading-tight mt-0.5">{email}</p>
          )}
          <div className="flex items-center gap-1 mt-0.5">
            <Clock className="h-3 w-3 text-foreground/40 shrink-0" />
            <span className="text-[10px] text-foreground/40 truncate">{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Subject */}
      <div className="p-2.5 space-y-1">
        <span className="text-[9px] font-bold uppercase tracking-wider text-foreground block">Subject</span>
        <h2 className="text-xs font-semibold text-foreground leading-snug wrap-break-word">
          {mail.subject || '(No Subject)'}
        </h2>
      </div>

      {/* Description */}
      {mail.description && (
        <div className="p-2.5 space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-foreground block">Description</span>
          <p className="text-xs text-foreground/80 font-medium leading-relaxed">{mail.description}</p>
        </div>
      )}

      {/* Summary */}
      {mail.summary && (
        <div className="p-2.5 space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-foreground block">Summary</span>
          <p className="text-xs text-foreground/75 leading-relaxed whitespace-pre-line">{mail.summary}</p>
        </div>
      )}

      {/* AI Classification */}
      {(mail.category || mail.priority_score !== undefined || mail.confidence_score !== undefined || mail.versions || mail.retry_count !== undefined) && (
        <div className="p-2.5 space-y-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-foreground block">
            AI Classification &amp; Priority
          </span>
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            {mail.category && (
              <div className="p-2 rounded-lg bg-foreground/5">
                <span className="text-[9px] text-foreground/50 block">Category</span>
                <span className="font-semibold text-foreground text-xs">{mail.category}</span>
              </div>
            )}
            {mail.priority_score !== undefined && mail.priority_score !== null && (
              <div className="p-2 rounded-lg bg-foreground/5">
                <span className="text-[9px] text-foreground/50 block">Priority Score</span>
                <span className="font-semibold font-mono text-foreground text-xs">{((mail.priority_score * 100) / 10).toFixed(2)}%</span>
              </div>
            )}
            {mail.confidence_score !== undefined && mail.confidence_score !== null && (
              <div className="p-2 rounded-lg bg-foreground/5">
                <span className="text-[9px] text-foreground/50 block">Confidence</span>
                <span className="font-semibold font-mono text-foreground text-xs">{(mail.confidence_score * 100).toFixed(2)}%</span>
              </div>
            )}
            {(mail.versions || mail.retry_count !== undefined) && (
              <div className="p-2 rounded-lg bg-foreground/5">
                <span className="text-[9px] text-foreground/50 block">Version &amp; Retries</span>
                <span className="font-semibold font-mono text-foreground text-xs">
                  v{mail.versions?.[0] ?? 1} (retry: {mail.retry_count ?? 0})
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Body preview + open link */}
      <div className="relative rounded-xl p-3 min-h-50 sm:h-67 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 p-3 overflow-hidden select-none pointer-events-none blur-xs opacity-30 text-xs leading-relaxed text-foreground/75 whitespace-pre-wrap wrap-break-word font-normal">
          {formatEmailContent(mail.body) || 'No message content available.'}
        </div>
        <div className="relative z-10 flex items-center justify-center">
          <a
            href={gmailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 duration-200 text-foreground px-5 py-2 text-xs font-semibold cursor-pointer hover:text-foreground/80 transition-colors"
          >
            <span>Open in Gmail</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );

  // Desktop: already uses QueryDrawer
  if (isDesktop) {
    return (
      <QueryDrawer
        open={!!mail}
        onOpenChange={(open) => !open && onClose()}
        title="Email Details"
        description="Detailed view &amp; AI insights"
      >
        {contentMarkup}
      </QueryDrawer>
    );
  }

  // Mobile: same glass sheet style as QueryDrawer mobile
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {mail && (
        <>
          {/* Blurred backdrop — matches QueryDrawer */}
          <motion.div
            key="mail-sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed inset-0 z-60 bg-black/25 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Bottom sheet panel — matches QueryDrawer mobile */}
          <motion.div
            key="mail-sheet-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 300, mass: 0.8 }}
            className="fixed bottom-0 left-0 right-0 z-70 w-full max-h-[85vh] rounded-t-4xl bg-foreground/5 backdrop-blur-md border-t border-foreground/15 flex flex-col overflow-hidden text-foreground select-text shadow-2xl"
          >
            {/* Drag handle */}
            <div className="flex shrink-0 justify-center -mt-1 pb-1 select-none touch-none">
              <div className="mt-3 h-1.5 w-12 rounded-full bg-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-2 pb-3 border-b border-foreground/15 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                <div className="shrink-0 h-8 w-8 rounded-full bg-linear-to-br from-red-600 via-red-500 to-rose-400 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{initials}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">{name}</p>
                  <p className="text-[10px] text-foreground/50 font-mono truncate">Email Details</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1 p-1.5 transition-all duration-200 rounded-4xl text-xs cursor-pointer text-foreground/60 hover:text-foreground"
              >
                <ChevronRightIcon className="size-3.5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 py-3 space-y-2.5 overflow-y-auto overscroll-contain flex-1">
              {contentMarkup}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}