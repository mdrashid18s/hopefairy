'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Icon from './Icon.jsx';

/**
 * Button / link with a subtle magnetic pull toward the cursor.
 * Renders <Link> when `to` is set, <a> when `href` is set, else <button>.
 */
export default function MagneticButton({
  children,
  to,
  href,
  external = false,
  variant = 'primary',
  icon = 'arrow-right',
  className = '',
  ...props
}) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = 'translate(0,0)';
  };

  const cls = `${variant === 'primary' ? 'btn-primary' : 'btn-ghost'} group ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      {icon && (
        <Icon
          name={icon}
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
        />
      )}
    </>
  );

  const derivedTitle = props.title || (typeof children === 'string' ? children : undefined);
  const derivedAriaLabel = props['aria-label'] || derivedTitle;

  const motionProps = {
    ref,
    onMouseMove: onMove,
    onMouseLeave: reset,
    className: cls,
    style: { transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1)' },
    title: derivedTitle,
    'aria-label': derivedAriaLabel,
    ...props,
  };

  if (to)
    return (
      <Link prefetch={false} href={to} {...motionProps}>
        {inner}
      </Link>
    );
  if (href)
    return (
      <a
        {...motionProps}
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {inner}
      </a>
    );
  return (
    <button type="button" {...motionProps}>
      {inner}
    </button>
  );
}
