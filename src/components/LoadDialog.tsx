'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckIcon, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { LoadOptions } from '@/types';
import { buildDatabaseQueryOptions, DatabaseQueryFields } from './QueryFields';
import QueryDrawer from './QueryDrawer';

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
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fields = { count, setCount, sessionUserId };

  useEffect(() => {
    if (!open) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setLoading(false);
      setConfirmed(false);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleLoad = () => {
    if (!confirmed || loading) return;
    setLoading(true);
    timeoutRef.current = setTimeout(() => {
      onLoadFromDatabase(buildDatabaseQueryOptions(fields, sessionUserId!));
      onOpenChange(false);
      setLoading(false);
    }, 1000);
  };

  return (
    <QueryDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Storage"
      description="Query stored mails from database"
      footerAction={
        <div className="w-full flex items-center justify-between gap-3 select-none">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirm-load"
              checked={confirmed}
              className="data-checked:bg-blue-600 data-checked:border-blue-600"
              onCheckedChange={(c) => setConfirmed(c === true)}
            />
            <Label
              htmlFor="confirm-load"
              className="cursor-pointer text-xs font-medium text-black select-none"
            >
              Confirm
            </Label>
          </div>

          <button
            type="button"
            onClick={handleLoad}
            disabled={!confirmed || loading}
            className={cn(
              'flex disabled:cursor-not-allowed items-center justify-center gap-2 px-3.5 py-2 cursor-pointer rounded-lg text-xs font-medium transition-all duration-200 border select-none outline-none',
              (!confirmed || loading) && 'text-black/30'
            )}
          >
            <span>Continue</span>
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            ) : (
              <CheckIcon
                className={cn(
                  'w-3.5 h-3.5 transition-colors',
                  confirmed ? 'text-blue-600' : 'text-black/30'
                )}
              />
            )}
          </button>
        </div>
      }
    >
      <DatabaseQueryFields {...fields} />
    </QueryDrawer>
  );
}
