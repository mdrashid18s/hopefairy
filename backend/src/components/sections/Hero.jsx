'use client';

import MagneticButton from '../ui/MagneticButton.jsx';
import Icon from '../ui/Icon.jsx';
import Logo from '../layout/Logo.jsx';
import Sparkle from '../ui/Sparkle.jsx';
import Flag from '../ui/Flag.jsx';
import { getCountryTitle } from './DestinationCard.jsx';
import { hero, destinations, stats, homeOnly, counsellingLink } from '../../data/site.js';

// Destination chips spaced evenly around the outer ring (percent of the
// orbit box), offset half a step so none sits dead-centre top or bottom.
const CHIP_POS = Array.from({ length: 8 }, (_, i) => {
  const a = ((-67.5 + i * 45) * Math.PI) / 180;
  return { left: `${50 + 50 * Math.cos(a)}%`, top: `${50 + 50 * Math.sin(a)}%` };
});

// Twinkling four-point stars — a nod to the star in the logo.
const STARS = [
  { top: '14%', left: '8%', size: 10, delay: 0 },
  { top: '72%', left: '46%', size: 8, delay: 1.2 },
  { top: '24%', left: '44%', size: 12, delay: 2.1 },
  { top: '86%', left: '14%', size: 9, delay: 0.6 },
  { top: '10%', left: '66%', size: 7, delay: 1.7 },
  { top: '60%', left: '92%', size: 11, delay: 2.6 },
];

