import Link from 'next/link';
import Icon from '../ui/Icon.jsx';
import Flag from '../ui/Flag.jsx';
import Card3D from '../ui/Card3D.jsx';
import { homeOnly, countryCardStyle } from '../../data/site.js';

/**
 * Country card, in several interchangeable styles. The homepage uses
 * `countryCardStyle` from data/site.js; /card-styles previews them all.
 *
 *   compact  — full flag on the left, details on the right
 *   postcard — flag across the top, details below
 *   badge    — round flag badge, centred text
 *   luxe     — black & gold card, flag top-right
 *   glass    — tinted with the flag's own colours behind frosted glass
 *
 * Every style is a Card3D (slab look at rest, pointer tilt) with the flag
 * and text lifted to different depths on hover. Nothing between the card
 * and those layers may use overflow-hidden — it would flatten the 3D effect.
 */
export const CARD_STYLES = ['compact', 'postcard', 'badge', 'luxe', 'glass'];

export const COUNTRY_TOOLTIP_MAP = {
  'united kingdom': 'Study in United Kingdom — Russell Group Universities, 2-Year Post-Study Work Visa (PSW), Low Tuition & Fast 1-Year Masters',
  'uk': 'Study in United Kingdom — Russell Group Universities, 2-Year Post-Study Work Visa (PSW), Low Tuition & Fast 1-Year Masters',
  'gb': 'Study in United Kingdom — Russell Group Universities, 2-Year Post-Study Work Visa (PSW), Low Tuition & Fast 1-Year Masters',

  'united states': 'Study in United States — World Top Universities, 3-Year STEM OPT Work Visa, Tier-1 Research & Generous Merit Scholarships',
  'usa': 'Study in United States — World Top Universities, 3-Year STEM OPT Work Visa, Tier-1 Research & Generous Merit Scholarships',
  'us': 'Study in United States — World Top Universities, 3-Year STEM OPT Work Visa, Tier-1 Research & Generous Merit Scholarships',

  'canada': 'Study in Canada — Top DLI Universities, Up to 3-Year Post-Graduation Work Permit (PGWP) & Express PR Pathways',
  'ca': 'Study in Canada — Top DLI Universities, Up to 3-Year Post-Graduation Work Permit (PGWP) & Express PR Pathways',

  'australia': 'Study in Australia — Group of Eight (Go8) Top Universities, High Minimum Wages & Extended Post-Study Work Visas',
  'au': 'Study in Australia — Group of Eight (Go8) Top Universities, High Minimum Wages & Extended Post-Study Work Visas',

  'germany': 'Study in Germany — Zero Tuition at Public Universities, Global Engineering Hub & 18-Month Job Search Visa',
  'de': 'Study in Germany — Zero Tuition at Public Universities, Global Engineering Hub & 18-Month Job Search Visa',

  'ireland': 'Study in Ireland — Silicon Valley of Europe, Tech & Pharma HQ Hub, English-Speaking & 2-Year Stay Back Visa',
  'ie': 'Study in Ireland — Silicon Valley of Europe, Tech & Pharma HQ Hub, English-Speaking & 2-Year Stay Back Visa',

  'new zealand': 'Study in New Zealand — Safe & Scenic Country, Hands-On Research Universities & Post-Study Work Rights',
  'nz': 'Study in New Zealand — Safe & Scenic Country, Hands-On Research Universities & Post-Study Work Rights',

  'france': 'Study in France — Elite Grandes Écoles & Top Business Schools, Affordable Public Fees & Schengen Access',
  'fr': 'Study in France — Elite Grandes Écoles & Top Business Schools, Affordable Public Fees & Schengen Access',

  'dubai': 'Study in Dubai (UAE) — International Branch Campuses, Tax-Free Career Opportunities & Fast-Track Visa Processing',
  'dubai (uae)': 'Study in Dubai (UAE) — International Branch Campuses, Tax-Free Career Opportunities & Fast-Track Visa Processing',
  'uae': 'Study in Dubai (UAE) — International Branch Campuses, Tax-Free Career Opportunities & Fast-Track Visa Processing',
  'united arab emirates': 'Study in Dubai (UAE) — International Branch Campuses, Tax-Free Career Opportunities & Fast-Track Visa Processing',
  'ae': 'Study in Dubai (UAE) — International Branch Campuses, Tax-Free Career Opportunities & Fast-Track Visa Processing',

  'singapore': 'Study in Singapore — Global Asian Financial Hub, World-Ranked NUS & NTU, and Thriving Global Career Prospects',
  'sg': 'Study in Singapore — Global Asian Financial Hub, World-Ranked NUS & NTU, and Thriving Global Career Prospects',

  'the netherlands': 'Study in Netherlands — High English-Taught Program Diversity, Tech & Innovation Hub & 1-Year Orientation Year Visa',
  'netherlands': 'Study in Netherlands — High English-Taught Program Diversity, Tech & Innovation Hub & 1-Year Orientation Year Visa',
  'nl': 'Study in Netherlands — High English-Taught Program Diversity, Tech & Innovation Hub & 1-Year Orientation Year Visa',

  'italy': 'Study in Italy — Low Tuition / DSU Regional Scholarships, World-Renowned Architecture & Top IMAT Medical Schools',
  'it': 'Study in Italy — Low Tuition / DSU Regional Scholarships, World-Renowned Architecture & Top IMAT Medical Schools',

  'spain': 'Study in Spain — Prestigious Triple-Accredited Business Schools, Affordable European Lifestyle & Rich Heritage',
  'es': 'Study in Spain — Prestigious Triple-Accredited Business Schools, Affordable European Lifestyle & Rich Heritage',

  'malta': 'Study in Malta — English-Speaking Mediterranean EU Country, Cost-Effective Tuition & Friendly Student Visa Guidelines',
  'mt': 'Study in Malta — English-Speaking Mediterranean EU Country, Cost-Effective Tuition & Friendly Student Visa Guidelines',
};

