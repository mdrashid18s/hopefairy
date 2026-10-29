'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Section from '../../../components/ui/Section.jsx';
import SectionHeading from '../../../components/ui/SectionHeading.jsx';
import Reveal from '../../../components/ui/Reveal.jsx';
import Icon from '../../../components/ui/Icon.jsx';
import Sparkle from '../../../components/ui/Sparkle.jsx';
import MagneticButton from '../../../components/ui/MagneticButton.jsx';
import WordsReveal from '../../../components/ui/WordsReveal.jsx';
import CTASection from '../../../components/sections/CTASection.jsx';
import { stagger, fadeUp, easeOut } from '../../../lib/motion.js';
import { services, whyUs } from '../../../data/site.js';
import { SITE_URL } from '../../../lib/seo.js';

export default function ServiceDetailClient({ service: rawService }) {
  const fallbackService = services.find((s) => s.slug === rawService?.slug);

  const rawHighlights = Array.isArray(rawService?.highlights) && rawService.highlights.length > 0
    ? rawService.highlights
    : (fallbackService?.highlights || []);

  const parsedHighlights = rawHighlights
    .map((h, i) => {
      if (typeof h === 'string') {
        if (h.includes('[object Object]') || !h.trim()) return null;
        return { title: h, text: '', icon: 'sparkles' };
      }
      if (h && typeof h === 'object') {
        const title = h.title || '';
        if (title.includes('[object Object]')) return null;
        return {
          title: title || `Highlight ${i + 1}`,
          text: h.text || h.description || '',
          icon: h.icon || 'sparkles',
        };
      }
      return null;
    })
    .filter(Boolean);

  const finalHighlights = parsedHighlights.length > 0 ? parsedHighlights : (fallbackService?.highlights || []);

  const service = {
    ...rawService,
    features: Array.isArray(rawService?.features)
      ? rawService.features.map((f) => (typeof f === 'string' ? f : (f?.feature_text || ''))).filter(Boolean)
      : (fallbackService?.features || []),
    processFlow: Array.isArray(rawService?.processFlow)
      ? rawService.processFlow.map((p) => (typeof p === 'string' ? p : (p?.step_title || ''))).filter(Boolean)
      : (fallbackService?.processFlow || []),
    highlights: finalHighlights,
    intro: Array.isArray(rawService?.intro)
      ? rawService.intro
      : (rawService?.short ? [rawService.short] : (fallbackService?.intro || ['Professional admission and counselling guidance.'])),
  };

  const idx = services.findIndex((s) => s.slug === service.slug);
  const prev = services[(idx - 1 + services.length) % services.length];
  const next = services[(idx + 1) % services.length];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Services',
        item: `${SITE_URL}/services`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: service.title,
      },
    ],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.short || service.headline,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'HopeFairy',
      url: `${SITE_URL}/`,
    },
    areaServed: 'IN',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <header className="relative overflow-hidden pt-24 pb-8 sm:pt-40">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-brand-400/15 to-transparent dark:from-brand-600/15" />
        <div className="container-x relative">
          <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6 flex items-center gap-2 text-xs sm:text-sm text-fg-faint">
            <Link
              prefetch={false}
              href="/"
              title="HopeFairy Home — Study Abroad & Career Counselling"
              aria-label="Return to HopeFairy Home"
              className="hover:text-fg"
            >
              Home
            </Link>
            <span className="text-brand-500">/</span>
            <Link
              prefetch={false}
              href="/services/"
              title="All Study Abroad Advisory Services"
              aria-label="View all study abroad services"
              className="hover:text-fg"
            >
              Services
            </Link>
            <span className="text-brand-500">/</span>
            <span className="text-fg-muted">{service.title}</span>
          </nav>

          <div className="grid gap-6 sm:gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            <motion.div variants={stagger} initial="hidden" animate="show">
              <motion.div variants={fadeUp} className="flex items-center gap-3 sm:gap-4">
                <span className="inline-flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-brand-300 to-brand-600 text-ink-950">
                  <Icon name={service.icon} className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-fg-faint">
                  {service.title}
                </span>
              </motion.div>

              <WordsReveal
                as="h1"
                text={service.headline || service.title}
                highlightLast={2}
                className="mt-4 sm:mt-6 text-2xl sm:text-5xl md:text-6xl leading-[1.1] tracking-tight text-fg"
              />

              {/* Intro paragraphs */}
              {(Array.isArray(service?.intro) ? service.intro : [service?.short || '']).filter(Boolean).map((p, i) => (
                <motion.p
                  key={i}
                  variants={fadeUp}
                  className={`max-w-2xl text-xs sm:text-lg text-fg-muted ${i === 0 ? 'mt-3 sm:mt-6' : 'mt-2 sm:mt-4'}`}
                >
                  {p}
                </motion.p>
              ))}

              <motion.div variants={fadeUp} className="mt-5 sm:mt-8 flex flex-wrap gap-2.5 sm:gap-3">
                <MagneticButton
                  to="/contact-us"
                  icon="calendar"
                  title={`Book Free 1-on-1 Counselling for ${service.title}`}
                  aria-label={`Book free counselling for ${service.title}`}
                  className="!py-2 !px-4 text-xs sm:text-sm"
                >
                  Book Free Counselling
                </MagneticButton>
                <MagneticButton
                  to="/services"
                  variant="ghost"
                  icon="arrow-right"
                  title="View all HopeFairy study abroad advisory services"
                  aria-label="View all services"
                  className="!py-2 !px-4 text-xs sm:text-sm"
                >
                  All services
                </MagneticButton>
              </motion.div>
            </motion.div>

            {/* Black-and-gold feature panel (stays black in both themes) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: easeOut }}
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-brand-400/30 bg-ink-950 p-4 sm:p-8 text-white shadow-card"
            >
              {(service.image_url || service.image) && (
                <div className="relative mb-4 sm:mb-6 h-36 sm:h-48 w-full overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 shadow-inner">
                  <img
                    src={service.image_url || service.image}
                    alt={`${service.title} — Study Abroad Guidance by HopeFairy`}
                    title={`${service.title} — HopeFairy Admissions`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
                </div>
              )}
              <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-brand-400/25 blur-[90px]" />
              <Sparkle size={12} className="absolute right-6 top-6 sm:right-8 sm:top-8 text-brand-300/70" />
              <span className="relative text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-brand-300">
                {service.featuresTitle || 'What’s included'}
              </span>
              <ul className="relative mt-3 sm:mt-5 space-y-2 sm:space-y-3">
                {service.features?.slice(0, 6).map((f, i) => (
                  <li key={`header-feat-${f}-${i}`} className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-white/80">
                    <span className="mt-0.5 inline-flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full bg-brand-400/20 text-brand-300">
                      <Icon name="check" className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Section 1: Highlights & Features */}
      <Section seq={1} className="!pt-10 sm:!pt-16">
        <SectionHeading
          eyebrow="Key Advantages"
          title="How This Program Empowers You"
          intro="Every consultation is built around your individual goals, offering strategic mentorship, application precision, and end-to-end guidance."
          highlightLast={2}
          className="mb-8 sm:mb-12"
        />

        {/* Highlights grid */}
        {service.highlights?.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-5 md:grid-cols-3">
            {service.highlights.map((h, i) => (
              <motion.div
                key={`highlight-${h.title || i}-${i}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: easeOut }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-hair/10 bg-surface/80 p-3 sm:p-7 transition-colors hover:border-brand-400/40 dark:bg-tint/[0.03]"
              >
                <span className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-400/0 blur-2xl transition-colors duration-500 group-hover:bg-brand-400/30" />
                <span className="relative icon-3d h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl">
                  <Icon name={h.icon} className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <h3 className="relative mt-2.5 sm:mt-5 text-xs sm:text-lg font-bold text-fg leading-tight">{h.title}</h3>
                <p className="relative mt-1 sm:mt-1.5 text-[10px] sm:text-sm leading-snug sm:leading-relaxed text-fg-muted line-clamp-2 sm:line-clamp-none">{h.text}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Full feature list */}
        {service.features?.length > 0 && (
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-hair/10">
            <h3 className="text-sm sm:text-lg font-bold text-fg mb-4">
              {service.featuresTitle || 'Included Deliverables & Milestones'}
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {service.features.map((f, i) => (
                <motion.div
                  key={`full-feat-${f}-${i}`}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: easeOut }}
                  className="group flex items-center gap-2 sm:gap-3 rounded-xl border border-hair/10 bg-surface/70 px-2.5 py-2 sm:px-4 sm:py-3.5 transition-colors hover:border-brand-400/40 dark:bg-tint/[0.02]"
                >
                  <span className="inline-flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-300 to-brand-600 text-ink-950 transition-transform group-hover:scale-110">
                    <Icon name="check" className="h-3 w-3 sm:h-4 sm:w-4" strokeWidth={2.5} />
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-fg truncate">{f}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Section 2: Process flow */}
      {service.processFlow?.length > 0 && (
        <Section seq={2} className="!pt-10 sm:!pt-16">
          <SectionHeading
            eyebrow="Step-by-Step Pathway"
            title="Our Advisory & Application Roadmap"
            intro="A structured roadmap ensuring every document, application portal, and counselling round is meticulously managed."
            highlightLast={2}
            className="mb-8 sm:mb-12"
          />
          <div className="flex flex-wrap items-center gap-2">
            {service.processFlow.map((step, i) => (
              <motion.div
                key={`flow-step-${step}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="flex items-center gap-1.5 sm:gap-2"
              >
                <span className="flex items-center gap-1.5 rounded-full border border-brand-400/25 bg-brand-400/[0.06] py-1 pl-1.5 pr-3 text-xs sm:text-sm font-medium text-fg">
                  <span className="inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-brand-400 text-[9px] sm:text-[0.65rem] font-bold text-ink-950">
                    {i + 1}
                  </span>
                  {step}
                </span>
                {i < service.processFlow.length - 1 && (
                  <Icon name="arrow-right" className="h-3 w-3 sm:h-4 sm:w-4 shrink-0 text-brand-500/60" />
                )}
              </motion.div>
            ))}
          </div>
        </Section>
      )}

      {/* Section 3: Why HopeFairy + Service Navigation */}
      <Section seq={service.processFlow?.length > 0 ? 3 : 2} className="!pt-10 sm:!pt-16">
        <div className="rounded-2xl sm:rounded-3xl border border-brand-400/20 bg-gradient-to-br from-brand-400/[0.08] via-surface/60 to-surface/60 p-4 sm:p-12 dark:via-elevated/40 dark:to-elevated/40">
          <SectionHeading
            eyebrow={whyUs.eyebrow}
            title={whyUs.headline}
            intro={whyUs.copy}
            highlightLast={2}
          />
          <div className="mt-6 sm:mt-10 grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-3">
            {whyUs.differentiators.map((d, i) => (
              <Reveal key={`why-${d.title || i}-${i}`} i={i} className="group flex flex-col sm:flex-row gap-2 sm:gap-4 p-2 sm:p-0">
                <span className="icon-3d h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-lg">
                  <Icon name={d.icon} className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <span>
                  <span className="block text-xs sm:text-sm font-bold text-fg transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-300 leading-tight">{d.title}</span>
                  <span className="mt-1 block text-[10px] sm:text-sm leading-snug sm:leading-relaxed text-fg-muted line-clamp-2 sm:line-clamp-none">{d.text}</span>
                </span>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Prev / Next navigation inside this section */}
        <div className="mt-8 sm:mt-12 grid gap-3 sm:gap-4 sm:grid-cols-2">
          <ServiceNav dir="prev" service={prev} />
          <ServiceNav dir="next" service={next} />
        </div>
      </Section>

      <CTASection seq={service.processFlow?.length > 0 ? 4 : 3} />
    </>
  );
}

