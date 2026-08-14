'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Link from 'next/link';
import { UserIcon, MailIcon, CalendarIcon, ChevronsRightIcon, CircleUserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchUserDetails } from '@/app/actions';

interface AccountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSignOut: () => void;
}

export default function AccountDialog({ open, onOpenChange, onSignOut }: AccountDialogProps) {
    const [data, setData] = useState<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [maxSwipe, setMaxSwipe] = useState(250);
    const x = useMotionValue(0);

    const bg = useTransform(x, [0, maxSwipe], ["#ffffff", "#2c0237"]);
    const iconColor = useTransform(x, [0, maxSwipe], ["#2c0237", "#ffffff"]);

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.x > maxSwipe * 0.8) {
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby={undefined} className="w-full sm:w-80 rounded-t-4xl sm:rounded-2xl bg-[#2c0237] border border-white/10 [html.light_&]:bg-white [html.light_&]:border-black/10 text-white p-5 shadow-2xl">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-base sm:text-lg font-semibold tracking-tight text-white">Account</DialogTitle>
                    {data ? (
                        <div className="space-y-2.5 pt-2">
                            <div className="flex items-center gap-3 text-xs sm:text-sm text-white">
                                <UserIcon size={16} className="text-white/50 shrink-0" />
                                <span className="truncate">{data.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs sm:text-sm text-white">
                                <MailIcon size={16} className="text-white/50 shrink-0" />
                                <span>{data.totalEncryptedMails} Encrypted Mails</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs sm:text-sm text-white">
                                <CalendarIcon size={16} className="text-white/50 shrink-0" />
                                <span>Joined {new Date(data.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-20 animate-pulse bg-white/10 rounded-xl" />
                    )}
                </DialogHeader>
                <DialogFooter className="dark:bg-transparent bf border-t border-white/10 [html.light_&]:border-black/10 pt-3">
                    <div
                        ref={containerRef}
                        className="relative w-full h-12 rounded-full overflow-hidden border border-white/10 [html.light_&]:border-black/10 bg-white/5 [html.light_&]:bg-black/5 flex items-center p-1">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-white/70 [html.light_&]:text-black/70 text-xs font-medium">
                                Slide to Disconnect
                            </span>
                        </div>
                        <motion.div
                            drag="x"
                            dragConstraints={{ left: 0, right: 220 }}
                            dragElastic={0.1}
                            onDragEnd={handleDragEnd}
                            style={{ x, backgroundColor: bg }}
                            className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing"
                        >
                            <motion.div style={{ color: iconColor }}>
                                <ChevronsRightIcon size={18} strokeWidth={2.5} />
                            </motion.div>
                        </motion.div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}