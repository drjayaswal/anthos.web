'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Loader({ onComplete }: { onComplete?: () => void }) {
  const [speedFactor, setSpeedFactor] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2500;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setSpeedFactor(progress);

      if (progress >= 1) {
        clearInterval(interval);
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            setHidden(true);
            if (onComplete) onComplete();
          }, 500);
        }, 500);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (hidden) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      <motion.div
      
        className="flex flex-col items-center w-48 animate-pulse [html.light_&]:invert"
        animate={isExiting ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, ease: "linear", repeat: Infinity }}
        >
          <Image
            src="/anthos.png"
            alt="anthos"
            width={100}
            height={100}
            quality={90}
            style={{ width: '60px', height: 'auto' }}
            priority
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
