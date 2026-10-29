'use client';

import { useEffect, useState } from 'react';
import { FlagBadge } from './Flag.jsx';

// The full flag set is a separate chunk, downloaded only if a page needs a flag that is not
// in Flag.jsx's common list. Cached after the first load.
let allFlags = null;
const loadAllFlags = () => (allFlags ??= import('country-flag-icons/react/3x2'));

export default function LazyFlag({ code, title, className, svgProps }) {
  const [Cmp, setCmp] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let alive = true;
    loadAllFlags().then((mod) => {
      if (!alive) return;
      if (mod[code]) setCmp(() => mod[code]);
      else setMissing(true);
    });
    return () => {
      alive = false;
    };
  }, [code]);

  if (Cmp) return <Cmp {...svgProps} />;
  // same box as the flag while loading, two-letter badge if the code is unknown
  return missing ? (
    <FlagBadge code={code} title={title} className={className} />
  ) : (
    <span aria-hidden className={`block ${className}`} />
  );
}
