import { SITE_URL } from '../lib/seo.js';

export const dynamic = 'force-static';

/**
 * Statically generated at build time (`out/robots.txt`).
 *
 * NOTE: robots.txt is only honoured at the DOMAIN ROOT. If the site is
 * ever deployed under a sub-path (BASE_PATH in src/config/deploy.js),
 * merge these rules into the root site's robots.txt instead.
 */
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/backend/', '/backend', '/api/', '/admin/', '/admin', '/card-styles/', '/card-styles'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
