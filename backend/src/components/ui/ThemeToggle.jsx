'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext.jsx';

/** @param {{className?:string, onDark?:boolean}} p — `onDark`: sitting over the always-black hero. */
export default function ThemeToggle({ className = '', onDark = false }) {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className={`relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border transition-colors ${
        onDark
          ? 'border-white/20 bg-white/10 text-white hover:border-brand-400/60'
          : 'border-hair/15 bg-tint/5 text-fg hover:border-brand-400/60'
      } ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 14, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="absolute"
        >
          {dark ? (
            <Moon className="h-[18px] w-[18px]" strokeWidth={1.75} />
          ) : (
            <Sun className="h-[18px] w-[18px]" strokeWidth={1.75} />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
