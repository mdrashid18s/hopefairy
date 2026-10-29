import Link from 'next/link';
import PageHeader from './PageHeader.jsx';
import Section from '../ui/Section.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import { LEGAL_UPDATED, LEGAL_UPDATED_ISO } from '../../data/legal.js';
import { webPageJsonLd } from '../../lib/seo.js';

/**
 * Shared layout for the Privacy Policy and Terms of Use pages: page hero, then the document with
 * a contents list (sticky on desktop) beside the numbered sections.
 * @param {{ doc: { title: string, intro: string, sections: {id:string, heading:string, paras?:string[], list?:string[]}[] }, seo: { path: string, description: string }, summary: string }} props
 */
export default function LegalDocument({ doc, seo, summary }) {
  const schema = webPageJsonLd({
    name: doc.title,
    description: seo.description,
    path: seo.path,
    dateModified: LEGAL_UPDATED_ISO,
    extra: { about: { '@type': 'Organization', name: 'HopeFairy' } },
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PageHeader eyebrow="Legal" crumb={doc.title} path={seo.path} title={doc.title} intro={doc.intro} />
      <p className="sr-only">
        <time dateTime={LEGAL_UPDATED_ISO}>Last updated {LEGAL_UPDATED}</time>
      </p>

      <Section id="document" seq={1} className="!pt-10 sm:!pt-16">
        <SectionHeading eyebrow={`Last updated ${LEGAL_UPDATED}`} title={summary} />

        <div className="mt-8 sm:mt-12 grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-14">
          <nav aria-label={`${doc.title} contents`} className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">
              Contents
            </p>
            <ol className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-1">
              {doc.sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="flex gap-2 rounded-lg px-2 py-1.5 text-xs sm:text-sm text-fg-muted transition-colors hover:bg-brand-400/10 hover:text-brand-700 dark:hover:text-brand-300"
                  >
                    <span className="w-5 shrink-0 font-semibold text-brand-600 dark:text-brand-300">{i + 1}.</span>
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="min-w-0 rounded-2xl sm:rounded-3xl border border-hair/10 bg-surface/80 p-5 sm:p-10 dark:bg-tint/[0.03]">
            {doc.sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-28 border-b border-hair/10 py-6 first:pt-0 last:border-0 last:pb-0 sm:py-8">
                <h2 className="flex items-baseline gap-3 text-lg sm:text-2xl font-bold text-fg">
                  <span className="text-sm sm:text-base font-semibold text-brand-600 dark:text-brand-300">{String(i + 1).padStart(2, '0')}</span>
                  {s.heading}
                </h2>
                {s.paras?.map((p) => (
                  <p key={p} className="mt-3 text-sm sm:text-base leading-relaxed text-fg-muted">
                    {p}
                  </p>
                ))}
                {s.list && (
                  <ul className="mt-3 space-y-2">
                    {s.list.map((item) => (
                      <li key={item} className="flex gap-3 text-sm sm:text-base leading-relaxed text-fg-muted">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
            <p className="mt-8 text-xs sm:text-sm text-fg-faint">
              See also:{' '}
              <Link prefetch={false} href="/privacy-policy" className="text-brand-700 hover:underline dark:text-brand-300">Privacy Policy</Link>
              {' · '}
              <Link prefetch={false} href="/terms-of-use" className="text-brand-700 hover:underline dark:text-brand-300">Terms of Use</Link>
              {' · '}
              <Link prefetch={false} href="/sitemap" className="text-brand-700 hover:underline dark:text-brand-300">Sitemap</Link>
            </p>
          </article>
        </div>
      </Section>
    </>
  );
}
