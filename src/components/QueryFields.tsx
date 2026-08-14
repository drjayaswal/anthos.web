'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Minus, Plus } from 'lucide-react';
import type { CloudQueryOptions, DatabaseQueryOptions } from '@/types';

export type CloudQueryFieldsProps = {
  unread: boolean;
  setUnread: (v: boolean) => void;
  days: number;
  setDays: (v: number) => void;
  count: number;
  setCount: (v: number) => void;
  important: boolean;
  setImportant: (v: boolean) => void;
  starred: boolean;
  setStarred: (v: boolean) => void;
};
export type DatabaseQueryFieldsProps = {
  count: number;
  setCount: (v: number) => void;
}
function FlagRow({
  id,
  label,
  checked,
  onCheckedChange,
  tip,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (c: boolean) => void;
  tip?: string;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={id} checked={checked} onCheckedChange={(c) => onCheckedChange(c === true)} />
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id} className="cursor-pointer text-sm font-medium text-black">
          {label}
        </Label>
        {tip ? (
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 cursor-help text-blue-600" strokeWidth={3} />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-70 border-border bg-blue-600 text-[10px]">
                <p>{tip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </div>
    </div>
  );
}

export function buildCloudQueryOptions(p: CloudQueryFieldsProps): CloudQueryOptions {
  return {
    unread: p.unread,
    days: p.days,
    count: p.count,
    important: p.important,
    starred: p.starred,
  };
}
export function buildDatabaseQueryOptions(p: DatabaseQueryFieldsProps, sessionUserId: string): DatabaseQueryOptions {
  return {
    count: p.count,
    sessionUserId: sessionUserId
  };
}

function Counter({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const start = (toValue: number) => {
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      onChange(toValue);
      isLongPressRef.current = true;
    }, 500);
  };

  const end = (singleClickAction: () => void) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!isLongPressRef.current) {
      singleClickAction();
    }
    isLongPressRef.current = false;
  };

  const cancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleMinusStart = () => start(min);
  const handleMinusEnd = () => end(() => onChange(Math.max(min, value - 1)));

  const handlePlusStart = () => start(max);
  const handlePlusEnd = () => end(() => onChange(Math.min(max, value + 1)));

  return (
    <div className="flex items-center gap-3 p-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-4xl text-black disabled:border-transparent select-none"
        onMouseDown={handleMinusStart}
        onTouchStart={handleMinusStart}
        onMouseUp={handleMinusEnd}
        onTouchEnd={handleMinusEnd}
        onMouseLeave={cancel}
        disabled={value <= min}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="text-sm font-medium text-black select-none">{value}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-4xl text-black disabled:border-transparent select-none"
        onMouseDown={handlePlusStart}
        onTouchStart={handlePlusStart}
        onMouseUp={handlePlusEnd}
        onTouchEnd={handlePlusEnd}
        onMouseLeave={cancel}
        disabled={value >= max}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function CloudQueryFields(p: CloudQueryFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label className="text-[11px] text-black">Emails Count</Label>
          <Counter value={p.count} min={1} max={10} onChange={p.setCount} />
        </div>
        <div className="space-y-2">
          <Label className="text-[11px] text-black">Lookback Days</Label>
          <Counter value={p.days} min={1} max={7} onChange={p.setDays} />
        </div>
      </div>
      <div className="space-y-4">
        <Label className="text-[10px] uppercase tracking-wider text-black">Status & Flags</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="unread" checked={p.unread} onCheckedChange={() => p.setUnread(true)} />
            <Label htmlFor="unread" className="text-sm font-medium text-black">
              Unread
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="read" checked={!p.unread} onCheckedChange={() => p.setUnread(false)} />
            <Label htmlFor="read" className="text-sm font-medium text-black">
              Read
            </Label>
          </div>
          <FlagRow id="important" label="Important" checked={p.important} onCheckedChange={p.setImportant} tip="Emails marked important" />
          <FlagRow id="starred" label="Starred" checked={p.starred} onCheckedChange={p.setStarred} tip="Emails you ★ starred" />
        </div>
      </div>
    </div>
  );
}
export function DatabaseQueryFields(p: DatabaseQueryFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label className="text-[11px] text-white/50">Emails Count</Label>
          <Counter value={p.count} min={1} max={10} onChange={p.setCount} />
        </div>
      </div>
    </div>
  );
}
