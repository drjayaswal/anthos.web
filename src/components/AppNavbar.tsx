'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MailIcon,
  User,
  UserCogIcon,
  HelpCircle,
  FileText,
  SettingsIcon,
  LockIcon,
  ChevronRight,
  CheckIcon,
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTooltipHref, setActiveTooltipHref] = useState<string | null>(null);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeTooltipHref) {
          setActiveTooltipHref(null);
        } else {
          setMenuOpen(false);
        }
      }
    };
    if (menuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen, activeTooltipHref]);

  useEffect(() => {
    if (!activeTooltipHref) return;
    const handleDocClick = () => setActiveTooltipHref(null);
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, [activeTooltipHref]);

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
        label: 'Inbox',
        description: 'Your intelligent AI email inbox',
        show: authenticated,
        icon: MailIcon,
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
        icon: UserCogIcon,
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

  const closeMenu = () => {
    setActiveTooltipHref(null);
    setMenuOpen(false);
  };

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
            'relative px-3 py-2 cursor-pointer flex items-center gap-1.5 group select-none',
          )}
        >
          <div className="text-xs font-semibold tracking-tight text-black transition-colors">
            Menu
          </div>
          <ChevronRight
            className={cn(
              'w-3.5 h-3.5 text-black/60 group-hover:text-black transition-transform duration-200 ease-in-out',
              menuOpen ? 'rotate-90 text-black' : 'rotate-0'
            )}
            strokeWidth={2.5}
          />
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
              className="fixed top-0 left-0 bottom-0 z-70 w-21 bg-white shadow-2xl flex flex-col overflow-visible"
            >
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex-1 p-2 space-y-1.5 overflow-visible"
              >
                {visibleItems.map((item) => {
                  const active =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  const isTooltipOpen = activeTooltipHref === item.href;

                  return (
                    <motion.div
                      key={item.href}
                      variants={itemVariants}
                      className={cn('relative', isTooltipOpen ? 'z-30' : 'z-10 hover:z-20')}
                    >
                      <div
                        className={cn(
                          'relative z-10 flex items-center justify-center transition-all duration-200 border border-transparent p-1 bg-white',
                          active ? 'bg-black/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.18)] rounded-xl' : "rounded-4xl"
                        )}
                      >
                        <Link
                          href={item.href}
                          onClick={closeMenu}
                          className="flex items-center justify-center p-1.5 rounded-xl transition-colors cursor-pointer flex-1"
                          title={item.label}
                        >
                          <Icon
                            className={cn(
                              'w-5 h-5 transition-colors',
                              active
                                ? 'text-black'
                                : 'text-black/60 hover:text-black'
                            )}
                          />
                        </Link>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveTooltipHref((prev) => (prev === item.href ? null : item.href));
                          }}
                          disabled={active}
                          className={cn(
                            'p-1 ml-1.5 cursor-pointer flex items-center justify-center transition-colors outline-none shrink-0',
                            isTooltipOpen
                              ? 'text-black'
                              : 'text-black/40 hover:text-black'
                          )}
                          title={isTooltipOpen ? 'Hide info' : `Show info about ${item.label}`}
                          aria-label={`Info about ${item.label}`}
                          aria-expanded={isTooltipOpen}
                        >{
                          active ? 
                          <CheckIcon
                            className="h-3.5 w-3.5 transition-transform text-black bg-transparent duration-200 ease-in-out"
                            strokeWidth={2.5}
                          />
                          :
                          <ChevronRight
                          className={cn(
                            'h-3.5 w-3.5 transition-transform bg-transparent duration-200 ease-in-out',
                            isTooltipOpen ? 'rotate-180 text-blue-600' : 'rotate-0'
                          )}
                          strokeWidth={2.5}
                          />
                        }
                        </button>
                      </div>

                      <AnimatePresence>
                        {isTooltipOpen && (
                          <motion.div
                            initial={{ x: -24, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -24, opacity: 0 }}
                            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                            onClick={(e) => {
                              e.stopPropagation();
                              closeMenu();
                            }}
                            className={cn(
                              'absolute left-[calc(100%-15px)] top-[0.25px] z-0 h-10.25 bg-linear-to-b from-blue-600 to-blue-800 text-white border border-blue-600 rounded-l-none rounded-r-2xl pl-5.5 pr-4 py-1.5 flex flex-col justify-center cursor-pointer select-none',
                              'w-50 sm:max-w-xs'
                            )}
                          >
                            <Link
                              href={item.href}
                              onClick={closeMenu}
                              className="flex flex-col text-left"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-white tracking-tight">
                                  {item.label}
                                </span>
                                {active && (
                                  <span className="text-[8px] font-semibold uppercase px-1.5 py-0.2 bg-white/20 text-white rounded-full">
                                    Active
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-white/70 font-normal leading-tight mt-0.5 line-clamp-2 truncate">
                                {item.description}
                              </p>
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