export default function Hero() {
  return (
    <section className="relative isolate flex flex-col justify-center sm:min-h-0 xl:min-h-[100svh] sm:items-center w-full overflow-hidden bg-ink-950 text-white">
      {/* Ambient black-and-gold backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_72%_45%,rgba(200,155,60,0.22),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_10%_100%,rgba(200,155,60,0.10),transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-[0.5] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_70%_45%,black,transparent_70%)]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(216,176,86,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(216,176,86,0.07) 1px, transparent 1px)',
          }}
        />
        <div className="absolute inset-0 noise opacity-[0.05] mix-blend-overlay" />
        {STARS.map((s, i) => (
          <span
            key={i}
            className="hero-twinkle absolute text-brand-300"
            style={{ top: s.top, left: s.left, animationDelay: `${s.delay}s` }}
          >
            <Sparkle size={s.size} />
          </span>
        ))}
        <div className="absolute inset-x-0 bottom-0 h-24 sm:h-40 bg-gradient-to-t from-ink-950 to-transparent" />
      </div>

      <div className="container-x relative z-10 w-full pb-8 pt-20 sm:pt-28 sm:pb-16 md:pt-32 md:pb-20 lg:pt-36 lg:pb-24 lg:px-10 xl:px-8">
        <div className="grid items-center gap-6 sm:gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 xl:gap-12">
          {/* Copy */}
          {/* Entrance runs in CSS (.hero-rise) so the copy shows without waiting for JS — keeps LCP fast */}
          <div className="max-w-2xl lg:max-w-xl xl:max-w-2xl">
            <div
              style={{ '--d': '0.05s' }}
              className="hero-rise w-full sm:w-auto mx-auto sm:mx-0 flex sm:inline-flex items-center justify-around sm:justify-center gap-1 sm:gap-2.5 rounded-xl border border-brand-400/35 bg-brand-400/[0.08] px-2.5 min-[360px]:px-3 sm:px-4 py-2 sm:py-1.5 shadow-xs backdrop-blur-xs text-[clamp(7.6px,2.25vw,10px)] sm:text-xs font-bold uppercase tracking-tight sm:tracking-[0.14em] text-brand-200 leading-none"
            >
              <span className="inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
                <Sparkle size={10} className="text-brand-300 shrink-0" />
                <span>{hero.kickerItems?.[0] || 'Abroad Admission Advisor'}</span>
              </span>
              <span className="text-brand-400/80 shrink-0 select-none">·</span>
              <span className="shrink-0 whitespace-nowrap">{hero.kickerItems?.[1] || 'Career Counselling'}</span>
              <span className="text-brand-400/80 shrink-0 select-none">·</span>
              <span className="shrink-0 whitespace-nowrap">{hero.kickerItems?.[2] || 'Test Prep'}</span>
            </div>

            <h1
              style={{ '--d': '0.14s' }}
              className="hero-rise mt-2 text-[1.85rem] leading-[1.12] !text-white sm:mt-5 sm:text-4xl md:text-[2.75rem] lg:text-[3.25rem] xl:text-[4.4rem] sm:leading-[1.1]"
            >
              {hero.headlineTop}
              <br />
              <span className="text-gold">{hero.headlineAccent}</span>
            </h1>

            <p style={{ '--d': '0.23s' }} className="hero-rise mt-2 sm:mt-6 max-w-xl text-xs sm:text-base lg:text-lg leading-relaxed text-white/70">
              {hero.copy}
            </p>

            {/* Desktop Action Buttons: Kept inside copy column on sm+ */}
            <div style={{ '--d': '0.32s' }} className="hero-rise mt-4 sm:mt-9 hidden sm:flex sm:flex-row sm:gap-3">
              <MagneticButton
                {...counsellingLink}
                icon="calendar"
                title="Book a Free 1-on-1 Session with Best Abroad Admission Advisor & Career Counsellor — HopeFairy"
                aria-label="Book a free personal counselling session"
                className="w-full justify-center !py-2.5 !px-2 text-xs sm:w-auto sm:!py-3.5 sm:!px-7 sm:text-base font-bold text-center"
              >
                <span>{hero.ctaPrimary}</span>
              </MagneticButton>
              <MagneticButton
                to={homeOnly ? '/#destinations' : '/destinations'}
                variant="ghost"
                icon="arrow-right"
                title="Explore Top Destinations with Best Abroad Admission Advisor — UK, USA, Canada, Germany & Australia"
                aria-label="Explore study destinations"
                className="w-full justify-center !border-white/25 !text-white hover:!border-brand-300/70 hover:!bg-white/5 !py-2.5 !px-2 text-xs sm:w-auto sm:!py-3.5 sm:!px-7 sm:text-base font-bold text-center"
              >
                <span>{hero.ctaSecondary}</span>
              </MagneticButton>
            </div>

            <ul
              style={{ '--d': '0.41s' }}
              className="hero-rise mt-2.5 sm:mt-10 flex flex-wrap gap-x-3.5 sm:gap-x-6 gap-y-1.5 sm:gap-y-3 text-[11px] sm:text-sm text-white/75"
            >
              {hero.trust.map((t) => (
                <li key={t} className="flex items-center gap-1.5 sm:gap-2">
                  <span className="inline-flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-brand-400/15 text-brand-300">
                    <Icon name="check" className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            {/* Trust highlights badge — placed cleanly on the left column where space is open */}
            <div
              style={{ '--d': '0.5s' }}
              className="hero-rise mt-6 sm:mt-9 hidden sm:inline-flex items-center gap-2.5 sm:gap-3.5 rounded-2xl border border-brand-400/25 bg-ink-900/90 px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-card backdrop-blur-md w-fit"
            >
              <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-300 to-brand-600 text-ink-950 shrink-0">
                <Icon name="graduation-cap" className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </span>
              <span className="whitespace-nowrap text-xs sm:text-sm">
                <span className="block font-semibold text-white">{stats.items[0].value} study destinations</span>
                <span className="text-white/55">One counsellor, start to finish</span>
              </span>
            </div>
          </div>

          {/* Emblem orbit — Scaled down on iPad (310px) with compact chips so it never touches the right edge */}
          {/* CSS entrance (.hero-zoom): the emblem is the mobile LCP image, so it must not wait for JS */}
          <div
            className="hero-zoom relative mx-auto aspect-square mt-6 mb-2 sm:my-0 w-[min(54vw,205px)] sm:w-[min(70vw,320px)] lg:w-[310px] xl:w-[450px] 2xl:w-[480px]"
          >
            {/* rotating gold rings */}
            <div className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-brand-400/30" />
            <div className="absolute inset-[12%] animate-spin-slower rounded-full border border-brand-400/15" />
            <div className="absolute inset-[24%] rounded-full bg-brand-400/10 blur-3xl" />

            {/* planes flying the rings, each trailing a fading gold arc */}
            <Orbit className="inset-0" duration="26s" />
            <Orbit className="inset-[12%]" duration="19s" reverse />

            {/* emblem */}
            <div className="absolute inset-[24%] animate-float" style={{ animationDuration: '8s' }}>
              <div className="relative h-full w-full">
                <div className="absolute -inset-3 rounded-full bg-[conic-gradient(from_0deg,rgba(243,220,151,0.55),rgba(200,155,60,0.05),rgba(243,220,151,0.55))] opacity-70 blur-md" />
                <Logo size="lg" priority className="relative h-full w-full" />
              </div>
            </div>

            {/* destination chips — kept static, opaque and transform-free so
                the text stays crisp (moving/blurred layers rasterise text) */}
            {destinations.map((d, i) => {
              const pos = CHIP_POS[i % CHIP_POS.length];
              return (
                // Zero-size anchor at the point on the ring; flex centres the
                // chip on it without a fractional translate(-50%).
                <div
                  key={d.slug}
                  className="hero-fade absolute flex h-0 w-0 items-center justify-center"
                  style={{ ...pos, '--d': `${0.6 + i * 0.08}s` }}
                >
                  <span
                    className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-brand-400/35 bg-ink-900 px-1.5 py-0.5 text-[0.62rem] font-semibold text-white shadow-[0_8px_24px_-10px_rgba(0,0,0,0.8)] sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[0.68rem] xl:px-3 xl:py-1.5 xl:text-[0.8rem]"
                    title={getCountryTitle(d)}
                  >
                    <Flag code={d.flag} title={`National Flag of ${d.name} — ${getCountryTitle(d)}`} className="h-2.5 w-[15px] rounded-[2px] ring-1 ring-white/20 sm:h-3 sm:w-[17px] xl:h-3.5 xl:w-[21px]" />
                    <span className="text-brand-300 sm:hidden">{d.code}</span>
                    <span className="hidden sm:inline">{d.name}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Action Buttons: Spaced with mt-10 to give clear comfortable gap below orbit chips */}
        <div
          style={{ '--d': '0.05s' }}
          className="hero-rise mt-10 mb-2 grid grid-cols-2 gap-2.5 w-full max-w-sm mx-auto sm:hidden"
        >
          <MagneticButton
            {...counsellingLink}
            icon="calendar"
            title="Book a Free 1-on-1 Session with Best Abroad Admission Advisor & Career Counsellor — HopeFairy"
            aria-label="Book a free personal counselling session"
            className="w-full justify-center !py-2.5 !px-2 text-xs font-bold text-center"
          >
            <span>Free Counselling</span>
          </MagneticButton>
          <MagneticButton
            to={homeOnly ? '/#destinations' : '/destinations'}
            variant="ghost"
            icon="arrow-right"
            title="Explore Top Destinations with Best Abroad Admission Advisor — UK, USA, Canada, Germany & Australia"
            aria-label="Explore study destinations"
            className="w-full justify-center !border-white/25 !text-white hover:!border-brand-300/70 hover:!bg-white/5 !py-2.5 !px-2 text-xs font-bold text-center"
          >
            <span>Destinations</span>
          </MagneticButton>
        </div>
      </div>

      <div className="absolute bottom-6 right-5 z-20 hidden items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/40 xl:flex">
        <span>Scroll</span>
        <Icon name="chevron-down" className="h-4 w-4 animate-bounce" />
      </div>
    </section>
  );
}

/**
 * A plane circling one of the orbit rings. The wrapper matches the ring's
 * box and spins; the plane sits on the ring's top edge, nose pointing
 * along the direction of travel, with a masked arc as its trail.
 */
function Orbit({ className, duration, reverse = false }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{
        animation: `spin ${duration} linear infinite`,
        animationDirection: reverse ? 'reverse' : 'normal',
      }}
    >
      {/* trail: the ring's own outline, revealed only just behind the plane */}
      <div
        className="absolute inset-0 rounded-full border-2 border-brand-300/80"
        style={{
          maskImage: reverse
            ? 'conic-gradient(from 0deg, black 0deg, transparent 55deg)'
            : 'conic-gradient(from 305deg, transparent 0deg, black 55deg, transparent 55deg)',
        }}
      />
      <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
        <Icon
          name="plane"
          strokeWidth={2}
          // lucide's plane points up-right (45°): turn it to face the direction of travel
          className={`h-6 w-6 text-brand-300 drop-shadow-[0_0_6px_rgba(228,199,117,0.8)] ${
            reverse ? '-rotate-[135deg]' : 'rotate-45'
          }`}
        />
      </span>
    </div>
  );
}
