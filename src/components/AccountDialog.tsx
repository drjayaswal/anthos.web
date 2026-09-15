'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { UserIcon, MailIcon, CalendarIcon, ChevronsRightIcon } from 'lucide-react';
import { fetchUserDetails } from '@/app/actions';
import QueryDrawer from './QueryDrawer';

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
    if (x.get() >= maxSwipe - 10) {
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
    if (!containerRef.current) return;
    const updateSwipe = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        if (width > 0) {
          setMaxSwipe(width - 44);
        }
      }
    };
    updateSwipe();
    const ro = new ResizeObserver(updateSwipe);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [open, data]);

  return (
    <QueryDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Account"
      description="Manage your connected profile"
      footerAction={
        <div className="w-full select-none">
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
              className="absolute h-10 left-0 top-0 rounded-full bg-linear-to-b from-blue-600 via-blue-700 to-blue-800 border shadow-[inset_0_-2px_4px_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.1)] pointer-events-none flex items-center justify-center overflow-hidden"
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
              className="relative z-10 w-10 h-10 rounded-full bg-white flex items-center justify-center cursor-grab active:cursor-grabbing select-none shrink-0"
            >
              <ChevronsRightIcon size={24} strokeWidth={3} className="text-blue-600" />
            </motion.div>
          </div>
        </div>
      }
    >
      <div className="space-y-2">
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
    </QueryDrawer>
  );
}