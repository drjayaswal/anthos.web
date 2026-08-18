'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CloudDownloadIcon, X } from 'lucide-react';
import type { FetchOptions } from '@/types';
import { buildCloudQueryOptions, CloudQueryFields } from './QueryFields';

interface FetchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFetchFromCloud: (opts: FetchOptions) => void;
}

export default function FetchDialog({
  open,
  onOpenChange,
  onFetchFromCloud,
}: FetchDialogProps) {
  const [unread, setUnread] = useState(true);
  const [days, setDays] = useState(1);
  const [count, setCount] = useState(1);
  const [important, setImportant] = useState(false);
  const [starred, setStarred] = useState(false);
  const fields = { unread, setUnread, days, setDays, count, setCount, important, setImportant, starred, setStarred };

  const handleFetch = () => {
    onFetchFromCloud(buildCloudQueryOptions(fields));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full sm:w-80 rounded-t-4xl sm:rounded-2xl bg-[#2c0237] border border-b-0 border-white/30 [html.light_&]:bg-white [html.light_&]:border-black/30 text-white shadow-2xl p-0 gap-0 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/10 [html.light_&]:border-black/10">
          <div>
            <DialogTitle className="text-xs font-semibold text-white">Fetch Mails</DialogTitle>
            <DialogDescription className="text-[10px] text-white/50">Query Gmail with custom filters</DialogDescription>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            title="Close dialog"
            className="rounded cursor-pointer p-1 text-white/50 hover:text-white transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="px-4 py-3 max-h-[75vh] overflow-y-auto">
          <CloudQueryFields {...fields} />
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10 [html.light_&]:border-black/10">
          <button
            type="button"
            onClick={handleFetch}
            className="inline-flex items-center gap-1.5 rounded-lg cursor-pointer bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-600/90 active:scale-95"
          >
            <CloudDownloadIcon className="h-3.5 w-3.5" />
            Fetch Mails
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
