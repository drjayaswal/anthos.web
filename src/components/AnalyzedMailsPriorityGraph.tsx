'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Mail } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomButton } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatEmailContent } from '@/lib/utils';
import { formatMailPriorityDisplay, getPriorityColor, getPriorityMessage, parseMailPriority } from '@/lib/mail-priority';
import { getCategoriesAction } from '@/app/actions';

type Props = {
  mails: Mail[];
  onOpenDetail: (mail: Mail) => void;
  categories?: { name: string; description?: string | null }[];
};

function hashSpreadY(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = Math.imul(31, h) + id.charCodeAt(i);
  return ((h >>> 0) % 10_000 / 9_999) * 2 - 1;
}

function PriorityLegend() {
  const legendItems = [
    { label: "Archive", color: "bg-emerald-600" },
    { label: "Routine", color: "bg-teal-400" },
    { label: "Normal", color: "bg-yellow-400" },
    { label: "Important", color: "bg-orange-500" },
    { label: "Urgent", color: "bg-red-600" },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className={`size-2.5 rounded-full ${item.color}`} />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-black/50">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function getPriorityForCategory(mail: Mail, catName: string): string | number | null | undefined {
  const cats = mail.categories;
  const pris = mail.priority;
  if (!cats || !pris) return null;
  if (Array.isArray(cats)) {
    const idx = cats.indexOf(catName);
    if (idx === -1) return null;
    return Array.isArray(pris) ? pris[idx] : pris;
  }
  if ((cats as unknown as string) === catName) {
    return Array.isArray(pris) ? pris[0] : pris;
  }
  return null;
}

function toPlotPercent(priorityNorm: number, yNorm: number): { left: number; top: number } {
  const clamped = Math.min(Math.max(priorityNorm, -1), 1);
  return {
    left: 8 + ((clamped + 1) / 2) * 84,
    top: 8 + ((1 - (yNorm + 1) / 2)) * 84,
  };
}

function parseSenderName(sender: string): string {
  return sender.split('<')[0].trim() || sender;
}

function getPriorityStyles(pri: number) {
  const val = Number(pri);
  let h = 0;
  let s = 85;
  let l = 55;

  if (val <= -0.75) {
    h = 160; s = 80; l = 40;
  } else if (val <= -0.5) {
    h = 142; s = 70; l = 45;
  } else if (val <= -0.25) {
    h = 174; s = 75; l = 45;
  } else if (val <= 0) {
    h = 50; s = 85; l = 48;
  } else if (val <= 0.25) {
    h = 40; s = 90; l = 50;
  } else if (val <= 0.5) {
    h = 24; s = 90; l = 52;
  } else if (val <= 0.75) {
    h = 0; s = 90; l = 55;
  } else {
    h = 343; s = 90; l = 50;
  }

  return {
    main: `hsl(${h}, ${s}%, ${l}%)`,
    ring: `hsla(${h}, ${s}%, ${l}%, 0.6)`,
    shadow: `hsla(${h}, ${s}%, ${l}%, 0.5)`,
  };
}

export default function AnalyzedMailsPriorityGraph({ mails, onOpenDetail, categories: initialCategories }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [preview, setPreview] = useState<Mail | null>(null);
  const [fetchedCategories, setFetchedCategories] = useState<{ name: string; description?: string | null }[]>([]);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    (async () => {
      const result = await getCategoriesAction();
      if (!result.ok || !result.categories) return;
      setFetchedCategories(result.categories);
    })();
  }, []);

  const allCategories = useMemo(() => {
    return initialCategories && initialCategories.length > 0 ? initialCategories : fetchedCategories;
  }, [initialCategories, fetchedCategories]);

  const validCategories = useMemo(() =>
    allCategories.filter((cat) =>
      mails.some((m) => {
        if (!m.categories) return false;
        if (Array.isArray(m.categories)) return m.categories.includes(cat.name);
        return (m.categories as unknown as string) === cat.name;
      })
    ),
    [allCategories, mails]
  );

  const safeActiveTab = validCategories.length > 0 ? Math.min(activeTab, validCategories.length - 1) : 0;
  const activeCat = validCategories[safeActiveTab]?.name ?? null;

  const filteredMails = useMemo(() =>
    activeCat
      ? mails.filter((m) => {
          if (!m.categories) return false;
          if (Array.isArray(m.categories)) return m.categories.includes(activeCat);
          return (m.categories as unknown as string) === activeCat;
        })
      : [],
    [mails, activeCat]
  );

  const layout = useMemo(() => {
    if (!filteredMails.length || !activeCat) return [];

    return filteredMails.map((mail) => {
      const rawPriority = getPriorityForCategory(mail, activeCat);
      const priorityVal = parseMailPriority(rawPriority);
      const yn = hashSpreadY(mail.id);
      const pos = toPlotPercent(priorityVal, yn);
      return {
        mail,
        priorityVal,
        rawPriority,
        left: pos.left,
        top: pos.top,
      };
    });
  }, [filteredMails, activeCat]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSvgSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setSvgSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const svgPoints = useMemo(() =>
    layout.map(({ left, top }) => ({
      x: (left / 100) * svgSize.w,
      y: (top / 100) * svgSize.h,
    })),
    [layout, svgSize]
  );

  const sortedSegments = useMemo(() => {
    if (svgPoints.length < 2) return [];
    const combined = layout.map((item, i) => ({ ...svgPoints[i], priorityVal: item.priorityVal }));
    const sorted = [...combined].sort((a, b) => a.x - b.x);
    return sorted.slice(0, -1).map((pt, i) => ({
      x1: pt.x,
      y1: pt.y,
      x2: sorted[i + 1].x,
      y2: sorted[i + 1].y,
      colorA: getPriorityStyles(pt.priorityVal).main,
      colorB: getPriorityStyles(sorted[i + 1].priorityVal).main,
      id: `seg-${activeTab}-${i}`,
    }));
  }, [svgPoints, layout, activeTab]);

  if (mails.length === 0) return null;

  return (
    <>
      <section className="px-4 py-5 sm:px-6 space-y-4">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-black">Priority Analysis</p>
          <p className="text-xs text-black/40">{filteredMails.length} mail{filteredMails.length !== 1 ? 's' : ''}</p>
        </div>
        <PriorityLegend />
        {validCategories.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x w-full">
            {validCategories.map((cat, idx) => {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={cn(
                    'relative cursor-pointer py-1.5 text-xs font-medium transition-colors duration-200 truncate max-w-35 whitespace-nowrap snap-start shrink-0',
                    activeTab === idx ? 'text-black' : 'text-black/40'
                  )}
                >
                  {cat.name}
                  {activeTab === idx && (
                    <motion.span
                      layoutId="tab-glide-line"
                      className="absolute bottom-0 left-0 right-0 h-0.5 w-full rounded-full bg-black"
                      transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div
          className="relative w-full rounded-xl overflow-hidden"
          style={{ aspectRatio: '4/3', minHeight: 200, maxHeight: 340 }}
        >
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden
          >
            <line x1="8%" y1="92%" x2="92%" y2="92%" stroke="hsl(var(--border))" strokeOpacity="0.5" strokeWidth="1" />
            <line x1="8%" y1="8%" x2="8%" y2="92%" stroke="hsl(var(--border))" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 4" />
            <line x1="50%" y1="8%" x2="50%" y2="92%" stroke="hsl(var(--border))" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="3 4" />
            <line x1="8%" y1="50%" x2="92%" y2="50%" stroke="hsl(var(--border))" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="3 4" />

            <defs>
              {sortedSegments.map((seg) => (
                <linearGradient
                  key={`grad-${seg.id}`}
                  id={`grad-${seg.id}`}
                  gradientUnits="userSpaceOnUse"
                  x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
                >
                  <stop offset="0%" stopColor={seg.colorA} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={seg.colorB} stopOpacity="0.5" />
                </linearGradient>
              ))}
            </defs>
            <AnimatePresence mode="popLayout">
              {sortedSegments.map((seg, i) => (
                <motion.line
                  key={seg.id}
                  x1={seg.x1} y1={seg.y1}
                  x2={seg.x2} y2={seg.y2}
                  className={"stroke-black/30"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: 1, pathLength: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.05, ease: 'easeInOut' }}
                />
              ))}
            </AnimatePresence>
          </svg>
          <div className="absolute bottom-6 left-[8%] right-[8%] pointer-events-none">
            <div className="w-full h-px bg-black/50 relative mb-1" />
            <div className="flex justify-between w-full relative">
              {['-1', '0', '+1'].map((l, index) => {
                const alignmentClass =
                  index === 0 ? 'items-start text-left' :
                    index === 2 ? 'items-end text-right' :
                      'items-center text-center';

                return (
                  <div
                    key={l}
                    className={`flex flex-col absolute ${alignmentClass}`}
                    style={{
                      left: index === 0 ? '0%' : index === 1 ? '50%' : 'auto',
                      right: index === 2 ? '0%' : 'auto',
                      transform: index === 1 ? 'translateX(-50%)' : 'none'
                    }}
                  >
                    <div className="h-1.5 w-px bg-black -mt-2 mb-1" />
                    <span className="text-[10px] font-medium text-black tabular-nums">
                      {l}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <TooltipProvider delayDuration={150}>
            <AnimatePresence mode="popLayout">
              {layout.map(({ mail, rawPriority, priorityVal, left, top }, i) => (
                <div
                  key={`${activeTab}-${mail.id}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
                  style={{ left: `${left}%`, top: `${top}%` }}
                >
                  <span className="sm:hidden absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-[10px] font-mono font-bold leading-none text-black whitespace-nowrap select-none drop-shadow-sm pointer-events-none">
                    {formatMailPriorityDisplay(rawPriority ? String(rawPriority) : String(priorityVal))}
                  </span>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        type="button"
                        aria-label={`Mail: ${mail.subject}`}
                        className="pointer-events-auto size-3 rounded-full cursor-pointer block"
                        style={(() => {
                          const ps = getPriorityStyles(priorityVal);
                          return {
                            backgroundColor: ps.main,
                            borderColor: '#FFFFFF50',
                            borderWidth: 1,
                            boxShadow: `0 0 0 1px hsl(var(--background)), 0 0 0 3px ${ps.ring}, 0 4px 10px ${ps.shadow}`,
                          };
                        })()}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ delay: i * 0.04, type: 'spring', damping: 16, stiffness: 300 }}
                        whileHover={{ scale: 1.7 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setPreview(mail)}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="hidden sm:block px-2 bg-transparent relative rounded-t-none">
                      <div className={`absolute h-0.5 w-full ${getPriorityColor(priorityVal)} top-0 left-0`} />
                      <span className="text-[12px] text-black">
                        {getPriorityMessage(priorityVal)} with {rawPriority}
                      </span>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </AnimatePresence>
          </TooltipProvider>

          {filteredMails.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xs text-muted-foreground/50">No mails to display</p>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {preview && (
          <Dialog open onOpenChange={(o) => !o && setPreview(null)}>
            <DialogContent className="sm:max-w-md w-full rounded-t-4xl sm:rounded-2xl p-5! bg-white border border-black/10 text-black shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-black line-clamp-1 pr-8">{parseSenderName(preview.sender)}</DialogTitle>
                <DialogDescription className="text-left text-xs text-black/50">
                  {new Date(preview.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-black/50">Subject</p>
                  <p className="text-sm text-black line-clamp-2">{preview.subject}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-black/50">
                    Classifications & Priorities
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {(preview.categories?.filter(Boolean).length ?? 0) > 0 ? (
                      preview.categories!.filter(Boolean).map((cat, idx) => {
                        const pri = Array.isArray(preview.priority)
                          ? preview.priority[idx]
                          : idx === 0
                            ? preview.priority ?? undefined
                            : undefined;

                        return (
                          <div
                            key={`${cat}-${idx}`}
                            className="flex items-center justify-between py-1 border-b border-black/10 last:border-0"
                          >
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[11px] font-normal border-0 bg-black/8 text-black rounded-md px-2',
                              )}>
                              {cat}
                            </Badge>
                            <span className="text-xs tabular-nums font-mono text-black">
                              {pri ? formatMailPriorityDisplay(pri) : 'N/A'}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-black/50">No classifications</p>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[11px] font-medium text-black/50 mb-1.5">Preview</p>
                  <p className="text-xs text-black/80 line-clamp-3 leading-relaxed">
                    {formatEmailContent(preview.body).slice(0, 220)}
                    {(preview.body?.length ?? 0) > 220 ? '…' : ''}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <CustomButton
                  onClick={() => { onOpenDetail(preview); setPreview(null); }}
                >
                  Open Mail
                </CustomButton>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}