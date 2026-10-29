'use client';

import Section from '../ui/Section.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';
import Icon from '../ui/Icon.jsx';
import Flag from '../ui/Flag.jsx';
import Sparkle from '../ui/Sparkle.jsx';
import MagneticButton from '../ui/MagneticButton.jsx';
import { gulfDesk } from '../../data/site.js';

export default function GulfDeskTeaser({ variant, seq, alt, className = '' }) {
  const d = gulfDesk;
  const teaser = d.homeTeaser;

  return (
    <Section variant={variant} seq={seq} alt={alt} className={`!py-10 sm:!py-14 ${className}`}>
      <SectionHeading
        eyebrow="Specialized Advisory"
        title="NRI Admissions & Gulf Desk"
        intro="Dedicated admission consulting tailored to the curriculum, fee structures, and NRI quotas for Indian families across the GCC."
        highlightLast={2}
        className="mb-6 sm:mb-8"
      />
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-brand-400/35 bg-gradient-to-br from-ink-950 via-[#14120e] to-ink-950 p-4 sm:p-10 shadow-2xl text-white">
          {/* Ambient luxury glow and sparkles */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-400/20 blur-[90px]" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-brand-500/10 blur-[90px]" />
          <Sparkle size={12} className="pointer-events-none absolute right-12 top-10 text-brand-300/60" />
          <Sparkle size={8} className="pointer-events-none absolute left-10 bottom-8 text-brand-300/40" />

          <div className="relative flex flex-col items-start justify-between gap-5 sm:gap-6 lg:flex-row lg:items-center">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-400/40 bg-brand-400/10 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
                  {teaser.eyebrow}
                </span>
                <span className="rounded-full bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#0b0b0c]">
                  New
                </span>
              </div>

              <h3 className="mt-2.5 sm:mt-3 text-base sm:text-xl md:text-2xl font-semibold leading-snug text-white">
                <span className="text-gold font-bold">Dedicated Desk for the Gulf</span> — Indian families in the UAE, Kuwait, Bahrain, Qatar, Oman and Saudi Arabia: we help your children get into India&apos;s premier institutions.
              </h3>

              {/* Gulf country flags strip */}
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-white/70">
                <span className="text-white/50 text-[11px] sm:text-xs mr-1 font-medium">Serving:</span>
                {d.countries.map((c) => (
                  <span
                    key={c.code}
                    className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-medium text-white/90"
                  >
                    <Flag code={c.code} className="h-3 w-4 sm:h-3.5 sm:w-5 rounded-[2px] ring-1 ring-white/20" />
                    {c.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <MagneticButton
                to="/gulf-desk"
                variant="primary"
                title="Explore HopeFairy Gulf Desk for NRI Admissions in India's Premier Colleges"
                aria-label="Learn more about our dedicated Gulf Desk for NRI admissions"
                className="w-full sm:w-auto !px-5 sm:!px-6 !py-2.5 sm:!py-3 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 whitespace-nowrap justify-center"
              >
                {teaser.button}
              </MagneticButton>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
