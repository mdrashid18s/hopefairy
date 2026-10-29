'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '../../../components/layout/Logo.jsx';
import Flag from '../../../components/ui/Flag.jsx';
import Icon from '../../../components/ui/Icon.jsx';
import Sparkle from '../../../components/ui/Sparkle.jsx';
import { adminLogin } from '../../../services/adminApi.js';

// Twinkling four-point gold stars echoing the HopeFairy brand logo
const STARS = [
  { top: '12%', left: '6%', size: 10, delay: 0 },
  { top: '78%', left: '14%', size: 8, delay: 1.2 },
  { top: '22%', left: '46%', size: 12, delay: 2.1 },
  { top: '88%', left: '38%', size: 9, delay: 0.6 },
  { top: '14%', left: '72%', size: 7, delay: 1.7 },
  { top: '65%', left: '90%', size: 11, delay: 2.6 },
];

// Study destinations around the orbit with official ISO flag codes
const ORBIT_DESTINATIONS = [
  { name: 'United Kingdom', code: 'UK', flag: 'GB' },
  { name: 'United States', code: 'US', flag: 'US' },
  { name: 'Canada', code: 'CA', flag: 'CA' },
  { name: 'Germany', code: 'DE', flag: 'DE' },
  { name: 'Australia', code: 'AU', flag: 'AU' },
  { name: 'Ireland', code: 'IE', flag: 'IE' },
];

