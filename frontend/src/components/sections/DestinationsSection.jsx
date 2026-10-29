'use client';

import { useState, useEffect } from 'react';
import Section from '../ui/Section.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';
import MagneticButton from '../ui/MagneticButton.jsx';
import DestinationCard, { getCountryTitle } from './DestinationCard.jsx';
import { getApiBaseUrl } from '../../services/httpClient.js';
import { destinations as staticDestinations, destinationsSection as copy, moreDestinations, homeOnly } from '../../data/site.js';

/**
 * Homepage "Study Destinations" grid.
 * Dynamically renders active countries from the Laravel REST API backend,
 * falling back gracefully to static configuration if offline.
 *
 * @param {{destinations?: any[]}} props
 */
export default function DestinationsSection({ destinations: propDestinations, alt = false, variant, seq }) {
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
      .catch(() => {
        // Keeps staticDestinations gracefully
      });

    return () => {
      isMounted = false;
    };
  }, [propDestinations]);

  return (
    <Section id="destinations" alt={alt} variant={variant} seq={seq} className="!pt-6 sm:!pt-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          eyebrow={copy.eyebrow}
          title={copy.title}
          intro={copy.intro}
          highlightLast={3}
        />
        {!homeOnly && (
          <Reveal i={2}>
            <MagneticButton
              to="/destinations"
              variant="ghost"
              title="Compare all study abroad destinations: UK, USA, Canada, Germany, Australia & Ireland"
              aria-label="Compare all study destinations"
            >
              {copy.button}
            </MagneticButton>
          </Reveal>
        )}
      </div>

      <div className="mt-6 sm:mt-12 grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4 items-stretch">
        {items.map((d, i) => (
          <Reveal key={d.slug || d.id || i} i={i % 4} className="h-full">
            <DestinationCard destination={d} />
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-8 text-center text-sm text-fg-muted">
        {copy.notePrefix}{' '}
        <span className="font-medium text-fg">
          {moreDestinations.map((country, idx) => (
            <span key={country}>
              <span
                className="cursor-help hover:text-brand-600 dark:hover:text-brand-300 transition-colors underline decoration-dotted decoration-hair/40 underline-offset-2"
                title={getCountryTitle({ name: country })}
              >
                {country}
              </span>
              {idx < moreDestinations.length - 1 ? ', ' : ''}
            </span>
          ))}
        </span>{' '}
        {copy.noteSuffix}
      </Reveal>
    </Section>
  );
}
