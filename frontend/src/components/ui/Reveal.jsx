'use client';

import { motion } from 'framer-motion';
import { fadeUp, viewport } from '../../lib/motion.js';

/** Scroll-into-view fade + rise. */
export default function Reveal({ children, i = 0, as = 'div', className = '', ...props }) {
  const M = motion[as] || motion.div;
  return (
    <M
      className={className}
      variants={fadeUp}
      custom={i}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      {...props}
    >
      {children}
    </M>
  );
}
