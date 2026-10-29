'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApproveRegistration } from '../../../services/adminApi.js';
import Logo from '../../../components/layout/Logo.jsx';
import { useAdminTheme } from '../AdminThemeContext.js';
import AdminThemeToggle from '../AdminThemeToggle.js';

export default function AdminApprovePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const { theme } = useAdminTheme();
  const isLight = theme === 'light';

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [approvedUser, setApprovedUser] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('Approval token is missing. Please click the link directly from your Super Admin email.');
      setLoading(false);
      return;
    }

    const processApproval = async () => {
      try {
        const res = await adminApproveRegistration(token);
        setApprovedUser(res);
        setSuccess(true);
      } catch (err) {
        setError(err.message || 'Failed to approve account. The token may be expired or already used.');
      } finally {
        setLoading(false);
      }
    };

    processApproval();
  }, [token]);

  return (
    <div
      className={`min-h-screen flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300 ${
        isLight ? 'bg-[#faf8f3] text-[#181512]' : 'bg-[#080809] text-[#faf7f0]'
      }`}
    >
      {/* Top Header */}
      <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between pb-6">
        <Link
          href="/"
          className={`inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all border ${
            isLight
              ? 'bg-white/80 border-[#e5dfd3] text-slate-700 hover:border-amber-400 hover:text-amber-800'
              : 'bg-[#141311]/80 border-[#2a2620] text-slate-300 hover:border-amber-400/60 hover:text-amber-300'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Admin Portal</span>
        </Link>
        <AdminThemeToggle />
      </header>

      {/* Main Approval Confirmation Card */}
      <div className="relative z-10 max-w-lg mx-auto w-full my-auto">
        <div
          className={`p-8 sm:p-10 rounded-3xl border text-center shadow-2xl backdrop-blur-xl ${
            isLight
              ? 'bg-white/95 border-[#e5dfd3] shadow-amber-900/5'
              : 'bg-[#100f0e]/95 border-[#2b2721] shadow-black/80'
          }`}
        >
          <div className="mb-6 flex justify-center">
            <Logo size="lg" className="h-16 w-16" />
          </div>

          {loading ? (
            <div className="py-8 space-y-4">
              <div className="w-12 h-12 border-3 border-amber-400/20 border-t-amber-400 rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold">Verifying &amp; Authorizing Admin Access...</p>
            </div>
          ) : success ? (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                  Access Granted
                </span>
                <h1 className={`text-2xl font-black tracking-tight mt-2.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Admin Account Approved!
                </h1>
                <p className={`text-xs sm:text-sm mt-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  You have successfully approved admin privileges for{' '}
                  <strong className="text-amber-500 font-bold">{approvedUser?.email || 'the applicant'}</strong>.
                </p>
              </div>

              <div
                className={`p-4 rounded-2xl text-left border text-xs space-y-1.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex justify-between">
                  <span className="text-slate-400">Approved User:</span>
                  <span className="font-semibold">{approvedUser?.name || 'Admin'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-semibold font-mono">{approvedUser?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-semibold text-emerald-500">Active &amp; Ready to Log In</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-lg shadow-amber-500/20 hover:brightness-105 transition cursor-pointer"
                >
                  <span>Open Admin Dashboard</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/30 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>

              <div>
                <h1 className={`text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Approval Failed
                </h1>
                <p className={`text-xs sm:text-sm mt-2 leading-relaxed text-rose-500`}>
                  {error}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:border-amber-400 transition"
                >
                  <span>Back to Login</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs opacity-75 pt-6">
        &copy; {new Date().getFullYear()} HopeFairy. All rights reserved.
      </footer>
    </div>
  );
}
