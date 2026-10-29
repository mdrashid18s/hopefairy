import Section from '../ui/Section.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';
import Icon from '../ui/Icon.jsx';
import Logo from '../layout/Logo.jsx';
import Card3D, { Lift } from '../ui/Card3D.jsx';
import { whyUs } from '../../data/site.js';

/** "Why HopeFairy?" — differentiators around a black-and-gold brand panel. */
export default function WhyUs({ alt = false, variant, seq }) {
  return (
    <Section id="why-us" alt={alt} variant={variant} seq={seq}>
      <div className="grid gap-6 sm:gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <SectionHeading
            eyebrow={whyUs.eyebrow}
            title={whyUs.headline}
            intro={whyUs.copy}
            highlightLast={2}
          />

          {/* Brand panel — stays black in both themes */}
          <Reveal i={3} className="mt-6 sm:mt-10">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-brand-400/25 bg-ink-950 p-4 sm:p-8 text-white">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-400/25 blur-[80px]" />
              <div className="relative flex items-center gap-3 sm:gap-5">
                <Logo className="h-12 w-12 sm:h-20 sm:w-20 shrink-0" size="lg" />
                <div>
                  <p className="text-sm leading-snug text-white sm:text-2xl">
                    “{whyUs.promise}”
                  </p>
                  <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-brand-300">{whyUs.promiseLabel}</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-5">
          {whyUs.differentiators.map((d, i) => (
            <Reveal key={d.title} i={i}>
              <Card3D className="flex-col p-3 sm:p-6 justify-between h-full">
                <Lift depth="lg" className="flex items-center gap-2 sm:block">
                  <span className="icon-3d h-8 w-8 sm:h-11 sm:w-11 rounded-xl shrink-0">
                    <Icon name={d.icon} className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                  <h3 className="text-xs sm:text-base font-semibold text-fg sm:hidden leading-snug">{d.title}</h3>
                </Lift>
                <Lift depth="sm" className="mt-1 sm:mt-4">
                  <h3 className="text-base font-semibold text-fg hidden sm:block">{d.title}</h3>
                  <p className="mt-0.5 sm:mt-1.5 text-[10.5px] sm:text-sm leading-snug sm:leading-relaxed text-fg-muted line-clamp-3 sm:line-clamp-none">{d.text}</p>
                </Lift>
              </Card3D>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
