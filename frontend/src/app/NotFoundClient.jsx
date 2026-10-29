'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from '../components/layout/Logo.jsx';
import Flag from '../components/ui/Flag.jsx';
import Icon from '../components/ui/Icon.jsx';
import { useShell } from '../components/layout/AppShell.jsx';

// 8 target destinations matching the HopeFairy global orbit
const ORBIT_DESTINATIONS = [
  { name: 'France', code: 'FR', flag: 'FR' },
  { name: 'United Kingdom', code: 'UK', flag: 'GB' },
  { name: 'United States', code: 'US', flag: 'US' },
  { name: 'Canada', code: 'CA', flag: 'CA' },
  { name: 'Australia', code: 'AU', flag: 'AU' },
  { name: 'Ireland', code: 'IE', flag: 'IE' },
  { name: 'Germany', code: 'DE', flag: 'DE' },
  { name: 'New Zealand', code: 'NZ', flag: 'NZ' },
];

// Spaced symmetrically around the circular orbit ring (tuned radius at 45% for perfect containment)
const CHIP_POS = Array.from({ length: 8 }, (_, i) => {
  const a = ((-112.5 + i * 45) * Math.PI) / 180;
  return { left: `${50 + 45 * Math.cos(a)}%`, top: `${50 + 45 * Math.sin(a)}%` };
});

// Magnetic Button with interactive cursor attraction
function MagneticButtonLink({ href, className, children }) {
  const buttonRef = useRef(null);

  const handleMouseMove = (e) => {
    const el = buttonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    // Smooth magnetic pull towards cursor
    el.style.transform = `translate(${x * 0.32}px, ${y * 0.38}px)`;
  };

  const handleMouseLeave = () => {
    const el = buttonRef.current;
    if (!el) return;
    el.style.transform = 'translate(0px, 0px)';
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-flex w-full sm:w-auto items-center justify-center p-1.5"
    >
      <Link
        ref={buttonRef}
        href={href}
        className={className}
        style={{
          transition: 'transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
          willChange: 'transform',
        }}
      >
        {children}
      </Link>
    </div>
  );
}

// Orbiting plane with golden glowing trail
function OrbitRing({ className, duration, reverse = false }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{
        animation: `spin ${duration} linear infinite`,
        animationDirection: reverse ? 'reverse' : 'normal',
      }}
    >
      <div
        className="absolute inset-0 rounded-full border-2 border-[#d8b056]/80"
        style={{
          maskImage: reverse
            ? 'conic-gradient(from 0deg, black 0deg, transparent 55deg)'
            : 'conic-gradient(from 305deg, transparent 0deg, black 55deg, transparent 55deg)',
        }}
      />
      <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
        <Icon
          name="plane"
          strokeWidth={2.2}
          className={`h-4 sm:h-5 w-4 sm:w-5 text-[#eedb9f] drop-shadow-[0_0_8px_rgba(228,199,117,0.9)] ${
            reverse ? '-rotate-[135deg]' : 'rotate-45'
          }`}
        />
      </span>
    </div>
  );
}