const CHIP_POS = Array.from({ length: 6 }, (_, i) => {
  const a = ((-60 + i * 60) * Math.PI) / 180;
  return { left: `${50 + 49 * Math.cos(a)}%`, top: `${50 + 49 * Math.sin(a)}%` };
});

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isInactive, setIsInactive] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const resetMessages = () => {
    setError('');
    setIsInactive(false);
    setIsPendingApproval(false);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      await adminLogin(email, password);
      router.push('/');
    } catch (err) {
      const errMsg = err.message || 'Invalid credentials. Please verify your email and password.';
      setError(errMsg);

      const lower = errMsg.toLowerCase();
      if (lower.includes('pending approval') || lower.includes('pending verification')) {
        setIsPendingApproval(true);
      } else if (
        lower.includes('inactive') ||
        lower.includes('deactivated') ||
        lower.includes('disabled')
      ) {
        setIsInactive(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page min-h-screen lg:h-screen lg:max-h-screen w-full relative flex flex-col justify-between overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-ink-950 !text-white select-none">
      
      {/* ========================================================
          BACKGROUND: Authentic HopeFairy Hero Black & Gold Atmosphere
         ======================================================== */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Subtle radial ambient gold blooms matching Homepage Hero */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_25%_45%,rgba(200,155,60,0.22),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_85%_75%,rgba(200,155,60,0.12),transparent_70%)]" />

        {/* Twinkling four-point gold stars */}
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute text-brand-300 animate-pulse pointer-events-none"
            style={{
              top: s.top,
              left: s.left,
              animationDuration: `${3 + (i % 3)}s`,
              animationDelay: `${s.delay}s`,
              opacity: 0.65,
            }}
          >
            <Sparkle size={s.size} />
          </span>
        ))}
      </div>

      {/* ========================================================
          TOP NAVBAR: Matches Public Header Aesthetics
         ======================================================== */}
      <header className="relative z-20 w-full max-w-[1400px] mx-auto px-4 sm:px-8 pt-4 sm:pt-6">
        <div className="rounded-2xl border border-brand-400/25 bg-ink-900/85 backdrop-blur-xl px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-lg">
          <Link
            href="/"
            aria-label="HopeFairy Home"
            className="inline-flex items-center gap-2.5 transition-transform hover:scale-105"
          >
            <Logo size="sm" className="h-8 w-8 sm:h-9 sm:w-9" />
            <span className="flex items-center text-[1.2rem] font-black tracking-tight leading-none">
              <span className="!text-white drop-shadow-sm" style={{ color: '#ffffff' }}>Hope</span>
              <span className="text-[#d8b056] ml-0.5">Fairy</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-400/25 bg-ink-950/60 text-[11px] font-semibold !text-white/80" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Admin Gateway Online</span>
            </span>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-brand-300/50 !text-white/90 hover:!text-white transition-all cursor-pointer"
              style={{ color: '#ffffff' }}
            >
              <svg className="w-3.5 h-3.5 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back to Website</span>
              <span className="sm:hidden">Website</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================
          MAIN SECTION: HopeFairy Orbit Universe (Left) + Luxury Card (Right)
         ======================================================== */}
      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-4 sm:py-6 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-10 xl:gap-14">
          
          {/* ----------------------------------------------------
              LEFT COLUMN (Col 7): Exact Website Hero Brand Orbit
             ---------------------------------------------------- */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            {/* Eyebrow Kicker Pill */}
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/[0.08] px-3.5 py-1 text-[0.7rem] sm:text-xs font-semibold uppercase tracking-[0.2em] text-brand-200">
                <Sparkle size={10} className="text-brand-300" />
                <span>Administrative Control Hub</span>
              </span>
            </div>

            {/* Shimmering Headline with Stark White Dream Big */}
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.1] !text-white" style={{ color: '#ffffff' }}>
              <span className="!text-white drop-shadow-sm" style={{ color: '#ffffff' }}>Dream Big.</span>
              <br />
              <span className="text-gold">We&apos;ll Map the Way.</span>
            </h1>

            <p className="mt-3 text-xs sm:text-sm xl:text-base max-w-lg leading-relaxed text-white/70">
              Overseas destinations, course catalogues, direct CRM student enquiries &amp; test prep — orchestrated under one roof.
            </p>

            {/* The Signature HopeFairy Emblem Orbit (Exact from Hero.jsx) */}
            <div className="relative mx-auto lg:mx-0 my-6 sm:my-8 aspect-square w-[280px] sm:w-[350px] xl:w-[380px]">
              {/* Rotating Gold Dashed Outer Ring */}
              <div className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-brand-400/30" />

              {/* Reverse Rotating Hairline Inner Ring */}
              <div className="absolute inset-[12%] animate-spin-slower rounded-full border border-brand-400/15" />

              {/* Central Ambient Gold Bloom */}
              <div className="absolute inset-[24%] rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />

              {/* Circling Airplanes Trailing Fading Gold Arc */}
              <Orbit className="inset-0" duration="26s" />
              <Orbit className="inset-[12%]" duration="19s" reverse />

              {/* Central HopeFairy Emblem with Conic Glowing Halo */}
              <div className="absolute inset-[24%] animate-float" style={{ animationDuration: '8s' }}>
                <div className="relative h-full w-full flex items-center justify-center">
                  <div className="absolute -inset-3 rounded-full bg-[conic-gradient(from_0deg,rgba(243,220,151,0.55),rgba(200,155,60,0.05),rgba(243,220,151,0.55))] opacity-70 blur-md" />
                  <Logo size="lg" className="relative h-full w-full rounded-full" />
                </div>
              </div>

              {/* Floating Destination Chips with Authentic Country Flags */}
              {ORBIT_DESTINATIONS.map((d, i) => {
                const pos = CHIP_POS[i];
                return (
                  <div
                    key={d.code}
                    className="absolute flex h-0 w-0 items-center justify-center"
                    style={pos}
                  >
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-brand-400/35 bg-ink-900 px-2.5 py-1 text-[0.7rem] sm:text-[0.75rem] font-semibold text-white shadow-[0_8px_24px_-10px_rgba(0,0,0,0.8)] transition-transform duration-300 hover:scale-105">
                      <Flag code={d.flag} className="h-3 w-[18px] rounded-[2px] ring-1 ring-white/20" />
                      <span className="text-brand-300 font-bold">{d.code}</span>
                      <span className="hidden sm:inline text-white/80">{d.name}</span>
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Trust Metrics Strip */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-3 border-t border-brand-400/20 max-w-md">
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-brand-300 tracking-tight">98%</div>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/60 font-semibold mt-0.5">
                  Visa Success
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">500+</div>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/60 font-semibold mt-0.5">
                  Universities
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-brand-200 tracking-tight">1:1</div>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/60 font-semibold mt-0.5">
                  Honest Guide
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------
              RIGHT COLUMN (Col 5): Luxury Form Card Matching Website
             ---------------------------------------------------- */}
          <div className="lg:col-span-5 flex justify-end w-full">
            <div className="w-full max-w-[420px] sm:max-w-[440px] ml-auto relative rounded-3xl border border-brand-400/30 bg-ink-900/95 backdrop-blur-xl p-6 sm:p-8 shadow-[0_0_0_1px_rgba(216,176,86,0.2),0_24px_60px_-18px_rgba(200,155,60,0.4)] overflow-hidden">
              
              {/* Hairline Gold Rule on Card Top */}
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/80 to-transparent" />

              {/* Periodic Diagonal Shine Sweep Effect */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <span className="animate-shine-sweep absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-brand-200/10 to-transparent" />
              </div>

              {/* Card Header */}
              <div className="relative z-10 text-center mb-5">
                <div className="inline-block p-1 rounded-2xl bg-brand-400/10 border border-brand-400/30 mb-2.5">
                  <Logo size="sm" className="h-10 w-10 rounded-full" />
                </div>

                <h2 className="text-xl sm:text-2xl font-bold tracking-tight !text-white leading-tight" style={{ color: '#ffffff' }}>
                  Sign In to Management
                </h2>

                <p className="mt-1 text-xs text-white/65">
                  Enter your credentials to access HopeFairy Control Hub
                </p>
              </div>

              {/* Status & Error Alerts */}
              {isPendingApproval ? (
                <div className="relative z-10 mb-4 p-3.5 rounded-2xl bg-brand-400/10 border border-brand-400/40 text-brand-200 text-xs flex items-start gap-2.5 shadow-sm">
                  <svg className="w-4 h-4 text-brand-300 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-left">
                    <span className="font-bold uppercase tracking-wider block text-brand-300 text-[10px]">Approval Pending</span>
                    <span>Your account is pending verification by Super Admin.</span>
                  </div>
                </div>
              ) : isInactive ? (
                <div className="relative z-10 mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-400 text-xs flex items-start gap-2.5 shadow-sm">
                  <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="text-left">
                    <span className="font-bold uppercase tracking-wider block text-rose-400 text-[10px]">Account Inactive</span>
                    <span>Your admin account is disabled. Please contact administrator.</span>
                  </div>
                </div>
              ) : error ? (
                <div className="relative z-10 mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              ) : null}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="relative z-10 space-y-3.5">
                {/* Email Field */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-200 mb-1.5 pl-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      style={{ backgroundColor: '#141311', color: '#ffffff', borderColor: 'rgba(216, 176, 86, 0.35)' }}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium bg-[#141311] border border-brand-400/35 !text-white placeholder-white/40 transition-all duration-200 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/25"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 pl-1 pr-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-200">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-[11px] font-semibold text-brand-300 hover:text-brand-200 hover:underline transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      style={{ backgroundColor: '#141311', color: '#ffffff', borderColor: 'rgba(216, 176, 86, 0.35)' }}
                      className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium bg-[#141311] border border-brand-400/35 !text-white placeholder-white/40 transition-all duration-200 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/25"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/50 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me Option */}
                <div className="flex items-center justify-between pt-0.5 pl-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-brand-400/40 bg-ink-800 text-brand-400 focus:ring-brand-400 accent-brand-400 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-white/80">
                      Remember this device
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all duration-300 will-change-transform bg-gradient-to-r from-brand-200 via-brand-400 to-brand-500 text-ink-950 shadow-[0_10px_30px_-10px_rgba(200,155,60,0.65)] hover:shadow-[0_0_0_1px_rgba(216,176,86,0.3),0_20px_50px_-15px_rgba(200,155,60,0.85)] hover:brightness-105 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin text-ink-950" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>Enter Management Portal</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Quick Security Badge */}
              <div className="relative z-10 mt-5 pt-4 border-t border-white/10 text-center text-[10px] font-medium text-white/50 flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-brand-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>256-bit AES Reversible Encryption • Super Admin Verified</span>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ========================================================
          FOOTER: Matches Public Site Footer Standards
         ======================================================== */}
      <footer className="relative z-20 text-center text-xs text-white/50 py-3 shrink-0 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3">
        <span>&copy; {new Date().getFullYear()} <strong className="font-semibold text-white/80">HopeFairy</strong>. All rights reserved.</span>
        <span className="hidden sm:inline opacity-30">•</span>
        <span className="flex items-center gap-1">
          <span>Designed &amp; Developed by</span>
          <a
            href="https://areezsoftware.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-400 hover:text-brand-300 hover:underline transition-colors"
          >
            Areez Software
          </a>
        </span>
      </footer>

    </div>
  );
}

/**
 * Airplane flying the orbital ring with gold trail arc (from Hero.jsx)
 */
function Orbit({ className, duration, reverse = false }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{
        animation: `spin ${duration} linear infinite`,
        animationDirection: reverse ? 'reverse' : 'normal',
      }}
    >
      <div
        className="absolute inset-0 rounded-full border-2 border-brand-300/80"
        style={{
          maskImage: reverse
            ? 'conic-gradient(from 0deg, black 0deg, transparent 55deg)'
            : 'conic-gradient(from 305deg, transparent 0deg, black 55deg, transparent 55deg)',
        }}
      />
      <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
        <Icon
          name="plane"
          strokeWidth={2}
          className={`h-5 w-5 text-brand-300 drop-shadow-[0_0_6px_rgba(228,199,117,0.8)] ${
            reverse ? '-rotate-[135deg]' : 'rotate-45'
          }`}
        />
      </span>
    </div>
  );
}
