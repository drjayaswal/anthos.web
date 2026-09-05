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
import { CustomButton } from './ui/button';

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
  const [provider, setProvider] = useState<string>('google');
  const [unread, setUnread] = useState(true);
  const [days, setDays] = useState(1);
  const [count, setCount] = useState(1);
  const [important, setImportant] = useState(false);
  const [starred, setStarred] = useState(false);
  const fields = { provider, setProvider, unread, setUnread, days, setDays, count, setCount, important, setImportant, starred, setStarred };

  const handleFetch = () => {
    onFetchFromCloud(buildCloudQueryOptions(fields));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full sm:w-80 rounded-t-4xl sm:rounded-2xl bg-white sm:border-b border border-b-0 text-black shadow-2xl p-0 gap-0 overflow-hidden sm:overflow-visible"
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b">
          <div>
            <DialogTitle className="text-sm font-semibold text-black">Email Service Providers</DialogTitle>
            <DialogDescription className="text-[10px] text-black/50">Query email with custom filters</DialogDescription>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            title="Close dialog"
            className="rounded cursor-pointer p-1 text-black/50 hover:text-red-600! transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="px-4 py-3 max-h-[75vh] overflow-y-auto sm:overflow-visible">
          <CloudQueryFields {...fields} />
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t">
          <CustomButton onClick={handleFetch} size="sm" color='green'>
            <CloudDownloadIcon className="w-3.5 h-3.5" />
            <span>Fetch Mails</span>
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
