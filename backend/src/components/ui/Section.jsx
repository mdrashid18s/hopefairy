'use client';

import { useRef, useEffect, useState } from 'react';

/**
 * Universal Section Component with 4-Color Luxury Sequential Rotation.
 *
 * Sequence Options:
 * - seq={n}: 1-indexed sequential step (1, 2, 3, 4, 5, 6...), automatically maps to variant 1..4.
 * - variant={1|2|3|4}: Directly targets a specific subtle theme tint.
 * - alt={true|false}: Legacy support (true -> variant 2, false -> variant 1).
 * - Automatic Fallback: If no props are supplied, automatically syncs with DOM position in <main>.
 */
export default function Section({
  id,
  className = '',
  children,
  containerClassName = '',
  variant,
  seq,
  alt,
  ...props
}) {
  const sectionRef = useRef(null);

  // Compute initial variant synchronously for 100% SSR / Zero-Flicker hydration
  const rawNum = variant ?? seq;
  const initialVariant =
    rawNum !== undefined && rawNum !== null
      ? (((Number(rawNum) - 1) % 4 + 4) % 4) + 1
      : alt === true
      ? 2
      : alt === false
      ? 1
      : null;

  const [activeVariant, setActiveVariant] = useState(initialVariant ?? 1);

  useEffect(() => {
    // If explicit sequence or variant was provided, keep it active
    if (rawNum !== undefined && rawNum !== null) {
      setActiveVariant((((Number(rawNum) - 1) % 4 + 4) % 4) + 1);
      return;
    }

    if (alt !== undefined && alt !== null) {
      setActiveVariant(alt ? 2 : 1);
      return;
    }

    // Automatic fallback: detect exact section index inside <main>
    if (sectionRef.current) {
      const allSections = Array.from(document.querySelectorAll('main section.hope-section'));
      const idx = allSections.indexOf(sectionRef.current);
      if (idx !== -1) {
        setActiveVariant((idx % 4) + 1);
      }
    }
  }, [rawNum, alt]);

  const resolved = activeVariant || 1;
  const variantClass = `bg-section-v${resolved}`;

  return (
    <section
      ref={sectionRef}
      id={id}
      data-hope-section
      data-section-variant={resolved}
      className={`hope-section relative scroll-mt-20 py-10 sm:py-14 md:py-20 w-full max-w-full overflow-hidden ${variantClass} ${className}`}
      {...props}
    >
      <div className={`container-x ${containerClassName}`}>{children}</div>
    </section>
  );
}
