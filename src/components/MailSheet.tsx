'use client';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { X, Clock, ExternalLink } from 'lucide-react';
import { Mail } from '@/types';
import { cn, formatEmailContent } from '@/lib/utils';
import { getSenderCategory } from '@/lib/sender-category';

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

export default function MailSheet({ mail, onClose }: MailDetailSheetProps) {
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

  return (
    <Dialog open={!!mail} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-full sm:w-80 sm:max-w-lg rounded-t-4xl sm:rounded-b-none bg-white border sm:border-b border-b-0 text-black shadow-2xl p-0 gap-0 overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
            <div className="shrink-0 h-9 w-9 rounded-full bg-linear-to-br from-red-600 via-red-500 to-rose-400 flex items-center justify-center shadow-xs">
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <DialogTitle className="text-xs font-semibold text-black truncate">
                  {name}
                </DialogTitle>
                <span
                  className={cn(
                    'text-[9px] font-semibold px-2 py-0.2 rounded capitalize shrink-0',
                    mail.status === 'unread'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-emerald-50 text-emerald-600'
                  )}
                >
                  {mail.status}
                </span>
                {category && (
                  <span
                    className={cn(
                      'text-[9px] font-medium px-2 py-0.5 rounded shrink-0 leading-none',
                      category.className
                    )}
                  >
                    {category.label}
                  </span>
                )}
              </div>
              {email && (
                <p className="text-[10px] text-black/50 truncate font-mono leading-tight mt-0.5">
                  {email}
                </p>
              )}
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="h-3 w-3 text-black/40 shrink-0" />
                <DialogDescription className="text-[10px] text-black/40 truncate">
                  {formattedDate}
                </DialogDescription>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Close dialog"
            className="shrink-0 rounded cursor-pointer p-1 text-black/50 hover:text-red-600! transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="px-4 py-3 space-y-2.5 overflow-y-auto overscroll-contain flex-1">
          <div className="p-2.5 border border-dashed border-amber-500/50 space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500 block">
              Subject
            </span>
            <h2 className="text-xs font-semibold text-black leading-snug wrap-break-word">
              {mail.subject || '(No Subject)'}
            </h2>
          </div>

          {mail.description && (
            <div className="p-2.5 space-y-1 border border-dashed border-purple-500/50">
              <span className="text-[9px] font-bold uppercase tracking-wider text-purple-600 block">
                Description
              </span>
              <p className="text-xs text-black/85 font-medium leading-relaxed">{mail.description}</p>
            </div>
          )}

          {mail.summary && (
            <div className="p-2.5 space-y-1 border border-dashed border-blue-600/50">
              <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 block">
                Summary
              </span>
              <p className="text-xs text-black/80 leading-relaxed whitespace-pre-line">{mail.summary}</p>
            </div>
          )}

          {(mail.category || mail.priority_score !== undefined || mail.confidence_score !== undefined || mail.versions || mail.retry_count !== undefined) && (
            <div className="p-2.5 space-y-1.5 border border-dashed border-green-600/50">
              <span className="text-[9px] font-bold uppercase tracking-wider text-green-600 block">
                AI Classification & Priority
              </span>
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                {mail.category && (
                  <div className="p-2">
                    <span className="text-[9px] text-black/50 block">Category</span>
                    <span className="font-semibold text-black text-xs">{mail.category}</span>
                  </div>
                )}
                {mail.priority_score !== undefined && mail.priority_score !== null && (
                  <div className="p-2">
                    <span className="text-[9px] text-black/50 block">Priority Score</span>
                    <span className="font-semibold font-mono text-black text-xs">{((mail.priority_score * 100)/10).toFixed(2)}%</span>
                  </div>
                )}
                {mail.confidence_score !== undefined && mail.confidence_score !== null && (
                  <div className="p-2">
                    <span className="text-[9px] text-black/50 block">Confidence</span>
                    <span className="font-semibold font-mono text-black text-xs">{(mail.confidence_score * 100).toFixed(2)}%</span>
                  </div>
                )}
                {(mail.versions || mail.retry_count !== undefined) && (
                  <div className="p-2">
                    <span className="text-[9px] text-black/50 block">Version & Retries</span>
                    <span className="font-semibold font-mono text-black text-xs">
                      v{mail.versions?.[0] ?? 1} (retry: {mail.retry_count ?? 0})
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="relative p-3 min-h-36 border border-black/25 border-dashed overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 p-3 overflow-hidden select-none pointer-events-none blur-xs opacity-50 text-xs leading-relaxed text-black/75 whitespace-pre-wrap wrap-break-word font-normal">
              {formatEmailContent(mail.body) || 'No message content available.'}
            </div>

            <div className="relative z-10 flex items-center justify-center">
              <a
                href={gmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 duration-200 text-black px-5 py-2 text-xs font-semibold cursor-pointer"
              >
                <span>Open</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}