export function getCountryTitle(d) {
  if (!d) return 'Study Abroad Destination';
  const keyName = (d.name || '').trim().toLowerCase();
  const keyCode = (d.code || d.flag || d.country_code || '').trim().toLowerCase();
  const custom = COUNTRY_TOOLTIP_MAP[keyName] || COUNTRY_TOOLTIP_MAP[keyCode];
  if (custom) return custom;
  return `Study in ${d.name} — Top Universities, Course Intakes & Student Visa Guidance with Best Abroad Admission Advisor`;
}

export default function DestinationCard({ destination, variant = countryCardStyle }) {
  if (!destination) return null;
  const normalized = {
    ...destination,
    code: destination.code || destination.country_code || destination.flag || '',
    flag: destination.flag || destination.country_code || destination.code || '',
    intakes: destination.intakes || ['Autumn (Sep/Oct)', 'Spring (Jan/Feb)'],
    tagline: destination.tagline || destination.description || `Study abroad programs and university admissions in ${destination.name}.`,
  };
  const Body = BODIES[variant] || BODIES.compact;
  return <Body d={normalized} />;
}

/* ------------------------------------------------------------------ */

function Shell({ d, className, radius = 'rounded-2xl', surface = 'light', children }) {
  const countryTitle = getCountryTitle(d);
  const linkProps = homeOnly
    ? { title: countryTitle }
    : {
        as: Link,
        prefetch: false,
        href: `/destinations#${d.slug}`,
        title: countryTitle,
        'aria-label': countryTitle,
      };
  return (
    <Card3D {...linkProps} tilt={10} radius={radius} surface={surface} className={className}>
      {children}
    </Card3D>
  );
}

const LIFT_FLAG =
  'transition-[translate,scale] duration-500 ease-out group-hover/card3d:translate-z-10 group-hover/card3d:scale-[1.05]';
const LIFT_TEXT = 'transition-[translate] duration-500 ease-out group-hover/card3d:translate-z-6';

/** Whole, uncropped 3:2 flag with a glossy, slightly fabric-like finish. */
function GlossyFlag({ d, className = '', rounded = 'rounded-lg' }) {
  const countryTitle = getCountryTitle(d);
  return (
    <div className={`relative aspect-[3/2] overflow-hidden ${rounded} shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] ring-1 ring-black/10 ${className}`}>
      <Flag code={d.flag} title={`National Flag of ${d.name} — ${countryTitle}`} className="h-full w-full" />
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0.06)_35%,transparent_50%,rgba(0,0,0,0.06)_72%,rgba(0,0,0,0.2)_100%)]" />
      <span className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(100deg,transparent_0,rgba(255,255,255,0.07)_16%,transparent_32%)] mix-blend-overlay" />
    </div>
  );
}

