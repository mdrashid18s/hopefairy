import { SITE_ORIGIN, BASE_PATH } from '../config/deploy.js';
import { HOME_ONLY } from '../config/launch.js';

const SITE_NAME = 'HopeFairy';
const SITE_URL = `${SITE_ORIGIN}${BASE_PATH}`;
// Absolute + base-path aware. Note: `image` args passed in from call sites
// are already the output of asset() (root-relative, base-path prefixed),
// so they only need SITE_ORIGIN prepended, not SITE_URL (which would
// double the base path).
const DEFAULT_IMAGE = `${SITE_URL}/brand/og-image.jpg`;

/**
 * Build a Next `Metadata` object for a route. Used as
 * `export const metadata = pageMetadata({...})` on static pages, or
 * returned from an async `generateMetadata({ params })` for dynamic ones.
 *
 * Next renders these tags into the actual HTML at build time (static
 * export), so crawlers and link-unfurlers (WhatsApp, Facebook, X,
 * LinkedIn — none of which execute JS) see real, page-specific
 * title/description/OG/canonical tags.
 *
 * @param {{title?:string, description?:string, path?:string, image?:string, type?:string, noindex?:boolean}} p
 */
export function pageMetadata({
  title,
  description,
  keywords,
  path = '/',
  image,
  type = 'website',
  noindex,
} = {}) {
  const url = `${SITE_URL}${path === '/' ? '/' : path}`;
  const img = image ? `${SITE_ORIGIN}${image}` : DEFAULT_IMAGE;
  // While the site is soft-launched to just the homepage (src/config/launch.js),
  // keep every other route out of search results.
  const shouldNoindex = noindex ?? (HOME_ONLY && path !== '/');
  // If the title already contains the site brand (e.g. "— HopeFairy" or "HopeFairy | ..."),
  // use { absolute: title } so Next.js doesn't append the root layout template again.
  const titleField = title
    ? { title: title.includes(SITE_NAME) ? { absolute: title } : title }
    : {};
  const keywordsField = keywords ? { keywords } : {};

  return {
    ...titleField,
    description,
    ...keywordsField,
    alternates: { canonical: url },
    robots: shouldNoindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      ...titleField,
      description,
      url,
      siteName: SITE_NAME,
      type,
      images: [{ url: img }],
    },
    twitter: {
      card: 'summary_large_image',
      ...titleField,
      description,
      images: [img],
    },
  };
}

export { SITE_ORIGIN, BASE_PATH, SITE_URL, SITE_NAME, DEFAULT_IMAGE };
