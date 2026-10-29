/**
 * Single source of truth for the soft-launch flag. While true, only the
 * homepage is linked from nav/footer and every other route is set
 * noindex,nofollow (see src/lib/seo.js). Flip to false to go fully live.
 */
export const HOME_ONLY = false;

/**
 * Light/dark theme toggle in the header. While false the toggle is hidden
 * and everyone sees the default light theme (a previously saved dark
 * preference is ignored). Flip to true to bring the toggle back.
 */
export const SHOW_THEME_TOGGLE = true;
