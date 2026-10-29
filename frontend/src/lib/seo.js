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
  const url = pageUrl(path);
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

/**
 * Absolute URL of a route exactly as its canonical tag states it. The site is exported with
 * trailingSlash, so every page lives at ".../path/"; sitemaps and structured data use the same
 * form so search engines see one URL per page. Anchors (#...) are kept after the slash.
 */
export function pageUrl(path = '/') {
  const [route, hash] = path.split('#');
  const clean = route === '/' || route === '' ? '/' : `${route.replace(/\/+$/, '')}/`;
  return `${SITE_URL}${clean}${hash ? `#${hash}` : ''}`;
}

/**
 * schema.org WebPage (or a subtype such as AboutPage) for a route, linked to the site and its
 * publisher, so search engines can tie the page to the HopeFairy organisation.
 * @param {{name:string, description:string, path:string, type?:string, dateModified?:string, extra?:object}} p
 */
export function webPageJsonLd({ name, description, path, type = 'WebPage', dateModified, extra = {} }) {
  const url = pageUrl(path);
  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: 'en-IN',
    ...(dateModified ? { dateModified } : {}),
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: pageUrl('/') },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/`, logo: `${SITE_URL}/brand/hopefairy-emblem.png` },
    ...extra,
  };
}

export { SITE_ORIGIN, BASE_PATH, SITE_URL, SITE_NAME, DEFAULT_IMAGE };
