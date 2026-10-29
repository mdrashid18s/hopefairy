'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Section from '../ui/Section.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';
import Icon from '../ui/Icon.jsx';
import FaqAside from './FaqAside.jsx';
import { getApiBaseUrl } from '../../services/httpClient.js';
import { faqs as staticFaqs, faqSection as copy } from '../../data/site.js';
import { easeOut } from '../../lib/motion.js';

export default function FAQ({ items: propItems, alt = true, variant, seq }) {
  const [open, setOpen] = useState(0);
  const [faqs, setFaqs] = useState(
    propItems && propItems.length > 0 ? propItems : staticFaqs
  );

  useEffect(() => {
    if (propItems && propItems.length > 0) {
      setFaqs(propItems);
      return;
    }

    let isMounted = true;
    const apiUrl = getApiBaseUrl();

    fetch(`${apiUrl}/api/faqs`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        const list = json?.data?.items || json?.data;
        if (Array.isArray(list) && list.length > 0) {
          const normalized = list.map((f) => ({
            q: f.question || f.q,
            a: f.answer || f.a,
          }));
          setFaqs(normalized);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [propItems]);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  return (
    <Section id="faq" alt={alt} variant={variant} seq={seq}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:-mt-10">
          <SectionHeading
            eyebrow={copy.eyebrow}
            title={copy.title}
            intro={copy.intro}
            highlightLast={2}
          />
          <FaqAside />
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal
                key={f.q || i}
                i={i}
                // Same slab look as Card3D, without the tilt (it's an accordion).
                className={`card-3d rounded-2xl ${
                  isOpen ? '!border-brand-400/50 !bg-brand-50 dark:!bg-ink-800' : ''
                }`}
              >
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    title={isOpen ? `Collapse question: ${f.q}` : `Expand answer: ${f.q}`}
                    aria-label={f.q}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-5 text-left text-sm sm:text-base font-semibold text-fg"
                  >
                    {f.q}
                    <span
                      className={`inline-flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        isOpen
                          ? 'rotate-45 border-transparent bg-brand-400 text-ink-950'
                          : 'border-brand-400/40 text-brand-600 dark:text-brand-300'
                      }`}
                    >
                      <Icon name="plus" className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.25} />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: easeOut }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 sm:px-6 sm:pb-6 text-xs sm:text-sm leading-relaxed text-fg-muted">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
