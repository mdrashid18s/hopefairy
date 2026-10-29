import Section from '../ui/Section.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';
import MagneticButton from '../ui/MagneticButton.jsx';
import Icon from '../ui/Icon.jsx';
import Card3D, { Lift } from '../ui/Card3D.jsx';
import { about, homeOnly } from '../../data/site.js';

/** Homepage "About HopeFairy" teaser, with the audiences we guide. */
export default function WhoWeAre({ alt = true, variant, seq }) {
  return (
    <Section id="about" alt={alt} variant={variant} seq={seq}>
      <div className="grid gap-6 sm:gap-12 lg:grid-cols-2 lg:items-start">
        <div>
          <SectionHeading eyebrow={about.teaserEyebrow} title={about.headline} highlightLast={2} />
          <div className="mt-6 space-y-4">
            {about.paragraphs.map((p, i) => (
              <Reveal key={i} i={i} as="p" className="text-sm leading-relaxed text-fg-muted sm:text-base">
                {p}
              </Reveal>
            ))}
          </div>
          {!homeOnly && (
            <Reveal i={4} className="mt-8">
              <MagneticButton
                to="/about-us"
                variant="ghost"
                title="Learn About HopeFairy — Best Abroad Admission Advisor & Career Mentors in India"
                aria-label="Learn more about HopeFairy counsellors and mission"
              >
                {about.teaserButton}
              </MagneticButton>
            </Reveal>
          )}
        </div>

        <div>
          <Reveal>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              {about.audienceTitle}
            </h3>
          </Reveal>
          <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2.5 sm:gap-5">
            {about.audience.map((a, i) => (
              <Reveal key={a.title} i={i}>
                <Card3D className="flex-col p-3 sm:p-6 justify-between h-full">
                  <Lift depth="lg" className="flex items-center gap-2 sm:block">
                    <span className="icon-3d h-8 w-8 sm:h-11 sm:w-11 rounded-full shrink-0">
                      <Icon name={a.icon} className="h-4 w-4 sm:h-5 sm:w-5" />
                    </span>
                    <h3 className="text-xs sm:text-base font-semibold text-fg sm:hidden leading-snug">{a.title}</h3>
                  </Lift>
                  <Lift depth="sm" className="mt-1 sm:mt-4">
                    <h3 className="text-base font-semibold text-fg hidden sm:block">{a.title}</h3>
                    <p className="mt-0.5 sm:mt-1.5 text-[10.5px] sm:text-sm leading-snug sm:leading-relaxed text-fg-muted line-clamp-3 sm:line-clamp-none">{a.text}</p>
                  </Lift>
                </Card3D>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
