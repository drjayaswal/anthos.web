'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Mail } from '@/types';
import { cn, formatEmailContent } from '@/lib/utils';
import { getCategoryBadgeColor } from './MailTable';
import { Sparkles, Clock, ArrowUpRight, X, ChevronDown, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomButton } from '@/components/ui/button';

export const PRIORITY_RANGES = [
  { key: 'ALL', label: 'All Priorities', range: '0% – 100%' },
  { key: '0-25', label: 'Low', range: '0% – 25%' },
  { key: '26-50', label: 'Routine', range: '26% – 50%' },
  { key: '51-75', label: 'Normal', range: '51% – 75%' },
  { key: '76-100', label: 'Urgent', range: '76% – 100%' },
];

export const CONFIDENCE_RANGES = [
  { key: 'ALL', label: 'All Confidence', range: '0% – 100%' },
  { key: '0-25', label: 'Low', range: '0% – 25%' },
  { key: '26-50', label: 'Moderate', range: '26% – 50%' },
  { key: '51-75', label: 'High', range: '51% – 75%' },
  { key: '76-100', label: 'Very High', range: '76% – 100%' },
];

export function matchesRange(value: number, rangeKey: string): boolean {
  if (rangeKey === 'ALL') return true;
  if (rangeKey === '0-25') return value >= 0 && value <= 25;
  if (rangeKey === '26-50') return value > 25 && value <= 50;
  if (rangeKey === '51-75') return value > 50 && value <= 75;
  if (rangeKey === '76-100') return value > 75 && value <= 100;
  return true;
}

type Props = {
  mails: Mail[];
  onOpenDetail: (mail: Mail) => void;
  categories?: { name: string; description?: string | null }[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  selectedPriorityRange?: string;
  onPriorityRangeChange?: (range: string) => void;
  selectedConfidenceRange?: string;
  onConfidenceRangeChange?: (range: string) => void;
};

export function getPriorityPercent(mail: Mail): number {
  if (mail.priority_score !== undefined && mail.priority_score !== null && !isNaN(Number(mail.priority_score))) {
    return Math.min(Math.max((Number(mail.priority_score) * 100) / 10, 0), 100);
  }
  if (mail.priority) {
    const raw = Array.isArray(mail.priority) ? mail.priority[0] : mail.priority;
    const num = Number(raw);
    if (!isNaN(num)) {
      if (num >= -1 && num <= 1) {
        return Math.min(Math.max(((num + 1) / 2) * 100, 0), 100);
      }
      return Math.min(Math.max((num * 100) / 10, 0), 100);
    }
  }
  return 10;
}

export function getConfidencePercent(mail: Mail): number {
  if (mail.confidence_score !== undefined && mail.confidence_score !== null && !isNaN(Number(mail.confidence_score))) {
    const raw = Number(mail.confidence_score);
    if (raw >= 0 && raw <= 1) {
      return Math.min(Math.max(raw * 100, 0), 100);
    }
    return Math.min(Math.max(raw, 0), 100);
  }
  return 0;
}

const GRADIENT_STOPS: { stop: number; rgb: [number, number, number] }[] = [
  { stop: 0, rgb: [22, 163, 74] },
  { stop: 25, rgb: [132, 204, 22] },
  { stop: 50, rgb: [234, 179, 8] },
  { stop: 75, rgb: [234, 88, 12] },
  { stop: 100, rgb: [220, 38, 38] },
];

function interpolateRgb(
  c1: [number, number, number],
  c2: [number, number, number],
  factor: number
): string {
  const r = Math.round(c1[0] + factor * (c2[0] - c1[0]));
  const g = Math.round(c1[1] + factor * (c2[1] - c1[1]));
  const b = Math.round(c1[2] + factor * (c2[2] - c1[2]));
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

function getPriorityColorHex(pct: number): string {
  const clamped = Math.max(0, Math.min(100, pct));
  for (let i = 0; i < GRADIENT_STOPS.length - 1; i++) {
    const s1 = GRADIENT_STOPS[i];
    const s2 = GRADIENT_STOPS[i + 1];
    if (clamped >= s1.stop && clamped <= s2.stop) {
      const t = (clamped - s1.stop) / (s2.stop - s1.stop);
      return interpolateRgb(s1.rgb, s2.rgb, t);
    }
  }
  return '#dc2626';
}

function getPriorityBadgeClass(pct: number): string {
  if (pct <= 20) return 'bg-green-600/10 text-green-700 border-green-200/60';
  if (pct <= 40) return 'bg-lime-600/10 text-lime-700 border-lime-200/60';
  if (pct <= 60) return 'bg-yellow-600/10 text-yellow-700 border-yellow-200/60';
  if (pct <= 80) return 'bg-orange-600/10 text-orange-700 border-orange-200/60';
  return 'bg-red-600/10 text-red-700 border-red-200/60';
}

function getPriorityTierLabel(pct: number): string {
  if (pct <= 20) return 'Low';
  if (pct <= 40) return 'Routine';
  if (pct <= 60) return 'Normal';
  if (pct <= 80) return 'Important';
  return 'Urgent';
}

function parseSenderName(sender: string): string {
  return sender.split('<')[0].trim() || sender;
}

function getSmoothCurvePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  if (points.length === 2) {
    const midX = (points[0].x + points[1].x) / 2;
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} C ${midX.toFixed(1)} ${points[0].y.toFixed(1)}, ${midX.toFixed(1)} ${points[1].y.toFixed(1)}, ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function getAreaPath(points: { x: number; y: number }[], baselineY: number): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    return `M ${points[0].x - 10} ${baselineY} L ${points[0].x} ${points[0].y} L ${points[0].x + 10} ${baselineY} Z`;
  }
  const curvePath = getSmoothCurvePath(points);
  const first = points[0];
  const last = points[points.length - 1];
  return `${curvePath} L ${last.x.toFixed(1)} ${baselineY.toFixed(1)} L ${first.x.toFixed(1)} ${baselineY.toFixed(1)} Z`;
}

