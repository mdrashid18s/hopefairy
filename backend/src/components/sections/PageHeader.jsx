'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Sparkle from '../ui/Sparkle.jsx';
import { stagger, fadeUp } from '../../lib/motion.js';
import { SITE_URL } from '../../lib/seo.js';

/** Consistent inner-page hero. */
export default function PageHeader({ eyebrow, title, intro, crumb, children }) {
  const breadcrumbSchema = crumb
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: typeof crumb === 'string' ? crumb : 'Page',
          },
        ],
      }
    : null;

  return (
    <header className="relative overflow-hidden pt-20 pb-6 sm:pt-40 sm:pb-16">
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-brand-400/15 to-transparent dark:from-brand-600/15" />
      <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-brand-400/15 blur-[110px]" />
      <Sparkle size={14} className="pointer-events-none absolute right-[12%] top-[38%] hidden text-brand-400/60 sm:block" />
      <Sparkle size={9} className="pointer-events-none absolute right-[22%] top-[58%] hidden text-brand-400/40 sm:block" />
      <div className="container-x relative">
        <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-3xl">
          {crumb && (
            <motion.nav
              variants={fadeUp}
              aria-label="Breadcrumb"
              className="mb-3 sm:mb-5 flex items-center gap-2 text-xs sm:text-sm text-fg-faint"
            >
              <Link
                prefetch={false}
                href="/"
                title="HopeFairy Home — Study Abroad & Career Counselling"
                aria-label="Return to HopeFairy Home"
                className="hover:text-fg"
              >
                Home
              </Link>
              <span className="text-brand-500">/</span>
              <span className="text-fg-muted">{crumb}</span>
            </motion.nav>
          )}
          {eyebrow && (
            <motion.span variants={fadeUp} className="eyebrow text-[11px] sm:text-xs">
              <span className="h-px w-6 sm:w-8 bg-gradient-to-r from-transparent to-brand-500" />
              {eyebrow}
            </motion.span>
          )}
          <motion.h1
            variants={fadeUp}
            className="mt-3 sm:mt-4 text-3xl leading-[1.08] sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold"
          >
            {title}
          </motion.h1>
          {intro && (
            <motion.p variants={fadeUp} className="mt-3 sm:mt-6 max-w-2xl text-xs sm:text-base leading-relaxed text-fg-muted">
              {intro}
            </motion.p>
          )}
          {children && <motion.div variants={fadeUp}>{children}</motion.div>}
        </motion.div>
      </div>
    </header>
  );
}
