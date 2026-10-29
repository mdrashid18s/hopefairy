import Link from 'next/link';
import PageHeader from '../../components/sections/PageHeader.jsx';
import Section from '../../components/ui/Section.jsx';
import SectionHeading from '../../components/ui/SectionHeading.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { pageMetadata, webPageJsonLd, pageUrl } from '../../lib/seo.js';
import { sitemapGroups, legalSeo } from '../../data/legal.js';

const seo = legalSeo.sitemap;
export const metadata = pageMetadata(seo);

// Every listed link, for the ItemList structured data (anchors on the same page are skipped)
const allLinks = sitemapGroups.flatMap((g) => g.links).filter((l, i, a) => a.findIndex((x) => x.to === l.to) === i);
const schema = webPageJsonLd({
  name: 'HopeFairy Sitemap',
  description: seo.description,
  path: seo.path,
  type: 'CollectionPage',
  extra: {
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: allLinks.length,
      itemListElement: allLinks.map((l, i) => ({
        '@type': 'SiteNavigationElement',
        position: i + 1,
        name: l.label,
        url: pageUrl(l.to),
      })),
    },
  },
});

export default function SitemapPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PageHeader
        eyebrow="Sitemap"
        crumb="Sitemap"
        path={seo.path}
        title="Sitemap"
        intro="Every important HopeFairy page in one place — study abroad admissions, career counselling, India admissions, test prep and study destinations — so you can quickly find what you need."
      />

      <Section id="all-pages" seq={1} className="!pt-10 sm:!pt-16">
        <SectionHeading eyebrow="All Pages" title="Find your way around HopeFairy" />
        <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sitemapGroups.map((group) => (
            <nav
              key={group.title}
              aria-label={group.title}
              className="rounded-2xl sm:rounded-3xl border border-hair/10 bg-surface/80 p-5 sm:p-7 dark:bg-tint/[0.03]"
            >
              <div className="flex items-center gap-3">
                <span className="icon-3d h-10 w-10 rounded-xl">
                  <Icon name={group.icon} className="h-5 w-5" />
                </span>
                <h2 className="text-base sm:text-lg font-bold text-fg">{group.title}</h2>
              </div>
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-fg-muted">{group.text}</p>
              <ul className="mt-3 space-y-0.5">
                {group.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      prefetch={false}
                      href={l.to}
                      title={`${l.label} — HopeFairy`}
                      className="group flex items-center justify-between gap-2 rounded-lg py-1.5 text-sm text-fg-muted transition-colors hover:text-brand-700 dark:hover:text-brand-300"
                    >
                      {l.label}
                      <Icon name="arrow-right" className="h-3.5 w-3.5 shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </Section>
    </>
  );
}
