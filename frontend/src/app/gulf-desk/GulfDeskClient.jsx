'use client';

import PageHeader from '../../components/sections/PageHeader.jsx';
import Section from '../../components/ui/Section.jsx';
import SectionHeading from '../../components/ui/SectionHeading.jsx';
import Reveal from '../../components/ui/Reveal.jsx';
import Icon from '../../components/ui/Icon.jsx';
import Flag from '../../components/ui/Flag.jsx';
import Sparkle from '../../components/ui/Sparkle.jsx';
import Card3D, { Lift } from '../../components/ui/Card3D.jsx';
import MagneticButton from '../../components/ui/MagneticButton.jsx';
import WhyUs from '../../components/sections/WhyUs.jsx';
import FAQ from '../../components/sections/FAQ.jsx';
import CTASection from '../../components/sections/CTASection.jsx';
import { gulfDesk, site } from '../../data/site.js';

const DOMAIN_ICONS = {
  Engineering: 'cpu',
  Medicine: 'stethoscope',
  Management: 'briefcase',
  Law: 'scale',
  'Liberal Arts': 'palette',
};

export default function GulfDeskClient() {
  const d = gulfDesk;

  return (
    <>
      <PageHeader
        eyebrow={d.eyebrow}
        crumb="Gulf Desk"
        title={
          <>
            Living in the Gulf. Studying in India.{' '}
            <span className="text-gradient-brand">We Bridge the Gap.</span>
          </>
        }
        intro={d.intro}
      >
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-400/10 px-4 py-1.5 text-xs font-bold text-brand-700 dark:text-brand-300">
            <Sparkle size={12} className="text-brand-500" />
            {d.tagline}
          </span>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <MagneticButton
            to="/contact-us?interest=Gulf+Desk"
            icon="arrow-right"
            title="Talk to the Best Abroad Admission Advisor for NRI Admissions in India"
            aria-label="Contact HopeFairy Gulf Desk"
          >
            {d.buttons.primary}
          </MagneticButton>
          <MagneticButton
            href={site.whatsappHref}
            external
            variant="ghost"
            icon="message-circle"
            title="Chat on WhatsApp with the Best Abroad Admission Advisor for Gulf NRI Admissions"
            aria-label="Chat with Gulf Desk on WhatsApp"
          >
            {d.buttons.whatsapp}
          </MagneticButton>
        </div>
      </PageHeader>

      {/* Target Gulf Countries & Domains */}
      <Section seq={1} className="!pt-10 sm:!pt-16 !pb-10 sm:!pb-16">
        <SectionHeading
          eyebrow="Gulf Desk Advisory"
          title="Serving Indian & NRI Families Across the GCC"
          intro="Dedicated guidance on NRI quota admissions, entrance examinations, and academic timelines tailored for families living abroad."
          highlightLast={3}
        />
        <div className="mt-8 grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Countries Served */}
          <Reveal>
            <div className="h-full rounded-2xl sm:rounded-3xl border border-hair/15 bg-surface/80 p-3.5 sm:p-8 shadow-card backdrop-blur-xl dark:bg-tint/[0.03]">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                Serving Indian Families Across
              </span>
              <h3 className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold text-fg">GCC &amp; Gulf Countries</h3>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-fg-muted leading-snug">
                Dedicated admission consulting tailored to academic timelines of NRI families.
              </p>

              <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3">
                {d.countries.map((c) => (
                  <div
                    key={c.code}
                    className="flex items-center gap-2 rounded-xl sm:rounded-2xl border border-hair/15 bg-surface/60 p-2 sm:p-3 transition-colors hover:border-brand-400/40 dark:bg-tint/[0.02]"
                  >
                    <Flag code={c.code} className="h-4 w-6 sm:h-5 sm:w-7 shrink-0 rounded-[2px] ring-1 ring-black/10 shadow-sm" />
                    <span className="text-xs sm:text-sm font-semibold text-fg truncate">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Academic Domains */}
          <Reveal i={1}>
            <div className="h-full rounded-2xl sm:rounded-3xl border border-hair/15 bg-surface/80 p-3.5 sm:p-8 shadow-card backdrop-blur-xl dark:bg-tint/[0.03]">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                Premier Admission Domains
              </span>
              <h3 className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold text-fg">Key Academic Streams</h3>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-fg-muted leading-snug">
                Complete guidance for UG and PG entrance tests, NRI quota seat counselling.
              </p>

              <div className="mt-4 sm:mt-6 flex flex-wrap gap-1.5 sm:gap-2.5">
                {d.domains.map((dom) => (
                  <span
                    key={dom}
                    className="inline-flex items-center gap-1.5 rounded-xl sm:rounded-2xl border border-brand-400/25 bg-brand-400/10 px-2.5 py-1.5 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-fg"
                  >
                    <Icon name={DOMAIN_ICONS[dom] || 'book-open'} className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand-600 dark:text-brand-300" />
                    {dom}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* How We Help — 5 Pillars */}
      <Section seq={2} className="!py-14 sm:!py-20">
        <SectionHeading
          eyebrow="Our Process"
          title="How We Help NRI Families"
          intro="From navigating NRI quotas to confirmed seat allotment, your dedicated counsellor manages every step."
          align="center"
          className="!mx-auto"
          highlightLast={2}
        />

        <div className="mt-6 sm:mt-12 grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-3">
          {d.howWeHelp.map((step, idx) => (
            <Reveal key={step.title} i={idx}>
              <Card3D className="h-full flex-col justify-between p-3 sm:p-7">
                <Lift depth="lg">
                  <div className="flex items-center justify-between">
                    <span className="icon-3d h-8 w-8 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl">
                      <Icon name={step.icon} className="h-4 w-4 sm:h-5 sm:w-5" />
                    </span>
                    <span className="text-[10px] sm:text-xs font-black tracking-widest text-brand-500/70">
                      0{idx + 1}
                    </span>
                  </div>
                </Lift>
                <Lift depth="sm" className="mt-3 sm:mt-6">
                  <h4 className="text-xs sm:text-lg font-bold text-fg leading-tight">{step.title}</h4>
                  <p className="mt-1 sm:mt-2 text-[10px] sm:text-sm leading-snug sm:leading-relaxed text-fg-muted line-clamp-2 sm:line-clamp-none">{step.desc}</p>
                </Lift>
              </Card3D>
            </Reveal>
          ))}

          {/* 6th Tile: Direct Action Card */}
          <Reveal i={5}>
            <Card3D surface="dark" className="h-full flex-col justify-between p-3 sm:p-7">
              <Lift depth="lg">
                <span className="icon-3d h-8 w-8 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl">
                  <Icon name="phone-call" className="h-4 w-4 sm:h-6 sm:w-6" />
                </span>
              </Lift>
              <Lift depth="sm" className="mt-3 sm:mt-6">
                <h4 className="text-xs sm:text-lg font-bold text-white leading-tight">Have Questions?</h4>
                <p className="mt-1 sm:mt-2 text-[10px] sm:text-sm leading-snug text-white/70 line-clamp-2 sm:line-clamp-none">
                  Schedule a confidential 1:1 consultation with our Gulf Desk specialist today.
                </p>
                <div className="mt-2.5 sm:mt-5">
                  <MagneticButton to="/contact-us?interest=Gulf+Desk" icon="arrow-right" className="!py-1.5 !px-2.5 sm:!py-2 sm:!px-4 text-[10px] sm:text-xs font-bold w-full justify-center">
                    Book Free Session
                  </MagneticButton>
                </div>
              </Lift>
            </Card3D>
          </Reveal>
        </div>
      </Section>

      <WhyUs seq={3} />
      <FAQ seq={4} />
      <CTASection
        seq={5}
        eyebrow="Dedicated Desk for the Gulf"
        title="Far From India. Close To Your Dream College."
        text="Book a free consultation session with our specialized Gulf Desk counsellors. We'll map out admission pathways, eligibility, and entrance preparation for your family."
        buttonLabel="Talk to Our Gulf Desk"
      />
    </>
  );
}
