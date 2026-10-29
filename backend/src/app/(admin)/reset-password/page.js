'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '../../../components/layout/Logo.jsx';
import { verifyResetToken, resetPasswordWithToken } from '../../../services/adminApi.js';
import { useAdminTheme } from '../AdminThemeContext.js';
import AdminThemeToggle from '../AdminThemeToggle.js';
import PasswordStrengthIndicator, { evaluatePasswordRules } from '../PasswordStrengthIndicator.js';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const { theme } = useAdminTheme();
  const isLight = theme === 'light';

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Verify unique token on initial load
  useEffect(() => {
    if (!token || !emailParam) {
      setTokenError('Missing password reset token or email address in the URL.');
      setVerifying(false);
      return;
    }

    setEmail(emailParam);

    const checkToken = async () => {
      try {
        setVerifying(true);
        setTokenError('');
        const res = await verifyResetToken(emailParam, token);
        setUserInfo(res || { email: emailParam });
        setTokenValid(true);
      } catch (err) {
        setTokenError(err.message || 'This unique password reset link is invalid or has expired.');
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    };

    checkToken();
  }, [token, emailParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!password) {
      setFormError('Please enter a new password.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    const evaluation = evaluatePasswordRules(password, email);
    if (evaluation.metCount < 4) {
      setFormError('Password is too weak. Please fulfill at least 4 of the 8 enterprise security rules.');
      return;
    }

    if (password !== passwordConfirmation) {
      setFormError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPasswordWithToken(email, token, password, passwordConfirmation);
      setIsSuccess(true);
    } catch (err) {
      setFormError(err.message || 'Failed to update password. The link may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  const isSuperAdmin = userInfo?.is_super_admin || email.toLowerCase() === 'md.asif2412@gmail.com' || email.toLowerCase() === 'mrrashidsaikh0365@gmail.com';

  return (
    <div
      className={`min-h-screen flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300 ${
        isLight ? 'bg-[#faf8f3] text-[#181512]' : 'bg-[#080809] text-[#faf7f0]'
      }`}
    >
      {/* Ambient Luxury Gold Light Bloom */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[650px] h-[520px] rounded-full blur-[140px] pointer-events-none opacity-40 transition-opacity duration-500"
        style={{
          background: isLight
            ? 'radial-gradient(circle, rgba(216,176,86,0.35) 0%, rgba(200,155,60,0.12) 50%, transparent 80%)'
            : 'radial-gradient(circle, rgba(200,155,60,0.22) 0%, rgba(135,100,37,0.08) 50%, transparent 80%)',
        }}
      />

      {/* Top Header */}
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
          <span>Back to Sign In</span>
        </Link>
        <AdminThemeToggle />
      </header>

      {/* Main Card Container */}
      <div className="relative z-10 max-w-md mx-auto w-full my-auto">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block group mb-3" title="Return to HopeFairy Home">
            <Logo size="lg" className="h-14 w-14 group-hover:scale-105 transition-transform duration-300" />
          </Link>

          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <span>Hope</span>
            <span className="text-[#d8b056] ml-1">Fairy</span>
          </h1>

          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 mt-2.5 rounded-full text-[11px] font-semibold tracking-wider uppercase border shadow-xs"
            style={{
              backgroundColor: isLight ? '#f6ecd0' : 'rgba(200, 155, 60, 0.12)',
              borderColor: isLight ? '#eedb9f' : 'rgba(216, 176, 86, 0.28)',
              color: isLight ? '#876425' : '#eedb9f',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>{isSuperAdmin ? 'Super Admin Credential Setup' : 'Secure Password Reset'}</span>
          </div>

          <p className={`mt-2 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Configure your enterprise credentials and secure your account access.
          </p>
        </div>

        {/* Card Slab */}
        <div
          className={`py-8 px-6 sm:px-8 rounded-3xl border transition-all duration-300 backdrop-blur-xl ${
            isLight
              ? 'bg-white/95 border-[#e5dfd3] shadow-[0_20px_50px_-20px_rgba(60,44,12,0.15)]'
              : 'bg-[#100f0e]/95 border-[#2b2721] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.85)]'
          }`}
        >
          {verifying ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-10 h-10 border-3 border-amber-400/20 border-t-amber-400 rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Verifying unique security token...
              </p>
            </div>
          ) : !tokenValid ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-500 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Invalid or Expired Link
              </h3>
              <p className="text-xs text-rose-500 font-medium max-w-xs mx-auto">
                {tokenError}
              </p>
              <div className="pt-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#d8b056] text-[#0b0b0c] hover:brightness-105 transition"
                >
                  Return to Admin Sign In
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="py-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                  Password Set Successfully
                </span>
                <h3 className={`text-xl font-black tracking-tight mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Welcome to HopeFairy Hub!
                </h3>
                <p className={`text-xs mt-1.5 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Your credentials have been securely configured. You can now log into the management portal.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-xs font-bold transition-all duration-300 bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-md shadow-amber-500/20 hover:brightness-105"
                >
                  <span>Sign In to Management Portal</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account summary pill */}
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#151412] border-[#25221e]'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Configuring Account
                  </div>
                  <div className="text-xs font-mono font-bold truncate text-[#d8b056]">
                    {email}
                  </div>
                </div>
                <span
                  className="shrink-0 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border"
                  style={{
                    backgroundColor: isSuperAdmin ? 'rgba(216, 176, 86, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                    borderColor: isSuperAdmin ? 'rgba(216, 176, 86, 0.4)' : 'rgba(56, 189, 248, 0.4)',
                    color: isSuperAdmin ? (isLight ? '#876425' : '#eedb9f') : '#38bdf8',
                  }}
                >
                  {isSuperAdmin ? '👑 Super Admin' : 'Admin'}
                </span>
              </div>

              {formError && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formError}</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars (uppercase, numbers, symbols)"
                    className={`w-full rounded-xl px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-mono border transition-all duration-200 focus:outline-none focus:ring-2 ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#d8b056] focus:ring-[#d8b056]/25'
                        : 'bg-[#161513] border-[#292622] text-white placeholder-slate-500 focus:bg-[#1c1a17] focus:border-[#d8b056] focus:ring-[#d8b056]/25'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
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

                <PasswordStrengthIndicator
                  password={password}
                  email={email}
                  isLight={isLight}
                  showChecklistInitially={true}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    minLength={8}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="Re-enter password"
                    className={`w-full rounded-xl px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-mono border transition-all duration-200 focus:outline-none focus:ring-2 ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#d8b056] focus:ring-[#d8b056]/25'
                        : 'bg-[#161513] border-[#292622] text-white placeholder-slate-500 focus:bg-[#1c1a17] focus:border-[#d8b056] focus:ring-[#d8b056]/25'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                    title={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? (
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

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-xs sm:text-sm font-bold transition-all duration-300 bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-[0_10px_30px_-10px_rgba(200,155,60,0.65)] hover:brightness-105 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0b0b0c] border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Set Password &amp; Activate</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center text-[11px] text-slate-500 py-4">
        © {new Date().getFullYear()} HopeFairy Educational Consultancy. All rights reserved.
      </footer>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#080809]">
        <div className="w-10 h-10 border-3 border-amber-400/20 border-t-amber-400 rounded-full animate-spin"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
