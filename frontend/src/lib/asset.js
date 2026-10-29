/**
 * Resolve a public asset path against the app's deploy base path.
 * Next prefixes `next/link` and `next/image` automatically, but NOT plain
 * string `src`/`href` values — so any `/assets/...` referenced at runtime
 * goes through here. NEXT_PUBLIC_BASE_PATH is set in next.config.mjs
 * ("" in dev, "/v2" in production).
 *
 *   asset('/assets/theme/hero.jpg')  ->  /v2/assets/theme/hero.jpg
 */
export const asset = (path) =>
  (process.env.NEXT_PUBLIC_BASE_PATH || '') + '/' + String(path).replace(/^\/+/, '');

export default asset;
