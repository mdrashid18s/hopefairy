'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Section from '../ui/Section.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';
import Icon from '../ui/Icon.jsx';
import Card3D, { Lift } from '../ui/Card3D.jsx';
import SmartLink from '../ui/SmartLink.jsx';
import MagneticButton from '../ui/MagneticButton.jsx';
import { getApiBaseUrl } from '../../services/httpClient.js';
import { indiaAdmissions, counsellingLink, homeOnly } from '../../data/site.js';

const LEVELS = [
  { key: 'ug', label: 'Undergraduate' },
  { key: 'pg', label: 'Postgraduate' },
];

/**
 * Admission consulting for Indian institutions — one card per stream, with
 * an Undergraduate / Postgraduate switch for programs and entrance exams.
 * @param {{heading?: boolean, showPageLink?: boolean}} props
 */
export default function IndiaAdmissions({ heading = true, showPageLink = true, variant, seq, alt }) {
  const [level, setLevel] = useState('ug');
  const d = indiaAdmissions;
  const [streams, setStreams] = useState(d.streams || []);

  useEffect(() => {
    let isMounted = true;
    const apiUrl = getApiBaseUrl();

    fetch(`${apiUrl}/api/india-admissions`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        const apiStreams = json?.data?.streams || json?.data;
        if (Array.isArray(apiStreams) && apiStreams.length > 0) {
          // Normalize streams from API
          const normalized = apiStreams.map((s) => ({
            slug: s.slug || s.title?.toLowerCase().replace(/\s+/g, '-'),
            name: s.name || s.title,
            icon: s.icon || 'book-open',
            text: s.text || s.description || s.tagline || '',
            ug: s.ug || {
              programs: s.ug_programs || [],
              exams: s.ug_exams || [],
            },
            pg: s.pg || {
              programs: s.pg_programs || [],
              exams: s.pg_exams || [],
            },
          }));
          setStreams(normalized);
        }
      })
      .catch((err) => {
        // Graceful fallback to static site.js
        console.warn('Live India Admissions fetch error, using static fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Section id="india-admissions" variant={variant} seq={seq} alt={alt}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        {heading ? (
          <SectionHeading eyebrow={d.eyebrow} title={d.title} intro={d.intro} highlightLast={3} />
        ) : (
          <span />
        )}
        <Reveal i={2} className="flex items-center gap-2 sm:gap-3 flex-nowrap shrink-0">
          <LevelSwitch level={level} onChange={setLevel} />
          {showPageLink && !homeOnly && (
            <MagneticButton
              to="/india-admissions"
              variant="ghost"
              title="Explore Engineering, Medical, Law and Management Admissions in India"
              aria-label="Explore admissions in India"
              className="!py-1.5 !px-2.5 sm:!py-2.5 sm:!px-4 text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0"
            >
              {d.button}
            </MagneticButton>
          )}
        </Reveal>
      </div>

      <div className="mt-6 sm:mt-12 grid grid-cols-2 gap-2 sm:gap-6 lg:grid-cols-3">
        {streams.map((s, i) => (
          <Reveal key={s.slug || i} i={i % 3}>
            <StreamCard stream={s} level={level} />
          </Reveal>
        ))}

        {/* completes the grid with a clear next step */}
        <Reveal i={2}>
          <Card3D
            as={SmartLink}
            {...counsellingLink}
            surface="gold"
            title="Book Free Counselling for Indian College Admissions (JEE, NEET, CUET, CLAT)"
            aria-label="Book free counselling for Indian college admissions"
            className="min-h-[135px] sm:min-h-[15rem] flex-col justify-between p-2.5 sm:p-7"
          >
            <Lift depth="lg" className="flex items-center gap-2 sm:gap-3">
              <span className="inline-flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-2xl bg-ink-950 text-brand-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_3px_0_-1px_rgba(0,0,0,0.5)] shrink-0">
                <Icon name="compass" className="h-4 w-4 sm:h-6 sm:w-6" />
              </span>
              <span className="block text-xs sm:text-xl font-bold leading-tight sm:hidden">{d.ctaTitle}</span>
            </Lift>
            <Lift depth="sm" className="mt-2 sm:mt-auto">
              <span className="hidden sm:block text-xl sm:text-2xl font-semibold leading-tight">{d.ctaTitle}</span>
              <span className="mt-1 sm:mt-2 block text-[10px] sm:text-sm text-ink-950/75 line-clamp-2 sm:line-clamp-none">{d.ctaText}</span>
              <span className="mt-2 sm:mt-5 inline-flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm font-bold">
                {d.ctaButton}
                <Icon name="arrow-right" className="h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover/card3d:translate-x-1" />
              </span>
            </Lift>
          </Card3D>
        </Reveal>
      </div>
    </Section>
  );
}

function LevelSwitch({ level, onChange }) {
  return (
    <div role="tablist" aria-label="Program level" className="card-3d inline-flex rounded-full p-0.5 sm:p-1 shrink-0">
      {LEVELS.map((l) => {
        const active = level === l.key;
        return (
          <button
            key={l.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(l.key)}
            className={`relative rounded-full px-2.5 sm:px-4 py-1 sm:py-2 text-[11px] sm:text-sm font-semibold transition-colors shrink-0 whitespace-nowrap ${
              active ? 'text-ink-950 font-bold' : 'text-fg-muted hover:text-fg'
            }`}
          >
            {active && (
              <motion.span
                layoutId="india-level-pill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-300 to-brand-500 shadow-xs"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{l.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function StreamCard({ stream: s, level }) {
  const info = s?.[level] || { programs: [], exams: [] };
  const programsList = Array.isArray(info.programs) ? info.programs : [];
  const examsText = Array.isArray(info.exams)
    ? info.exams.join(' · ')
    : (info.exams || 'Direct Admission / Merit');

  return (
    <Card3D className="flex-col p-2.5 sm:p-7 h-full justify-between">
      <div>
        <Lift depth="lg" className="flex items-center gap-2 sm:gap-4">
          <span className="icon-3d h-7 w-7 sm:h-12 sm:w-12 rounded-lg sm:rounded-2xl shrink-0">
            <Icon name={s.icon || 'book-open'} className="h-3.5 w-3.5 sm:h-6 sm:w-6" />
          </span>
          <h3 className="text-xs sm:text-xl font-bold text-fg leading-tight truncate" title={s.name}>{s.name}</h3>
        </Lift>

        <Lift depth="sm" className="mt-2 sm:mt-4 flex flex-1 flex-col">
          <p className="text-[10px] sm:text-sm leading-snug sm:leading-relaxed text-fg-muted line-clamp-2">{s.text}</p>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={level}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="mt-2 sm:mt-4 flex flex-1 flex-col"
            >
              <span className="text-[8.5px] sm:text-[0.7rem] font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
                Programs
              </span>
              <div className="mb-1.5 sm:mb-4 mt-1 sm:mt-2 flex flex-wrap gap-1">
                {programsList.map((p) => (
                  <span
                    key={p}
                    className="rounded-full border border-brand-400/30 bg-brand-400/10 px-1.5 sm:px-2.5 py-0.5 text-[9px] sm:text-xs font-medium text-fg truncate max-w-[130px]"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </Lift>
      </div>

      <div className="mt-2 sm:mt-auto flex items-center gap-1 border-t border-hair/10 pt-1.5 sm:pt-3 text-[9px] sm:text-xs text-fg-body min-w-0">
        <Icon name="clipboard-check" className="h-3 w-3 sm:h-4 sm:w-4 shrink-0 text-brand-500" />
        <span className="truncate leading-tight">
          <span className="font-semibold">Exams:</span> {examsText}
        </span>
      </div>
    </Card3D>
  );
}
