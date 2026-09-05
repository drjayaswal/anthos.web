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
import { CustomButton } from './ui/button';

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
        className="w-full sm:w-80 rounded-t-4xl sm:rounded-2xl bg-white sm:border-b border border-b-0 text-black shadow-2xl p-0 gap-0 overflow-hidden sm:overflow-visible"
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b">
          <div>
            <DialogTitle className="text-sm font-semibold text-black">Storage</DialogTitle>
            <DialogDescription className="text-[10px] text-black/50">Query stored mails from database</DialogDescription>
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

        <div className="px-4 py-3">
          <DatabaseQueryFields {...fields} />
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t">
          <CustomButton onClick={handleLoad} size="sm" color='green'>
            <DatabaseZapIcon className="w-3.5 h-3.5" />
            <span>Load Mails</span>
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
