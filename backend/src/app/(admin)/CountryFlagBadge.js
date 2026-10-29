'use client';

import * as Flags from 'country-flag-icons/react/3x2';

/**
 * CountryFlagBadge Component
 * Displays a crisp 3:2 SVG flag on top and the 2-letter ISO country code underneath.
 * Works seamlessly on all operating systems (including Windows where flag emojis show as plain text).
 *
 * @param {{ code: string, className?: string, size?: 'sm' | 'md' | 'lg' }} props
 */
export default function CountryFlagBadge({ code, className = '', size = 'md', showCode = false }) {
  const upperCode = (code || '').trim().toUpperCase();
  const FlagComponent = Flags[upperCode];

  const dimensions =
    size === 'sm'
      ? 'w-7 h-4.5'
      : size === 'lg'
      ? 'w-11 h-7'
      : 'w-9 h-6';

  return (
    <div className={`inline-flex items-center gap-1.5 shrink-0 ${className}`}>
      {/* 3:2 SVG Flag with subtle shadow and border */}
      <div
        className={`${dimensions} rounded overflow-hidden border border-slate-700/50 shadow-xs flex items-center justify-center bg-slate-800/60 shrink-0`}
      >
        {FlagComponent ? (
          <FlagComponent className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs">🌐</span>
        )}
      </div>

      {/* Optional Inline Code */}
      {showCode && upperCode && (
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#d8b056]/10 text-[#946c1a] dark:text-[#e4c775] border border-[#d8b056]/30 leading-none">
          {upperCode}
        </span>
      )}
    </div>
  );
}
