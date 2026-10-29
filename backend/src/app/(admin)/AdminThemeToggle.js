'use client';

import { useAdminTheme } from './AdminThemeContext.js';

export default function AdminThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode (White & Golden)' : 'Switch to Dark Mode (Black & Golden)'}
      aria-label="Toggle Theme"
      className={`relative inline-flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer shadow-xs ${
        isDark
          ? 'bg-[#181715] border-[#d8b056]/40 text-[#eedb9f] hover:bg-[#22201c] hover:border-[#d8b056]'
          : 'bg-[#faf7f0] border-[#d8b056]/40 text-slate-800 hover:bg-[#f5eedc]'
      } ${className}`}
    >
      {isDark ? (
        <>
          <svg className="w-4 h-4 text-[#d8b056]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="hidden sm:inline text-[11px] font-semibold tracking-wide text-[#eedb9f]">Light Mode</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <span className="hidden sm:inline text-[11px] font-semibold tracking-wide text-slate-800">Dark Mode</span>
        </>
      )}
    </button>
  );
}
