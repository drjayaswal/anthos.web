'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, X, Bot, Mail as MailIcon, Loader2 } from 'lucide-react';
import { CustomButton } from '@/components/ui/button';
import type { Mail } from '@/types';
import { getProviderByName } from '@/lib/providers';

interface InsightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mail: Mail | null;
  onGetInsight: (mail: Mail) => void;
  loading?: boolean;
}

export default function InsightDialog({
  open,
  onOpenChange,
  mail,
  onGetInsight,
  loading = false,
}: InsightDialogProps) {
  if (!mail) return null;

  const openaiProvider = getProviderByName('OpenAI');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !mail) return;
    onGetInsight(mail);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full sm:w-80 max-w-[calc(100vw)] rounded-t-4xl sm:rounded-2xl bg-white border sm:border-b border-b-0 text-black shadow-2xl p-0 gap-0 overflow-hidden flex flex-col min-w-0"
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b shrink-0 min-w-0">
          <div className="min-w-0 flex-1 pr-2">
            <DialogTitle className="text-sm font-semibold text-black truncate">
              Mail Insight
            </DialogTitle>
            <DialogDescription className="text-xs text-black/50 truncate">
              Get AI insights for this email
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            title="Close dialog"
            className="shrink-0 rounded cursor-pointer p-1 text-black/50 hover:text-red-600! transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-w-0 w-full">
          <div className="px-4 py-3.5 space-y-3 min-w-0 w-full">
            <div className="rounded-xl p-2.5 border space-y-1 min-w-0">
              <p className="text-xs font-semibold text-black truncate" title={mail.subject}>
                {mail.subject || '(No Subject)'}
              </p>
              <p className="text-[10px] text-black/60 truncate" title={mail.sender}>
                From: {mail.sender}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t bg-gray-50/50 shrink-0 min-w-0">
            <CustomButton
              type="submit"
              disabled={loading}
              size="sm"
              color='green'
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Working...</span>
                </>
              ) : (
                <>
                  <Search className="h-3.5 w-3.5" />
                  <span>Insight</span>
                </>
              )}
            </CustomButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
