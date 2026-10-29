'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '../../../components/layout/Logo.jsx';
import { sendForgotOtp, resetPasswordWithOtp } from '../../../services/adminApi.js';
import { useAdminTheme } from '../AdminThemeContext.js';
import AdminThemeToggle from '../AdminThemeToggle.js';
import PasswordStrengthIndicator, { evaluatePasswordRules } from '../PasswordStrengthIndicator.js';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { theme } = useAdminTheme();
  const isLight = theme === 'light';

  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP & New Password, 3 = Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Step 1: Send OTP to Email via SMTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await sendForgotOtp(email);
      setMessage(`A 6-digit verification OTP has been dispatched to ${email}. Please check your inbox.`);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please check your email and SMTP settings.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password with 8-Rule Check
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP verification code.');
      return;
    }

    const evaluation = evaluatePasswordRules(password, email);
    if (evaluation.metCount < 4) {
      setError('Password is too weak. Please fulfill at least 4 of the 8 enterprise security rules.');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Passwords do not match. Please re-enter your confirmation password.');
      return;
    }

    setLoading(true);

    try {
      await resetPasswordWithOtp(email, otp, password, passwordConfirmation);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300 ${
        isLight ? 'bg-[#faf8f3] text-[#181512]' : 'bg-[#080809] text-[#faf7f0]'
      }`}
    >
      {/* Ambient Luxury Gold Light Bloom */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[600px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-40 transition-opacity duration-500"
        style={{
          background: isLight
            ? 'radial-gradient(circle, rgba(216,176,86,0.35) 0%, rgba(200,155,60,0.12) 50%, transparent 80%)'
            : 'radial-gradient(circle, rgba(200,155,60,0.22) 0%, rgba(135,100,37,0.08) 50%, transparent 80%)',
        }}
      />

      {/* Top Header: Navigation & Theme Toggle */}
      <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between pb-4">
        <Link
          href="/login"
          className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 border ${
            isLight
              ? 'bg-white/80 border-[#e5dfd3] text-slate-700 hover:border-amber-400 hover:text-amber-800 shadow-xs'
              : 'bg-[#141311]/80 border-[#2a2620] text-slate-300 hover:border-amber-400/60 hover:text-amber-300'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Admin Login</span>
        </Link>

        <div className="flex items-center gap-2">
          <AdminThemeToggle />
        </div>
      </header>

      {/* Main Form Container */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md my-auto">
        {/* Brand Emblem & Header */}
        <div className="text-center mb-7">
          <Link href="/" className="inline-block group mb-3" title="Return to HopeFairy Home">
            <Logo size="lg" className="h-16 w-16 group-hover:scale-105 transition-transform duration-300" />
          </Link>

          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <span className={`${isLight ? 'text-slate-900' : 'text-white'} dark:text-white`}>Hope</span>
            <span className="text-gradient-brand">Fairy</span>
          </h1>

          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 mt-2.5 rounded-full text-[11px] font-semibold tracking-wider uppercase border transition-colors shadow-xs"
            style={{
              backgroundColor: isLight ? '#f6ecd0' : 'rgba(200, 155, 60, 0.12)',
              borderColor: isLight ? '#eedb9f' : 'rgba(216, 176, 86, 0.28)',
              color: isLight ? '#876425' : '#eedb9f',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Security & Password Recovery</span>
          </div>

          <p className={`mt-2 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            {step === 1 && 'Receive an encrypted 6-digit verification code to reset your HopeFairy admin password.'}
            {step === 2 && 'Enter the OTP code received on your email and configure your new strong credentials.'}
            {step === 3 && 'Credentials updated securely! You can now log into the management portal.'}
          </p>
        </div>

        {/* Card Slab */}
        <div
          className={`py-8 px-6 sm:px-8 rounded-3xl border transition-all duration-300 backdrop-blur-xl ${
            isLight
              ? 'bg-white/95 border-[#e5dfd3] shadow-[0_20px_50px_-20px_rgba(60,44,12,0.15)]'
              : 'bg-[#100f0e]/95 border-[#2b2721] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.85)]'
          }`}
          style={{
            backgroundImage: isLight
              ? 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(250,248,243,0.5))'
              : 'linear-gradient(180deg, rgba(255,248,230,0.03), transparent 60%)',
          }}
        >
          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm flex items-center gap-2.5">
              <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm flex items-center gap-2.5">
              <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{message}</span>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form className="space-y-5" onSubmit={handleSendOtp}>
              <div>
                <label
                  className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-500/70">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 ${
                      isLight
                        ? 'bg-[#faf8f3] border border-[#e5dfd3] text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:ring-amber-500/20'
                        : 'bg-[#181715] border border-[#2b2721] text-white placeholder-slate-500 focus:bg-[#1e1c19] focus:border-amber-400 focus:ring-amber-400/20'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all duration-300 bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-[0_10px_30px_-10px_rgba(200,155,60,0.65)] hover:brightness-105 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin text-[#0b0b0c]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Dispatching OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send 6-Digit OTP</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Enter OTP & New Password */}
          {step === 2 && (
            <form className="space-y-5" onSubmit={handleResetPassword}>
              <div>
                <label
                  className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className={`w-full px-4 py-3 rounded-xl text-center text-xl tracking-[0.35em] font-mono font-bold transition-all duration-200 focus:outline-none focus:ring-2 ${
                    isLight
                      ? 'bg-[#faf8f3] border border-[#e5dfd3] text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:ring-amber-500/20'
                      : 'bg-[#181715] border border-[#2b2721] text-amber-400 placeholder-slate-600 focus:bg-[#1e1c19] focus:border-amber-400 focus:ring-amber-400/20'
                  }`}
                  placeholder="000000"
                />
              </div>

              <div>
                <label
                  className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  New Strong Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 pr-11 ${
                      isLight
                        ? 'bg-[#faf8f3] border border-[#e5dfd3] text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:ring-amber-500/20'
                        : 'bg-[#181715] border border-[#2b2721] text-white placeholder-slate-500 focus:bg-[#1e1c19] focus:border-amber-400 focus:ring-amber-400/20'
                    }`}
                    placeholder="Create your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 right-0 pr-3.5 flex items-center transition ${
                      isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-500 hover:text-slate-300'
                    }`}
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

                {/* Real-time 8-rule password strength indicator */}
                <PasswordStrengthIndicator
                  password={password}
                  email={email}
                  isLight={isLight}
                  showChecklistInitially={true}
                />
              </div>

              <div>
                <label
                  className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 ${
                    isLight
                      ? 'bg-[#faf8f3] border border-[#e5dfd3] text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:ring-amber-500/20'
                      : 'bg-[#181715] border border-[#2b2721] text-white placeholder-slate-500 focus:bg-[#1e1c19] focus:border-amber-400 focus:ring-amber-400/20'
                  }`}
                  placeholder="Re-enter your new password"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all duration-300 bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-[0_10px_30px_-10px_rgba(200,155,60,0.65)] hover:brightness-105 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin text-[#0b0b0c]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Verifying & Resetting Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Password Reset</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Reset Success */}
          {step === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h3 className="text-lg font-extrabold tracking-tight">
                  Password Updated Successfully
                </h3>
                <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Your HopeFairy admin password has been safely updated with 256-bit encryption. You can now log into your account.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all duration-300 bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-[0_10px_30px_-10px_rgba(200,155,60,0.65)] hover:brightness-105 active:scale-[0.99]"
                >
                  <span>Proceed to Admin Login</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer copyright */}
      <footer className="relative z-10 text-center text-xs opacity-60 pt-4">
        &copy; {new Date().getFullYear()} HopeFairy Study Abroad Consultancy. All rights reserved.
      </footer>
    </div>
  );
}
