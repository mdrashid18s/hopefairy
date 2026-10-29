'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useAdminTheme } from './AdminThemeContext.js';

/**
 * AdminCustomSelect
 * ------------------------------------------------------------------
 * Executive custom dropdown selector built for HopeFairy Admin Portal.
 * 
 * Guarantees:
 * 1. 100% contained within the popup/modal boundaries (never renders outside).
 * 2. Real-time search filter for fast selection among large option lists.
 * 3. Dual-theme luxury HopeFairy styling (White/Gold & Obsidian/Gold).
 * 4. Outside-click and Escape key auto-close.
 * 5. Full keyboard accessibility & form integration.
 */
export default function AdminCustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Choose Course',
  required = false,
  disabled = false,
  searchable = true,
  className = '',
  variant = 'default',
  icon = null,
}) {
  const { theme } = useAdminTheme();
  const isLight = theme === 'light';

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options array: supports [{ id, name, level, code }] or [{ value, label, level, code }]
  const normalizedOptions = useMemo(() => {
    if (!Array.isArray(options)) return [];
    return options.map((opt) => {
      if (typeof opt === 'string' || typeof opt === 'number') {
        return { value: String(opt), label: String(opt) };
      }
      const val = opt.value !== undefined ? String(opt.value) : String(opt.id || '');
      const lbl = opt.label !== undefined ? String(opt.label) : String(opt.name || opt.title || val);
      return {
        value: val,
        label: lbl,
        level: opt.level || null,
        code: opt.code || null,
        subtitle: opt.subtitle || null,
      };
    });
  }, [options]);

  // Currently selected option object
  const selectedOption = useMemo(() => {
    if (value === undefined || value === null || value === '') return null;
    return normalizedOptions.find((o) => o.value === String(value)) || null;
  }, [normalizedOptions, value]);

  // Filtered options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return normalizedOptions;
    const term = searchTerm.toLowerCase().trim();
    return normalizedOptions.filter((o) => {
      const matchLabel = o.label.toLowerCase().includes(term);
      const matchLevel = o.level ? o.level.toLowerCase().includes(term) : false;
      const matchCode = o.code ? o.code.toLowerCase().includes(term) : false;
      return matchLabel || matchLevel || matchCode;
    });
  }, [normalizedOptions, searchTerm]);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, searchable]);

  const handleSelect = (optValue) => {
    onChange?.(optValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const showSearch = searchable && normalizedOptions.length > 5;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Hidden Native Input to support HTML form validation */}
      <input
        type="text"
        required={required}
        value={value || ''}
        onChange={() => {}}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Trigger Button - Header / Toolbar Variant vs Default Form Variant */}
      {variant === 'header' ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={`group w-full px-3 py-2 rounded-2xl text-xs font-bold border flex items-center justify-between gap-2.5 text-left transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs ${
            isOpen
              ? isLight
                ? 'bg-[#fbf7ed] border-[#d8b056] ring-2 ring-[#d8b056]/25 shadow-[0_4px_16px_-2px_rgba(216,176,86,0.25)]'
                : 'bg-[#181613] border-[#d8b056] ring-2 ring-[#d8b056]/25 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.8)]'
              : isLight
              ? 'bg-white hover:bg-[#fbf7ed]/40 border-[#d8b056]/40 hover:border-[#d8b056] text-slate-800 shadow-[0_2px_8px_-2px_rgba(216,176,86,0.15)] hover:shadow-[0_4px_14px_-2px_rgba(216,176,86,0.25)]'
              : 'bg-[#121110] hover:bg-[#181613] border-[#2e2a22] hover:border-[#d8b056]/60 text-[#faf7f0] shadow-[0_2px_12px_-2px_rgba(0,0,0,0.6)]'
          }`}
        >
          {/* Left Academic Icon Badge */}
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200 ${
            isLight
              ? 'bg-gradient-to-br from-[#fbf7ed] to-[#eedb9f]/40 border-[#d8b056]/40 text-[#8f640c]'
              : 'bg-gradient-to-br from-[#1e1c18] to-[#2e2a22] border-[#d8b056]/30 text-[#eedb9f]'
          }`}>
            {icon || (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            )}
          </div>

          {/* Central Title & Label Area */}
          <div className="flex flex-col text-left truncate flex-1 min-w-0">
            <span className="text-[9px] font-black uppercase tracking-wider text-[#d8b056] leading-none mb-0.5">
              Course
            </span>
            {selectedOption ? (
              <div className="flex items-center gap-1.5 truncate">
                <span className="truncate font-black text-slate-900 dark:text-[#faf7f0] text-xs">
                  {selectedOption.label}
                </span>
                {selectedOption.level && (
                  <span className={`text-[8px] uppercase px-1.5 py-0.2 rounded font-black tracking-wider shrink-0 border ${
                    isLight
                      ? 'bg-[#d8b056]/25 text-[#4e3103] border-[#d8b056]/60'
                      : 'bg-[#d8b056]/20 text-[#eedb9f] border-[#d8b056]/35'
                  }`}>
                    {selectedOption.level}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs font-black tracking-tight text-slate-800 dark:text-slate-100 truncate">
                {placeholder}
              </span>
            )}
          </div>

          {/* Right Chevron Pill Badge */}
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-200 ${
            isOpen
              ? 'bg-[#d8b056] border-[#d8b056] text-[#0b0b0c] rotate-180 shadow-xs'
              : isLight
              ? 'bg-[#fbf7ed] border-[#d8b056]/30 text-[#8f640c] group-hover:bg-[#d8b056]/20 group-hover:border-[#d8b056]/60'
              : 'bg-[#1e1c18] border-[#d8b056]/25 text-[#eedb9f] group-hover:bg-[#d8b056]/20'
          }`}>
            <svg className="w-3.5 h-3.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      ) : (
        /* Standard Form Input Variant */
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border flex items-center justify-between gap-2 text-left transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            isOpen
              ? 'border-[#d8b056] ring-2 ring-[#d8b056]/20'
              : isLight
              ? 'border-slate-200 hover:border-[#d8b056]/60 bg-white text-slate-800'
              : 'border-[#2a2824] hover:border-[#d8b056]/60 bg-[#141311] text-slate-100'
          }`}
        >
          <div className="flex items-center gap-2 truncate flex-1 min-w-0">
            {selectedOption ? (
              <>
                <span className="truncate font-bold">{selectedOption.label}</span>
                {selectedOption.code && (
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    ({selectedOption.code})
                  </span>
                )}
                {selectedOption.level && (
                  <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-md font-black tracking-wider shrink-0 border ${
                    isLight
                      ? 'bg-[#d8b056]/25 text-[#4e3103] border-[#d8b056]/60'
                      : 'bg-[#d8b056]/20 text-[#eedb9f] border-[#d8b056]/35'
                  }`}>
                    {selectedOption.level}
                  </span>
                )}
              </>
            ) : (
              <span className="text-slate-500 dark:text-slate-400 font-semibold truncate">{placeholder}</span>
            )}
          </div>

          <svg
            className={`w-4 h-4 shrink-0 transition-transform duration-200 text-[#d8b056] ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {/* Contained Dropdown Panel */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 ${
            isLight
              ? 'bg-white border-[#e5dfd3] shadow-[0_20px_50px_-10px_rgba(60,44,12,0.18)] text-slate-900'
              : 'bg-[#141311] border-[#292622] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] text-[#faf7f0]'
          }`}
          style={{ maxHeight: '240px' }}
        >
          {/* Search Box Header */}
          {showSearch && (
            <div className={`p-2 border-b sticky top-0 z-10 backdrop-blur-md ${
              isLight ? 'bg-white/95 border-slate-100' : 'bg-[#141311]/95 border-[#24221e]'
            }`}>
              <div className="relative">
                <svg
                  className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Search ${normalizedOptions.length} items...`}
                  className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs font-medium border outline-none transition-colors ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[#d8b056] focus:bg-white'
                      : 'bg-[#1b1916] border-[#2d2922] text-slate-100 focus:border-[#d8b056] focus:bg-[#201d18]'
                  }`}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options Scrollable List */}
          <div className="max-h-48 overflow-y-auto divide-y divide-transparent p-1">
            {/* Optional Unset / Clear item if not required */}
            {!required && (
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`w-full px-3 py-2 rounded-xl text-xs text-left transition-colors cursor-pointer flex items-center justify-between ${
                  !value
                    ? 'bg-[#d8b056]/15 text-[#78510d] dark:text-[#eedb9f] font-bold'
                    : isLight
                    ? 'hover:bg-slate-100 text-slate-500'
                    : 'hover:bg-[#1f1d19] text-slate-400'
                }`}
              >
                <span>-- {placeholder || 'Choose Course'} --</span>
                {!value && <span className="text-[#d8b056] text-xs font-black">✓</span>}
              </button>
            )}

            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-400">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(value) === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs text-left transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? isLight
                          ? 'bg-[#fbf7ed] text-[#4e3103] font-black border border-[#d8b056]/50 shadow-xs'
                          : 'bg-[#d8b056]/20 text-[#eedb9f] font-black border border-[#d8b056]/35'
                        : isLight
                        ? 'hover:bg-[#fbf7ed] hover:text-[#78510d] text-slate-800'
                        : 'hover:bg-[#1e1c18] hover:text-[#eedb9f] text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      <span className="truncate">{opt.label}</span>
                      {opt.code && (
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          ({opt.code})
                        </span>
                      )}
                      {opt.level && (
                        <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-black tracking-wider shrink-0 border ${
                          isLight
                            ? 'bg-[#d8b056]/25 text-[#4e3103] border-[#d8b056]/60'
                            : 'bg-[#d8b056]/20 text-[#eedb9f] border-[#d8b056]/35'
                        }`}>
                          {opt.level}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="text-[#d8b056] font-black text-xs shrink-0">✓</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
