import { COMMON_FLAGS } from './commonFlags.js';
import LazyFlag from './LazyFlag.jsx';

// When a flag is cropped to a narrower (e.g. portrait) box, these keep
// their defining canton — stars & stripes / Union Jack — in view instead
// of the centre.
const ALIGN_LEFT = new Set(['US', 'AU', 'NZ']);

const escapeXml = (s) => String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]);

/**
 * 3:2 SVG country flag. Real SVGs rather than emoji — flag emoji don't
 * render on Windows (they show as two letters). Fills its box like
 * object-fit: cover.
 * Supports all 266 ISO-3166 alpha-2 country flags from country-flag-icons:
 * the common ones (commonFlags.js) render straight away; any other code (e.g. a
 * destination added from the admin panel) is fetched on demand by <LazyFlag>, so
 * the ~250 rarely used flags stay out of the first page load.
 * @param {{code:string, title?:string, className?:string}} p  code: ISO 3166 alpha-2
 */
export default function Flag({ code, title, className = '' }) {
  if (!code) return null;
  const upper = String(code).toUpperCase().trim();

  const svgProps = {
    role: title ? 'img' : undefined,
    'aria-label': title || undefined,
    'aria-hidden': title ? undefined : true,
    className: `block ${className}`,
    preserveAspectRatio: `${ALIGN_LEFT.has(upper) ? 'xMinYMid' : 'xMidYMid'} slice`,
  };

  const flag = COMMON_FLAGS[upper];
  if (flag) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={flag.v}
        {...svgProps}
        dangerouslySetInnerHTML={{ __html: (title ? `<title>${escapeXml(title)}</title>` : '') + flag.d }}
      />
    );
  }

  return <LazyFlag code={upper} title={title} className={className} svgProps={{ ...svgProps, title }} />;
}

/** Fallback shown for an unknown code. */
export function FlagBadge({ code, title, className = '' }) {
  return (
    <span
      title={title || code}
      className={`inline-flex items-center justify-center font-bold text-[10px] bg-brand-400/20 text-brand-700 dark:text-brand-300 rounded ${className}`}
    >
      {code.slice(0, 2)}
    </span>
  );
}
