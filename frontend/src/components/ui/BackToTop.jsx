'use client';

import { useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from 'framer-motion';
import Icon from './Icon.jsx';
import { easeOut } from '../../lib/motion.js';

// Only appears once the visitor has scrolled past the first screen.
const SHOW_AFTER = 400;

/**
 * Floating "back to top" button. The ring around the arrow fills as you
 * scroll down the page, so it doubles as a progress indicator. Drop it into
 * any page — it only depends on window scroll.
 */
export default function BackToTop() {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => setVisible(y > SHOW_AFTER));

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          title="Scroll smoothly back to top of page"
          aria-label="Back to top"
          onClick={toTop}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ duration: 0.3, ease: easeOut }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="group fixed bottom-4 right-3.5 z-40 inline-flex cursor-pointer h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-hair/10 bg-surface/90 text-brand-600 shadow-card backdrop-blur-xl transition-colors hover:bg-brand-400 hover:text-ink-950 dark:text-brand-300 dark:hover:text-ink-950 sm:bottom-8 sm:right-8"
        >
          <svg
            viewBox="0 0 48 48"
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
          >
            <circle
              cx="24"
              cy="24"
              r="21"
              fill="none"
              strokeWidth="2"
              className="stroke-hair/10 group-hover:stroke-ink-950/25"
            />
            <motion.circle
              cx="24"
              cy="24"
              r="21"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="stroke-brand-500 group-hover:stroke-ink-950"
              style={{ pathLength: progress }}
            />
          </svg>
          <Icon
            name="arrow-up"
            strokeWidth={2.25}
            className="relative h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
