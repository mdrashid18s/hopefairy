/**
 * Page-wide ambient background: soft gold light blooms + faint grid + noise.
 * Pointer-events off; sits behind everything. Tuned for both themes.
 */
export default function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-page" />
      <div className="absolute -left-40 -top-40 h-[38rem] w-[38rem] rounded-full bg-brand-300/20 blur-[140px] animate-float dark:bg-brand-600/[0.12]" />
      <div
        className="absolute -right-32 top-1/3 h-[32rem] w-[32rem] rounded-full bg-brand-200/25 blur-[130px] animate-float dark:bg-brand-500/[0.08]"
        style={{ animationDelay: '-3s' }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[30rem] w-[30rem] rounded-full bg-brand-100/40 blur-[140px] animate-float dark:bg-brand-800/[0.12]"
        style={{ animationDelay: '-5s' }}
      />
      <div
        className="absolute inset-0 [background-size:64px_64px] opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(var(--hair)/0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--hair)/0.05) 1px, transparent 1px)',
        }}
      />
      <div className="absolute inset-0 noise opacity-[0.03] mix-blend-overlay dark:opacity-[0.04]" />
    </div>
  );
}
