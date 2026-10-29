'use client';

import PageHeader from '../../components/sections/PageHeader.jsx';
import Section from '../../components/ui/Section.jsx';
import SectionHeading from '../../components/ui/SectionHeading.jsx';
import Reveal from '../../components/ui/Reveal.jsx';
import Icon from '../../components/ui/Icon.jsx';
import Flag from '../../components/ui/Flag.jsx';
import MagneticButton from '../../components/ui/MagneticButton.jsx';
import FAQ from '../../components/sections/FAQ.jsx';
import CTASection from '../../components/sections/CTASection.jsx';
import { moreDestinations, destinationsPage } from '../../data/site.js';
import { getCountryTitle } from '../../components/sections/DestinationCard.jsx';

/** @param {{data: {intro:string, items:any[]}}} props — fetched server-side in page.js */
export default function DestinationsClient({ data }) {
  return (
    <>
      <PageHeader
        eyebrow={destinationsPage.eyebrow}
        crumb="Destinations"
        title={
          <>
            Many Countries.{' '}
            <span className="text-gradient-brand">One Right Fit.</span>
          </>
        }
        intro={destinationsPage.intro}
      >
        <div className="mt-8 flex flex-wrap gap-4">
          <MagneticButton
            href="#destinations-list"
            icon="arrow-right"
            title="Compare Top Study Destinations: UK, USA, Canada, Germany, Australia"
            aria-label="Scroll to destinations list"
          >
            {destinationsPage.button || 'Find My Country'}
          </MagneticButton>
        </div>

        {/* Jump bar */}
        <div id="destinations-list" className="mt-5 sm:mt-8 flex flex-wrap gap-1.5 sm:gap-2 pt-1 sm:pt-2">
          {data.items.map((d) => (
            <a
              key={d.slug}
              href={`#${d.slug}`}
              title={getCountryTitle(d)}
              aria-label={`Jump to Study in ${d.name}`}
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-hair/10 bg-surface/70 py-1 pl-2 pr-3 text-xs sm:text-sm font-medium text-fg-muted transition-colors hover:border-brand-400/50 hover:text-fg dark:bg-tint/[0.03]"
            >
              <Flag code={d.flag} title={`Official National Flag of ${d.name} — ${getCountryTitle(d)}`} className="h-3.5 w-5 sm:h-5 sm:w-[30px] rounded-[2px] ring-1 ring-black/10" />
              {d.name}
            </a>
          ))}
        </div>
      </PageHeader>

      <Section seq={1} className="!pt-10 sm:!pt-16">
        <SectionHeading
          eyebrow="Global Destinations"
          title="Top Countries for Higher Education"
          intro="Comprehensive country guides covering top universities, tuition fees, cost of living, and post-study work rights."
          highlightLast={2}
        />
        <div className="mt-8 flex flex-col gap-4 sm:gap-6">
          {data.items.map((d, i) => {
            const highlightsList = Array.isArray(d.highlights)
              ? d.highlights
              : (typeof d.highlights === 'string' ? d.highlights.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean) : []);
            const intakesList = Array.isArray(d.intakes)
              ? d.intakes
              : (typeof d.intakes === 'string' ? d.intakes.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean) : []);
            const coursesList = Array.isArray(d.courses)
              ? d.courses
              : (typeof d.courses === 'string' ? d.courses.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean) : []);

            return (
            <Reveal
              key={d.slug}
              as="article"
              id={d.slug}
              className="group relative scroll-mt-28 overflow-hidden rounded-2xl sm:rounded-3xl border border-hair/10 bg-surface/80 p-3.5 sm:p-10 transition-colors duration-500 hover:border-brand-400/35 dark:bg-tint/[0.03]"
            >
              <span className="pointer-events-none absolute -right-4 -top-10 select-none text-[6rem] sm:text-[13rem] font-bold leading-none text-brand-400/[0.07]">
                {d.code}
              </span>

              <div className="relative grid gap-4 sm:gap-8 lg:grid-cols-[1fr_1fr_0.8fr]">
                {/* Name + highlights */}
                <div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Flag
                      code={d.flag}
                      title={`Official National Flag of ${d.name} — ${getCountryTitle(d)}`}
                      className="h-7 w-[42px] sm:h-12 sm:w-[72px] shrink-0 rounded-md sm:rounded-lg shadow-[0_6px_14px_-6px_rgba(0,0,0,0.4)] ring-1 ring-black/10"
                    />
                    <div>
                      <span className="text-[9.5px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-fg-faint">
                        Destination {String(i + 1).padStart(2, '0')}
                      </span>
                      <h2 className="text-lg sm:text-3xl md:text-4xl font-bold leading-tight" title={getCountryTitle(d)}>Study in {d.name}</h2>
                    </div>
                  </div>
                  <p className="mt-2.5 sm:mt-4 text-xs sm:text-base text-fg-muted">{d.tagline}</p>
                </div>

                <div>
                  <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300">
                    Why {d.name}
                  </h3>
                  <ul className="mt-2.5 sm:mt-4 space-y-2 sm:space-y-3">
                    {highlightsList.map((h, hIdx) => {
                      const text = typeof h === 'string' ? h : (h?.highlight_text || h?.text || h?.name || '');
                      return (
                        <li key={h?.id || hIdx} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-fg-body">
                          <span className="mt-0.5 inline-flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full bg-brand-400/15 text-brand-600 dark:text-brand-300">
                            <Icon name="check" className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={3} />
                          </span>
                          {text}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="flex flex-col gap-3 sm:gap-6">
                  <div>
                    <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300">
                      Main intakes
                    </h3>
                    <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                      {intakesList.map((t, tIdx) => {
                        const text = typeof t === 'string' ? t : (t?.intake || t?.name || '');
                        return (
                          <span
                            key={t?.id || tIdx}
                            className="inline-flex items-center gap-1 rounded-full border border-brand-400/30 bg-brand-400/[0.07] px-2 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-medium text-fg"
                          >
                            <Icon name="calendar" className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-brand-500" />
                            {text}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300">
                      Popular courses
                    </h3>
                    <div className="mt-2 sm:mt-3 flex flex-wrap gap-1 sm:gap-2">
                      {coursesList.map((c, cIdx) => {
                        const text = typeof c === 'string' ? c : (c?.name || c?.course_name || c?.title || '');
                        return (
                          <span
                            key={c?.id || cIdx}
                            className="rounded-full border border-hair/10 bg-tint/[0.03] px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs text-fg-muted"
                          >
                            {text}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-6 sm:mt-10 flex flex-col items-center gap-3 sm:gap-5 rounded-2xl sm:rounded-3xl border border-dashed border-brand-400/30 p-4 sm:p-8 text-center">
          <p className="max-w-2xl text-sm sm:text-base font-semibold text-fg">
            Also:{' '}
            {moreDestinations.map((country, idx) => (
              <span key={country}>
                <span
                  className="cursor-help hover:text-brand-600 dark:hover:text-brand-300 transition-colors underline decoration-dotted decoration-hair/40 underline-offset-2"
                  title={getCountryTitle({ name: country })}
                >
                  {country}
                </span>
                {idx < moreDestinations.length - 1 ? ', ' : ''}
              </span>
            ))}{' '}
            and more.
          </p>
          <p className="max-w-2xl text-[11px] sm:text-xs text-fg-muted">
            Intakes, costs and work rights change — we’ll give you the latest details for your
            chosen country during counselling.
          </p>
          <MagneticButton
            to="/contact-us"
            icon="calendar"
            title="Book a Free Session with Best Abroad Admission Advisor to Select the Best Country for Your Profile"
            aria-label="Book free session to choose study destination"
            className="!py-2 !px-4 text-xs sm:text-sm"
          >
            Help me choose a country
          </MagneticButton>
        </Reveal>
      </Section>

      <FAQ seq={2} />
      <CTASection variant={1} />
    </>
  );
}
