'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface QueryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
  footerAction?: React.ReactNode;
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 640);
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  return isDesktop;
}

export default function QueryDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footerAction,
}: QueryDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const isDesktop = useIsDesktop();
  const panelRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  const currentYRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open && !isDesktop) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, isDesktop]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isDesktop) return;
    const touch = e.touches[0];
    const target = e.target as HTMLElement;
    if (target.closest('input, select, textarea, button, [data-prevent-drawer-drag]')) {
      return;
    }
    startYRef.current = touch.clientY;
    currentYRef.current = touch.clientY;
    startTimeRef.current = Date.now();
    isDraggingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (startYRef.current === null) return;
    const touch = e.touches[0];
    const deltaY = touch.clientY - startYRef.current;
    if (deltaY > 0) {
      isDraggingRef.current = true;
      currentYRef.current = touch.clientY;
      if (panelRef.current) {
        panelRef.current.style.transition = 'none';
        panelRef.current.style.transform = `translateY(${deltaY}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (startYRef.current === null) return;
    const deltaY = currentYRef.current - startYRef.current;
    const time = Date.now() - startTimeRef.current;
    const velocity = deltaY / (time || 1);

    if (panelRef.current) {
      panelRef.current.style.transition = 'transform 0.22s cubic-bezier(0.32, 0.72, 0, 1)';
      if (isDraggingRef.current && (deltaY > 75 || (deltaY > 30 && velocity > 0.4))) {
        panelRef.current.style.transform = 'translateY(100%)';
        setTimeout(() => {
          onOpenChange(false);
          if (panelRef.current) {
            panelRef.current.style.transform = '';
            panelRef.current.style.transition = '';
          }
        }, 180);
      } else {
        panelRef.current.style.transform = '';
      }
    }

    startYRef.current = null;
    isDraggingRef.current = false;
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className={
              isDesktop
                ? 'fixed inset-0 z-60'
                : 'fixed inset-0 z-60 bg-black/20 backdrop-blur-xs'
            }
            onClick={() => onOpenChange(false)}
          />

          {isDesktop ? (
            <motion.div
              key="drawer-panel-desktop"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 z-70 w-80 h-screen bg-white border-l flex flex-col overflow-hidden text-black select-text"
            >
              <div className="sm:hidden flex items-center justify-between px-4 pt-4 pb-3 border-b shrink-0">
                <div>
                  <h2 className="text-sm font-semibold text-black">{title}</h2>
                  <p className="text-[10px] text-black/50">{description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  title="Close dialog"
                  className="rounded cursor-pointer p-1 text-black/50 hover:text-red-600! transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="px-4 py-3 overflow-y-auto flex-1 overscroll-contain">
                {children}
              </div>

              {footerAction && (
                <div className="flex items-center justify-end gap-2 px-4 py-3 border-t shrink-0 bg-white">
                  {footerAction}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              ref={panelRef}
              key="drawer-panel-mobile"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="fixed bottom-0 left-0 right-0 z-70 w-full max-h-[85vh] rounded-t-4xl bg-white border-t border-border flex flex-col overflow-hidden text-black select-text shadow-2xl"
            >
              <div className="flex shrink-0 justify-center -mt-1 pb-1 cursor-grab active:cursor-grabbing select-none touch-none">
                <div className="mt-3 h-1.5 w-12 rounded-full bg-black/25" />
              </div>

              <div className="flex items-center justify-between px-4 pt-2 pb-3 border-b shrink-0">
                <div>
                  <h2 className="text-sm font-semibold text-black">{title}</h2>
                  <p className="text-[10px] text-black/50">{description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  title="Close dialog"
                  className="rounded cursor-pointer p-1 text-black/50 hover:text-red-600! transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="px-4 py-3 max-h-[70vh] overflow-y-auto flex-1 overscroll-contain">
                {children}
              </div>

              {footerAction && (
                <div className="flex items-center justify-end gap-2 px-4 py-3 border-t shrink-0 bg-white">
                  {footerAction}
                </div>
              )}
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
