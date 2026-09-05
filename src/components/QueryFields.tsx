'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronRightIcon, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CloudQueryOptions, DatabaseQueryOptions } from '@/types';

export const EMAIL_PROVIDERS = [
  { id: 'google', name: 'Google', description: 'Gmail & Google Workspace', logo: '/providers/gmail.jpg' },
  { id: 'hotmail', name: 'Hotmail', description: 'Outlook & Microsoft Live', logo: '/providers/hotmail.webp' },
  { id: 'yahoo', name: 'Yahoo', description: 'Yahoo Mail', logo: '/providers/yahoo.png' },
  { id: 'monday', name: 'Monday', description: 'Monday.com Work OS', logo: '/providers/monday.png' },
  { id: 'zoho', name: 'Zoho', description: 'Zoho Mail', logo: '/providers/zohomail.png' },
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
  const [isOpen, setIsOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div
      ref={rowRef}
      className={cn('relative', isOpen ? 'z-30' : 'z-0 hover:z-20')}
    >
      <div
        onClick={() => onCheckedChange(!checked)}
        className={`relative z-10 flex items-center justify-between transition-all duration-200 rounded-2xl p-2 border bg-white shadow-[inset_0_-2px_4px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer ${checked && isOpen ? "border-green-600" : isOpen ? "border-blue-600" : "border-border"}`}
      >
        <div className="flex items-center space-x-2">
          <Checkbox
            id={id}
            checked={checked}
            onCheckedChange={(c) => onCheckedChange(c === true)}
            onClick={(e) => e.stopPropagation()}
          />
          <Label
            htmlFor={id}
            onClick={(e) => e.stopPropagation()}
            className="cursor-pointer text-xs font-medium text-black select-none"
          >
            {label}
          </Label>
        </div>
        {tip ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((prev) => !prev);
            }}
            className={cn(
              'p-1 -m-1 rounded-full cursor-pointer flex items-center justify-center transition-colors outline-none',
              isOpen && checked ? 'text-green-700 hover:text-green-800' : isOpen ? 'text-blue-700 hover:text-blue-800' : 'text-black/40 hover:text-black/80'
            )}
            title={isOpen ? 'Hide info' : 'Show info'}
            aria-label={`Info about ${label}`}
            aria-expanded={isOpen}
          >
            <ChevronRightIcon className={`h-3 w-3 transition-transform duration-200 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`} strokeWidth={2.5}/>
          </button>
        ) : null}
      </div>

      {tip ? (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className={`absolute left-[calc(100%-16px)] top-[0.025px] z-0 h-9.5 bg-linear-to-b rounded-l-none rounded-r-xl pl-5 pr-3 ${checked ? "from-green-600 to-green-800" : "from-blue-600 to-blue-800"} border ${checked ? "border-green-600" : "border-blue-600"} text-[10px] text-white font-medium whitespace-nowrap flex items-center cursor-pointer`}
            >
              <p>{tip}</p>
            </motion.div>
          )}
        </AnimatePresence>
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
        className={`h-6 w-6 rounded-lg bg-white ${value <= min || "border shadow-[inset_0_-2px_4px_rgba(0,0,0,0.18),0_1px_2px_rgba(0,0,0,0.06)] hover:-translate-y-px active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]"} text-black flex items-center justify-center cursor-pointer transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none select-none`}
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
        className={`h-6 w-6 rounded-lg bg-white ${value >= max || "border shadow-[inset_0_-2px_4px_rgba(0,0,0,0.18),0_1px_2px_rgba(0,0,0,0.06)] hover:-translate-y-px active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]"} text-black flex items-center justify-center cursor-pointer transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none select-none`}
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
            Service Provider
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setProviderDropdownOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between p-2.5 ${providerDropdownOpen && 'rounded-b-none border-b-0'} rounded-2xl bg-white border transition cursor-pointer text-left`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 flex rounded-4xl items-center justify-center shrink-0 overflow-hidden">
                  <Image
                    src={currentProvider.logo}
                    alt={currentProvider.name}
                    width={20}
                    height={20}
                    unoptimized
                    className="w-full h-full object-contain"
                  />
                </div>
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
                  className="overflow-hidden"
                >
                  <div className="rounded-b-2xl border border-t-0 p-2 scrollbar-none bg-black/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] max-h-48 overflow-y-auto overscroll-contain space-y-1.5">
                    {EMAIL_PROVIDERS.map((prov) => {
                      const isSelected = currentProviderId === prov.id;
                      const isGoogle = prov.id === 'google';
                      return (
                        <motion.button
                          key={prov.id}
                          type="button"
                          disabled={!isGoogle}
                          whileTap={isGoogle ? { scale: 0.98 } : {}}
                          onClick={() => {
                            if (isGoogle) {
                              p.setProvider?.(prov.id);
                              setProviderDropdownOpen(false);
                            }
                          }}
                          className={`w-full flex px-3 py-2 items-center gap-2.5 transition-all duration-200 text-left text-black ${
                            !isGoogle
                              ? 'opacity-40 cursor-not-allowed rounded-xl'
                              : isSelected
                                ? 'rounded-xl bg-white shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.08)] cursor-pointer'
                                : 'hover:bg-black/5 rounded-xl cursor-pointer'
                          }`}
                        >
                          <div className="w-7 h-7 flex rounded-4xl items-center justify-center shrink-0 overflow-hidden">
                            <Image
                              src={prov.logo}
                              alt={prov.name}
                              width={20}
                              height={20}
                              unoptimized
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-black truncate">
                                {prov.name}
                              </span>
                              {!isGoogle && (
                                <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-red-600/10 text-red-600 font-medium shrink-0">
                                  Not Connected
                                </span>
                              )}
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
        <div className="px-3 py-2 flex items-center justify-between rounded-xl border">
          <Label className="text-xs font-medium text-black/80">Emails Count</Label>
          <Counter value={p.count} min={1} max={10} onChange={p.setCount} />
        </div>
        <div className="px-3 py-2 flex items-center justify-between rounded-xl border">
          <Label className="text-xs font-medium text-black/80">Lookback Days</Label>
          <Counter value={p.days} min={1} max={7} onChange={p.setDays} />
        </div>
      </div>

      <div className="space-y-1.5 pt-1">
        <label className="block text-[10px] font-medium text-black/60 uppercase tracking-wide">
          Status &amp; Flags
        </label>
        <div className="grid grid-cols-2 gap-2">
          <FlagRow
            id="unread"
            label="Unread"
            checked={p.unread}
            onCheckedChange={() => p.setUnread(true)}
            tip="Only unread emails"
          />
          <FlagRow
            id="read"
            label="Read"
            checked={!p.unread}
            onCheckedChange={() => p.setUnread(false)}
            tip="Only read emails"
          />
          <FlagRow
            id="important"
            label="Important"
            checked={p.important}
            onCheckedChange={p.setImportant}
            tip="Emails marked important"
          />
          <FlagRow
            id="starred"
            label="Starred"
            checked={p.starred}
            onCheckedChange={p.setStarred}
            tip="Emails you ★ starred"
          />
        </div>
      </div>
    </div>
  );
}

export function DatabaseQueryFields(p: DatabaseQueryFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="px-3 py-2 flex items-center justify-between border rounded-xl">
        <Label className="text-xs font-medium text-black/80">Emails Count</Label>
        <Counter value={p.count} min={1} max={10} onChange={p.setCount} />
      </div>
    </div>
  );
}
