'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A soft glowing circle that trails the mouse pointer around the homepage
 * — an ambient decorative accent, distinct from the small functional
 * cursor dot/ring in components/common/Cursor.jsx. Desktop-only; disabled
 * for touch input and prefers-reduced-motion.
 */
export default function PointerGlow() {
  const circle = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;
    setEnabled(true);

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let x = tx;
    let y = ty;
    let raf = 0;

    // Runs only while the glow is catching up with the pointer; stops once settled
    const loop = () => {
      x += (tx - x) * 0.1;
      y += (ty - y) * 0.1;
      if (circle.current) circle.current.style.transform = `translate(${x}px, ${y}px)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(loop) : 0;
    };
    const move = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={circle}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-30 -ml-10 -mt-10 h-20 w-20 rounded-full bg-gradient-to-br from-brand-300/25 to-brand-600/15 blur-xl"
    />
  );
}