export default function AnalyzedMailsPriorityGraph({
  mails,
  onOpenDetail,
  selectedCategory: propSelectedCategory,
  onCategoryChange: propOnCategoryChange,
  selectedPriorityRange: propSelectedPriorityRange,
  onPriorityRangeChange: propOnPriorityRangeChange,
  selectedConfidenceRange: propSelectedConfidenceRange,
  onConfidenceRangeChange: propOnConfidenceRangeChange,
}: Props) {
  const [internalCategory, setInternalCategory] = useState<string>('ALL');
  const [internalPriorityRange, setInternalPriorityRange] = useState<string>('ALL');
  const [internalConfidenceRange, setInternalConfidenceRange] = useState<string>('ALL');
  const [openDropdown, setOpenDropdown] = useState<'category' | 'priority' | 'confidence' | null>(null);

  const activeCategory = propSelectedCategory !== undefined ? propSelectedCategory : internalCategory;
  const activePriorityRange = propSelectedPriorityRange !== undefined ? propSelectedPriorityRange : internalPriorityRange;
  const activeConfidenceRange = propSelectedConfidenceRange !== undefined ? propSelectedConfidenceRange : internalConfidenceRange;

  const handleCategoryChange = (val: string) => {
    if (propOnCategoryChange) propOnCategoryChange(val);
    else setInternalCategory(val);
    setHoveredPoint(null);
    setSelectedPoint(null);
  };

  const handlePriorityRangeChange = (val: string) => {
    if (propOnPriorityRangeChange) propOnPriorityRangeChange(val);
    else setInternalPriorityRange(val);
    setHoveredPoint(null);
    setSelectedPoint(null);
  };

  const handleConfidenceRangeChange = (val: string) => {
    if (propOnConfidenceRangeChange) propOnConfidenceRangeChange(val);
    else setInternalConfidenceRange(val);
    setHoveredPoint(null);
    setSelectedPoint(null);
  };

  const handleResetFilters = () => {
    handleCategoryChange('ALL');
    handlePriorityRangeChange('ALL');
    handleConfidenceRangeChange('ALL');
  };

  const [hoveredPoint, setHoveredPoint] = useState<{
    mail: Mail;
    x: number;
    y: number;
    pct: number;
  } | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{
    mail: Mail;
    x: number;
    y: number;
    pct: number;
  } | null>(null);
  const [previewMail, setPreviewMail] = useState<Mail | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 260 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          setDimensions({
            width: rect.width,
            height: Math.max(220, Math.min(rect.width * 0.38, 300)),
          });
        }
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (selectedPoint && !target.closest('[data-point-modal]') && !target.closest('[data-point-node]')) {
        setSelectedPoint(null);
      }
      if (openDropdown && toolbarRef.current && !toolbarRef.current.contains(target)) {
        setOpenDropdown(null);
      }
    };
    window.addEventListener('pointerdown', handleClickOutside);
    return () => window.removeEventListener('pointerdown', handleClickOutside);
  }, [selectedPoint, openDropdown]);

  const categoriesList = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of mails) {
      const cat = m.category || (Array.isArray(m.categories) && m.categories[0]) || 'Others';
      counts.set(cat, (counts.get(cat) || 0) + 1);
    }
    const list = [{ name: 'All Categories', key: 'ALL', count: mails.length }];
    for (const [name, count] of counts.entries()) {
      list.push({ name, key: name, count });
    }
    return list;
  }, [mails]);

  const filteredMails = useMemo(() => {
    const base = mails.filter((m) => {
      if (activeCategory !== 'ALL') {
        const cat = m.category || (Array.isArray(m.categories) && m.categories[0]) || 'Others';
        if (cat.toLowerCase() !== activeCategory.toLowerCase()) return false;
      }
      if (activePriorityRange !== 'ALL') {
        const pct = getPriorityPercent(m);
        if (!matchesRange(pct, activePriorityRange)) return false;
      }
      if (activeConfidenceRange !== 'ALL') {
        const conf = getConfidencePercent(m);
        if (!matchesRange(conf, activeConfidenceRange)) return false;
      }
      return true;
    });

    return [...base].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [mails, activeCategory, activePriorityRange, activeConfidenceRange]);

  const { avgPriority, maxPriority, avgConfidence, maxConfidence } = useMemo(() => {
    if (filteredMails.length === 0) return { avgPriority: 0, maxPriority: 0, avgConfidence: 0, maxConfidence: 0 };
    const priorityPcts = filteredMails.map(getPriorityPercent);
    const confPcts = filteredMails.map(getConfidencePercent);
    const sumPriority = priorityPcts.reduce((acc, v) => acc + v, 0);
    const sumConf = confPcts.reduce((acc, v) => acc + v, 0);
    return {
      avgPriority: Math.round(sumPriority / priorityPcts.length),
      maxPriority: Math.round(Math.max(...priorityPcts)),
      avgConfidence: Math.round(sumConf / confPcts.length),
      maxConfidence: Math.round(Math.max(...confPcts)),
    };
  }, [filteredMails]);

  const padding = { top: 28, bottom: 42, left: 42, right: 32 };
  const plotWidth = Math.max(dimensions.width - padding.left - padding.right, 50);
  const plotHeight = Math.max(dimensions.height - padding.top - padding.bottom, 50);
  const baselineY = padding.top + plotHeight;
  const peakY = padding.top + (1 - maxPriority / 100) * plotHeight;
  const avgY = padding.top + (1 - avgPriority / 100) * plotHeight;
  const peakColor = getPriorityColorHex(maxPriority);
  const avgColor = getPriorityColorHex(avgPriority);
  const filterKey = `${activeCategory}-${activePriorityRange}-${activeConfidenceRange}`;

  const points = useMemo(() => {
    if (filteredMails.length === 0) return [];
    if (filteredMails.length === 1) {
      const pct = getPriorityPercent(filteredMails[0]);
      return [
        {
          mail: filteredMails[0],
          x: padding.left + plotWidth / 2,
          y: padding.top + (1 - pct / 100) * plotHeight,
          pct,
        },
      ];
    }
    return filteredMails.map((mail, idx) => {
      const pct = getPriorityPercent(mail);
      const x = padding.left + (idx / (filteredMails.length - 1)) * plotWidth;
      const y = padding.top + (1 - pct / 100) * plotHeight;
      return { mail, x, y, pct };
    });
  }, [filteredMails, plotWidth, plotHeight, padding.left, padding.top]);

  const confidencePoints = useMemo(() => {
    if (filteredMails.length === 0) return [];
    if (filteredMails.length === 1) {
      const pct = getConfidencePercent(filteredMails[0]);
      return [
        {
          mail: filteredMails[0],
          x: padding.left + plotWidth / 2,
          y: padding.top + (1 - pct / 100) * plotHeight,
          pct,
        },
      ];
    }
    return filteredMails.map((mail, idx) => {
      const pct = getConfidencePercent(mail);
      const x = padding.left + (idx / (filteredMails.length - 1)) * plotWidth;
      const y = padding.top + (1 - pct / 100) * plotHeight;
      return { mail, x, y, pct };
    });
  }, [filteredMails, plotWidth, plotHeight, padding.left, padding.top]);

  const curvePath = useMemo(() => getSmoothCurvePath(points), [points]);
  const areaPath = useMemo(() => getAreaPath(points, baselineY), [points, baselineY]);
  const confidenceCurvePath = useMemo(
    () => getSmoothCurvePath(confidencePoints),
    [confidencePoints]
  );
  const confidenceAreaPath = useMemo(
    () => getAreaPath(confidencePoints, baselineY),
    [confidencePoints, baselineY]
  );

  if (mails.length === 0) return null;

  return (
    <section className="px-4 py-6 sm:px-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-black">Priority Confidence Graph</h3>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full text-black/60">
                {filteredMails.length} {filteredMails.length === 1 ? 'mail' : 'mails'}
              </span>
            </div>
            <p className="text-[11px] text-black/45">
              Chronological priority progression from AI classification
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs">
            <span className="text-[10px] text-black/50 font-medium">Average Priority:</span>
            <span className="font-mono font-semibold text-black">{avgPriority}%</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs">
            <span className="text-[10px] text-black/50 font-medium">Peak Priority:</span>
            <span className="font-mono font-semibold text-black">{maxPriority}%</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs">
            <span className="text-[10px] text-black/50 font-medium">Average Confidence:</span>
            <span className="font-mono font-semibold text-black">{avgConfidence}%</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs">
            <span className="text-[10px] text-black/50 font-medium">Max Confidence:</span>
            <span className="font-mono font-semibold text-black">{maxConfidence}%</span>
          </div>
        </div>
      </div>

      <div ref={toolbarRef} className="flex flex-wrap items-center justify-between gap-2.5 pt-1 pb-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown((prev) => (prev === 'category' ? null : 'category'))}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer select-none',
                activeCategory !== 'ALL'
                  ? 'text-black'
                  : 'text-black/70 hover:text-black'
              )}
            >
              <span className="text-black/40 text-[10px] uppercase font-semibold">Category:</span>
              <span className="truncate max-w-32">
                {activeCategory === 'ALL'
                  ? 'All Categories'
                  : categoriesList.find((c) => c.key.toLowerCase() === activeCategory.toLowerCase())?.name || activeCategory}
              </span>
              <ChevronDown className={cn('size-3 text-black/40 transition-transform duration-150', openDropdown === 'category' && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {openDropdown === 'category' && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 2, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 mt-1.5 z-40 min-w-44 bg-white rounded-xl p-1 shadow-xl border border-black/10 text-left max-h-56 overflow-y-auto"
                >
                  {categoriesList.map((cat) => {
                    const isSelected = activeCategory.toLowerCase() === cat.key.toLowerCase();
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => {
                          handleCategoryChange(cat.key);
                          setOpenDropdown(null);
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer text-left',
                          isSelected
                            ? 'bg-black/5 font-semibold text-black'
                            : 'text-black/70 hover:bg-black/3 hover:text-black'
                        )}
                      >
                        <div className="flex items-center gap-1.5 truncate pr-2">
                          {isSelected && <Check className="size-3 text-black shrink-0" />}
                          <span className="truncate">{cat.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-black/40 bg-black/4 px-1.5 py-0.2 rounded-full">
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown((prev) => (prev === 'priority' ? null : 'priority'))}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer select-none',
                activePriorityRange !== 'ALL'
                  ? 'text-black'
                  : 'text-black/70 hover:text-black'
              )}
            >
              <span className="text-black/40 text-[10px] uppercase font-semibold">Priority:</span>
              <span className="truncate max-w-32">
                {PRIORITY_RANGES.find((r) => r.key === activePriorityRange)?.label || 'All'}
              </span>
              <ChevronDown className={cn('size-3 text-black/40 transition-transform duration-150', openDropdown === 'priority' && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {openDropdown === 'priority' && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 2, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 mt-1.5 z-40 min-w-52 bg-white rounded-xl p-1 shadow-xl border border-black/10 text-left"
                >
                  {PRIORITY_RANGES.map((rng) => {
                    const isSelected = activePriorityRange === rng.key;
                    const count = mails.filter((m) => matchesRange(getPriorityPercent(m), rng.key)).length;
                    return (
                      <button
                        key={rng.key}
                        type="button"
                        onClick={() => {
                          handlePriorityRangeChange(rng.key);
                          setOpenDropdown(null);
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer text-left',
                          isSelected
                            ? 'font-semibold text-black'
                            : 'text-black/70 hover:text-black'
                        )}
                      >
                        <div className="flex items-center gap-1.5 truncate pr-2">
                          {isSelected && <Check className="size-3 text-black shrink-0" />}
                          <span className="font-medium">{rng.label}</span>
                          <span className="text-[10px] text-black/40 font-mono">({rng.range})</span>
                        </div>
                        <span className="text-[10px] font-mono text-black/40 bg-black/4 px-1.5 py-0.2 rounded-full">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown((prev) => (prev === 'confidence' ? null : 'confidence'))}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer select-none',
                activeConfidenceRange !== 'ALL'
                  ? 'text-black font-semibold'
                  : 'text-black/70 hover:text-black'
              )}
            >
              <span className="text-black/40 text-[10px] uppercase font-semibold">Confidence:</span>
              <span className="truncate max-w-32">
                {CONFIDENCE_RANGES.find((r) => r.key === activeConfidenceRange)?.label || 'All'}
              </span>
              <ChevronDown className={cn('size-3 text-black/40 transition-transform duration-150', openDropdown === 'confidence' && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {openDropdown === 'confidence' && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 2, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 mt-1.5 z-40 min-w-52 bg-white rounded-xl p-1 shadow-xl border border-black/10 text-left"
                >
                  {CONFIDENCE_RANGES.map((rng) => {
                    const isSelected = activeConfidenceRange === rng.key;
                    const count = mails.filter((m) => matchesRange(getConfidencePercent(m), rng.key)).length;
                    return (
                      <button
                        key={rng.key}
                        type="button"
                        onClick={() => {
                          handleConfidenceRangeChange(rng.key);
                          setOpenDropdown(null);
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer text-left',
                          isSelected
                            ? 'bg-black/5 font-semibold text-black'
                            : 'text-black/70 hover:bg-black/3 hover:text-black'
                        )}
                      >
                        <div className="flex items-center gap-1.5 truncate pr-2">
                          {isSelected && <Check className="size-3 text-black shrink-0" />}
                          <span className="font-medium">{rng.label}</span>
                          <span className="text-[10px] text-black/40 font-mono">({rng.range})</span>
                        </div>
                        <span className="text-[10px] font-mono text-black/40 bg-black/4 px-1.5 py-0.2 rounded-full">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {(activeCategory !== 'ALL' || activePriorityRange !== 'ALL' || activeConfidenceRange !== 'ALL') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-black/50 hover:text-black hover:bg-black/5 transition cursor-pointer"
            >
              <X className="size-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="text-[11px] text-black/40 font-mono">
          Showing {filteredMails.length} of {mails.length}
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full p-2 select-none overflow-hidden"
        style={{ minHeight: 240 }}
      >
        <svg
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full block overflow-visible"
        >
          <defs>
            <linearGradient
              id="confidence-area-gradient"
              x1="0"
              y1={padding.top}
              x2="0"
              y2={baselineY}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.09" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient
              id="priority-area-gradient"
              x1="0"
              y1={padding.top}
              x2="0"
              y2={baselineY}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.18" />
              <stop offset="25%" stopColor="#ea580c" stopOpacity="0.14" />
              <stop offset="50%" stopColor="#eab308" stopOpacity="0.10" />
              <stop offset="75%" stopColor="#84cc16" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient
              id="priority-line-gradient"
              x1="0"
              y1={baselineY}
              x2="0"
              y2={padding.top}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#16a34a" />
              <stop offset="25%" stopColor="#84cc16" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="75%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>

          {[100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0].map((tierPct) => {
            const y = padding.top + (1 - tierPct / 100) * plotHeight;
            return (
              <g key={`grid-${tierPct}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={dimensions.width - padding.right}
                  y2={y}
                  stroke={tierPct === 0 ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.06)'}
                  strokeDasharray={tierPct === 0 ? 'none' : '3 4'}
                  strokeWidth={tierPct === 0 ? 1.5 : 1}
                />
                <text
                  x={padding.left - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[9px] font-mono fill-black/40 select-none"
                >
                  {tierPct}%
                </text>
              </g>
            );
          })}

          {filteredMails.length > 0 && (
            <motion.g
              key={`ref-lines-${filterKey}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="pointer-events-none select-none"
            >
              {maxPriority === avgPriority ? (
                <g>
                  <line
                    x1={padding.left}
                    y1={peakY}
                    x2={dimensions.width - padding.right}
                    y2={peakY}
                    stroke={peakColor}
                    strokeWidth={1.2}
                    strokeDasharray="4 3"
                    strokeOpacity={0.65}
                  />
                  <text
                    x={dimensions.width - padding.right - 6}
                    y={Math.max(peakY - 5, 14)}
                    textAnchor="end"
                    fill={peakColor}
                    fillOpacity={0.9}
                    stroke="#ffffff"
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                    style={{ paintOrder: 'stroke fill' }}
                    className="text-[10px] font-mono font-medium"
                  >
                    Peak & Avg: {maxPriority}%
                  </text>
                </g>
              ) : (
                <>
                  <g>
                    <line
                      x1={padding.left}
                      y1={avgY}
                      x2={dimensions.width - padding.right}
                      y2={avgY}
                      stroke={avgColor}
                      strokeWidth={1.2}
                      strokeDasharray="4 3"
                      strokeOpacity={0.55}
                    />
                    <text
                      x={dimensions.width - padding.right - 6}
                      y={
                        Math.abs(peakY - avgY) < 18
                          ? Math.min(avgY + 12, baselineY - 4)
                          : Math.max(avgY - 5, 14)
                      }
                      textAnchor="end"
                      fill={avgColor}
                      fillOpacity={0.85}
                      stroke="#ffffff"
                      strokeWidth={2.5}
                      strokeLinejoin="round"
                      style={{ paintOrder: 'stroke fill' }}
                      className="text-[10px] font-mono font-medium"
                    >
                      Avg: {avgPriority}%
                    </text>
                  </g>

                  <g>
                    <line
                      x1={padding.left}
                      y1={peakY}
                      x2={dimensions.width - padding.right}
                      y2={peakY}
                      stroke={peakColor}
                      strokeWidth={1.2}
                      strokeDasharray="5 3"
                      strokeOpacity={0.65}
                    />
                    <text
                      x={dimensions.width - padding.right - 6}
                      y={Math.max(peakY - 5, 14)}
                      textAnchor="end"
                      fill={peakColor}
                      fillOpacity={0.9}
                      stroke="#ffffff"
                      strokeWidth={2.5}
                      strokeLinejoin="round"
                      style={{ paintOrder: 'stroke fill' }}
                      className="text-[10px] font-mono font-medium"
                    >
                      Peak: {maxPriority}%
                    </text>
                  </g>
                </>
              )}
            </motion.g>
          )}

          {(hoveredPoint || selectedPoint) && (() => {
            const pt = hoveredPoint || selectedPoint!;
            return (
              <motion.line
                key={pt.mail.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                x1={pt.x}
                y1={padding.top}
                x2={pt.x}
                y2={baselineY}
                stroke="rgba(0,0,0,0.18)"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
            );
          })()}

          <AnimatePresence mode="wait">
            {confidencePoints.length >= 2 && (
              <motion.path
                key={`conf-area-${filterKey}`}
                d={confidenceAreaPath}
                fill="url(#confidence-area-gradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="pointer-events-none select-none"
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {confidencePoints.length >= 2 && (
              <motion.path
                key={`conf-line-${filterKey}`}
                d={confidenceCurvePath}
                fill="none"
                stroke="#4F46E5"
                strokeWidth={2}
                strokeOpacity={0.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-none select-none"
              />
            )}
          </AnimatePresence>

          {confidencePoints.length === 1 && (
            <line
              x1={padding.left}
              y1={confidencePoints[0].y}
              x2={dimensions.width - padding.right}
              y2={confidencePoints[0].y}
              stroke="#4F46E5"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              strokeOpacity={0.4}
              className="pointer-events-none select-none"
            />
          )}

          {confidencePoints.map((cp, idx) => {
            const pt = points[idx];
            if (!pt) return null;
            const isSelected = selectedPoint?.mail.id === pt.mail.id;
            const isHovered = hoveredPoint?.mail.id === pt.mail.id;

            return (
              <g key={`conf-stem-group-${pt.mail.id}`} className="pointer-events-none select-none">
                <line
                  x1={pt.x}
                  y1={pt.y}
                  x2={cp.x}
                  y2={cp.y}
                  stroke="#4F46E5"
                  strokeWidth={1.2}
                  strokeDasharray="2 3"
                  strokeOpacity={isHovered || isSelected ? 0.75 : 0.25}
                  className="transition-all duration-150"
                />
                <circle
                  cx={cp.x}
                  cy={cp.y}
                  r={isSelected ? 4.5 : isHovered ? 4 : 2.5}
                  fill="#4F46E5"
                  stroke="#4F46E590"
                  strokeWidth={isSelected || isHovered ? 2 : 1.5}
                  strokeOpacity={isSelected || isHovered ? 0.95 : 0.45}
                  className="transition-all duration-150"
                />
                {(isHovered || isSelected) && (
                  <circle
                    cx={cp.x}
                    cy={cp.y}
                    r={7.5}
                    fill="#4F46E5"
                    fillOpacity={0.15}
                  />
                )}
              </g>
            );
          })}

          <AnimatePresence mode="wait">
            {points.length >= 2 && (
              <motion.path
                key={`area-${filterKey}`}
                d={areaPath}
                fill="url(#priority-area-gradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {points.length >= 2 && (
              <motion.path
                key={`line-${filterKey}`}
                d={curvePath}
                fill="none"
                stroke="url(#priority-line-gradient)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
          </AnimatePresence>

          {points.length === 1 && (
            <line
              x1={padding.left}
              y1={points[0].y}
              x2={dimensions.width - padding.right}
              y2={points[0].y}
              stroke={getPriorityColorHex(points[0].pct)}
              strokeDasharray="4 4"
              strokeWidth={1.5}
              opacity={0.5}
            />
          )}

          <AnimatePresence>
            {points.map((pt, i) => {
              const colorHex = getPriorityColorHex(pt.pct);
              const isSelected = selectedPoint?.mail.id === pt.mail.id;
              const isHovered = hoveredPoint?.mail.id === pt.mail.id;

              return (
                <g
                  key={pt.mail.id}
                  data-point-node
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPoint((prev) => (prev?.mail.id === pt.mail.id ? null : pt));
                  }}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={18}
                    fill="transparent"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />

                  {(isHovered || isSelected) && (
                    <motion.circle
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: isSelected ? 2.6 : 2.2, opacity: isSelected ? 0.35 : 0.2 }}
                      cx={pt.x}
                      cy={pt.y}
                      r={6}
                      fill={colorHex}
                    />
                  )}

                  <motion.circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 7.5 : isHovered ? 6.5 : 5}
                    fill="#ffffff"
                    stroke={colorHex}
                    strokeWidth={isSelected ? 2.5 : 2}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.15 + i * 0.04,
                      type: 'spring',
                      damping: 15,
                      stiffness: 300,
                    }}
                    className="drop-shadow-xs"
                    onMouseEnter={() => setHoveredPoint(pt)}
                  />

                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 4 : isHovered ? 3.5 : 2.5}
                    fill={colorHex}
                    className="pointer-events-none"
                  />

                  {isHovered && !isSelected && (() => {
                    const cp = confidencePoints[i];
                    const tooltipWidth = cp ? 170 : 56;
                    const tooltipHeight = 22;
                    const tooltipX = Math.max(
                      padding.left + tooltipWidth / 2,
                      Math.min(pt.x, dimensions.width - padding.right - tooltipWidth / 2)
                    );
                    const minY = cp ? Math.min(pt.y, cp.y) : pt.y;
                    const tooltipY = Math.max(minY - 30, 4);

                    return (
                      <motion.g
                        key={`hover-pct-${pt.mail.id}`}
                        initial={{ opacity: 0, y: 3, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 2, scale: 0.9 }}
                        transition={{ duration: 0.12 }}
                        className="pointer-events-none select-none"
                      >
                        <rect
                          x={tooltipX - tooltipWidth / 2}
                          y={tooltipY}
                          width={tooltipWidth}
                          height={tooltipHeight}
                          rx={6}
                          fill="#ffffff"
                          stroke="#00000010"
                          strokeWidth={1}
                          className="drop-shadow-md"
                        />
                        <polygon
                          points={`${pt.x - 4},${tooltipY + tooltipHeight} ${pt.x + 4},${tooltipY + tooltipHeight} ${pt.x},${tooltipY + tooltipHeight + 4}`}
                          className="drop-shadow-md"
                          fill="#ffffff"
                        />
                        <text
                          x={tooltipX}
                          y={tooltipY + 14.5}
                          textAnchor="middle"
                          className="text-[10px] font-mono select-none"
                        >
                          <tspan fill={colorHex} fontWeight="bold">
                            {pt.pct.toFixed(0)}% Priority
                          </tspan>
                          {cp && (
                            <>
                              <tspan fill="#00000020"> | </tspan>
                              <tspan fill="#4F46E5" fontWeight="bold">
                                {cp.pct.toFixed(0)}% Confidence
                              </tspan>
                            </>
                          )}
                        </text>
                      </motion.g>
                    );
                  })()}
                </g>
              );
            })}
          </AnimatePresence>

          {points.length > 1 && (
            <g className="select-none pointer-events-none">
              <text
                x={points[0].x}
                y={dimensions.height - 12}
                textAnchor="start"
                className="text-[9px] font-mono fill-black/45"
              >
                {new Date(points[0].mail.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </text>

              {points.length >= 3 && (
                <text
                  x={points[Math.floor(points.length / 2)].x}
                  y={dimensions.height - 12}
                  textAnchor="middle"
                  className="text-[9px] font-mono fill-black/35 hidden sm:inline"
                >
                  {new Date(points[Math.floor(points.length / 2)].mail.createdAt).toLocaleDateString(
                    undefined,
                    { month: 'short', day: 'numeric' }
                  )}
                </text>
              )}

              <text
                x={points[points.length - 1].x}
                y={dimensions.height - 12}
                textAnchor="end"
                className="text-[9px] font-mono fill-black/45"
              >
                {new Date(points[points.length - 1].mail.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </text>
            </g>
          )}
        </svg>

        {filteredMails.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <Sparkles className="size-6 text-black/30 mb-2" />
            <p className="text-xs text-black/50">No analyzed emails match the selected filters</p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-2 text-xs font-semibold text-[#4F46E5] hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        <AnimatePresence>
          {selectedPoint && (
            <motion.div
              key={selectedPoint.mail.id}
              data-point-modal
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                left: Math.min(
                  Math.max(selectedPoint.x, 135),
                  dimensions.width - 135
                ),
                top: Math.max(selectedPoint.y - 125, 8),
              }}
              className="absolute -translate-x-1/2 z-30 pointer-events-auto bg-white/98 backdrop-blur-md rounded-xl p-3 shadow-xl border border-black/10 w-72 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-2 pb-1.5 mb-1.5 border-b border-black/5">
                <div className="min-w-0 pr-1">
                  <span className="block text-[11px] font-bold text-black truncate max-w-44">
                    {parseSenderName(selectedPoint.mail.sender)}
                  </span>
                  <span
                    className={cn(
                      'inline-block mt-0.5 text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded border',
                      getPriorityBadgeClass(selectedPoint.pct)
                    )}
                  >
                    {selectedPoint.pct.toFixed(0)}% • {getPriorityTierLabel(selectedPoint.pct)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPoint(null)}
                  className="size-5 rounded-md flex items-center justify-center text-black/40 hover:text-black hover:bg-black/5 cursor-pointer shrink-0 transition-colors"
                  aria-label="Close popup"
                >
                  <X className="size-3" />
                </button>
              </div>

              <p className="text-xs text-black/85 font-medium line-clamp-2 mb-2">
                {selectedPoint.mail.subject || '(No Subject)'}
              </p>

              <div className="flex items-center justify-between text-[9px] text-black/45 pt-1 border-t border-black/5">
                <div className="flex items-center gap-1 truncate max-w-36">
                  <span
                    className={cn(
                      'px-1.5 py-0.2 rounded text-[8px] font-medium border truncate',
                      getCategoryBadgeColor(selectedPoint.mail.category || 'Others')
                    )}
                  >
                    {selectedPoint.mail.category || 'Others'}
                  </span>
                  {selectedPoint.mail.confidence_score != null && (
                    <span>
                      Conf: {(Number(selectedPoint.mail.confidence_score) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenDetail) onOpenDetail(selectedPoint.mail);
                    else setPreviewMail(selectedPoint.mail);
                  }}
                  className="flex items-center gap-1 shrink-0 text-black/75 hover:text-black font-semibold text-[10px] cursor-pointer hover:underline"
                >
                  <span>View Mail</span>
                  <ArrowUpRight className="size-2.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-black/50">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-black/40">
            Priority Bands:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-green-600" />
            <span className="text-[10px]">Low (&le; 20%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-lime-500" />
            <span className="text-[10px]">Routine (21-40%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-yellow-500" />
            <span className="text-[10px]">Normal (41-60%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-orange-500" />
            <span className="text-[10px]">High (61-80%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-red-600" />
            <span className="text-[10px]">Urgent (&gt; 80%)</span>
          </div>
          <div className="h-3 w-px bg-black/15 mx-0.5 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 bg-[#4F46E5]/60 rounded-full" />
            <span className="text-[10px]">Confidence</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 border-b-[1.5px] border-dashed border-red-500/70" />
            <span className="text-[10px]">Peak Priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 border-b-[1.5px] border-dashed border-amber-600/70" />
            <span className="text-[10px]">Average Priority</span>
          </div>
        </div>

        <div className="text-[10px] text-black/40 italic">
          Hover node for % • Click node for details
        </div>
      </div>

      <AnimatePresence>
        {previewMail && (
          <Dialog open onOpenChange={(o) => !o && setPreviewMail(null)}>
            <DialogContent className="sm:max-w-md w-full rounded-t-4xl sm:rounded-2xl p-5! bg-white border text-black shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-black line-clamp-1 pr-8">
                  {parseSenderName(previewMail.sender)}
                </DialogTitle>
                <DialogDescription className="text-left text-xs text-black/50 flex items-center gap-1">
                  <Clock className="size-3" />
                  <span>{new Date(previewMail.createdAt).toLocaleString()}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                <div className="p-2 bg-black/3 rounded-lg space-y-1">
                  <p className="text-[10px] font-semibold text-black/50 uppercase">Subject</p>
                  <p className="text-xs font-medium text-black line-clamp-2">{previewMail.subject}</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-black/3 rounded-lg">
                    <p className="text-[10px] font-semibold text-black/50 uppercase">Category</p>
                    <p className="text-xs font-semibold text-black truncate">{previewMail.category || 'Others'}</p>
                  </div>
                  <div className="p-2 bg-black/3 rounded-lg">
                    <p className="text-[10px] font-semibold text-black/50 uppercase">Priority</p>
                    <p className="text-xs font-mono font-semibold text-black">
                      {getPriorityPercent(previewMail)}%
                    </p>
                  </div>
                  <div className="p-2 bg-black/3 rounded-lg">
                    <p className="text-[10px] font-semibold text-blue-600/70 uppercase">Confidence</p>
                    <p className="text-xs font-mono font-semibold text-blue-600">
                      {getConfidencePercent(previewMail)}%
                    </p>
                  </div>
                </div>

                <div className="p-2 bg-black/3 rounded-lg space-y-1">
                  <p className="text-[10px] font-semibold text-black/50 uppercase">Preview</p>
                  <p className="text-xs text-black/75 line-clamp-3 leading-relaxed">
                    {formatEmailContent(previewMail.body).slice(0, 220)}
                    {(previewMail.body?.length ?? 0) > 220 ? '…' : ''}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <CustomButton
                  onClick={() => {
                    onOpenDetail(previewMail);
                    setPreviewMail(null);
                  }}
                >
                  Open Full Mail
                </CustomButton>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </section>
  );
}