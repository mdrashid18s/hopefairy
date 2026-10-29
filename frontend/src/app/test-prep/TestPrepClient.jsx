'use client';

import { PageHeader, TestPrep, WhyUs, FAQ, CTASection } from '@/components/sections';
import MagneticButton from '../../components/ui/MagneticButton.jsx';
import { testPrep } from '../../data/site.js';

export default function TestPrepClient() {
  return (
    <>
      <PageHeader
        eyebrow={testPrep.eyebrow}
        crumb="Test Prep"
        title={
          <>
            The Right Score{' '}
            <span className="text-gradient-brand">Opens the Right Door.</span>
          </>
        }
        intro={testPrep.intro}
      >
        <div className="mt-8 flex flex-wrap gap-4">
          <MagneticButton
            to="/contact-us?interest=Test+Prep"
            icon="arrow-right"
            title="Enquire About Best IMAT Coaching, Digital SAT, IELTS & CELPIP Classes in India"
            aria-label="Enquire about test prep coaching programs"
          >
            {testPrep.button || 'View All Programs'}
          </MagneticButton>
        </div>
      </PageHeader>
      <TestPrep heading={true} showPageLink={false} seq={1} />
      <WhyUs seq={2} />
      <FAQ seq={3} />
      <CTASection variant={1} {...testPrep.cta} />
    </>
  );
}
