import Reveal from '../ui/Reveal.jsx';
import Icon from '../ui/Icon.jsx';
import Flag from '../ui/Flag.jsx';
import Logo from '../layout/Logo.jsx';
import { destinations, site, faqSection as copy } from '../../data/site.js';


/**
 * Visual for the empty column under the FAQ heading: a "still have a
 * question?" chat panel with floating study-abroad icons and flags.
 * Built from brand elements rather than stock photos.
 */
export default function FaqAside() {
  return (
    <Reveal i={3} className="relative mx-auto mt-8 w-full max-w-md lg:mx-0">
      {/* floating decorative tiles (icons only — no text, so motion can't blur anything) */}
      <span
        aria-hidden
        className="animate-float absolute -left-3 -top-5 z-10 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-300 to-brand-600 text-ink-950 shadow-[0_12px_24px_-10px_rgba(120,90,20,0.6)]"
      >
        <Icon name="graduation-cap" className="h-6 w-6" />
      </span>
      <span
        aria-hidden
        className="animate-float absolute -right-4 bottom-20 z-10 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-400/30 bg-surface text-brand-600 shadow-card dark:bg-ink-850 dark:text-brand-300"
        style={{ animationDelay: '-2.5s' }}
      >
        <Icon name="plane" className="h-5 w-5" />
      </span>
      <span
        aria-hidden
        className="animate-float absolute -bottom-4 -left-2 z-10 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-400/30 bg-surface text-brand-600 shadow-card dark:bg-ink-850 dark:text-brand-300"
        style={{ animationDelay: '-4s' }}
      >
        <Icon name="book-open" className="h-5 w-5" />
      </span>

      {/* chat panel — black & gold in both themes */}
      <div className="relative overflow-hidden rounded-3xl border border-brand-400/30 bg-ink-950 p-6 text-white shadow-card">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-400/25 blur-[70px]" />

        {/* header */}
        <div className="relative flex items-center gap-3 border-b border-white/10 pb-4">
          <Logo className="h-10 w-10" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">{copy.chatName}</p>
            <p className="flex items-center gap-1.5 text-xs text-white/55">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {site.hours}
            </p>
          </div>
          {/* overlapping flags */}
          <div className="ml-auto flex -space-x-2">
            {destinations.slice(0, 4).map((d) => (
              <span
                key={d.slug}
                className="inline-block h-7 w-7 overflow-hidden rounded-full ring-2 ring-ink-950"
                title={d.name}
              >
                <Flag code={d.flag} className="h-full w-full" />
              </span>
            ))}
          </div>
        </div>

        {/* sample conversation */}
        <div aria-label="Example conversation" className="relative flex flex-col gap-2.5 py-5">
          {copy.chat.map((m, i) =>
            m.from === 'student' ? (
              <p
                key={i}
                className="max-w-[80%] self-end rounded-2xl rounded-br-md bg-gradient-to-br from-brand-300 to-brand-500 px-3.5 py-2 text-sm text-ink-950"
              >
                {m.text}
              </p>
            ) : (
              <p
                key={i}
                className="max-w-[80%] self-start rounded-2xl rounded-bl-md bg-white/10 px-3.5 py-2 text-sm text-white/85"
              >
                {m.text}
              </p>
            )
          )}
        </div>

        {/* call to action */}
        <div className="relative border-t border-white/10 pt-5">
          <p className="text-base font-semibold text-white">{copy.helpTitle}</p>
          <p className="mt-1 text-sm text-white/60">{copy.helpText}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={site.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              title="Chat directly on WhatsApp with HopeFairy Study Abroad Mentors"
              aria-label="Chat on WhatsApp with HopeFairy counsellors"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              <Icon name="message-circle" className="h-4 w-4" />
              {copy.whatsappLabel}
            </a>
            <a
              href={site.phoneHref}
              title={`Call HopeFairy Admission Helpdesk: ${site.phone}`}
              aria-label="Call HopeFairy admission helpline phone"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-brand-300/70"
            >
              <Icon name="phone" className="h-4 w-4" />
              {copy.callLabel}
            </a>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
