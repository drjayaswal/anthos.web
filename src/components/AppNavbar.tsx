'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Inbox,
  User,
  ShieldCheck,
  HelpCircle,
  FileText,
  ChevronRight,
  SettingsIcon,
  LockIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  description: string;
  show: boolean;
  icon: React.ElementType;
};

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  return isDesktop;
}

export default function AppNavbar({
  authenticated,
  isAdmin,
}: {
  authenticated: boolean;
  isAdmin: boolean;
}) {
  const pathname = usePathname();

  if (!authenticated) {
    return null;
  }

  if (pathname === '/thank-you' || pathname?.startsWith('/thank-you')) {
    return null;
  }

  const [menuOpen, setMenuOpen] = useState(false);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    if (menuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen && !isDesktop) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, isDesktop]);

  const items = useMemo<NavItem[]>(
    () => [
      {
        href: '/',
        label: 'Firebox',
        description: 'Your intelligent AI email hub',
        show: authenticated,
        icon: Inbox,
      },
      {
        href: '/profile',
        label: 'Profile',
        description: 'Account settings & preferences',
        show: authenticated,
        icon: User,
      },
      {
        href: '/admin',
        label: 'Admin',
        description: 'System administration & controls',
        show: authenticated && isAdmin,
        icon: ShieldCheck,
      },
      {
        href: '/settings',
        label: 'Settings',
        description: 'System & AI Settings',
        show: authenticated,
        icon: SettingsIcon,
      },
      {
        href: '/help',
        label: 'Help',
        description: 'Guides, FAQs & assistance',
        show: true,
        icon: HelpCircle,
      },
      {
        href: '/privacy-policy',
        label: 'Privacy Policy',
        description: 'Our data protection practices',
        show: true,
        icon: LockIcon,
      },
      {
        href: '/terms-condition',
        label: 'Terms & Conditions',
        description: 'Terms and conditions of use',
        show: true,
        icon: FileText,
      },
    ],
    [authenticated, isAdmin],
  );

  const visibleItems = items.filter((item) => item.show);

  const closeMenu = () => setMenuOpen(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: isDesktop ? 20 : 0, y: isDesktop ? 0 : -10 },
    show: { opacity: 1, x: 0, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  } as const;

  return (
    <>
      <header className="fixed top-2 left-12 -translate-x-1/2 z-40">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className={cn(
            'group relative flex items-center justify-center gap-2 px-3 py-2 rounded-full transition-all duration-300 outline-none cursor-pointer',
            'backdrop-blur-md'
          )}
          >
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold tracking-tight text-white/75 group-hover:text-white transition-colors">
              Menu
            </span>
            <ChevronRight
              className={cn(
                'w-4 h-4 transition-transform duration-300',
                menuOpen ? 'rotate-90' : 'text-white/75 group-hover:text-white -translate-x-0.5 group-hover:translate-x-0.5'
              )}
            />
          </div>
        </button>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm"
              onClick={closeMenu}
            />

            <motion.div
              key="menu-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed top-0 left-0 bottom-0 z-70 w-80 sm:w-70 bg-[#2c0237] border-r border-white/10 shadow-2xl flex flex-col overflow-hidden"
            >
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex-1 overflow-y-auto p-3 space-y-1"
              >
                {visibleItems.map((item) => {
                  const active =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <motion.div key={item.href} variants={itemVariants}>
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className={cn(
                          'group flex items-center justify-between p-2 rounded-3xl transition-all duration-200',
                          active ? "bg-white/10" : ""
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'p-2.5 rounded-2xl transition-colors',
                              active
                                ? 'text-white bg-white/10'
                                : 'text-white/40 group-hover:text-white transition-colors'
                            )}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className={cn(
                              "font-medium text-sm text-white/50 group-hover:text-white transition-colors",
                              active
                                ? 'text-white'
                                : 'text-white/40 group-hover:text-white transition-colors'
                            )}
                            >
                              {item.label}
                            </div>
                            <div className={cn(
                              "font-medium text-[9px] text-white/50 group-hover:text-white transition-colors",
                              active
                                ? 'text-white'
                                : 'text-white/40 group-hover:text-white transition-colors'
                            )}
                            >
                              {item.description}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/30 group-hover:translate-x-1 -translate-x-1 group-hover:text-white transition-all" />
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

