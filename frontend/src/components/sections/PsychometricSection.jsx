'use client';

import { useState, useEffect } from 'react';
import Section from '../ui/Section.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';
import Icon from '../ui/Icon.jsx';
import Sparkle from '../ui/Sparkle.jsx';
import MagneticButton from '../ui/MagneticButton.jsx';
import { psychometricService } from '../../services/psychometricService.js';
import { psychometricSection as initialData } from '../../data/site.js';

export default function PsychometricSection({ alt = true, variant, seq }) {
  const [d, setD] = useState(initialData);

  useEffect(() => {
    let active = true;
    psychometricService.getSectionData().then((res) => {
      if (active && res) {
        setD(res);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Section id="psychometric-test" alt={alt} variant={variant} seq={seq} className="relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/10 blur-[130px] -z-10" />

      {/* 1. HopeFairy Compass Header */}
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
        <SectionHeading
          eyebrow={d.eyebrow || 'HopeFairy Compass'}
          title={
            <>
              {d.title || 'Your Potential.'}{' '}
              <span className="text-gradient-brand block sm:inline mt-1 sm:mt-0">
                {d.headlineAccent || 'Design Your Future.'}
              </span>
            </>
          }
          intro={d.intro}
          align="center"
          className="max-w-3xl"
        />

        {/* Action Button Strip */}
        <Reveal i={2} className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <MagneticButton
            href={psychometricService.getWhatsAppConsultationUrl()}
            external
            icon="message-circle"
            title="Book 1-on-1 Career Counselling & Psychometric Consultation via WhatsApp"
            aria-label="Book one-on-one career consultation with HopeFairy counsellor"
            className="btn-primary !py-3.5 !px-8 text-sm font-bold shadow-lg shadow-amber-500/25"
          >
            {d.ctaPrimary || 'Book One to One Consultation'}
          </MagneticButton>
        </Reveal>

        {/* Trust Badges Strip — Mobile: 2 in first row, 1 centered in second row; Desktop: 1 clean row */}
        <Reveal i={3} className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 w-full">
          {/* Row 1 on mobile (2 items side-by-side) */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-3 max-w-full">
            {d.trustBadges?.slice(0, 2).map((badge, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 sm:gap-2 rounded-full border border-hair/10 bg-surface/80 px-2.5 min-[380px]:px-3 sm:px-3.5 py-1 sm:py-1.5 text-[10.5px] min-[380px]:text-[11px] sm:text-xs font-semibold text-fg-muted shadow-xs backdrop-blur-md dark:bg-tint/[0.04] whitespace-nowrap"
              >
                <Icon name={badge.icon} className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-brand-500 shrink-0" />
                <span>{badge.label}</span>
              </span>
            ))}
          </div>

          {/* Row 2 on mobile (1 item centered on next line) */}
          {d.trustBadges && d.trustBadges.length > 2 && (
            <div className="flex items-center justify-center gap-1.5 sm:gap-3">
              {d.trustBadges.slice(2).map((badge, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 sm:gap-2 rounded-full border border-hair/10 bg-surface/80 px-2.5 min-[380px]:px-3 sm:px-3.5 py-1 sm:py-1.5 text-[10.5px] min-[380px]:text-[11px] sm:text-xs font-semibold text-fg-muted shadow-xs backdrop-blur-md dark:bg-tint/[0.04] whitespace-nowrap"
                >
                  <Icon name={badge.icon} className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-brand-500 shrink-0" />
                  <span>{badge.label}</span>
                </span>
              ))}
            </div>
          )}
        </Reveal>
      </div>

      {/* 3. 4 Core Dimensions Evaluated (Preserved) */}
      <div className="mt-5 sm:mt-14 grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-4">
        {d.pillars.map((pillar, i) => (
          <Reveal key={pillar.num} i={i}>
            <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-hair/15 bg-surface/70 p-3 sm:p-6 sm:p-7 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/50 hover:shadow-card dark:bg-tint/[0.03]">
              {/* Corner ambient shine on hover */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand-400/0 transition-all duration-300 group-hover:bg-brand-400/15 group-hover:blur-2xl" />

              <div>
                <div className="flex items-center justify-between">
                  <span className="icon-3d h-9 w-9 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl shrink-0">
                    <Icon name={pillar.icon} className="h-4.5 w-4.5 sm:h-6 sm:w-6" />
                  </span>
                  <span className="font-mono text-base sm:text-2xl font-black tracking-tighter text-hair/20 group-hover:text-brand-400/60 transition-colors">
                    {pillar.num}
                  </span>
                </div>

                <h3 className="mt-2.5 sm:mt-6 text-xs sm:text-lg font-bold tracking-tight text-fg group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors leading-snug">
                  {pillar.title}
                </h3>
                <p className="mt-1 sm:mt-2 text-[10.5px] sm:text-xs leading-snug sm:leading-relaxed text-fg-muted line-clamp-3 sm:line-clamp-none">
                  {pillar.short}
                </p>
              </div>

              <div className="mt-2.5 sm:mt-6 pt-2 sm:pt-4 border-t border-hair/10 flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold text-brand-600 dark:text-brand-400">
                <span>Scientific Diagnostic</span>
                <Icon name="arrow-right" className="h-2.5 w-2.5 sm:h-3 sm:w-3 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* 4. Target Stages (Who Should Take It?) + CTA Banner (Preserved) */}
      <Reveal className="mt-5 sm:mt-12">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-brand-400/35 bg-gradient-to-br from-ink-950 via-[#13110e] to-ink-950 p-3.5 sm:p-7 md:p-10 text-white shadow-2xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-brand-400/20 blur-[100px]" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-60 w-60 rounded-full bg-brand-500/15 blur-[90px]" />
          <Sparkle size={12} className="pointer-events-none absolute right-8 top-8 text-brand-300/60" />

          <div className="relative flex flex-col justify-between gap-5 sm:gap-8 lg:flex-row lg:items-center">
            {/* Left side: Stage alignment */}
            <div className="max-w-2xl">
              <span className="eyebrow !text-brand-300 text-[10px] sm:text-xs">
                <span className="h-px w-5 sm:w-6 bg-gradient-to-r from-transparent to-brand-400" />
                Tailored By Academic Level
              </span>
              <h3 className="mt-1.5 sm:mt-3 text-lg sm:text-3xl font-bold text-white leading-tight">
                Who Is HopeFairy Compass For?
              </h3>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-white/70 leading-snug">
                Whether selecting a Class 11 stream or picking a Master&apos;s specialization abroad, get 100% clarity backed by data.
              </p>

              <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3">
                {d.stages.map((stage, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.05] p-2.5 sm:p-3.5 backdrop-blur-md ${
                      idx === 2 ? 'col-span-2 sm:col-span-1' : 'col-span-1'
                    }`}
                  >
                    <span className="block text-[10px] sm:text-xs font-bold text-brand-300">{stage.grade}</span>
                    <span className="mt-0.5 sm:mt-1 block text-xs sm:text-sm font-semibold text-white leading-tight">{stage.badge}</span>
                    <p className="mt-1 text-[9.5px] sm:text-[11px] leading-snug text-white/60">{stage.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: Action Card */}
            <div className="shrink-0 flex flex-col gap-2.5 sm:gap-3 sm:flex-row lg:flex-col items-stretch justify-center pt-2 sm:pt-0">
              <MagneticButton
                href={psychometricService.getWhatsAppConsultationUrl('Hi HopeFairy, I am interested in the HopeFairy Compass one-to-one consultation.')}
                external
                icon="message-circle"
                title="Chat on WhatsApp to Book HopeFairy Compass Assessment & 1-on-1 Consultation"
                aria-label="Book HopeFairy Compass assessment and consultation via WhatsApp"
                className="btn-primary !py-2.5 !px-5 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 whitespace-nowrap justify-center"
              >
                {d.ctaPrimary || 'Book One to One Consultation'}
              </MagneticButton>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
