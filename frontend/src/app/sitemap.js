import { services, homeOnly } from '../data/site.js';
import { pageUrl } from '../lib/seo.js';

export const dynamic = 'force-static';

/**
 * Statically generated at build time (`out/sitemap.xml`) — supported by
 * `output: 'export'`. Kept in sync with the soft-launch flag: a sitemap
 * listing noindex pages is a known SEO smell, so only "/" is listed while
 * HOME_ONLY is on (src/config/launch.js).
 */
export default function sitemap() {
  const staticRoutes = [
    '/',
    '/about-us',
    '/services',
    '/destinations',
    '/india-admissions',
    '/gulf-desk',
    '/test-prep',
    '/contact-us',
    '/sitemap',
    '/privacy-policy',
    '/terms-of-use',
  ];
  const serviceRoutes = services.map((s) => `/service/${s.slug}`);
  const all = [...staticRoutes, ...serviceRoutes];
  const routes = homeOnly ? ['/'] : all;

  const getPriority = (path) => {
    if (path === '/') return 1.0;
    if (['/destinations', '/services', '/india-admissions', '/gulf-desk', '/test-prep'].includes(path)) return 0.9;
    if (['/about-us', '/contact-us'].includes(path)) return 0.8;
    if (['/sitemap', '/privacy-policy', '/terms-of-use'].includes(path)) return 0.3;
    return 0.75;
  };

  const getChangeFreq = (path) => {
    if (path === '/') return 'daily';
    if (['/destinations', '/services', '/india-admissions', '/gulf-desk', '/test-prep', '/contact-us'].includes(path)) return 'weekly';
    return 'monthly';
  };

  return routes.map((path) => ({
    url: pageUrl(path), // same form as each page's canonical tag (trailing slash)
    lastModified: new Date(),
    changeFrequency: getChangeFreq(path),
    priority: getPriority(path),
  }));
}
