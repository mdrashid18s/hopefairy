import Reveal from '../ui/Reveal.jsx';
import MagneticButton from '../ui/MagneticButton.jsx';
import Logo from '../layout/Logo.jsx';
import Sparkle from '../ui/Sparkle.jsx';
import { site, cta, counsellingLink } from '../../data/site.js';

/** Closing call-to-action band — seamlessly matches the footer background in both themes */
export default function CTASection({
  eyebrow = cta.eyebrow,
  title = cta.title,
  text = cta.text,
  buttonLabel = cta.buttonLabel,
  className = '',
}) {
  return (
    <section
      id="cta-section"
      className={`relative py-10 sm:py-14 md:py-20 w-full max-w-full overflow-hidden bg-surface/60 dark:bg-ink-950 ${className}`}
    >
      <div className="container-x">
        <Reveal>
        <div className="group relative overflow-hidden rounded-2xl sm:rounded-[2rem] border border-brand-400/30 bg-ink-950 px-4 py-8 text-center sm:px-16 sm:py-20">
          {/* gold blooms */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-400/30 blur-[100px] animate-glow-pulse" />
          <div
            className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-brand-600/25 blur-[100px] animate-glow-pulse"
            style={{ animationDelay: '-2s' }}
          />
          {/* hairline gold rule */}
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/80 to-transparent" />
          {/* periodic diagonal shine sweep */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <span className="animate-shine-sweep absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-brand-200/10 to-transparent" />
          </div>
          <Sparkle size={14} className="absolute left-[12%] top-[22%] text-brand-300/60" />
          <Sparkle size={10} className="absolute right-[16%] bottom-[24%] text-brand-300/50" />

          <div className="relative mx-auto max-w-2xl">
            <Logo className="mx-auto h-12 w-12 sm:h-16 sm:w-16" size="lg" />
            <span className="mt-4 sm:mt-6 inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-brand-300">
              {eyebrow}
            </span>
            <h2 className="mt-3 sm:mt-4 text-2xl leading-[1.1] !text-white sm:text-4xl md:text-5xl">{title}</h2>
            <p className="mx-auto mt-3 sm:mt-5 max-w-xl text-xs sm:text-base leading-relaxed text-white/65">{text}</p>
            <div className="mt-6 sm:mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <MagneticButton
                {...counsellingLink}
                icon="calendar"
                title="Book a Free 1-on-1 Session with Best Abroad Admission Advisor & Career Counsellor — HopeFairy"
                aria-label="Book free counselling session"
              >
                {buttonLabel}
              </MagneticButton>
              <MagneticButton
                href={site.phoneHref}
                variant="ghost"
                icon="phone"
                title="Call Best Abroad Admission Advisor Helpdesk at +91 91470 70644"
                aria-label="Call HopeFairy admission phone helpline"
                className="!border-white/25 !text-white hover:!border-brand-300/70 hover:!bg-white/5"
              >
                {site.phone}
              </MagneticButton>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);
}
