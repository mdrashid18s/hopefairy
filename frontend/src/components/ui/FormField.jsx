/**
 * Labelled form control used by every form on the site (contact page,
 * homepage query form). Renders an <input> by default; pass `as="select"`
 * or `as="textarea"` for the others.
 *
 * @param {{label:string, error?:string, required?:boolean, as?:'input'|'select'|'textarea', className?:string}} p
 */
export default function FormField({ label, error, required, as = 'input', className = '', children, ...props }) {
  const Cmp = as;
  return (
    <label className={`flex flex-col gap-1 sm:gap-2 ${className}`}>
      <span className="text-xs sm:text-sm font-medium text-fg-muted">
        {label}
        {required && <span className="ml-0.5 text-brand-600 dark:text-brand-300">*</span>}
      </span>
      <Cmp
        {...props}
        required={required}
        aria-invalid={!!error}
        className={`w-full rounded-xl border bg-page/70 px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm text-fg placeholder:text-fg-faint outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 ${
          error ? 'border-red-500/60' : 'border-hair/15'
        }`}
      >
        {children}
      </Cmp>
      {error && <span className="text-[11px] sm:text-xs text-red-600 dark:text-red-400">{error}</span>}
    </label>
  );
}

/**
 * Anti-spam trap: hidden from people (and screen readers), but bots that
 * fill every field will fill this one — the server then silently drops
 * the submission. Keep the field name in sync with public/api/query.php.
 */
export function Honeypot({ value, onChange }) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={onChange} />
      </label>
    </div>
  );
}
