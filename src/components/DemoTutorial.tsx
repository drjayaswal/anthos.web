'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  X,
  CheckCircle2,
} from 'lucide-react';
import { CustomButton } from './ui/button';

const TUTORIAL_STORAGE_KEY = 'anthos-demo-tutorial-seen';

interface TourStep {
  targetSelector: string;
  badge: string;
  title: string;
  description: string;
  placement?: 'bottom' | 'top' | 'left' | 'right' | 'auto';
  padding?: number;
  radius?: number;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetSelector: '[data-tour="options-button"]',
    badge: 'Step 1 of 4 • Actions Dock',
    title: 'Options & Quick Actions',
    description:
      'Click here to access your action dock: Fetch from Gmail, Run AI Prioritization, Load Encrypted DB, and Account management.',
    placement: 'bottom',
    padding: 6,
    radius: 999,
  },
  {
    targetSelector: '[data-tour="inbox-tabs"]',
    badge: 'Step 2 of 4 • Navigation',
    title: 'Inbox Views & Priority Graph',
    description:
      'Smoothly glide between your Fetched emails (blue), Analyzed AI priority & category view (green), and Encrypted database vault (teal).',
    placement: 'bottom',
    padding: 8,
    radius: 999,
  },
  {
    targetSelector: '[data-tour="fetch-action-btn"]',
    badge: 'Step 3 of 4 • Ingestion',
    title: 'Fetch Latest Emails',
    description:
      'Click here to fetch your latest emails with custom date and unread filters. In demo mode, 6 simulated roadmap, alert, and invoice emails are ready.',
    placement: 'bottom',
    padding: 8,
    radius: 16,
  },
  {
    targetSelector: '[data-tour="navbar-menu"]',
    badge: 'Step 4 of 4 • Custom AI & Theme',
    title: 'Menu & Settings',
    description:
      'Open the navigation menu to visit Settings for adding custom AI models (Groq, OpenAI, Anthropic), or switch between Dark and Light mode.',
    placement: 'bottom',
    padding: 6,
    radius: 999,
  },
];

interface DemoTutorialProps {
  isOpen?: boolean;
  onClose?: () => void;
  forceShow?: boolean;
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
  radius: number;
}

