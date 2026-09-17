'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Loader() {
  return (
    <div className="fixed inset-0 z-10000 w-full h-full bg-white flex flex-col items-center justify-center select-none cursor-wait">
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
        <div className="relative w-44 h-0.5 bg-red-600/10 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 bottom-0 w-14 bg-red-600 rounded-full"
            initial={{ left: '0%' }}
            animate={{ left: ['0%', '68%', '0%'] }}
            transition={{
              duration: 1.4,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
          />
        </div>
      </div>
    </div>
  );
}
