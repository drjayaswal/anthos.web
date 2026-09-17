'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-10000 w-full h-full bg-white flex flex-col items-center justify-center select-none">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Image
          src="/anthos.png"
          alt="anthos"
          width={100}
          height={100}
          priority
          quality={100}
          className="w-30 h-auto drop-shadow-xs"
        />

        <div className="w-30 h-0.5 bg-red-400/10 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ left: "-47%" }}
            animate={{ left: "98%" }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1.4,
              ease: "easeInOut",
            }}
            className="absolute top-0 bottom-0 w-1/2 bg-red-600 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

