'use client';

import {
  Hero,
  DestinationsTicker,
  StatsSection,
  DestinationsSection,
  WhatWeDo,
  IndiaAdmissions,
  GulfDeskTeaser,
  TestPrep,
  ProcessSteps,
  WhyUs,
  WhoWeAre,
  FAQ,
  QuerySection,
  PsychometricSection,
  TestimonialsSection,
  CTASection,
} from '@/components/sections';
import PointerGlow from '../components/ui/PointerGlow.jsx';

/**
 * @param {{
 *   services: {intro:string, items:any[]},
 *   destinations?: any[],
 *   faqs?: any[]
 * }} props
 */
export default function HomeClient({ services, destinations, faqs }) {
  return (
    <>
      <PointerGlow />

      <Hero />
      <DestinationsTicker destinations={destinations} />
      <StatsSection seq={1} />
      <DestinationsSection destinations={destinations} seq={2} />
      <GulfDeskTeaser seq={3} />
      <WhatWeDo services={services} seq={4} />
      <IndiaAdmissions seq={5} />
      <PsychometricSection seq={6} />
      <TestPrep seq={7} />
      <ProcessSteps seq={8} />
      <WhyUs seq={9} />
      <WhoWeAre seq={10} />
      <FAQ items={faqs} seq={11} />
      <QuerySection source="Homepage query form" seq={12} />
      <TestimonialsSection seq={13} />
      <CTASection />
    </>
  );
}
