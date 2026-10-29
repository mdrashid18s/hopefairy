'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { mainNav, mainHeaderNav, services, site, counsellingLink } from '../../data/site.js';
import Icon from '../ui/Icon.jsx';
import Logo from './Logo.jsx';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import { SHOW_THEME_TOGGLE } from '../../config/launch.js';
import SmartLink from '../ui/SmartLink.jsx';

// `trailingSlash: true` in next.config.mjs means usePathname() returns
// paths like "/services/" while nav `to` values are "/services" — strip
// the trailing slash before comparing so the active state actually matches.
const normalize = (path) => (path.length > 1 ? path.replace(/\/$/, '') : path);

const NAV_TITLES = {
  '/': 'HopeFairy — Best Abroad Admission Advisor & Best Career Counselling in India',
  '/about-us': 'About HopeFairy — Best Overseas Admission Mentors & Transparent Career Counselling',
  '/services': 'Study Abroad Services — Best Abroad Admission Advisor for Admissions, SOP & Visas',
  '/destinations': 'Top Study Abroad Destinations — UK, USA, Canada, Germany, Australia & Ireland',
  '/india-admissions': 'Admissions in India — Best College Admission Consultant for Engineering, Medical & MBA',
  '/gulf-desk': 'Gulf Desk — Best Abroad Admission Advisor for NRI Students in GCC',
  '/test-prep': 'Test Prep Coaching — Best IMAT Coaching, Digital SAT, IELTS & CELPIP Classes',
  '/contact-us': 'Contact HopeFairy — Book Free Session with Best Abroad Admission Advisor',
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = normalize(usePathname());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [open]);

  // Home hero is always black — use light nav chrome over it.
  const overHero = pathname === '/' && !scrolled;

  return (
    <header
      id="main-navbar"
      className={`fixed inset-x-0 top-0 z-50 flex justify-center transition-all duration-300 ${
        scrolled ? 'py-1.5 sm:py-2' : 'py-2.5 sm:py-3.5'
      }`}
    >
      <div className="w-[96%] max-w-[1260px] xl:w-auto xl:max-w-none flex justify-center px-2 sm:px-3">
        <div
          className={`relative z-50 flex items-center justify-between xl:justify-center w-full xl:w-auto gap-3 sm:gap-4 xl:gap-5 2xl:gap-6 rounded-2xl border px-3.5 sm:px-4.5 xl:px-6 py-2 backdrop-blur-xl transition-all duration-300 ${
            scrolled
              ? 'border-brand-400/30 bg-white/95 dark:bg-[#0e0e10]/95 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_48px_-6px_rgba(0,0,0,0.7)]'
              : overHero
                ? 'border-white/15 bg-black/45 shadow-[0_12px_36px_rgba(0,0,0,0.4)]'
                : 'border-hair/15 bg-white/90 dark:bg-[#0e0e10]/90 shadow-sm'
          }`}
        >
          {/* Left Anchor: Logo */}
          <div className="flex items-center shrink-0">
            <Link
              prefetch={false}
              href="/"
              title="HopeFairy — Premier Study Abroad Consultants & Career Guidance"
              aria-label={`${site.name} — Home`}
              className="shrink-0 flex items-center"
            >
              <Logo className="h-8 w-8 sm:h-9 sm:w-9 xl:h-9 xl:w-9" wordmark light={overHero} />
            </Link>
          </div>

          {/* Center: Main Navigation Menu */}
          <nav className="hidden items-center justify-center flex-nowrap gap-0.5 xl:gap-1.5 xl:flex shrink-0">
            {mainHeaderNav.map((item) => {
              const isActive =
                pathname === item.to || item.children?.some((c) => pathname === c.to);
              const linkTitle = NAV_TITLES[item.to] || `${item.label} — HopeFairy`;
              return (
                <div key={item.to} className={item.children ? 'group relative shrink-0' : 'relative shrink-0'}>
                  <Link
                    prefetch={false}
                    href={item.to}
                    title={linkTitle}
                    aria-label={item.label}
                    className={`relative inline-flex items-center gap-1 xl:gap-1.5 rounded-xl border border-transparent px-2.5 py-1.5 text-[12px] font-semibold tracking-tight whitespace-nowrap shrink-0 transition-all duration-200 xl:px-3 xl:py-2 xl:text-[13px] 2xl:text-[13.5px] outline-none select-none ${
                      isActive
                        ? 'text-[#060606] dark:text-[#060606] font-bold border-transparent'
                        : item.isGold
                          ? 'text-[#d8b056] font-bold hover:text-[#c89b3c] hover:border-[#d8b056]/50 hover:bg-[#d8b056]/[0.06] dark:text-[#eedb9f] dark:hover:border-[#d8b056]/60'
                          : overHero
                            ? 'text-white/85 hover:text-white hover:border-[#d8b056]/55 hover:bg-[#d8b056]/[0.08] active:border-[#d8b056]/75'
                            : 'text-slate-700 hover:text-slate-950 hover:border-[#d8b056]/50 hover:bg-[#d8b056]/[0.05] dark:text-slate-300 dark:hover:text-white dark:hover:border-[#d8b056]/60 dark:hover:bg-[#d8b056]/[0.08] active:border-[#d8b056]/75'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] shadow-sm"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className="relative inline-flex items-center gap-1 xl:gap-1.5 whitespace-nowrap">
                      {item.label}
                      {item.badge && (
                        <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] px-1.5 py-0.5 text-[8.5px] font-black uppercase leading-none tracking-wider text-[#0b0b0c] shadow-xs shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </span>
                    {item.children && (
                      <Icon
                        name="chevron-down"
                        className="relative h-3 w-3 xl:h-3.5 xl:w-3.5 shrink-0 opacity-70 transition-transform group-hover:rotate-180"
                      />
                    )}
                  </Link>

                  {item.children && (
                    <div className="invisible absolute left-1/2 top-full z-50 w-[34rem] -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                      <div className="overflow-hidden rounded-2xl border border-brand-400/25 bg-surface p-2 shadow-card backdrop-blur-xl">
                        <div className="grid grid-cols-2 gap-1">
                          {services.map((s) => {
                            const to = `/service/${s.slug}`;
                            return (
                              <Link
                                prefetch={false}
                                key={s.slug}
                                href={to}
                                title={`Explore ${s.title} — ${s.short}`}
                                aria-label={`${s.title} advisory and guidance`}
                                className={`group/item flex items-start gap-3 rounded-xl border border-transparent p-3 transition-all hover:border-[#d8b056]/40 hover:bg-brand-400/10 ${
                                  pathname === to ? 'border-[#d8b056]/50 bg-brand-400/10' : ''
                                }`}
                              >
                                <span className="mt-0.5 icon-3d h-9 w-9 shrink-0 rounded-lg">
                                  <Icon name={s.icon} className="h-4 w-4" />
                                </span>
                                <span>
                                  <span className="block text-sm font-semibold text-fg">{s.title}</span>
                                  <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-fg-faint">
                                    {s.short}
                                  </span>
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-4 border-t border-hair/10 px-3 pb-1.5 pt-3 text-sm font-semibold text-brand-700 dark:text-brand-300">
                          <Link
                            prefetch={false}
                            href="/services"
                            title="View all study abroad advisory services"
                            aria-label="View all study abroad services"
                            className="inline-flex items-center gap-2 hover:underline"
                          >
                            View all services
                            <Icon name="arrow-right" className="h-4 w-4" />
                          </Link>
                          <Link
                            prefetch={false}
                            href="/destinations"
                            title="Explore top higher education destinations worldwide"
                            aria-label="Explore study destinations"
                            className="inline-flex items-center gap-2 hover:underline"
                          >
                            <Icon name="globe" className="h-4 w-4" />
                            Study destinations
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Anchor on Desktop: ThemeToggle (symmetrically balanced with Left Logo) */}
          <div className="hidden xl:flex items-center justify-center shrink-0">
            {SHOW_THEME_TOGGLE && <ThemeToggle onDark={overHero} />}
          </div>

          {/* Mobile Right Controls: ThemeToggle + Hamburger */}
          <div className="flex items-center gap-2 xl:hidden">
            {SHOW_THEME_TOGGLE && <ThemeToggle onDark={overHero} />}
            <button
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                open
                  ? 'border-transparent bg-brand-400 text-ink-950 shadow-md'
                  : overHero
                    ? 'border-white/20 bg-white/10 text-white'
                    : 'border-hair/10 bg-tint/5 text-fg'
              }`}
              onClick={() => setOpen((v) => !v)}
              title={open ? 'Close navigation menu' : 'Open navigation menu'}
              aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={open}
            >
              <Icon name={open ? 'x' : 'menu'} className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-0 z-40 xl:hidden"
          >
            <div
              className="absolute inset-0 bg-page/80 backdrop-blur-md"
              onClick={() => setOpen(false)}
            />
            <motion.nav
              initial={{ y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -24, opacity: 0 }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
              className="relative mx-5 mt-24 max-h-[calc(100vh-7.5rem)] overflow-y-auto rounded-3xl border border-brand-400/20 bg-surface p-4 shadow-card"
            >
              {mainNav.map((item, i) => {
                const isActive = pathname === item.to;
                const linkTitle = NAV_TITLES[item.to] || `${item.label} — HopeFairy`;
                return (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * i + 0.1 }}
                  >
                    <Link
                      prefetch={false}
                      href={item.to}
                      title={linkTitle}
                      aria-label={item.label}
                      // In-page (#section) links don't change the pathname,
                      // so close the menu explicitly.
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between rounded-2xl border border-transparent px-4 py-3.5 text-base font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-brand-300 to-brand-500 font-semibold text-ink-950 border-transparent'
                          : item.isGold
                            ? 'border-brand-400/30 bg-brand-400/[0.08] font-semibold text-[#d8b056] dark:text-[#eedb9f]'
                            : 'text-fg-muted hover:border-[#d8b056]/40 hover:bg-[#d8b056]/[0.06] hover:text-fg'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {item.label}
                        {item.badge && (
                          <span className="rounded-full bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] px-2 py-0.5 text-[10px] font-extrabold uppercase leading-none tracking-wider text-[#0b0b0c]">
                            {item.badge}
                          </span>
                        )}
                      </span>
                      <Icon name="arrow-right" className="h-4 w-4 opacity-50" />
                    </Link>
                  </motion.div>
                );
              })}
              <SmartLink
                {...counsellingLink}
                title="Book a Free 1-on-1 Study Abroad & Career Counselling Session"
                aria-label="Book free personal counselling session with HopeFairy"
                className="btn-primary mt-3 w-full"
              >
                Book Free Counselling
                <Icon name="arrow-right" className="h-4 w-4" />
              </SmartLink>
              <a
                href={site.phoneHref}
                title={`Call HopeFairy Admission Helpdesk: ${site.phone}`}
                aria-label="Call HopeFairy admission desk on phone"
                className="mt-3 flex items-center justify-center gap-2 py-2 text-sm text-fg-muted"
              >
                <Icon name="phone" className="h-4 w-4 text-brand-500" />
                {site.phone}
              </a>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
