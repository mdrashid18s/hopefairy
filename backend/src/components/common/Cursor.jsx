'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Trailing dot + ring cursor. Auto-disables on touch devices and for
 * users who prefer reduced motion.
 */
export default function Cursor() {
  const ring = useRef(null);
  const dot = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;
    setEnabled(true);

    let rx = window.innerWidth / 2;
    let ry = window.innerHeight / 2;
    let x = rx;
    let y = ry;
    let raf = 0;

    const move = (e) => {
      x = e.clientX;
      y = e.clientY;
      if (dot.current) dot.current.style.transform = `translate(${x}px, ${y}px)`;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const isInteractive = (t) =>
      t.closest('a, button, input, textarea, select, [data-cursor]');
    const over = (e) => {
      if (ring.current) ring.current.dataset.active = isInteractive(e.target) ? '1' : '0';
    };
    // Runs only while the ring is catching up with the pointer; stops once settled
    // (an always-on loop kept the main thread busy every frame)
    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.3 ? requestAnimationFrame(loop) : 0;
    };

    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseover', over, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dot}
        className="pointer-events-none fixed left-0 top-0 z-[90] -ml-1 -mt-1 h-2 w-2 rounded-full bg-brand-300 mix-blend-difference"
      />
      <div
        ref={ring}
        data-active="0"
        className="pointer-events-none fixed left-0 top-0 z-[90] -ml-4 -mt-4 h-8 w-8 rounded-full border border-hair/40 transition-[width,height,margin,background-color] duration-200 mix-blend-difference data-[active=1]:-ml-6 data-[active=1]:-mt-6 data-[active=1]:h-12 data-[active=1]:w-12 data-[active=1]:bg-tint/10"
      />
    </>
  );
}
