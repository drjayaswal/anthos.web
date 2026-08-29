"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CustomButton } from "@/components/ui/button";

export default function ThankYou() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:p-6 text-black">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative overflow-hidden p-6 sm:p-10 max-w-md w-full text-center flex flex-col items-center space-y-5 sm:space-y-6 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.8, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          className="relative flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24"
        >
          <Image
            src="/thank-you.svg"
            alt="Thank You"
            height={64}
            width={64}
            priority
            className="object-contain invert"
          />
        </motion.div>

        <div className="space-y-1.5 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
            Thank You!
          </h1>
          <p className="text-xs sm:text-sm text-black/60 leading-relaxed max-w-xs mx-auto">
            Your intelligence workspace is ready. You can now securely query, analyze, and manage your emails anytime.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full pt-1 sm:pt-2">
          <CustomButton asChild>
            <Link href="/">
              <span>Connect</span>
            </Link>
          </CustomButton>
          <CustomButton asChild>
            <Link href="/help">
              <span>Documentation</span>
            </Link>
          </CustomButton>
        </div>
      </motion.div>
    </div>
  );
}