import Section from '../ui/Section.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';
import Card3D, { Lift } from '../ui/Card3D.jsx';
import { stats } from '../../data/site.js';

/** Headline numbers — see the CONFIRM note in data/site.js. */
export default function StatsSection({ variant, seq, alt, className = '' }) {
  return (
    <Section variant={variant} seq={seq} alt={alt} className={`!py-10 sm:!py-14 ${className}`}>
      <SectionHeading
        eyebrow="Proven Impact"
        title={stats.title}
        align="center"
        highlightLast={2}
        className="!mx-auto"
      />
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
    </Section>
  );
}
