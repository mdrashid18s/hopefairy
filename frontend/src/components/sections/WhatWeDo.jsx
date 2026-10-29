import Section from '../ui/Section.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';
import MagneticButton from '../ui/MagneticButton.jsx';
import Icon from '../ui/Icon.jsx';
import SmartLink from '../ui/SmartLink.jsx';
import Card3D, { Lift } from '../ui/Card3D.jsx';
import ServiceCard from './ServiceCard.jsx';
import {
  homeOnly,
  counsellingLink,
  services as allServices,
  servicesIntro,
  servicesSection as copy,
} from '../../data/site.js';

// Same shape the API's getServices() returns, so the section works with
// no props at all (drop it into any page) or with server-fetched data.
const DEFAULT_SERVICES = { intro: servicesIntro, items: allServices };

/**
 * Services grid + a gold call-to-action tile (copy in servicesSection, data/site.js).
 * @param {{services?: {intro:string, items:any[]}, showAllLink?: boolean, heading?: boolean}} props
 */
export default function WhatWeDo({ services = DEFAULT_SERVICES, showAllLink = true, heading = true, alt = true, variant, seq }) {
  return (
    <Section id="services" alt={heading && alt} variant={variant} seq={seq}>
      {heading && (
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow={copy.eyebrow}
            title={copy.title}
            intro={services.intro}
            highlightLast={3}
          />
          {showAllLink && !homeOnly && (
            <Reveal i={2}>
              <MagneticButton
                to="/services"
                variant="ghost"
                title="View all services by the best abroad admission advisor: admissions, SOP, visa & scholarships"
                aria-label="View all study abroad services"
              >
                {copy.button}
              </MagneticButton>
            </Reveal>
          )}
        </div>
      )}

      <div className={`${heading ? 'mt-6 sm:mt-12' : ''} grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-4`}>
        {services.items.map((s, i) => (
          <Reveal key={s.slug} i={i % 4}>
            <ServiceCard service={s} index={i} />
          </Reveal>
        ))}

        {/* Closing tile — completes the grid and gives an obvious next step. */}
        <Reveal i={3}>
          <Card3D
            as={SmartLink}
            {...counsellingLink}
            surface="gold"
            title="Book a Free 1-on-1 Study Abroad & Career Counselling Session with HopeFairy"
            aria-label="Book free personal counselling session"
            className="min-h-[135px] sm:min-h-[16rem] flex-col justify-between p-3 sm:p-5 md:p-7"
          >
            <Lift depth="lg" className="flex items-center gap-2 sm:gap-3">
              <span className="inline-flex h-9 w-9 sm:h-12 sm:w-12 md:h-14 md:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-ink-950 text-brand-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_3px_0_-1px_rgba(0,0,0,0.5),0_10px_18px_-8px_rgba(0,0,0,0.5)] shrink-0">
                <Icon name="message-circle" className="h-4.5 w-4.5 sm:h-6 sm:w-6" />
              </span>
              <span className="block text-xs sm:text-lg font-bold leading-tight sm:hidden">{copy.ctaTitle}</span>
            </Lift>
            <Lift depth="sm" className="mt-2 sm:mt-4 flex flex-1 flex-col justify-between">
              <div>
                <span className="hidden sm:block text-xl md:text-2xl font-semibold leading-tight">{copy.ctaTitle}</span>
                <span className="mt-1 sm:mt-2 block text-[10.5px] sm:text-xs md:text-sm text-ink-950/75 line-clamp-2 sm:line-clamp-none">{copy.ctaText}</span>
              </div>
              <span className="mt-2 sm:mt-5 inline-flex items-center gap-1 sm:gap-2 text-[11px] sm:text-sm font-bold">
                {copy.ctaButton}
                <Icon
                  name="arrow-right"
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover/card3d:translate-x-1"
                />
              </span>
            </Lift>
          </Card3D>
        </Reveal>
      </div>
    </Section>
  );
}
