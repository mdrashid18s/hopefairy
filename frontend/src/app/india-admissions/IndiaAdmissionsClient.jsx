'use client';

import { PageHeader, IndiaAdmissions, WhyUs, FAQ, CTASection } from '@/components/sections';
import Section from '../../components/ui/Section.jsx';
import SectionHeading from '../../components/ui/SectionHeading.jsx';
import Reveal from '../../components/ui/Reveal.jsx';
import Icon from '../../components/ui/Icon.jsx';
import MagneticButton from '../../components/ui/MagneticButton.jsx';
import { indiaAdmissions } from '../../data/site.js';

export default function IndiaAdmissionsClient() {
  return (
    <>
      <PageHeader
        eyebrow={indiaAdmissions.eyebrow}
        crumb="India Admissions"
        title={
          <>
            India&apos;s Best Colleges.{' '}
            <span className="text-gradient-brand">Your Best Fit.</span>
          </>
        }
        intro={indiaAdmissions.intro}
      >
        <div className="mt-8 flex flex-wrap gap-4">
          <MagneticButton
            to="/contact-us?interest=India+Admissions"
            icon="arrow-right"
            title="Find Top Indian Colleges & Universities Matching Your Entrance Exam Scores"
            aria-label="Find top colleges in India"
          >
            {indiaAdmissions.button || 'Find My College'}
          </MagneticButton>
        </div>
      </PageHeader>

      {/* Stream & Exams Guide Table */}
      <Section seq={1} className="!pt-10 sm:!pt-16 !pb-10 sm:!pb-16">
        <SectionHeading
          eyebrow="Admission Matrix"
          title="Program Streams & Entrance Exams"
          intro="Comprehensive roadmap for UG and PG entrance examinations across India's top colleges and universities."
          highlightLast={3}
        />
        <Reveal>
          <div className="mt-8 rounded-2xl sm:rounded-3xl border border-brand-400/25 bg-surface/80 p-3 sm:p-8 shadow-card backdrop-blur-xl dark:bg-tint/[0.03]">
            <div className="mb-3 sm:mb-6 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
              <div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                  Admission Consulting
                </span>
                <h2 className="mt-0.5 sm:mt-1 text-lg sm:text-3xl font-bold text-fg">Exams We Guide For</h2>
              </div>
              <MagneticButton
                to="/contact-us?interest=India+Admissions"
                icon="arrow-right"
                title="Book Free Session with Best Career Counselling Mentors for Engineering, Medical & MBA Admissions"
                aria-label="Book consultation for Indian admissions"
                className="!py-1.5 !px-3 text-xs"
              >
                Find My College
              </MagneticButton>
            </div>

            <div className="w-full">
              <table className="w-full text-left border-collapse table-auto">
                <thead>
                  <tr className="border-b border-brand-400/25 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                    <th className="py-2 px-1.5 sm:py-3 sm:px-4 w-[36%] sm:w-[35%]">STREAM</th>
                    <th className="py-2 px-1.5 sm:py-3 sm:px-4">EXAMS WE GUIDE FOR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hair/10 text-xs sm:text-sm">
                  {indiaAdmissions.streamsGuide?.map((row, idx) => (
                    <tr key={idx} className="group transition-colors hover:bg-brand-400/[0.05]">
                      <td className="py-2.5 sm:py-4 px-1.5 sm:px-4 font-bold text-fg align-middle">
                        <div className="flex items-center gap-1.5 sm:gap-3">
                          <span className="icon-3d h-6 w-6 sm:h-8 sm:w-8 shrink-0 rounded-lg sm:rounded-xl">
                            <Icon name={row.icon} className="h-3 w-3 sm:h-4 sm:w-4" />
                          </span>
                          <span className="text-xs sm:text-sm leading-tight">{row.stream}</span>
                        </div>
                      </td>
                      <td className="py-2.5 sm:py-4 px-1.5 sm:px-4 text-fg-muted font-medium text-[11px] sm:text-sm leading-snug">
                        {row.exams}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </Section>

      <IndiaAdmissions heading={true} showPageLink={false} seq={2} />
      <WhyUs seq={3} />
      <FAQ seq={4} />
      <CTASection seq={5} {...indiaAdmissions.cta} />
    </>
  );
}
