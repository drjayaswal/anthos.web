'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { UserIcon, MailIcon, CalendarIcon, ChevronsRightIcon, X } from 'lucide-react';
import { fetchUserDetails } from '@/app/actions';

interface UserAccountDetails {
  id?: string;
  email?: string;
  createdAt?: string;
  totalEncryptedMails?: number;
}

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignOut: () => void;
}

export default function AccountDialog({ open, onOpenChange, onSignOut }: AccountDialogProps) {
  const [data, setData] = useState<UserAccountDetails | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxSwipe, setMaxSwipe] = useState(255);
  const x = useMotionValue(0);

  const fillWidth = useTransform(x, (v) => `${Math.max(36, v + 36)}px`);
  const labelOpacity = useTransform(x, [0, 80], [1, 0]);
  const activeLabelOpacity = useTransform(x, [50, 150], [0, 1]);

  const handleDragEnd = () => {
    if (x.get() >= maxSwipe) {
      onSignOut();
    } else {
      animate(x, 0, {
        type: 'spring',
        stiffness: 500,
        damping: 35,
      });
    }
  };

  useEffect(() => {
    async function loadData() {
      if (open) {
        x.set(0);
        const result = await fetchUserDetails();
        if (result.ok && result.data) {
          setData(result.data as UserAccountDetails);
        }
      }
    }
    loadData();
  }, [open, x]);

  useEffect(() => {
    if (containerRef.current) {
      setMaxSwipe(containerRef.current.offsetWidth - 44);
    }
  }, [open, data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-full sm:w-80 rounded-t-4xl sm:rounded-2xl bg-white border sm:border-b border-b-0 text-black shadow-2xl p-0 gap-0 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b">
          <div>
            <DialogTitle className="text-xs font-semibold text-black">Account</DialogTitle>
            <DialogDescription className="text-[10px] text-black/50">Manage your connected profile</DialogDescription>
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

        <div className="px-4 py-3 space-y-2">
          {data ? (
            <div className="space-y-2">
              <div className="rounded-2xl p-2.5 border flex items-center gap-3">
                <UserIcon size={15} className="text-black/50 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-medium text-black/50 uppercase tracking-wide">Email</p>
                  <p className="text-xs font-medium text-black truncate">{data.email}</p>
                </div>
              </div>

              <div className="rounded-2xl p-2.5 border flex items-center gap-3">
                <MailIcon size={15} className="text-black/50 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-medium text-black/50 uppercase tracking-wide">Encrypted Mails</p>
                  <p className="text-xs font-medium text-black">{data.totalEncryptedMails} Stored</p>
                </div>
              </div>

              <div className="rounded-2xl p-2.5 border flex items-center gap-3">
                <CalendarIcon size={15} className="text-black/50 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-medium text-black/50 uppercase tracking-wide">Joined</p>
                  <p className="text-xs font-medium text-black">{data.createdAt ? new Date(data.createdAt).toLocaleDateString() : ''}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="h-12 animate-pulse rounded-lg bg-black/5 border border-transparent" />
              <div className="h-12 animate-pulse rounded-lg bg-black/5 border border-transparent" />
              <div className="h-12 animate-pulse rounded-lg bg-black/5 border border-transparent" />
            </div>
          )}
        </div>

        <div className="p-3 border-t">
          <div
            ref={containerRef}
            className="relative w-full h-10 rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] bg-black/5 flex items-center select-none"
          >
            <motion.div
              style={{ opacity: labelOpacity }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none pl-6"
            >
              <span className="text-black/60 text-[11px] font-medium tracking-tight">
                Slide to Disconnect
              </span>
            </motion.div>

            <motion.div
              style={{ width: fillWidth }}
              className="absolute h-10 left-0 top-0 rounded-full bg-linear-to-b from-red-600 via-red-700 to-red-800 border shadow-[inset_0_-2px_4px_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.1)] pointer-events-none flex items-center justify-center overflow-hidden"
            >
              <motion.span
                style={{ opacity: activeLabelOpacity }}
                className="text-white text-[10px] font-bold uppercase tracking-wider pr-6 truncate select-none"
              >
                Disconnecting
              </motion.span>
            </motion.div>

            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: maxSwipe }}
              dragMomentum={false}
              dragElastic={0}
              onDragEnd={handleDragEnd}
              style={{ x }}
              className="relative z-10 w-10 h-10 rounded-full bg-linear-to-b from-white to-gray-100 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.1)] flex items-center justify-center cursor-grab active:cursor-grabbing select-none shrink-0"
            >
              <ChevronsRightIcon size={24} strokeWidth={3} className="text-red-600" />
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}