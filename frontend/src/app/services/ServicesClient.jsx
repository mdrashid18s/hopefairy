'use client';

import PageHeader from '../../components/sections/PageHeader.jsx';
import WhatWeDo from '../../components/sections/WhatWeDo.jsx';
import ProcessSteps from '../../components/sections/ProcessSteps.jsx';
import WhyUs from '../../components/sections/WhyUs.jsx';
import FAQ from '../../components/sections/FAQ.jsx';
import CTASection from '../../components/sections/CTASection.jsx';

import MagneticButton from '../../components/ui/MagneticButton.jsx';
import { studyAbroadPage } from '../../data/site.js';

/** @param {{data: {intro:string, items:any[]}}} props — fetched server-side in page.js */
export default function ServicesClient({ data }) {
  return (
    <>
      <PageHeader
        eyebrow={studyAbroadPage.eyebrow}
        crumb="Study Abroad"
        title={
          <>
            From &ldquo;Where Should I Go?&rdquo; to{' '}
            <span className="text-gradient-brand">&ldquo;I&rsquo;m Here!&rdquo;</span>
          </>
        }
        intro={studyAbroadPage.intro}
      >
        <div className="mt-8 flex flex-wrap gap-2">
          {studyAbroadPage.keyPoints.map((kp, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-full border border-hair/15 bg-surface/80 px-3.5 py-1.5 text-xs font-semibold text-fg-muted dark:bg-tint/[0.04]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              {kp}
            </span>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <MagneticButton to="/contact-us" icon="arrow-right">
            {studyAbroadPage.button || 'Plan My Journey'}
          </MagneticButton>
        </div>
      </PageHeader>

      <WhatWeDo services={data} showAllLink={false} heading={true} seq={1} />
      <ProcessSteps seq={2} />
      <WhyUs seq={3} />
      <FAQ seq={4} />
      <CTASection seq={5} />
    </>
  );
}
