'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, User, ExternalLink } from 'lucide-react';
import { Mail } from '@/types';
import { Badge } from './ui/badge';
import { useBodyScrollLock } from '@/lib/useBodyScrollLock';
import { formatEmailContent } from '@/lib/utils';

interface MailDetailSheetProps {
  mail: Mail | null;
  onClose: () => void;
}

export default function MailSheet({ mail, onClose }: MailDetailSheetProps) {
  useBodyScrollLock(!!mail);

  const initials = mail?.sender
    ? mail.sender.split('@')[0].slice(0, 2).toUpperCase()
    : '??';

  const formattedDate = mail
    ? new Date(mail.createdAt).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : '';

  const gmailUrl = mail ? `https://mail.google.com/mail/u/0/#all/${mail.id}` : '#';

  return (
    <AnimatePresence>
      {mail && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-70 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 pointer-events-none">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.7 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80 || info.velocity.y > 200) {
                  onClose();
                }
              }}
              className="w-full sm:w-140 md:w-155 sm:max-w-sm max-h-[70dvh] sm:max-h-[50vh] flex flex-col rounded-t-4xl sm:rounded-2xl border border-b-0 sm:border-b border-white/20 [html.light_&]:border-black/20 bg-[#2c0237] [html.light_&]:bg-white text-white [html.light_&]:text-black shadow-2xl overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sm:hidden flex shrink-0 justify-center pt-3 pb-1.5 cursor-grab active:cursor-grabbing touch-none select-none">
                <div className="h-1.5 w-12 rounded-full bg-white/25 [html.light_&]:bg-black/25" />
              </div>

              <div className="shrink-0 px-4 sm:px-5 pt-3 sm:pt-4 pb-3 border-b border-white/10 [html.light_&]:border-black/10">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/10 [html.light_&]:bg-black/5 border border-white/10 [html.light_&]:border-black/10 flex items-center justify-center">
                      <span className="text-xs sm:text-sm font-semibold text-white [html.light_&]:text-black">{initials}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-white [html.light_&]:text-black truncate max-w-40 sm:max-w-xs">
                          {mail.sender}
                        </p>
                        <Badge
                          variant={mail.status === 'unread' ? 'failure_light' : 'success_light'}
                          className="capitalize text-[10px] px-2 py-0 h-4 shrink-0"
                        >
                          {mail.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3 text-white/40 [html.light_&]:text-black/40 shrink-0" />
                        <p className="text-[11px] text-white/50 [html.light_&]:text-black/50 truncate">{formattedDate}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    title="Close"
                    className="shrink-0 h-7 w-7 cursor-pointer rounded-full flex items-center justify-center text-white/50 hover:text-red-500 [html.light_&]:text-black/50 [html.light_&]:hover:text-red-600 hover:bg-white/10 [html.light_&]:hover:bg-black/5 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {mail.recipient && (
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <User className="h-3 w-3 text-white/30 [html.light_&]:text-black/30 shrink-0" />
                    <span className="text-[11px] text-white/50 [html.light_&]:text-black/50">To:</span>
                    <span className="text-[11px] text-white/70 [html.light_&]:text-black/70 truncate">{mail.recipient}</span>
                  </div>
                )}
              </div>

              <div className="shrink-0 px-4 sm:px-5 py-3 border-b border-white/10 [html.light_&]:border-black/10 bg-white/5 [html.light_&]:bg-black/2">
                <h2 className="text-base sm:text-sm font-semibold leading-snug text-white [html.light_&]:text-black wrap-break-word">
                  {mail.subject} 
                </h2>
                {mail.summary && (
                  <div className="mt-2 p-2.5 rounded-xl bg-white/5 [html.light_&]:bg-black/5 border border-white/5 [html.light_&]:border-white/5">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-white/50 [html.light_&]:text-black/50 mb-1">
                      AI Summary
                    </p>
                    <p className="text-xs text-white/80 [html.light_&]:text-black/80 leading-relaxed">
                      {mail.summary}
                    </p>
                  </div>
                )}
              </div>

              <div className="relative min-h-60 sm:min-h-72 flex-1 overflow-hidden flex flex-col justify-center">
                <div className="absolute inset-0 overflow-hidden px-4 sm:px-5 py-4 select-none pointer-events-none blur-xs opacity-25 dark:opacity-20">
                  <p className="text-sm leading-relaxed text-white/80 [html.light_&]:text-black/80 whitespace-pre-wrap wrap-break-word font-normal">
                    {formatEmailContent(mail.body) || 'No email content.'}
                  </p>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center px-4 py-8 text-center">
                  <p className="text-base sm:text-xs font-medium text-white/75 [html.light_&]:text-black/75 max-w-sm mb-4">
                    Open in Gmail to read the full message with rich formatting, attachments, and threads.
                  </p>
                  <a
                    href={gmailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-white text-accent [html.light_&]:bg-black [html.light_&]:text-white px-4 py-2 text-xs font-semibold shadow-md hover:opacity-90 transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <span>Open in Gmail</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}