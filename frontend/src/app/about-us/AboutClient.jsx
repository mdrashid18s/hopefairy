'use client';

import PageHeader from '../../components/sections/PageHeader.jsx';
import Section from '../../components/ui/Section.jsx';
import SectionHeading from '../../components/ui/SectionHeading.jsx';
import Reveal from '../../components/ui/Reveal.jsx';
import Icon from '../../components/ui/Icon.jsx';
import Sparkle from '../../components/ui/Sparkle.jsx';
import Logo from '../../components/layout/Logo.jsx';
import Card3D, { Lift } from '../../components/ui/Card3D.jsx';
import ProcessSteps from '../../components/sections/ProcessSteps.jsx';
import CTASection from '../../components/sections/CTASection.jsx';
import MagneticButton from '../../components/ui/MagneticButton.jsx';
import { about, site, stats } from '../../data/site.js';

export default function AboutClient() {
  return (
    <>
      <PageHeader
        eyebrow={about.eyebrow}
        crumb="About Us"
        title={
          <>
            A Guide Who Cares.{' '}
            <span className="text-gradient-brand">A Plan That Fits.</span>
          </>
        }
        intro={about.intro}
      >
        <div className="mt-8 space-y-3">
          {about.keyPoints?.map((pt, i) => (
            <div key={i} className="flex items-center gap-3 text-sm font-medium text-fg-muted sm:text-base">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-400/20 text-brand-600 dark:text-brand-300">
                <Icon name="check" className="h-3 w-3" strokeWidth={3} />
              </span>
              <span>{pt}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <MagneticButton
            to="/contact-us"
            icon="arrow-right"
            title="Schedule a 1-on-1 Session with Best Abroad Admission Advisor & Career Counsellor — HopeFairy"
            aria-label="Meet the best abroad admission advisor and career counsellor"
          >
            {about.button || 'Meet a Counsellor'}
          </MagneticButton>
        </div>
      </PageHeader>

      {/* Story (Seq 1: Natural Canvas / Pristine) */}
      <Section id="story" seq={1} className="!pt-8 sm:!pt-12 !pb-12 sm:!pb-18">
        <div className="grid gap-6 lg:gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal className="order-2 lg:order-1">
            {/* Brand panel — black and gold in both themes */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] border border-brand-400/30 bg-ink-950 p-6 text-center sm:p-14">
              <div className="pointer-events-none absolute left-1/2 top-1/3 h-52 w-52 sm:h-72 sm:w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/25 blur-[70px] sm:blur-[90px]" />
              <Sparkle size={12} className="absolute left-6 top-6 sm:left-10 sm:top-10 text-brand-300/70" />
              <Sparkle size={10} className="absolute bottom-8 right-8 sm:bottom-14 sm:right-12 text-brand-300/50" />
              <div className="relative mx-auto w-32 sm:w-56">
                <div className="absolute -inset-3 sm:-inset-4 animate-spin-slow rounded-full border border-dashed border-brand-400/30" />
                <Logo size="lg" className="relative h-full w-full" />
              </div>
              <p className="relative mt-5 sm:mt-10 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {site.wordmark[0]}
                <span className="text-brand-400">{site.wordmark[1]}</span>
              </p>
              <p className="relative mt-1 sm:mt-2 text-xs sm:text-lg text-brand-200">{site.tagline}</p>
            </div>
          </Reveal>
          <div className="order-1 lg:order-2">
            <SectionHeading eyebrow="Our Story" title={about.pageHeadline} highlightLast={3} />
            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              {about.pageParagraphs.map((p, i) => (
                <Reveal key={i} i={i} as="p" className="text-xs leading-relaxed text-fg-muted sm:text-base">
                  {p}
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* Mission & vision cards stay within Story grey section */}
        <div className="mt-8 sm:mt-12 grid gap-3 sm:gap-5 md:grid-cols-2">
          {[
            { label: 'Our Mission', text: about.mission, icon: 'target' },
            { label: 'Our Vision', text: about.vision, icon: 'sparkles' },
          ].map((m, i) => (
            <Reveal
              key={m.label}
              i={i}
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-brand-400/25 bg-gradient-to-br from-brand-400/[0.1] via-surface/60 to-surface/60 p-4 sm:p-10 dark:via-elevated/40 dark:to-elevated/40"
            >
              <span className="inline-flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-300 to-brand-600 text-ink-950">
                <Icon name={m.icon} className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <h2 className="mt-3 sm:mt-5 text-xl sm:text-3xl font-bold text-fg">{m.label}</h2>
              <p className="mt-1.5 sm:mt-3 text-xs leading-relaxed text-fg-muted sm:text-base">{m.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Values (Seq 2: Soft Pearl Slate) */}
      <Section id="values" seq={2} className="!py-10 sm:!py-16">
        <SectionHeading
          eyebrow="What We Stand For"
          title="Our Values"
          align="center"
          className="!mx-auto"
          highlightLast={1}
        />
        <div className="mt-6 sm:mt-12 grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">
          {about.values.map((v, i) => (
            <Reveal
              key={v.title}
              i={i}
              className="group rounded-2xl border border-hair/10 bg-surface/80 p-3 sm:p-7 text-center transition-colors hover:border-brand-400/40 dark:bg-tint/[0.03]"
            >
              <span className="mx-auto icon-3d h-9 w-9 sm:h-14 sm:w-14 rounded-full">
                <Icon name={v.icon} className="h-4 w-4 sm:h-6 sm:w-6" />
              </span>
              <h3 className="mt-2.5 sm:mt-5 text-xs sm:text-lg font-bold text-fg group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors leading-tight">{v.title}</h3>
              <p className="mt-1 sm:mt-2 text-[10px] sm:text-sm leading-snug sm:leading-relaxed text-fg-muted line-clamp-2 sm:line-clamp-none">{v.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Who we guide & Stats (Seq 3: Warm Champagne Ivory) */}
      <Section id="audience" seq={3} className="!pt-12 sm:!pt-20 !pb-12 sm:!pb-20">
        <SectionHeading eyebrow="Who We Help" title={about.audienceTitle} highlightLast={1} />
        <div className="mt-6 sm:mt-10 grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">
          {about.audience.map((a, i) => (
            <Reveal
              key={a.title}
              i={i}
              className="group rounded-2xl border border-hair/10 bg-surface/80 p-3 sm:p-7 transition-colors hover:border-brand-400/40 dark:bg-tint/[0.03]"
            >
              <span className="icon-3d h-8 w-8 sm:h-11 sm:w-11 rounded-full">
                <Icon name={a.icon} className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <h3 className="mt-2.5 sm:mt-4 text-xs sm:text-base font-bold text-fg leading-tight">{a.title}</h3>
              <p className="mt-1 sm:mt-1.5 text-[10px] sm:text-sm leading-snug sm:leading-relaxed text-fg-muted line-clamp-2 sm:line-clamp-none">{a.text}</p>
            </Reveal>
          ))}
        </div>

        {/* Headline Numbers / Stats inside audience grey section */}
        <div className="mt-12 sm:mt-18 pt-10 sm:pt-14 border-t border-hair/15">
          <Reveal>
            <h2 className="text-center font-extrabold tracking-tight leading-[1.08] text-2xl sm:text-4xl md:text-5xl">
              {stats.title}
            </h2>
          </Reveal>
          <div className="mt-6 sm:mt-10 grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-4 items-stretch">
            {stats.items.map((s, i) => (
              <div key={s.label} className="h-full w-full flex flex-col flex-1">
                <Reveal
                  i={i}
                  viewport={{ once: true, margin: '0px' }}
                  className="h-full w-full flex flex-col flex-1"
                >
                  <Card3D className="h-full w-full flex-1 flex-col items-center justify-center p-3.5 sm:p-6 md:p-8 text-center min-h-[125px] sm:min-h-[160px] md:min-h-[175px]">
                    <Lift depth="lg" className="text-2xl font-bold text-gradient-brand sm:text-4xl md:text-5xl shrink-0">
                      {s.value}
                    </Lift>
                    <Lift depth="sm" as="p" className="mx-auto mt-1 sm:mt-3 max-w-[14rem] text-[11px] sm:text-sm text-fg-muted leading-tight sm:leading-normal">
                      {s.label}
                    </Lift>
                  </Card3D>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ProcessSteps (Seq 4: Soft Heather Porcelain) */}
      <ProcessSteps seq={4} />
      <CTASection />
    </>
  );
}
