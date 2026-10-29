/**
 * Single source of truth for the deploy target, shared by next.config.mjs
 * (basePath) and app code (canonical / OG URL construction).
 *
 * Currently deployed at https://areezsoftware.com/hope/. When the site
 * moves to its own domain, set SITE_ORIGIN to it and BASE_PATH to ''.
 */
export const SITE_ORIGIN = 'https://myhopefairy.com';

// Sub-path this build is served from in production.
// Empty string for root domain deployment (https://myhopefairy.com/ in public_html)
export const BASE_PATH = process.env.NEXT_PUBLIC_DEPLOY_PATH !== undefined 
  ? process.env.NEXT_PUBLIC_DEPLOY_PATH 
  : '';


