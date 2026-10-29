import Reveal from './Reveal.jsx';
import WordsReveal from './WordsReveal.jsx';

export default function SectionHeading({
  eyebrow,
  title,
  intro,
  align = 'left',
  className = '',
  highlightLast = 0,
}) {
  const alignment =
    align === 'center' ? 'items-center text-center mx-auto' : 'items-start text-left';
  return (
    <div className={`flex max-w-2xl flex-col gap-2.5 sm:gap-4 ${alignment} ${className}`}>
      {eyebrow && (
        <Reveal>
          <span className="eyebrow text-[11px] sm:text-xs">
            <span className="h-px w-6 sm:w-8 bg-gradient-to-r from-transparent to-brand-500" />
            {eyebrow}
          </span>
        </Reveal>
      )}
      {typeof title === 'string' ? (
        <WordsReveal
          text={title}
          highlightLast={highlightLast}
          className="text-2xl font-extrabold tracking-tight sm:text-4xl md:text-5xl leading-[1.12] sm:leading-[1.08] text-fg"
        />
      ) : (
        <Reveal i={1}>
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-4xl md:text-5xl leading-[1.12] sm:leading-[1.08]">{title}</h2>
        </Reveal>
      )}
      {intro && (
        <Reveal i={2}>
          <p className="text-xs sm:text-base leading-relaxed text-fg-muted">{intro}</p>
        </Reveal>
      )}
    </div>
  );
}
