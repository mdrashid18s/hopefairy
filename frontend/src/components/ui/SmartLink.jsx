import Link from 'next/link';

/**
 * <Link> for internal routes (`to`), plain <a> for everything else
 * (`href` — WhatsApp, tel:, mailto:). Lets link targets that change with
 * the soft-launch flag (see `counsellingLink` in data/site.js) be spread
 * straight in: <SmartLink {...counsellingLink}>.
 */
export default function SmartLink({ to, href, children, ...props }) {
  const derivedTitle = props.title || (typeof children === 'string' ? children : undefined);
  const derivedAriaLabel = props['aria-label'] || derivedTitle;
  const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'));
  const rel = props.rel || (isExternal ? 'noopener noreferrer' : undefined);

  if (to)
    return (
      <Link
        prefetch={false}
        href={to}
        title={derivedTitle}
        aria-label={derivedAriaLabel}
        {...props}
      >
        {children}
      </Link>
    );
  return (
    <a
      href={href}
      title={derivedTitle}
      aria-label={derivedAriaLabel}
      rel={rel}
      {...props}
    >
      {children}
    </a>
  );
}
