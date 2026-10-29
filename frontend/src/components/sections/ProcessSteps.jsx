import Section from '../ui/Section.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';
import Icon from '../ui/Icon.jsx';
import { process } from '../../data/site.js';

/** The six-step student journey, as a numbered gold timeline. */
export default function ProcessSteps({ alt = true, variant, seq }) {
  return (
    <Section id="journey" alt={alt} variant={variant} seq={seq}>
      <SectionHeading
        eyebrow={process.eyebrow}
        title={process.title}
        intro={process.intro}
        align="center"
        className="!mx-auto"
        highlightLast={2}
      />

      <div className="relative mt-8 sm:mt-16">
        {/* connecting line (desktop) — continuous clean golden timeline */}
        <div className="pointer-events-none absolute left-[8%] right-[8%] top-7 hidden h-[1.5px] bg-gradient-to-r from-brand-400/20 via-brand-400/70 to-brand-400/20 lg:block z-0" />

        <ol className="relative z-10 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-6">
          {process.steps.map((s, i) => (
            <Reveal as="li" key={s.n} i={i} className="group relative text-center p-2 sm:p-0">
              <span className="icon-3d relative mx-auto flex h-11 w-11 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full bg-surface dark:bg-[#14120e]">
                <Icon name={s.icon} className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[0.6rem] sm:text-[0.68rem] font-black text-[#0b0b0c] ring-2 ring-surface dark:ring-[#14120e] shadow-sm">
                  {s.n}
                </span>
              </span>
              <h3 className="mt-2.5 sm:mt-5 text-xs sm:text-base font-semibold text-fg transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-300 leading-snug">{s.title}</h3>
              <p className="mx-auto mt-1 sm:mt-2 max-w-xs text-[10.5px] sm:text-sm leading-snug sm:leading-relaxed text-fg-muted line-clamp-3 sm:line-clamp-none">{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  );
}