function ServiceNav({ dir, service }) {
  const isNext = dir === 'next';
  return (
    <Link
      prefetch={false}
      href={`/service/${service.slug}`}
      title={`${isNext ? 'Next service' : 'Previous service'}: ${service.title} — ${service.short}`}
      aria-label={`${isNext ? 'Next service' : 'Previous service'}: ${service.title}`}
      className={`group flex items-center gap-4 rounded-3xl border border-hair/10 bg-surface/70 p-6 transition-colors hover:border-brand-400/40 dark:bg-tint/[0.03] ${
        isNext ? 'sm:flex-row-reverse sm:text-right' : ''
      }`}
    >
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-brand-400/30 text-brand-600 transition-all group-hover:scale-110 group-hover:bg-brand-400 group-hover:text-ink-950 dark:text-brand-300">
        <Icon name="arrow-right" className={`h-5 w-5 ${isNext ? '' : 'rotate-180'}`} />
      </span>
      <span className={isNext ? 'sm:ml-auto' : ''}>
        <span className="block text-xs uppercase tracking-[0.3em] text-fg-faint">
          {isNext ? 'Next service' : 'Previous service'}
        </span>
        <span className="mt-1 block text-xl font-bold text-fg">{service.title}</span>
      </span>
    </Link>
  );
}
