'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminLogout } from '../../services/adminApi.js';
import { useAdminTheme } from './AdminThemeContext.js';

export default function AdminUserMenu({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef(null);
  const timeoutRef = useRef(null);
  const router = useRouter();
  const { theme } = useAdminTheme();
  const isLight = theme === 'light';

  // Smooth hover handlers with debounced mouse leave
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isOpen]);

  const handleLogoutClick = () => {
    setIsOpen(false);
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await adminLogout();
      router.replace('/login');
    } catch {
      router.replace('/login');
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || 'H';

  return (
    <div
      className="relative"
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Avatar Trigger Button (Opens on Hover or Click) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={`${user?.name || 'Administrator'} — Account & Settings`}
        className="group relative flex items-center p-0.5 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#d8b056]/50 transition"
      >
        <div
          className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#080809] font-black text-sm shadow-md group-hover:scale-105 transition-transform duration-200 ring-2 ring-[#d8b056]/60"
          style={{
            background: 'linear-gradient(135deg, #e4c775 0%, #d8b056 45%, #c89b3c 100%)',
            boxShadow: '0 4px 14px -2px rgba(200, 155, 60, 0.4)',
          }}
        >
          <span>{initial}</span>
          {/* Active Status Indicator */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#100f0e]"></span>
        </div>
      </button>

      {/* Dropdown Menu Card */}
      {isOpen && (
        <div
          role="menu"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`absolute right-0 top-full mt-2.5 w-72 rounded-2xl border shadow-2xl z-50 overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${
            isLight
              ? 'bg-white border-slate-100 text-slate-800 shadow-2xl shadow-slate-300/60'
              : 'bg-[#121110] border-[#292622] text-[#faf7f0] shadow-black/80'
          }`}
        >
          {/* User Profile Header */}
          <div
            className={`p-4 border-b flex items-center gap-3 ${
              isLight ? 'bg-slate-50/80 border-slate-100' : 'bg-[#181615] border-[#24221e]'
            }`}
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-[#080809] font-black text-base shadow-md shrink-0 ring-2 ring-[#d8b056]/50"
              style={{
                background: 'linear-gradient(135deg, #e4c775 0%, #d8b056 45%, #c89b3c 100%)',
                boxShadow: '0 4px 14px -2px rgba(200, 155, 60, 0.4)',
              }}
            >
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-sm truncate leading-tight">
                  {user?.name || 'Administrator'}
                </p>
                <span
                  className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded border"
                  style={{
                    backgroundColor: isLight ? 'rgba(216, 176, 86, 0.14)' : 'rgba(216, 176, 86, 0.18)',
                    borderColor: 'rgba(216, 176, 86, 0.4)',
                    color: isLight ? '#946c1a' : '#e4c775',
                  }}
                >
                  {user?.role === 'super_admin' || user?.is_super_admin || user?.email?.toLowerCase() === 'md.asif2412@gmail.com'
                    ? 'Super Admin'
                    : (user?.role === 'user' ? 'User' : 'Admin')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                {user?.email || 'admin@hopefairy.com'}
              </p>
            </div>
          </div>

          {/* Quick Menu Options */}
          <div className="p-2 space-y-0.5">
            {/* Password & Security */}
            <Link
              href="/users"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                isLight
                  ? 'hover:bg-amber-50/90 text-slate-700 hover:text-slate-950'
                  : 'hover:bg-[#1f1d1a] text-slate-300 hover:text-white'
              }`}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border group-hover:scale-110 transition-transform"
                style={{
                  backgroundColor: 'rgba(216, 176, 86, 0.14)',
                  borderColor: 'rgba(216, 176, 86, 0.35)',
                  color: isLight ? '#946c1a' : '#d8b056',
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="leading-tight">Password &amp; Security</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Change password &amp; accounts</p>
              </div>
            </Link>

            {/* Site Settings */}
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                isLight
                  ? 'hover:bg-amber-50/90 text-slate-700 hover:text-slate-950'
                  : 'hover:bg-[#1f1d1a] text-slate-300 hover:text-white'
              }`}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border group-hover:scale-110 transition-transform"
                style={{
                  backgroundColor: 'rgba(216, 176, 86, 0.14)',
                  borderColor: 'rgba(216, 176, 86, 0.35)',
                  color: isLight ? '#946c1a' : '#d8b056',
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="leading-tight">Site Settings</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Contact info, SEO &amp; brand</p>
              </div>
            </Link>

            {/* View Public Website */}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                isLight
                  ? 'hover:bg-amber-50/90 text-slate-700 hover:text-slate-950'
                  : 'hover:bg-[#1f1d1a] text-slate-300 hover:text-white'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0 border border-sky-500/20 group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <div>
                <p className="leading-tight">Public Website</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Open portal in new tab</p>
              </div>
            </a>
          </div>

          {/* Divider */}
          <div className={`border-t ${isLight ? 'border-slate-100' : 'border-[#24221e]'}`} />

          {/* Logout Action */}
          <div className="p-2">
            <button
              type="button"
              onClick={handleLogoutClick}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer group ${
                isLight
                  ? 'text-rose-600 hover:bg-rose-50'
                  : 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/20 group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div className="text-left">
                <p className="leading-tight">Log Out</p>
                <p className="text-[10px] opacity-70 font-normal">Terminate current admin session</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Executive Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto my-auto animate-in zoom-in-95 duration-200 ${
              isLight
                ? 'bg-white/98 border-[#e5dfd3] shadow-[0_25px_60px_-15px_rgba(60,44,12,0.18)] text-slate-900'
                : 'bg-[#100f0e]/98 border-[#292622] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9)] text-[#faf7f0]'
            }`}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between pb-4 mb-4 border-b ${isLight ? 'border-slate-100' : 'border-[#24221e]'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-rose-500/10 border border-rose-500/25 text-rose-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">Confirm Sign Out</h3>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Terminate administrative session
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className={`p-4 rounded-2xl border mb-5 text-xs sm:text-sm leading-relaxed ${
              isLight ? 'bg-slate-50/80 border-slate-200/70 text-slate-600' : 'bg-[#161513] border-[#262420] text-slate-300'
            }`}>
              Are you sure you want to log out, <strong className={isLight ? 'text-slate-900 font-bold' : 'text-white font-bold'}>{user?.name || 'Administrator'}</strong>? Your active session will be securely terminated and you will need to sign back in with your credentials.
            </div>

            {/* Modal Actions Footer */}
            <div className={`flex items-center justify-end gap-3 pt-3 border-t ${isLight ? 'border-slate-100' : 'border-[#24221e]'}`}>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer disabled:opacity-60 ${
                  isLight
                    ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                    : 'border-slate-700 hover:bg-slate-800 text-slate-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={loggingOut}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 hover:shadow-rose-600/50 active:scale-[0.99] disabled:opacity-60 transition flex items-center gap-2 cursor-pointer"
              >
                {loggingOut ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing Out...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Yes, Log Out</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
