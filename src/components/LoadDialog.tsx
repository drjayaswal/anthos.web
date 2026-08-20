'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { DatabaseZapIcon, X } from 'lucide-react';
import type { LoadOptions } from '@/types';
import { buildDatabaseQueryOptions, DatabaseQueryFields } from './QueryFields';

interface LoadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionUserId: string | null | undefined;
  onLoadFromDatabase: (opts: LoadOptions) => void;
}

export default function LoadDialog({
  open,
  onOpenChange,
  sessionUserId,
  onLoadFromDatabase,
}: LoadDialogProps) {
  const [count, setCount] = useState(1);
  const fields = { count, setCount, sessionUserId };

  const handleLoad = () => {
    onLoadFromDatabase(buildDatabaseQueryOptions(fields, sessionUserId!));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full sm:w-80 rounded-t-4xl sm:rounded-2xl bg-[#2c0237] sm:border-b border border-b-0 border-white/10 [html.light_&]:bg-white [html.light_&]:border-black/10 text-white shadow-2xl p-0 gap-0 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/10 [html.light_&]:border-black/10">
          <div>
            <DialogTitle className="text-xs font-semibold text-white">Load Mails</DialogTitle>
            <DialogDescription className="text-[10px] text-white/50">Query encrypted mails from database</DialogDescription>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            title="Close dialog"
            className="rounded cursor-pointer p-1 text-white/50 hover:text-red-600! transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="px-4 py-3">
          <DatabaseQueryFields {...fields} />
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10 [html.light_&]:border-black/10">
          <button
            type="button"
            onClick={handleLoad}
            className="inline-flex items-center gap-1.5 rounded-lg cursor-pointer bg-white px-3 py-1.5 text-xs font-medium text-accent transition hover:bg-white/90 active:scale-95"
          >
            <DatabaseZapIcon className="h-3.5 w-3.5" />
            Load Mails
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
