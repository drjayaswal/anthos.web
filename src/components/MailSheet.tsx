'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, User } from 'lucide-react';
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
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 || info.velocity.y > 200) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 z-70 flex max-h-[88dvh] w-full sm:mx-auto flex-col rounded-t-4xl border border-b-0 border-white/30 [html.light_&]:border-black/30 bg-[#2c0237] [html.light_&]:bg-white text-white [html.light_&]:text-black shadow-2xl overflow-hidden"
          >
            <div className="flex shrink-0 justify-center pt-3 pb-1.5 cursor-grab active:cursor-grabbing touch-none select-none">
              <div className="h-1.5 w-12 rounded-full bg-white/25 [html.light_&]:bg-black/25" />
            </div>
            <div className="shrink-0 px-4 sm:px-5 pt-2 pb-3 border-b border-white/10 [html.light_&]:border-black/10">
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
                  className="shrink-0 h-7 w-7 cursor-pointer rounded-full flex items-center justify-center text-white/50 hover:text-white [html.light_&]:text-black/50 [html.light_&]:hover:text-black hover:bg-white/10 [html.light_&]:hover:bg-black/5 transition-colors"
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
              <h2 className="text-base sm:text-lg font-semibold leading-snug text-white [html.light_&]:text-black wrap-break-word">
                {mail.subject}
              </h2>
              {mail.summary && (
                <div className="mt-2 p-2.5 rounded-xl bg-white/5 [html.light_&]:bg-black/5 border border-white/5 [html.light_&]:border-black/5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-white/50 [html.light_&]:text-black/50 mb-1">
                    AI Summary
                  </p>
                  <p className="text-xs text-white/80 [html.light_&]:text-black/80 leading-relaxed">
                    {mail.summary}
                  </p>
                </div>
              )}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5 py-4">
              <div className="max-w-none">
                <p className="text-sm leading-relaxed text-white/80 [html.light_&]:text-black/80 whitespace-pre-wrap wrap-break-word font-normal">
                  {formatEmailContent(mail.body) || 'No content.'}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}