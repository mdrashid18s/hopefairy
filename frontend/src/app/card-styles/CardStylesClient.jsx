'use client';

import Section from '../../components/ui/Section.jsx';
import DestinationCard, { CARD_STYLES } from '../../components/sections/DestinationCard.jsx';
import { destinations, countryCardStyle } from '../../data/site.js';

const NOTES = {
  compact: 'Full flag on the left, details on the right. Shortest card.',
  postcard: 'Flag across the top like a postcard, details below.',
  badge: 'Round flag badge with a gold ring, centred text.',
  luxe: 'Black and gold card — matches the hero and closing sections.',
  glass: 'Tinted with the flag’s own colours behind frosted glass.',
};

/** Every country-card style, one row each, for choosing a design. */
export default function CardStylesClient() {
  return (
    <div className="pt-24">
      {CARD_STYLES.map((style, i) => (
        <Section key={style} seq={i + 1} className={i === 0 ? '!pt-10' : '!pt-0'}>
          <div className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 className="text-2xl font-bold text-fg">
              {i + 1}. <span className="text-gradient-brand">{style}</span>
            </h2>
            <p className="text-sm text-fg-muted">{NOTES[style]}</p>
            {style === countryCardStyle && (
              <span className="rounded-full bg-brand-400 px-2.5 py-0.5 text-xs font-bold text-ink-950">
                On homepage now
              </span>
            )}
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {destinations.slice(0, 4).map((d) => (
              <DestinationCard key={d.slug} destination={d} variant={style} />
            ))}
          </div>
        </Section>
      ))}
    </div>
  );
}
