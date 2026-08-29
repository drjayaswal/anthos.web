'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
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
  const [maxSwipe, setMaxSwipe] = useState(220);
  const x = useMotionValue(0);

  const bg = useTransform(x, [0, maxSwipe || 220], ['#DC2626', '#F87171']);
  const iconColor = useTransform(x, [0, maxSwipe || 220], ['#ffffff', '#ffffff']);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > maxSwipe * 0.75) {
      onSignOut();
    }
    x.set(0);
  };

  useEffect(() => {
    async function loadData() {
      if (open) {
        const result = await fetchUserDetails();
        if (result.ok && result.data) {
          setData(result.data as UserAccountDetails);
        }
      }
    }
    loadData();
  }, [open]);

  useEffect(() => {
    if (containerRef.current) {
      setMaxSwipe(containerRef.current.offsetWidth - 42);
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
              <div className="rounded-lg p-2.5 border flex items-center gap-3">
                <UserIcon size={15} className="text-black/50 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-medium text-black/50 uppercase tracking-wide">Email</p>
                  <p className="text-xs font-medium text-black truncate">{data.email}</p>
                </div>
              </div>

              <div className="rounded-lg p-2.5 border flex items-center gap-3">
                <MailIcon size={15} className="text-black/50 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-medium text-black/50 uppercase tracking-wide">Encrypted Mails</p>
                  <p className="text-xs font-medium text-black">{data.totalEncryptedMails} Stored</p>
                </div>
              </div>

              <div className="rounded-lg p-2.5 border flex items-center gap-3">
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
            className="relative w-full h-11 rounded-full overflow-hidden border shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] bg-black/5 flex items-center p-1"
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-black/60 text-[11px] font-medium">
                Slide to Disconnect
              </span>
            </div>
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: maxSwipe }}
              dragElastic={0.1}
              onDragEnd={handleDragEnd}
              style={{ x, backgroundColor: bg }}
              className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing"
            >
              <motion.div style={{ color: iconColor }}>
                <ChevronsRightIcon size={16} strokeWidth={2.5} />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}