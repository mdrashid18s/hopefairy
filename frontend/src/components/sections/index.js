/**
 * Every page section in one place. Each one is self-contained — it reads
 * its content from src/data/site.js — so it can be dropped into any page
 * with no props:
 *
 *   import { StatsSection, FAQ, CTASection } from '@/components/sections';
 *   // or, without the alias: '../../components/sections/index.js'
 *
 * Optional props are listed next to each export.
 */

// Page tops
export { default as Hero } from './Hero.jsx'; // homepage hero
export { default as PageHeader } from './PageHeader.jsx'; // inner-page header: { eyebrow, title, intro, crumb }

// Content sections
export { default as DestinationsTicker } from './DestinationsTicker.jsx'; // scrolling "Study in …" strip
export { default as StatsSection } from './StatsSection.jsx'; // "Guidance You Can Count On"
export { default as DestinationsSection } from './DestinationsSection.jsx'; // country cards
export { default as WhatWeDo } from './WhatWeDo.jsx'; // study-abroad services grid: { services?, showAllLink?, heading? }
export { default as IndiaAdmissions } from './IndiaAdmissions.jsx'; // admissions in India, UG/PG switch: { heading?, showPageLink? }
export { default as GulfDeskTeaser } from './GulfDeskTeaser.jsx'; // home teaser for Gulf Desk
export { default as TestPrep } from './TestPrep.jsx'; // IMAT feature + GMAT / IELTS / CELPIP: { heading?, showPageLink? }
export { default as ProcessSteps } from './ProcessSteps.jsx'; // 6-step journey
export { default as WhyUs } from './WhyUs.jsx'; // "Why HopeFairy?"
export { default as WhoWeAre } from './WhoWeAre.jsx'; // about teaser + who we guide
export { default as FAQ } from './FAQ.jsx'; // FAQs (includes FaqAside)
export { default as QuerySection } from './QuerySection.jsx'; // query form + contact options: { source? }
export { default as PsychometricSection } from './PsychometricSection.jsx'; // psychometric assessment & career profiling
export { default as TestimonialsSection } from './TestimonialsSection.jsx'; // student reviews (conditional)
export { default as CTASection } from './CTASection.jsx'; // closing call to action: { eyebrow?, title?, text?, buttonLabel? }

// Building blocks used inside the sections above
export { default as ServiceCard } from './ServiceCard.jsx'; // { service, index }
export { default as DestinationCard } from './DestinationCard.jsx'; // { destination, variant? }
export { default as FaqAside } from './FaqAside.jsx';
