'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, Info, Minus, Plus } from 'lucide-react';
import type { CloudQueryOptions, DatabaseQueryOptions } from '@/types';

export const EMAIL_PROVIDERS = [
  { id: 'google', name: 'Google', description: 'Gmail & Google Workspace' },
  { id: 'hotmail', name: 'Hotmail', description: 'Outlook & Microsoft Live' },
  { id: 'yahoo', name: 'Yahoo', description: 'Yahoo Mail' },
  { id: 'monday', name: 'Monday', description: 'Monday.com Work OS' },
  { id: 'zoho', name: 'Zoho', description: 'Zoho Mail' },
] as const;

export type CloudQueryFieldsProps = {
  provider?: string;
  setProvider?: (v: string) => void;
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
};

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
    <div className="flex items-center justify-between rounded-2xl p-2 border bg-white shadow-[inset_0_-2px_4px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center space-x-2">
        <Checkbox id={id} checked={checked} onCheckedChange={(c) => onCheckedChange(c === true)} />
        <Label htmlFor={id} className="cursor-pointer text-xs font-medium text-black select-none">
          {label}
        </Label>
      </div>
      {tip ? (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 cursor-help text-black/40 hover:text-black/80 transition-colors" strokeWidth={2.5} />
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
    provider: p.provider,
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
        className="h-6 w-6 rounded-lg bg-white border shadow-[inset_0_-2px_4px_rgba(0,0,0,0.18),0_1px_2px_rgba(0,0,0,0.06)] hover:-translate-y-px active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] text-black flex items-center justify-center cursor-pointer transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none select-none"
        onMouseDown={handleMinusStart}
        onTouchStart={handleMinusStart}
        onMouseUp={handleMinusEnd}
        onTouchEnd={handleMinusEnd}
        onMouseLeave={cancel}
        disabled={value <= min}
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-5 text-center font-mono text-xs font-semibold text-black select-none">{value}</span>
      <button
        type="button"
        className="h-6 w-6 rounded-lg bg-white border shadow-[inset_0_-2px_4px_rgba(0,0,0,0.18),0_1px_2px_rgba(0,0,0,0.06)] hover:-translate-y-px active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] text-black flex items-center justify-center cursor-pointer transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none select-none"
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
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const providerDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (providerDropdownRef.current && !providerDropdownRef.current.contains(event.target as Node)) {
        setProviderDropdownOpen(false);
      }
    };
    if (providerDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [providerDropdownOpen]);

  const currentProviderId = p.provider || 'google';
  const currentProvider =
    EMAIL_PROVIDERS.find((prov) => prov.id === currentProviderId) || EMAIL_PROVIDERS[0];

  return (
    <div className="space-y-3">
      {p.setProvider && (
        <div className="space-y-1.5" ref={providerDropdownRef}>
          <label className="block text-[10px] font-medium text-black/60 uppercase tracking-wide">
            Provider
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setProviderDropdownOpen((prev) => !prev)}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white border shadow-[inset_0_-2px_4px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.05)] transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-black truncate">
                    {currentProvider.name}
                  </p>
                  <p className="text-[9px] text-black/50 truncate font-normal">
                    {currentProvider.description}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-black/50 transition-transform duration-200 shrink-0 ml-1 ${
                  providerDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {providerDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden mt-1.5"
                >
                  <div className="rounded-2xl border p-1.5 scrollbar-none bg-black/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] max-h-48 overflow-y-auto overscroll-contain space-y-1.5">
                    {EMAIL_PROVIDERS.map((prov) => {
                      const isSelected = currentProviderId === prov.id;
                      return (
                        <motion.button
                          key={prov.id}
                          type="button"
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            p.setProvider?.(prov.id);
                            setProviderDropdownOpen(false);
                          }}
                          className={`w-full flex px-3 py-2 items-center gap-2 transition-all duration-200 cursor-pointer text-left text-black ${
                            isSelected
                              ? 'rounded-xl bg-white shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.08)]'
                              : 'hover:bg-black/5 rounded-xl'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-black truncate">
                              {prov.name}
                            </div>
                            <div className="text-[9px] truncate text-black/50 font-normal">
                              {prov.description}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="px-3 py-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-black/80">Emails Count</Label>
          <Counter value={p.count} min={1} max={10} onChange={p.setCount} />
        </div>
        <div className="px-3 py-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-black/80">Lookback Days</Label>
          <Counter value={p.days} min={1} max={7} onChange={p.setDays} />
        </div>
      </div>

      <div className="space-y-1.5 pt-1">
        <label className="block text-[10px] font-medium text-black/60 uppercase tracking-wide">
          Status &amp; Flags
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div
            onClick={() => p.setUnread(true)}
            className="flex items-center space-x-2 rounded-2xl p-2 border bg-white shadow-[inset_0_-2px_4px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer"
          >
            <Checkbox id="unread" checked={p.unread} onCheckedChange={() => p.setUnread(true)} />
            <Label htmlFor="unread" className="cursor-pointer text-xs font-medium text-black select-none">
              Unread
            </Label>
          </div>
          <div
            onClick={() => p.setUnread(false)}
            className="flex items-center space-x-2 rounded-2xl p-2 border bg-white shadow-[inset_0_-2px_4px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer"
          >
            <Checkbox id="read" checked={!p.unread} onCheckedChange={() => p.setUnread(false)} />
            <Label htmlFor="read" className="cursor-pointer text-xs font-medium text-black select-none">
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
      <div className="px-3 py-2 flex items-center justify-between">
        <Label className="text-xs font-medium text-black/80">Emails Count</Label>
        <Counter value={p.count} min={1} max={10} onChange={p.setCount} />
      </div>
    </div>
  );
}
