import { site } from '../../data/site.js';

/**
 * The HopeFairy emblem (cropped from the brand logo) — optionally with the
 * two-tone "Hope Fairy" wordmark and tagline beside it.
 *
 * @param {{className?:string, size?:'sm'|'lg', wordmark?:boolean, tagline?:boolean, light?:boolean}} p
 *   `light` forces white text (for the always-black hero), otherwise it
 *   follows the theme.
 */
export default function Logo({
  className = 'h-9 w-9',
  size = 'sm',
  wordmark = false,
  tagline = false,
  light = false,
  priority = false, // hero emblem: it is the mobile LCP image, fetch it first
}) {
  const [a, b] = site.wordmark;
  const img = size === 'lg' ? site.logoWebp : site.logoSmallWebp;
  const emblem = (
    // eslint-disable-next-line @next/next/no-img-element -- static export, plain img matches images.unoptimized
    <img
      src={img.src}
      srcSet={img.srcSet}
      // the large emblem shows at ~110–250px (hero orbit), the small one at ~36–48px
      sizes={size === 'lg' ? '(min-width: 1280px) 250px, 160px' : '48px'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      alt={`${site.name} — Study Abroad & Career Counselling Consultants`}
      title={`${site.name} — Where Dreams Meet Destinations`}
      width={size === 'lg' ? 512 : 160}
      height={size === 'lg' ? 512 : 160}
      className={`${className} shrink-0 rounded-full shadow-[0_0_0_1px_rgba(216,176,86,0.35),0_6px_20px_-6px_rgba(200,155,60,0.55)]`}
    />
  );

  if (!wordmark) return emblem;

  return (
    <span className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
      {emblem}
      <span className="flex flex-col leading-none shrink-0">
        <span
          className={`text-[1.2rem] font-extrabold tracking-tight transition-colors ${
            light ? 'text-white' : 'text-fg'
          }`}
        >
          {a}
          <span className={light ? 'text-brand-400' : 'text-brand-600 dark:text-brand-400'}>{b}</span>
        </span>
        {tagline && (
          <span
            className={`mt-1 hidden text-[0.6rem] font-medium uppercase tracking-[0.18em] sm:block ${
              light ? 'text-white/55' : 'text-fg-muted'
            }`}
          >
            {site.tagline}
          </span>
        )}
      </span>
    </span>
  );
}
