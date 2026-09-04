'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Inbox,
  User,
  UserCog2Icon,
  HelpCircle,
  FileText,
  SettingsIcon,
  LockIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 640);
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
        href: '/analyze',
        label: 'Analyze',
        description: 'Intelligent email analysis and inbox',
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
        icon: UserCog2Icon,
      },
      {
        href: '/settings',
        label: 'Settings',
        description: 'System & AI settings',
        show: authenticated,
        icon: SettingsIcon,
      },
      {
        href: '/help',
        label: 'Help',
        description: 'Guides, FAQs & documentation',
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
        description: 'Rules & terms for using Anthos',
        show: true,
        icon: FileText,
      },
    ],
    [authenticated, isAdmin]
  );

  const isHiddenRoute =
    !authenticated ||
    pathname === '/' ||
    pathname === '/thank-you' ||
    pathname?.startsWith('/thank-you');

  if (isHiddenRoute) {
    return null;
  }

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
      <header data-tour="navbar-menu" className="fixed top-2 left-10 -translate-x-1/2 z-40">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className={cn(
            'relative px-3 py-2 cursor-pointer',
          )}
        >
          <div className="text-xs font-semibold tracking-tight text-black transition-colors">
            Menu
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
              className="fixed top-0 left-0 bottom-0 z-70 w-60 sm:w-20 bg-white shadow-2xl rounded-r-[35px] my-2 flex flex-col overflow-hidden"
            >
              <TooltipProvider delayDuration={150}>
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={item.href}
                              onClick={closeMenu}
                              aria-label={`${item.label}: ${item.description}`}
                              className={cn(
                                'group flex items-center gap-3 sm:justify-center p-2 rounded-full transition-all duration-200',
                                active
                                  ? 'bg-black/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]'
                                  : 'hover:bg-black/5'
                              )}
                            >
                              <div
                                className={cn(
                                  'p-2.5 rounded-full transition-colors shrink-0',
                                  active
                                    ? 'text-white bg-red-600'
                                    : 'text-black/50 group-hover:text-black transition-colors'
                                )}
                              >
                                <Icon className="w-6 h-6" />
                              </div>
                              <div className="flex flex-col min-w-0 sm:hidden">
                                <span
                                  className={cn(
                                    'text-xs font-semibold tracking-tight transition-colors truncate',
                                    active
                                      ? 'text-black'
                                      : 'text-black/80 group-hover:text-black'
                                  )}
                                >
                                  {item.label}
                                </span>
                                <span
                                  className={cn(
                                    'text-[10px] font-medium transition-colors truncate',
                                    active
                                      ? 'text-black/70'
                                      : 'text-black/50 group-hover:text-black/70'
                                  )}
                                >
                                  {item.description}
                                </span>
                              </div>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            showArrow
                            className="hidden sm:inline-flex z-80 flex-col items-start gap-0.5 max-w-55 bg-blue-600"
                          >
                            <span className="font-semibold text-xs leading-none">{item.label}</span>
                            <span className="text-[10px] text-background/70 font-normal leading-snug">
                              {item.description}
                            </span>
                          </TooltipContent>
                        </Tooltip>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </TooltipProvider>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

