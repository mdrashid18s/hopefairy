'use client';

import { useState, useEffect } from 'react';
import Marquee from '../ui/Marquee.jsx';
import Sparkle from '../ui/Sparkle.jsx';
import { getApiBaseUrl } from '../../services/httpClient.js';
import { destinations as staticDestinations } from '../../data/site.js';

/** Full-bleed kinetic strip of study destinations connected to live backend API. */
export default function DestinationsTicker({ destinations: propDestinations }) {
  const [items, setItems] = useState(
    propDestinations && propDestinations.length > 0 ? propDestinations : staticDestinations
  );

  useEffect(() => {
    if (propDestinations && propDestinations.length > 0) {
      setItems(propDestinations);
      return;
    }

    let isMounted = true;
    const apiUrl = getApiBaseUrl();

    fetch(`${apiUrl}/api/destinations`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        const list = json?.data?.items || json?.data;
        if (Array.isArray(list) && list.length > 0) {
          setItems(list);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [propDestinations]);

  return (
    <div className="relative border-y border-brand-400/15 bg-surface/50 py-3 sm:py-2.5 my-2 sm:my-0 dark:bg-ink-900/60">
      <Marquee speed="slow">
        {items.map((d) => (
          <span key={d.slug || d.id || d.name} className="flex items-center gap-5 pr-5">
            <span className="text-xs font-medium tracking-wide text-fg/85 sm:text-sm">
              Study in <span className="text-gradient-brand">{d.name}</span>
            </span>
            <Sparkle size={8} className="text-brand-500" />
          </span>
        ))}
      </Marquee>
    </div>
  );
}
