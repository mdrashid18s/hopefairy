'use client';

import { useRef } from 'react';

/**
 * Pointer-follow 3D tilt wrapper with a moving light sheen.
 * Disabled for touch / reduced-motion via CSS-only fallback (no JS harm).
 */
export default function TiltCard({ children, className = '', max = 8, radius = 'rounded-2xl' }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${(0.5 - py) * max}deg`);
    el.style.setProperty('--ry', `${(px - 0.5) * max}deg`);
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
  };
  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <div style={{ perspective: '1000px' }} className={className}>
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={reset}
        className={`group/tilt relative h-full w-full flex flex-col flex-1 ${radius} transition-transform duration-200 ease-out will-change-transform`}
        style={{
          transform: 'rotateX(var(--rx,0)) rotateY(var(--ry,0))',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className={`pointer-events-none absolute inset-0 z-20 ${radius} opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100`}
          style={{
            background:
              'radial-gradient(320px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.10), transparent 45%)',
          }}
        />
        {children}
      </div>
    </div>
  );
}
