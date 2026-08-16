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
    <div className="flex items-center justify-between rounded-lg bg-white/5 [html.light_&]:bg-black/5 p-2 border border-white/5 [html.light_&]:border-black/5">
      <div className="flex items-center space-x-2">
        <Checkbox id={id} checked={checked} onCheckedChange={(c) => onCheckedChange(c === true)} className="[html.light_&]:data-checked:border-green-600"/>
        <Label htmlFor={id} className="cursor-pointer text-xs font-medium text-white select-none">
          {label}
        </Label>
      </div>
      {tip ? (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 cursor-help text-white/40 hover:text-white/80 transition-colors" strokeWidth={2.5} />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-70 border-border bg-blue-600 text-[10px] text-white">
              <p>{tip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
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
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="h-6 w-6 rounded-md bg-white/10 [html.light_&]:bg-black/5 hover:bg-white/20 [html.light_&]:hover:bg-black/10 text-white flex items-center justify-center cursor-pointer transition disabled:opacity-30 disabled:pointer-events-none select-none"
        onMouseDown={handleMinusStart}
        onTouchStart={handleMinusStart}
        onMouseUp={handleMinusEnd}
        onTouchEnd={handleMinusEnd}
        onMouseLeave={cancel}
        disabled={value <= min}
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-5 text-center font-mono text-xs font-semibold text-white select-none">{value}</span>
      <button
        type="button"
        className="h-6 w-6 rounded-md bg-white/10 [html.light_&]:bg-black/5 hover:bg-white/20 [html.light_&]:hover:bg-black/10 text-white flex items-center justify-center cursor-pointer transition disabled:opacity-30 disabled:pointer-events-none select-none"
        onMouseDown={handlePlusStart}
        onTouchStart={handlePlusStart}
        onMouseUp={handlePlusEnd}
        onTouchEnd={handlePlusEnd}
        onMouseLeave={cancel}
        disabled={value >= max}
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}

export function CloudQueryFields(p: CloudQueryFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="rounded-lg bg-white/5 [html.light_&]:bg-black/5 px-3 py-2 border border-white/5 [html.light_&]:border-black/5 flex items-center justify-between">
          <Label className="text-xs font-medium text-white/80">Emails Count</Label>
          <Counter value={p.count} min={1} max={10} onChange={p.setCount} />
        </div>

        <div className="rounded-lg bg-white/5 [html.light_&]:bg-black/5 px-3 py-2 border border-white/5 [html.light_&]:border-black/5 flex items-center justify-between">
          <Label className="text-xs font-medium text-white/80">Lookback Days</Label>
          <Counter value={p.days} min={1} max={7} onChange={p.setDays} />
        </div>
      </div>

      <div className="space-y-1.5 pt-1">
        <label className="block text-[10px] font-medium text-white/60 uppercase tracking-wide">
          Status &amp; Flags
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2 rounded-lg bg-white/5 [html.light_&]:bg-black/5 p-2 border border-white/5 [html.light_&]:border-black/5">
            <Checkbox id="unread" checked={p.unread} onCheckedChange={() => p.setUnread(true)} className="[html.light_&]:data-checked:border-green-600"/>
            <Label htmlFor="unread" className="cursor-pointer text-xs font-medium text-white select-none">
              Unread
            </Label>
          </div>
          <div className="flex items-center space-x-2 rounded-lg bg-white/5 [html.light_&]:bg-black/5 p-2 border border-white/5 [html.light_&]:border-black/5">
            <Checkbox id="read" checked={!p.unread} onCheckedChange={() => p.setUnread(false)} className="[html.light_&]:data-checked:border-green-600"/>
            <Label htmlFor="read" className="cursor-pointer text-xs font-medium text-white select-none">
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
    <div className="space-y-3">
      <div className="rounded-lg bg-white/5 [html.light_&]:bg-black/5 px-3 py-2 border border-white/5 [html.light_&]:border-black/5 flex items-center justify-between">
        <Label className="text-xs font-medium text-white/80">Emails Count</Label>
        <Counter value={p.count} min={1} max={10} onChange={p.setCount} />
      </div>
    </div>
  );
}
