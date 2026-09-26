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
  const [confirmed, setConfirmed] = useState(true);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fields = { count, setCount, sessionUserId };

  useEffect(() => {
    if (!open) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setLoading(false);
      setConfirmed(true);
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
    onLoadFromDatabase(buildDatabaseQueryOptions(fields, sessionUserId!));
    onOpenChange(false);
    setLoading(false);
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
              className="data-checked:bg-background data-checked:border-background"
              onCheckedChange={(c) => setConfirmed(c === true)}
            />
            <Label
              htmlFor="confirm-load"
              className="cursor-pointer text-xs font-medium text-foreground select-none"
            >
              Confirm
            </Label>
          </div>

          <button
            type="button"
            onClick={handleLoad}
            disabled={!confirmed || loading}
            className={cn(
              'flex disabled:cursor-not-allowed items-center justify-center gap-2 px-3.5 py-2 cursor-pointer rounded-lg text-xs font-medium transition-all duration-200 border border-dashed border-foreground/50 select-none outline-none',
              (!confirmed || loading) && 'text-foreground/30'
            )}
          >
            <span>Continue</span>
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 text-foreground animate-spin" />
            ) : (
              <CheckIcon
                className={cn(
                  'w-3.5 h-3.5 transition-colors text-foreground'
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
