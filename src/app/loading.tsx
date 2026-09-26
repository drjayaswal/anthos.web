'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-10000 w-full h-full flex flex-col items-center justify-center select-none">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Image
          src="/anthos.svg"
          alt="anthos"
          width={100}
          height={100}
          priority
          quality={100}
          className="w-30 h-auto drop-shadow-xs animate-pulse"
        />
      </div>
    </div>
  );
}