function Intakes({ d, className = '' }) {
  const text = Array.isArray(d.intakes) ? d.intakes.join(' · ') : (d.intakes || 'Flexible');
  return (
    <span className={`inline-flex items-center gap-1.5 text-[0.7rem] font-medium min-w-0 ${className}`} title={`University Intake Cycles for ${d.name}: ${text}`}>
      <Icon name="calendar" className="h-3.5 w-3.5 shrink-0 text-brand-500" />
      <span className="truncate">{text}</span>
    </span>
  );
}

function Arrow({ className = '' }) {
  if (homeOnly) return null;
  return (
    <Icon
      name="arrow-up-right"
      className={`h-4 w-4 shrink-0 transition-transform duration-300 group-hover/card3d:-translate-y-0.5 group-hover/card3d:translate-x-0.5 ${className}`}
    />
  );
}

/* ------------------------------------------------------------------ */

function Compact({ d }) {
  const countryTitle = getCountryTitle(d);
  return (
    <Shell
      d={d}
      className="h-full min-h-[135px] sm:min-h-[156px] flex-col sm:flex-row gap-2 sm:gap-3.5 p-2.5 sm:p-3 items-stretch justify-between"
    >
      <div className={`relative flex items-center justify-between sm:flex-col sm:justify-center w-full sm:w-20 md:w-22 shrink-0 gap-1.5 ${LIFT_FLAG}`}>
        <div className="flex items-center gap-1.5 sm:flex-col sm:gap-1 w-full sm:w-auto">
          <GlossyFlag d={d} className="w-8 sm:w-full shrink-0" />
          <span className="text-[0.62rem] sm:text-[0.65rem] font-bold tracking-[0.18em] text-fg-faint uppercase" title={`${d.name} (${d.code})`}>{d.code}</span>
        </div>
        <Arrow className="text-brand-600 dark:text-brand-300 shrink-0 sm:hidden" />
      </div>
      <div className={`relative flex min-w-0 flex-1 flex-col justify-between py-0.5 ${LIFT_TEXT}`}>
        <div>
          <h3 className="text-xs sm:text-base font-bold leading-snug text-fg truncate" title={countryTitle}>{d.name}</h3>
          <p className="mt-0.5 sm:mt-1 line-clamp-2 text-[10px] sm:text-xs leading-snug text-fg-muted min-h-[1.75rem] sm:min-h-[2.25rem]" title={d.tagline}>{d.tagline}</p>
        </div>
        <div className="mt-1.5 sm:mt-2 flex items-center justify-between gap-1 border-t border-hair/10 pt-1.5 sm:pt-2 shrink-0">
          <Intakes d={d} className="text-fg-body flex-1 min-w-0" />
          <Arrow className="text-brand-600 dark:text-brand-300 shrink-0 ml-1 hidden sm:inline-flex" />
        </div>
      </div>
    </Shell>
  );
}

function Postcard({ d }) {
  const countryTitle = getCountryTitle(d);
  return (
    <Shell
      d={d}
      radius="rounded-3xl"
      className="flex-col p-3"
    >
      <div className={`relative ${LIFT_FLAG}`}>
        <GlossyFlag d={d} className="w-full" rounded="rounded-2xl" />
        <span className="absolute -bottom-3 left-4 rounded-full border border-brand-400/40 bg-surface px-2.5 py-0.5 text-[0.65rem] font-bold tracking-[0.2em] text-brand-700 shadow-sm dark:bg-ink-850 dark:text-brand-300">
          {d.code}
        </span>
      </div>
      <div className={`relative flex flex-1 flex-col px-2 pb-1 pt-6 ${LIFT_TEXT}`}>
        <h3 className="text-lg font-semibold leading-tight text-fg" title={countryTitle}>{d.name}</h3>
        <p className="mb-4 mt-1.5 line-clamp-2 text-sm leading-relaxed text-fg-muted" title={d.tagline}>{d.tagline}</p>
        <div className="mt-auto flex items-center justify-between gap-2">
          <Intakes d={d} className="rounded-full bg-brand-400/10 px-2.5 py-1 text-fg-body" />
          <Arrow className="text-brand-600 dark:text-brand-300" />
        </div>
      </div>
    </Shell>
  );
}

