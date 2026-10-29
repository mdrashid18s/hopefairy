/** Four-point star, echoing the one above the fairy in the logo. Decorative. */
export default function Sparkle({ size = 12, className = '' }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`fill-current ${className}`}
    >
      <path d="M12 0c.6 5.9 3.4 10.1 12 12-8.6 1.9-11.4 6.1-12 12-.6-5.9-3.4-10.1-12-12C8.6 10.1 11.4 5.9 12 0Z" />
    </svg>
  );
}
