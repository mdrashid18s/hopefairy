import { PRELOADER_EMBLEM } from './preloaderEmblem.js';

/**
 * One-time intro overlay on first load of the session.
 * Pure CSS (globals.css, .hf-preloader): it is visible from the very first paint of the HTML
 * (no blank screen while JS loads), plays exactly once even if React re-renders, and is hidden
 * for repeat views by the `hf-preloaded` class set in <head> (app/layout.js).
 */
export default function Preloader() {
  return (
    <div className="hf-preloader fixed inset-0 z-[100] flex items-center justify-center bg-page" aria-hidden="true">
      <div className="hf-preloader-inner flex flex-col items-center gap-5">
        <div className="hf-preloader-logo">
          <img
            src={PRELOADER_EMBLEM}
            alt=""
            width="80"
            height="80"
            className="h-20 w-20 shrink-0 rounded-full shadow-[0_0_0_1px_rgba(216,176,86,0.35),0_6px_20px_-6px_rgba(200,155,60,0.55)]"
          />
        </div>
        <div className="h-px w-40 overflow-hidden bg-tint/10">
          <div className="hf-preloader-bar h-full bg-gradient-to-r from-brand-600 via-brand-300 to-brand-600" />
        </div>
        <span className="text-xs uppercase tracking-[0.4em] text-brand-600 dark:text-brand-300">HopeFairy</span>
      </div>
    </div>
  );
}