export default function DemoTutorial({
  isOpen: propIsOpen,
  onClose: propOnClose,
  forceShow = false,
}: DemoTutorialProps) {
  const [active, setActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<SpotlightRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (forceShow || propIsOpen) {
      setActive(true);
      setCurrentStep(0);
      return;
    }
    try {
      const seen = localStorage.getItem(TUTORIAL_STORAGE_KEY);
      if (!seen) {
        setActive(true);
        setCurrentStep(0);
      }
    } catch { }
  }, [forceShow, propIsOpen]);

  const updateTargetRect = useCallback(() => {
    if (!active) return;
    const step = TOUR_STEPS[currentStep];
    if (!step) return;

    let el = document.querySelector(step.targetSelector) as HTMLElement | null;

    if (!el && step.targetSelector === '[data-tour="fetch-action-btn"]') {
      el = document.querySelector('[data-tour="empty-state-card"]') as HTMLElement | null;
    }

    if (el) {
      const rect = el.getBoundingClientRect();
      const pad = step.padding ?? 8;
      const rad = step.radius ?? 16;
      setTargetRect({
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
        radius: rad,
      });
    } else {
      const w = Math.min(320, window.innerWidth - 40);
      const h = 120;
      setTargetRect({
        top: window.innerHeight / 2 - h / 2,
        left: window.innerWidth / 2 - w / 2,
        width: w,
        height: h,
        radius: 20,
      });
    }
  }, [active, currentStep]);

  useEffect(() => {
    if (!active) return;
    const step = TOUR_STEPS[currentStep];
    if (!step) return;

    let el = document.querySelector(step.targetSelector) as HTMLElement | null;
    if (!el && step.targetSelector === '[data-tour="fetch-action-btn"]') {
      el = document.querySelector('[data-tour="empty-state-card"]') as HTMLElement | null;
    }

    const elevatedElements: HTMLElement[] = [];

    if (el) {
      el.classList.add('tour-spotlight-active');
      elevatedElements.push(el);

      const parentContainer = el.closest('header, [class*="fixed"]') as HTMLElement | null;
      if (parentContainer && parentContainer !== el) {
        parentContainer.classList.add('tour-spotlight-active');
        elevatedElements.push(parentContainer);
      }
    }

    return () => {
      elevatedElements.forEach((element) => {
        element.classList.remove('tour-spotlight-active');
      });
    };
  }, [active, currentStep]);

  useEffect(() => {
    return () => {
      document.querySelectorAll('.tour-spotlight-active').forEach((el) => {
        el.classList.remove('tour-spotlight-active');
      });
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    updateTargetRect();

    const handleUpdate = () => {
      updateTargetRect();
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    };
  }, [active, currentStep, updateTargetRect]);

  const handleClose = () => {
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    } catch { }
    setActive(false);
    propOnClose?.();
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!active || !targetRect) return null;

  const step = TOUR_STEPS[currentStep];

  const tooltipWidth = 340;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  let tooltipTop = targetRect.top + targetRect.height + 16;
  let tooltipLeft = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;

  if (step.placement === 'top') {
    tooltipTop = Math.max(16, targetRect.top - 230);
  } else {
    tooltipTop = targetRect.top + targetRect.height + 16;
    if (typeof window !== 'undefined' && tooltipTop + 240 > window.innerHeight) {
      tooltipTop = Math.max(16, targetRect.top - 230);
    }
  }

  if (typeof window !== 'undefined') {
    tooltipLeft = Math.max(16, Math.min(tooltipLeft, window.innerWidth - tooltipWidth - 16));
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 select-none backdrop-blur-sm">
        <motion.div
          ref={tooltipRef}
          key={`tooltip-${currentStep}`}
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.96 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          style={{
            position: 'fixed',
            top: isMobile ? 'auto' : tooltipTop,
            bottom: isMobile ? 16 : 'auto',
            left: isMobile ? 16 : tooltipLeft,
            right: isMobile ? 16 : 'auto',
            maxWidth: isMobile ? 'none' : tooltipWidth,
          }}
          className="z-102 rounded-3xl bg-[#2c0237] border border-white/20 [html.light_&]:bg-white [html.light_&]:border-black/15 text-white [html.light_&]:text-black shadow-2xl overflow-hidden p-0 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-white/10 [html.light_&]:border-black/10">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-white/60 [html.light_&]:text-black/60">
              {step.badge}
            </span>
            <button
              type="button"
              onClick={handleClose}
              title="Skip Tutorial"
              className="text-xs dark:text-white [html.light_&]:text-black transition cursor-pointer flex items-center gap-1 px-2 py-0.5"
            >
              <span>Skip</span>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="px-4 py-3.5 space-y-2">
            <h4 className="text-sm font-bold tracking-tight text-white [html.light_&]:text-black">
              {step.title}
            </h4>
            <p className="text-xs text-white/70 [html.light_&]:text-black/70 leading-relaxed">
              {step.description}
            </p>
          </div>

          <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/10 [html.light_&]:border-black/10 bg-white/2 [html.light_&]:bg-black/2">
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${currentStep === idx
                    ? 'w-5 bg-white [html.light_&]:bg-black'
                    : 'w-1.5 bg-white/30 [html.light_&]:bg-black/30 hover:bg-white/50'
                    }`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <CustomButton onClick={handlePrev}>
                  Back
                </CustomButton>
              )}
              {currentStep === TOUR_STEPS.length - 1 ? (
                <CustomButton onClick={handleClose}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Finish Tour</span>
                </CustomButton>
              ) : (
                <CustomButton onClick={handleNext}>
                  <span>Next</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </CustomButton>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
