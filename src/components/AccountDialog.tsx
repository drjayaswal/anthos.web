'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { UserIcon, MailIcon, CalendarIcon, ChevronsRightIcon, X } from 'lucide-react';
import { fetchUserDetails } from '@/app/actions';

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignOut: () => void;
}

export default function AccountDialog({ open, onOpenChange, onSignOut }: AccountDialogProps) {
  const [data, setData] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxSwipe, setMaxSwipe] = useState(220);
  const x = useMotionValue(0);

  const bg = useTransform(x, [0, maxSwipe || 220], ['#ffffff', '#2c0237']);
  const iconColor = useTransform(x, [0, maxSwipe || 220], ['#2c0237', '#ffffff']);

  const handleDragEnd = (_: any, info: any) => {
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
          setData(result.data);
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
        className="w-full sm:w-80 rounded-t-4xl sm:rounded-2xl bg-[#2c0237] border border-white/10 [html.light_&]:bg-white [html.light_&]:border-black/10 text-white shadow-2xl p-0 gap-0 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/10 [html.light_&]:border-black/10">
          <div>
            <DialogTitle className="text-xs font-semibold text-white">Account</DialogTitle>
            <DialogDescription className="text-[10px] text-white/50">Manage your connected profile</DialogDescription>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            title="Close dialog"
            className="rounded cursor-pointer p-1 text-white/50 hover:text-white transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="px-4 py-3 space-y-2">
          {data ? (
            <div className="space-y-2">
              <div className="rounded-lg bg-white/5 [html.light_&]:bg-black/5 p-2.5 border border-white/5 [html.light_&]:border-black/5 flex items-center gap-3">
                <UserIcon size={15} className="text-white/50 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-medium text-white/50 uppercase tracking-wide">Email</p>
                  <p className="text-xs font-medium text-white truncate">{data.email}</p>
                </div>
              </div>

              <div className="rounded-lg bg-white/5 [html.light_&]:bg-black/5 p-2.5 border border-white/5 [html.light_&]:border-black/5 flex items-center gap-3">
                <MailIcon size={15} className="text-white/50 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-medium text-white/50 uppercase tracking-wide">Encrypted Mails</p>
                  <p className="text-xs font-medium text-white">{data.totalEncryptedMails} Stored</p>
                </div>
              </div>

              <div className="rounded-lg bg-white/5 [html.light_&]:bg-black/5 p-2.5 border border-white/5 [html.light_&]:border-black/5 flex items-center gap-3">
                <CalendarIcon size={15} className="text-white/50 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-medium text-white/50 uppercase tracking-wide">Joined</p>
                  <p className="text-xs font-medium text-white">{new Date(data.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="h-12 animate-pulse bg-white/10 rounded-lg" />
              <div className="h-12 animate-pulse bg-white/10 rounded-lg" />
              <div className="h-12 animate-pulse bg-white/10 rounded-lg" />
            </div>
          )}
        </div>

        <div className="p-3 border-t border-white/10 [html.light_&]:border-black/10">
          <div
            ref={containerRef}
            className="relative w-full h-11 rounded-full overflow-hidden border border-white/10 [html.light_&]:border-black/10 bg-white/5 [html.light_&]:bg-black/5 flex items-center p-1"
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-white/60 [html.light_&]:text-black/60 text-[11px] font-medium">
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