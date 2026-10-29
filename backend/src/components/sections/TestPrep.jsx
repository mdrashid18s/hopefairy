import Section from '../ui/Section.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';
import Icon from '../ui/Icon.jsx';
import Flag from '../ui/Flag.jsx';
import Sparkle from '../ui/Sparkle.jsx';
import Card3D, { Lift } from '../ui/Card3D.jsx';
import MagneticButton from '../ui/MagneticButton.jsx';
import { testPrep, homeOnly } from '../../data/site.js';

export default function TestPrep({ heading = true, showPageLink = true, variant, seq, alt }) {
  const d = testPrep;
  const programs = d.featuredPrograms || [];
  const imat = programs[0] || d.featured;
  const sat = programs[1];
  const celpip = programs[2];

  return (
    <Section id="test-prep" variant={variant} seq={seq} alt={alt}>
      {heading && (
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow={d.eyebrow} title={d.title} intro={d.intro} highlightLast={2} />
          {showPageLink && !homeOnly && (
            <Reveal i={2}>
              <MagneticButton
                to="/test-prep"
                variant="ghost"
                title="View All Test Prep Coaching Programs — IMAT, SAT, CELPIP, IELTS & GMAT"
                aria-label="View all test preparation courses"
              >
                {d.button || 'View All Programs'}
              </MagneticButton>
            </Reveal>
          )}
        </div>
      )}

      {/* Featured Grid: Flagship IMAT on left, SAT & CELPIP on right */}
      <div className={`${heading ? 'mt-4 sm:mt-12' : ''} grid gap-3 sm:gap-6 lg:grid-cols-[1.3fr_1fr]`}>
        {/* ---- 1. IMAT: Featured Study Medicine in Italy ---- */}
        <Reveal>
          <Card3D surface="dark" radius="rounded-2xl sm:rounded-3xl" tilt={4} className="h-full flex-col justify-between p-3.5 sm:p-7 md:p-10">
            <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-brand-400/20 blur-[70px] sm:blur-[90px]" />
            <Sparkle size={12} className="pointer-events-none absolute right-8 top-12 sm:top-24 text-brand-300/60" />

            <div>
              <Lift depth="md" className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-brand-400/40 bg-brand-400/10 px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[0.7rem] font-semibold uppercase tracking-wider sm:tracking-[0.2em] text-brand-200">
                  <Sparkle size={9} className="text-brand-300" />
                  {imat.tag || '★ FEATURED · STUDY MEDICINE IN ITALY'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-white/70">
                  <Flag code={imat.flag || 'IT'} className="h-3.5 w-5 sm:h-4 sm:w-6 rounded-[2px] ring-1 ring-white/20" />
                  Italy
                </span>
              </Lift>

              <Lift depth="lg" className="mt-2.5 sm:mt-8">
                <p className="text-gold text-2xl sm:text-6xl md:text-7xl font-extrabold leading-none tracking-tight">{imat.code}</p>
                <p className="mt-1 sm:mt-3 text-xs sm:text-lg font-semibold text-white">{imat.name}</p>
                <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-sm font-medium text-brand-200 leading-snug">{imat.headline || imat.tagline}</p>
              </Lift>

              <Lift depth="sm" className="mt-2 sm:mt-5">
                <p className="max-w-xl text-[10.5px] sm:text-sm leading-relaxed text-white/65 line-clamp-2 sm:line-clamp-none">{imat.text}</p>
                {imat.subjects && (
                  <div className="mt-2 sm:mt-5 flex flex-wrap gap-1 sm:gap-2">
                    {imat.subjects.map((sub) => (
                      <span
                        key={sub}
                        className="rounded-full border border-white/15 bg-white/[0.06] px-2 sm:px-3 py-0.5 sm:py-1 text-[9.5px] sm:text-xs font-medium text-white/85"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                )}
              </Lift>
            </div>

            <Lift depth="lg" className="mt-3.5 sm:mt-8 pt-1 sm:pt-4">
              <MagneticButton
                to="/contact-us?interest=Test+Prep"
                className="btn-primary !py-2 !px-4 text-xs sm:text-sm w-full sm:w-auto justify-center"
                icon="arrow-right"
                title="Enquire About IMAT Coaching for English-Taught Medicine at Italy Public Universities"
                aria-label="Enquire about IMAT test prep coaching"
              >
                {imat.cta || 'Enquire About IMAT'}
              </MagneticButton>
            </Lift>
          </Card3D>
        </Reveal>

        {/* ---- 2. SAT & 3. CELPIP Featured Cards ---- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-6">
          {sat && (
            <Reveal i={1} className="flex-1">
              <Card3D radius="rounded-2xl sm:rounded-3xl" className="h-full flex-col justify-between p-4 sm:p-6 md:p-7">
                <div>
                  <Lift depth="md" className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-400/30 bg-brand-400/10 px-2.5 py-0.5 text-[9px] sm:text-[0.68rem] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                      <Sparkle size={8} className="text-brand-400 shrink-0" />
                      {sat.tag}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Flag code={sat.flag} className="h-3.5 w-5 sm:h-4 sm:w-6 rounded-[2px] ring-1 ring-black/10 dark:ring-white/10" />
                    </div>
                  </Lift>
                  <Lift depth="lg" className="mt-2.5 sm:mt-4">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight text-fg leading-none">{sat.code}</h3>
                      <p className="text-xs font-medium text-fg-faint">{sat.name}</p>
                    </div>
                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-semibold text-fg leading-snug">{sat.headline}</p>
                    <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-fg-muted">{sat.text}</p>
                  </Lift>
                  {sat.subjects && (
                    <Lift depth="sm" className="mt-2.5 sm:mt-3 flex flex-wrap gap-1.5">
                      {sat.subjects.slice(0, 3).map((sub) => (
                        <span
                          key={sub}
                          className="rounded-full border border-brand-400/20 bg-brand-400/[0.05] px-2.5 py-0.5 text-[9.5px] sm:text-[11px] font-medium text-fg-muted"
                        >
                          {sub}
                        </span>
                      ))}
                    </Lift>
                  )}
                </div>
                <Lift depth="sm" className="mt-3.5 sm:mt-5 pt-2 border-t border-hair/10">
                  <MagneticButton
                    to="/contact-us?interest=Test+Prep"
                    variant="ghost"
                    icon="arrow-right"
                    title="Enquire About Digital SAT Coaching & Score Improvement"
                    aria-label="Enquire about SAT test prep coaching"
                    className="!py-2 !px-4 text-xs font-bold w-full sm:w-auto justify-center"
                  >
                    Enquire SAT
                  </MagneticButton>
                </Lift>
              </Card3D>
            </Reveal>
          )}

          {celpip && (
            <Reveal i={2} className="flex-1">
              <Card3D radius="rounded-2xl sm:rounded-3xl" className="h-full flex-col justify-between p-4 sm:p-6 md:p-7">
                <div>
                  <Lift depth="md" className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-400/30 bg-brand-400/10 px-2.5 py-0.5 text-[9px] sm:text-[0.68rem] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                      <Sparkle size={8} className="text-brand-400 shrink-0" />
                      {celpip.tag}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Flag code={celpip.flag} className="h-3.5 w-5 sm:h-4 sm:w-6 rounded-[2px] ring-1 ring-black/10 dark:ring-white/10" />
                    </div>
                  </Lift>
                  <Lift depth="lg" className="mt-2.5 sm:mt-4">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight text-fg leading-none">{celpip.code}</h3>
                      <p className="text-xs font-medium text-fg-faint">{celpip.name}</p>
                    </div>
                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-semibold text-fg leading-snug">{celpip.headline}</p>
                    <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-fg-muted">{celpip.text}</p>
                  </Lift>
                  {celpip.subjects && (
                    <Lift depth="sm" className="mt-2.5 sm:mt-3 flex flex-wrap gap-1.5">
                      {celpip.subjects.slice(0, 4).map((sub) => (
                        <span
                          key={sub}
                          className="rounded-full border border-brand-400/20 bg-brand-400/[0.05] px-2.5 py-0.5 text-[9.5px] sm:text-[11px] font-medium text-fg-muted"
                        >
                          {sub}
                        </span>
                      ))}
                    </Lift>
                  )}
                </div>
                <Lift depth="sm" className="mt-3.5 sm:mt-5 pt-2 border-t border-hair/10">
                  <MagneticButton
                    to="/contact-us?interest=Test+Prep"
                    variant="ghost"
                    icon="arrow-right"
                    title="Enquire About CELPIP General Test Coaching for Canadian PR & Immigration"
                    aria-label="Enquire about CELPIP coaching"
                    className="!py-2 !px-4 text-xs font-bold w-full sm:w-auto justify-center"
                  >
                    Enquire CELPIP
                  </MagneticButton>
                </Lift>
              </Card3D>
            </Reveal>
          )}
        </div>
      </div>

      {/* ALSO OFFERED: GMAT & IELTS */}
      <Reveal className="mt-5 sm:mt-8">
        <div className="flex flex-col items-center justify-between gap-3 sm:gap-6 rounded-2xl sm:rounded-3xl border border-hair/15 bg-surface/70 p-3.5 sm:p-8 backdrop-blur-xl sm:flex-row dark:bg-tint/[0.03]">
          <div className="space-y-1 sm:space-y-2 text-center sm:text-left w-full sm:w-auto">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-300">
              Also Offered
            </span>
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-x-6 sm:gap-y-2 text-xs sm:text-sm text-fg-muted">
              <div>
                <strong className="text-fg font-bold">GMAT</strong> — for MBA and business master&apos;s worldwide.
              </div>
              <div className="hidden sm:inline text-hair/30">•</div>
              <div>
                <strong className="text-fg font-bold">IELTS</strong> — English for study, work and migration.
              </div>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto mt-1 sm:mt-0">
            <MagneticButton
              to="/contact-us?interest=Test+Prep"
              icon="arrow-right"
              title="Enquire About GMAT & IELTS Coaching for Global University Admissions"
              aria-label="Enquire about test prep programs"
              className="!py-1.5 !px-3.5 text-xs w-full sm:w-auto justify-center"
            >
              {d.button || 'View All Programs'}
            </MagneticButton>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
