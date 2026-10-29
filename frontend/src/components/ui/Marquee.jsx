/**
 * Infinite horizontal marquee. Duplicates children once and animates -50%.
 */
export default function Marquee({ children, speed = 'normal', reverse = false, className = '' }) {
  const anim = speed === 'slow' ? 'animate-marquee-slow' : 'animate-marquee';
  return (
    <div className={`group relative flex overflow-hidden mask-fade-x ${className}`}>
      <div
        className={`flex shrink-0 items-center gap-10 pr-10 ${anim} group-hover:[animation-play-state:paused]`}
        style={{ animationDirection: reverse ? 'reverse' : 'normal' }}
      >
        {children}
      </div>
      <div
        aria-hidden
        className={`flex shrink-0 items-center gap-10 pr-10 ${anim} group-hover:[animation-play-state:paused]`}
        style={{ animationDirection: reverse ? 'reverse' : 'normal' }}
      >
        {children}
      </div>
    </div>
  );
}