function Badge({ d }) {
  const countryTitle = getCountryTitle(d);
  return (
    <Shell
      d={d}
      className="flex-col items-center px-5 pb-5 pt-7 text-center"
    >
      {/* gold rule that grows on hover */}
      <span className="absolute inset-x-10 top-0 h-0.5 origin-center scale-x-0 rounded-full bg-gradient-to-r from-brand-300 to-brand-600 transition-transform duration-500 group-hover/card3d:scale-x-100" />
      <div className={`relative ${LIFT_FLAG}`}>
        <div className="rounded-full bg-gradient-to-br from-brand-200 via-brand-400 to-brand-600 p-[3px] shadow-[0_10px_22px_-10px_rgba(120,90,20,0.6)]">
          <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-surface dark:ring-ink-850">
            <Flag code={d.flag} title={`National Flag of ${d.name} — ${countryTitle}`} className="h-full w-full" />
            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.55),transparent_45%)]" />
          </div>
        </div>
      </div>
      <div className={`relative flex flex-1 flex-col items-center ${LIFT_TEXT}`}>
        <h3 className="mt-4 text-lg font-semibold leading-tight text-fg" title={countryTitle}>{d.name}</h3>
        <p className="mb-4 mt-1.5 line-clamp-2 text-xs leading-relaxed text-fg-muted" title={d.tagline}>{d.tagline}</p>
        <Intakes d={d} className="mt-auto justify-center text-fg-body" />
      </div>
    </Shell>
  );
}

function Luxe({ d }) {
  const countryTitle = getCountryTitle(d);
  return (
    <Shell
      d={d}
      surface="dark"
      className="flex-col p-5"
    >
      {/* warm gold light in the corner */}
      <span className="pointer-events-none absolute -left-6 -top-6 h-28 w-28 rounded-full bg-brand-400/20 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3 transform-3d">
        <span className={`text-4xl font-extrabold tracking-tight text-brand-400/25 ${LIFT_TEXT}`}>{d.code}</span>
        <div className={LIFT_FLAG}>
          <GlossyFlag d={d} className="w-16" rounded="rounded-md" />
        </div>
      </div>
      <div className={`relative mt-3 flex flex-1 flex-col ${LIFT_TEXT}`}>
        <h3 className="text-lg font-semibold leading-tight !text-white" title={countryTitle}>{d.name}</h3>
        <p className="mb-4 mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/60" title={d.tagline}>{d.tagline}</p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-brand-400/20 pt-3">
          <Intakes d={d} className="text-brand-200" />
          <Arrow className="text-brand-300" />
        </div>
      </div>
    </Shell>
  );
}

function Glass({ d }) {
  const countryTitle = getCountryTitle(d);
  return (
    <Shell
      d={d}
      surface="none"
      className="flex-col border border-white/40 shadow-card transition-[border-color] duration-500 hover:border-brand-400/60 dark:border-white/10"
    >
      {/* the flag, blown up and blurred, tints the card in its own colours */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <Flag code={d.flag} className="h-full w-full scale-150 opacity-60 blur-2xl" />
        <div className="absolute inset-0 bg-surface/70 dark:bg-ink-900/70" />
      </div>
      <div className="relative flex flex-1 flex-col p-5 transform-3d">
        <div className={`flex items-center gap-3 ${LIFT_FLAG}`}>
          <GlossyFlag d={d} className="w-14" rounded="rounded-md" />
          <span className="text-[0.65rem] font-bold tracking-[0.2em] text-fg-muted">{d.code}</span>
        </div>
        <div className={`flex flex-1 flex-col ${LIFT_TEXT}`}>
          <h3 className="mt-4 text-lg font-semibold leading-tight text-fg" title={countryTitle}>{d.name}</h3>
          <p className="mb-4 mt-1.5 line-clamp-2 text-xs leading-relaxed text-fg-body" title={d.tagline}>{d.tagline}</p>
          <div className="mt-auto flex items-center justify-between gap-2">
            <Intakes d={d} className="rounded-full bg-surface/80 px-2.5 py-1 text-fg-body dark:bg-ink-950/60" />
            <Arrow className="text-fg" />
          </div>
        </div>
      </div>
    </Shell>
  );
}

const BODIES = { compact: Compact, postcard: Postcard, badge: Badge, luxe: Luxe, glass: Glass };
