'use client';

import { motion } from 'framer-motion';

const container = {
  hidden: {},
  show: (stagger = 0.06) => ({
    transition: { staggerChildren: stagger },
  }),
};

const word = {
  hidden: { y: '110%' },
  show: { y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Animated heading — each word rises + fades in on scroll into view.
 * `highlightLast` colors the trailing N words with the brand gradient, for
 * a bit of color/styling variety instead of every title being flat text-fg.
 */
export default function WordsReveal({
  text,
  as = 'h2',
  className = '',
  stagger = 0.06,
  highlightLast = 0,
}) {
  const Tag = motion[as] || motion.h2;
  const words = String(text).split(' ');
  return (
    <Tag
      className={className}
      variants={container}
      custom={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      aria-label={text}
    >
      {words.map((w, i) => {
        const highlighted = highlightLast > 0 && i >= words.length - highlightLast;
        return (
          // The space between words is a plain sibling text node, deliberately
          // OUTSIDE the overflow-hidden clipping box below — some browsers
          // trim trailing whitespace when sizing an inline-block, which would
          // otherwise silently swallow the space and run words together.
          <span key={i}>
            <span className="inline-block overflow-hidden pb-[0.12em] align-bottom">
              <motion.span
                className={`inline-block ${highlighted ? 'text-gradient-brand' : ''}`}
                variants={word}
              >
                {w}
              </motion.span>
            </span>
            {i < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </Tag>
  );
}