export default function NotFoundClient({ isServerError = false, onReset }) {
  const { setHideChrome } = useShell();

  // Strip Navbar, Footer, and all public chrome while on the 404 page
  useEffect(() => {
    setHideChrome(true);
    document.body.classList.add('hide-shell-chrome');
    return () => {
      setHideChrome(false);
      document.body.classList.remove('hide-shell-chrome');
    };
  }, [setHideChrome]);

  return (
    <div
      className="relative isolate min-h-screen w-full max-w-full flex flex-col justify-between items-center overflow-x-hidden bg-[#070708] text-white py-5 sm:py-8 px-3 sm:px-6 select-none"
      style={{ maxWidth: '100vw', overflowX: 'hidden' }}
    >
      {/* Ambient luxury space lighting & radial grid */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_42%,rgba(216,176,86,0.18),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_90%,rgba(200,155,60,0.08),transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-40 [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_50%_45%,black,transparent_75%)]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(216,176,86,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(216,176,86,0.06) 1px, transparent 1px)',
          }}
        />
      </div>

      {/* Top Header Branding */}
      <div className="relative z-20 w-full max-w-5xl mx-auto flex items-center justify-between gap-3 px-1 sm:px-4 shrink-0">
        <Link
          prefetch={false}
          href="/"
          aria-label="HopeFairy — Home"
          className="transition-transform hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <Logo className="h-8 w-8 sm:h-10 sm:w-10" wordmark light />
        </Link>
      </div>

      {/* Center Stage: Giant 404 + Scaled Orbit + Text + Buttons */}
      <main className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center justify-center my-auto py-3 sm:py-6 px-2 sm:px-4 text-center overflow-x-hidden">
        {/* 1. Giant "404" Watermark in Background (strictly contained) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[26%] sm:top-[28%] -translate-y-1/2 flex items-center justify-center overflow-hidden select-none -z-10 max-w-full"
        >
          <span
            className="font-black bg-gradient-to-b from-[#d8b056]/28 via-[#d8b056]/10 to-transparent bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(216,176,86,0.18)] select-none block leading-none"
            style={{
              fontSize: 'clamp(5.5rem, 20vw, 14rem)',
              letterSpacing: '-0.06em',
            }}
          >
            404
          </span>
        </div>

        {/* 2. Scaled Orbit Animation with Rotating Rings, Planes & Destination Chips */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto aspect-square w-[min(62vw,220px)] sm:w-[270px] md:w-[310px] mb-4 sm:mb-5 shrink-0"
        >
          {/* Rotating Gold Rings */}
          <div className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-[#d8b056]/35" />
          <div className="absolute inset-[13%] animate-spin-slower rounded-full border border-[#d8b056]/20" />
          <div className="absolute inset-[24%] rounded-full bg-[#d8b056]/12 blur-2xl" />

          {/* Orbiting Planes */}
          <OrbitRing className="inset-0" duration="22s" />
          <OrbitRing className="inset-[13%]" duration="15s" reverse />

          {/* Central Emblem Coin */}
          <div className="absolute inset-[23%] animate-float" style={{ animationDuration: '6s' }}>
            <div className="relative h-full w-full">
              <div className="absolute -inset-2 rounded-full bg-[conic-gradient(from_0deg,rgba(243,220,151,0.55),rgba(200,155,60,0.05),rgba(243,220,151,0.55))] opacity-80 blur-md" />
              <Logo size="lg" className="relative h-full w-full" />
            </div>
          </div>

          {/* 8 Destination Country Chips around the Orbit */}
          {ORBIT_DESTINATIONS.map((d, i) => {
            const pos = CHIP_POS[i];
            return (
              <div
                key={d.code}
                className="absolute flex h-0 w-0 items-center justify-center pointer-events-none"
                style={pos}
              >
                <span className="inline-flex items-center gap-1 sm:gap-1.5 whitespace-nowrap rounded-full border border-[#d8b056]/40 bg-[#0d0c0b]/92 px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-bold text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.85)] ring-1 ring-black/40">
                  <Flag
                    code={d.flag}
                    className="h-2.5 w-[15px] sm:h-3.5 sm:w-[21px] rounded-[2px] ring-1 ring-white/20 shrink-0"
                  />
                  <span className="text-[#eedb9f] sm:hidden">{d.code}</span>
                  <span className="hidden sm:inline">{d.name}</span>
                </span>
              </div>
            );
          })}
        </motion.div>

        {/* 3. Text Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-xl mx-auto px-2 sm:px-4"
        >
          {/* Badges: 404 Flight Diverted right above Destination Not Found */}
          <div className="flex flex-col items-center justify-center gap-1.5 mb-2.5 sm:mb-3">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wider uppercase border border-[#d8b056]/35 bg-[#d8b056]/12 text-[#eedb9f] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d8b056] animate-pulse shrink-0" />
              <span>404 • Flight Diverted</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider border border-[#d8b056]/20 bg-black/40 text-[#d8b056]">
              <span className="w-1 h-1 rounded-full bg-[#d8b056] animate-ping shrink-0" />
              <span>Destination Not Found</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Lost in <span className="text-gradient-brand">Orbit?</span>
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-300 dark:text-slate-400 max-w-sm sm:max-w-md mx-auto leading-relaxed">
            This destination has taken a detour or does not exist. Let&apos;s get your journey back on course.
          </p>

          {/* 4. Action Buttons (Return to Home & Contact Us with Magnetic Pull) */}
          <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 w-full max-w-xs sm:max-w-md mx-auto">
            {/* Return to Home */}
            <MagneticButtonLink
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] border border-[#eedb9f]/60 shadow-lg shadow-black/40 hover:brightness-105 active:scale-[0.98] transition cursor-pointer"
            >
              <svg className="w-4 h-4 text-[#0b0b0c] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Return to Home</span>
            </MagneticButtonLink>

            {/* Contact Us */}
            <MagneticButtonLink
              href="/contact-us/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm border border-[#d8b056]/35 bg-[#141312]/80 hover:bg-[#d8b056]/15 hover:border-[#d8b056] text-white shadow-lg shadow-black/40 backdrop-blur-md active:scale-[0.98] transition cursor-pointer"
            >
              <svg className="w-4 h-4 text-[#d8b056] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Contact Us</span>
            </MagneticButtonLink>
          </div>
        </motion.div>
      </main>

      {/* Bottom Footer (Copyright & Designed & Developed by Areez Software) */}
      <footer className="relative z-20 text-center text-[11px] sm:text-xs text-slate-400 pt-3 pb-1 px-4 max-w-full flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5">
        <span>
          &copy; {new Date().getFullYear()} <strong className="font-semibold text-slate-300">HopeFairy</strong>. All rights reserved.
        </span>
        <span className="hidden sm:inline text-slate-600">•</span>
        <span className="flex items-center gap-1">
          <span>Designed &amp; Developed by</span>
          <a
            href="https://areezsoftware.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#d8b056] hover:text-[#eedb9f] hover:underline transition-colors cursor-pointer"
            title="Areez Software — Websites, Apps & Custom Software"
          >
            Areez Software
          </a>
        </span>
      </footer>
    </div>
  );
}
