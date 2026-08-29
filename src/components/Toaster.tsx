"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, type ToastOptions } from '@/lib/toast';
import { XIcon } from 'lucide-react';

export const Toaster = () => {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  useEffect(() => {
    return toast.subscribe(setToasts);
  }, []);

  const reversedToasts = [...toasts].reverse();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col-reverse items-end gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout" initial={false}>
        {reversedToasts.map((t, idx) => {
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.8, filter: "blur(10px)" }}
              animate={{
                opacity: 1 - idx * 0.2,
                y: 0,
                scale: 1 - idx * 0.05,
                filter: `blur(${idx * 2}px)`,
                zIndex: reversedToasts.length - idx,
              }}
              exit={{
                opacity: 0,
                scale: 0.9,
                y: -20,
                filter: "blur(10px)",
                transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                mass: 1
              }}
              className="pointer-events-auto flex items-center gap-3 overflow-hidden bg-white border border-black/10 pl-4 pr-3 py-2 rounded-xl shadow-2xl min-w-70"
            >
              <p className="text-black text-sm tracking-tight z-10 flex-1">
                {t.message}
              </p>

              <button
                onClick={() => toast.remove(t.id)}
                className="ml-auto text-black hover:text-red-600 opacity-50 hover:opacity-100 mr-1 transition-colors cursor-pointer z-10"
              >
                <XIcon className='w-4 h-4' />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};