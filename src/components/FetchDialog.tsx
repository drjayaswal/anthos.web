'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckIcon, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { FetchOptions } from '@/types';
import { buildCloudQueryOptions, CloudQueryFields } from './QueryFields';
import QueryDrawer from './QueryDrawer';

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
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fields = { provider, setProvider, unread, setUnread, days, setDays, count, setCount, important, setImportant, starred, setStarred };

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

  const handleFetch = () => {
    if (!confirmed || loading) return;
    setLoading(true);
    timeoutRef.current = setTimeout(() => {
      onFetchFromCloud(buildCloudQueryOptions(fields));
      onOpenChange(false);
      setLoading(false);
    }, 1000);
  };

  return (
    <QueryDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Email Service Providers"
      description="Query email with custom filters"
      footerAction={
        <div className="w-full flex items-center justify-between gap-3 select-none">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirm-fetch"
              checked={confirmed}
              className='data-checked:bg-blue-600 data-checked:border-blue-600'
              onCheckedChange={(c) => setConfirmed(c === true)}
            />
            <Label
              htmlFor="confirm-fetch"
              className="cursor-pointer text-xs font-medium text-black select-none"
            >
              Confirm
            </Label>
          </div>

          <button
            type="button"
            onClick={handleFetch}
            disabled={!confirmed || loading}
            className={cn(
              'flex disabled:cursor-not-allowed items-center justify-center gap-2 px-3.5 py-2 cursor-pointer rounded-lg text-xs font-medium transition-all duration-200 border select-none outline-none',
              (!confirmed || loading) && "text-black/30"
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
      <CloudQueryFields {...fields} />
    </QueryDrawer>
  );
}
