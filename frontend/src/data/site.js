import { asset } from '../lib/asset.js';
import { HOME_ONLY } from '../config/launch.js';
import {
  CONTACT_PHONE,
  CONTACT_EMAIL,
  CONTACT_ADDRESS,
  CONTACT_HOURS,
  CONTACT_SOCIALS,
  CONTACT_WHATSAPP,
  PHONE_DISPLAY,
  PHONE_HREF,
  WHATSAPP_HREF,
  PRIMARY_EMAIL,
  OFFICE_HOURS,
} from '../config/contact.js';

/**
 * Single source of truth for site content.
 * All contact info, phones, emails, addresses & socials are centralized in:
 * src/config/contact.js
 */

export const site = {
  name: 'HopeFairy',
  // Split for the two-tone wordmark (matches the logo: "Hope" + gold "Fairy").
  wordmark: ['Hope', 'Fairy'],
  tagline: 'Where Dreams Meet Destinations',
  kicker: 'Abroad Admission Advisor · Career Counselling · Test Prep',
  description:
    'HopeFairy is recognized as the best abroad admission advisor and best career counselling consultancy in India & GCC. We provide 1-on-1 global university admissions (UK, USA, Canada, Germany & Australia), premier India college admissions, and elite test preparation for IMAT, SAT, IELTS and CELPIP.',
  // Phone & WhatsApp from centralized contact.js
  phone: CONTACT_PHONE.display,
  phoneHref: CONTACT_PHONE.href,
  whatsappHref: CONTACT_WHATSAPP.cleanHref,
  // Email from centralized contact.js
  email: CONTACT_EMAIL.primary,
  emailHref: CONTACT_EMAIL.href,
  // Location & Hours from centralized contact.js
  location: CONTACT_ADDRESS.location,
  displayLocation: CONTACT_ADDRESS.displayLocation,
  address: CONTACT_ADDRESS.headquarters.fullAddress,
  hours: CONTACT_HOURS.display,
  logo: asset('/brand/hopefairy-emblem.png'),
  logoSmall: asset('/brand/hopefairy-emblem-sm.png'),
  // Lightweight WebP renditions for on-page display (1x / 2x); the PNGs above stay for schema/OG
  logoWebp: { src: asset('/brand/hopefairy-emblem-256.webp'), srcSet: `${asset('/brand/hopefairy-emblem-256.webp')} 256w, ${asset('/brand/hopefairy-emblem-512.webp')} 512w` },
  logoSmallWebp: { src: asset('/brand/hopefairy-emblem-80.webp'), srcSet: `${asset('/brand/hopefairy-emblem-80.webp')} 80w, ${asset('/brand/hopefairy-emblem-160.webp')} 160w` },
  // Social profiles from centralized contact.js
  socials: CONTACT_SOCIALS,
};

/** Hero content (client copy). */
export const hero = {
  kicker: 'Abroad Admission Advisor · Career Counselling · Test Prep',
  kickerItems: ['Abroad Admission Advisor', 'Career Counselling', 'Test Prep'],
  kickerLines: ['Abroad Admission Advisor', 'Career Counselling', 'Test Prep'],
  // Headline renders on two lines; the second is highlighted in gold.
  headlineTop: 'Dream Big.',
  headlineAccent: "We'll Map the Way.",
  copy: "Universities abroad, India's top colleges and the tests that open their doors — all with the best abroad admission advisor and dedicated career counsellor by your side.",
  ctaPrimary: 'Book Free Counselling',
  ctaSecondary: 'Explore Destinations',
  trust: ['Best Abroad Admission Advisor', '1:1 Career Counselling', 'Psychometric Test'],
};

/** Flat list — used by the footer and the mobile menu. */
export const nav = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about-us/' },
  { label: 'Study Abroad', to: '/services/' },
  { label: 'Destinations', to: '/destinations/' },
  { label: 'India Admissions', to: '/india-admissions/' },
  { label: 'Gulf Desk', to: '/gulf-desk/', isGold: true, badge: 'New' },
  { label: 'Test Prep', to: '/test-prep/' },
  { label: 'Contact', to: '/contact-us/' },
];

/**
 * Desktop header nav — suggested menu order (new Gulf Desk item in gold)
 */
export const headerNav = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about-us/' },
  {
    label: 'Study Abroad',
    to: '/services/',
    // Filled in below, once `services` is defined.
    children: [],
  },
  { label: 'Destinations', to: '/destinations/' },
  { label: 'India Admissions', to: '/india-admissions/' },
  { label: 'Gulf Desk', to: '/gulf-desk/', isGold: true, badge: 'New' },
  { label: 'Test Prep', to: '/test-prep/' },
  { label: 'Contact', to: '/contact-us/' },
];

/**
 * Soft-launch switch. While true, only the homepage is linked from the
 * header, footer and mobile menu. The other routes still exist — set it
 * back to false (src/config/launch.js) to reveal the full navigation.
 */
export const homeOnly = HOME_ONLY;

/** Stats strip (client copy). */
export const stats = {
  title: 'Numbers That Mean Something',
  items: [
    { value: '8+', label: 'Countries, one trusted guide' },
    { value: '1:1', label: 'One student, one counsellor' },
    { value: '6', label: 'Steps from first chat to first flight' },
    { value: '360°', label: 'Careers, admissions, visas and beyond' },
  ],
};

export const studyAbroadPage = {
  metaTitle: 'Study Abroad Consultants | Admissions, Visas & Scholarships — HopeFairy',
  metaDescription:
    'Career counselling, university applications, SOPs, scholarships, student visas and pre-departure support — every step abroad, with one team.',
  eyebrow: 'Study Abroad',
  headline: 'From "Where Should I Go?" to "I\'m Here!"',
  intro:
    'We plan your whole journey abroad: the right course, a smart shortlist, strong applications, funding, visa and a confident take-off.',
  keyPoints: [
    'Career Counselling',
    'University Admissions',
    'SOP, LOR & Essays',
    'Scholarships & Loans',
    'Student Visa Guidance',
    'Pre-Departure Support',
  ],
  button: 'Plan My Journey',
};

export const servicesIntro =
  'We plan your whole journey abroad: the right course, a smart shortlist, strong applications, funding, visa and a confident take-off.';

/** Homepage "Our Services" section (client copy). */
export const servicesSection = {
  eyebrow: 'Best Abroad Admission Advisor',
  title: 'One Team. Every Step Abroad.',
  button: 'View All Services',
  ctaTitle: 'Don’t know where to begin?',
  ctaText: 'Start a free chat with India’s best career counselling mentors.',
  ctaButton: 'Book Free Counselling',
};

export const services = [
  {
    slug: 'career-counselling',
    title: 'Career Counselling',
    headline: 'Clarity Before You Commit',
    short: "Discover what you’re good at and what you love — then turn it into a course, a country and a career.",
    icon: 'compass',
    intro: [
      'Studying abroad is one of the biggest decisions a family makes. It should start with clarity, not a brochure.',
      'Our counsellors take the time to understand your academics, interests, ambitions and budget — then help you build a realistic plan for the course, country and career that genuinely fit you.',
    ],
    featuresTitle: 'What’s Included',
    features: [
      'One-to-one career discovery session',
      'Academic profile evaluation',
      'Interest & aptitude assessment',
      'Course and career-path mapping',
      'Country fit analysis',
      'Budget and return-on-investment planning',
      'Parent counselling session',
      'Personalised action plan & timeline',
    ],
    highlights: [
      {
        title: 'Know your options',
        text: 'See the courses and careers that suit your profile — not just the popular ones.',
        icon: 'lightbulb',
      },
      {
        title: 'Plan with your family',
        text: 'Sessions that include parents, so every decision is made together and with confidence.',
        icon: 'heart-handshake',
      },
      {
        title: 'A roadmap, not a guess',
        text: 'Leave with a clear timeline covering tests, applications, finances and deadlines.',
        icon: 'route',
      },
    ],
    processFlow: ['Discovery Call', 'Profile Assessment', 'Career Mapping', 'Country Fit', 'Action Plan'],
  },
  {
    slug: 'university-admissions',
    title: 'University Admissions',
    headline: 'The Right University, Not Just Any University',
    short: "A smart shortlist and stress-free applications for bachelor’s, master’s and diploma programmes.",
    icon: 'graduation-cap',
    intro: [
      'We build a balanced shortlist of ambitious, target and safe options based on your profile, preferences and budget.',
      'Then we manage the entire application process with you — deadlines, forms, documents, interviews and offer decisions — so nothing falls through the cracks.',
    ],
    featuresTitle: 'What’s Included',
    features: [
      'Personalised university shortlist',
      'Application strategy & deadline planning',
      'Application form review and submission',
      'Document checklist & verification',
      'Admission interview preparation',
      'Offer comparison & acceptance guidance',
      'Conditional-to-unconditional offer support',
      'Deferral and reapplication guidance',
    ],
    highlights: [
      {
        title: 'Balanced shortlist',
        text: 'Ambitious, target and safe choices so you apply with confidence and realistic odds.',
        icon: 'target',
      },
      {
        title: 'Deadline discipline',
        text: 'A clear application calendar, tracked for you — every intake, every university.',
        icon: 'calendar',
      },
      {
        title: 'Offer decisions',
        text: 'Compare offers on course quality, cost, location and outcomes before you accept.',
        icon: 'award',
      },
    ],
    processFlow: ['Shortlist', 'Strategy', 'Documents', 'Submission', 'Interviews', 'Offers'],
  },
  {
    slug: 'sop-lor-guidance',
    title: 'SOP, LOR & Essays',
    headline: 'Applications That Sound Like You — Only Stronger',
    short: "Your story, told clearly and convincingly — SOPs, LORs, essays and CVs.",
    icon: 'file-text',
    intro: [
      'Admissions teams read thousands of applications. Yours needs to be clear, specific and genuinely yours.',
      'We help you find your story, structure it well and refine it through multiple rounds of feedback — while keeping it authentic, as every good university expects.',
    ],
    featuresTitle: 'What’s Included',
    features: [
      'SOP brainstorming & structure',
      'Multiple rounds of review and feedback',
      'LOR guidance for your recommenders',
      'Academic CV / resume building',
      'Personal and supplemental essays',
      'Portfolio guidance for creative programmes',
    ],
    highlights: [
      {
        title: 'Find your story',
        text: 'Guided brainstorming to surface the experiences that make your application memorable.',
        icon: 'sparkles',
      },
      {
        title: 'Expert feedback',
        text: 'Detailed, round-by-round reviews on structure, clarity and university fit.',
        icon: 'pen-tool',
      },
      {
        title: 'Always authentic',
        text: 'We guide and refine — your voice and your experiences stay at the heart of it.',
        icon: 'badge',
      },
    ],
  },
  {
    slug: 'test-preparation',
    title: 'Test Preparation',
    headline: 'The Right Test, the Right Score',
    short: "IELTS, TOEFL, PTE, Duolingo, GRE, GMAT, SAT — pick the right test, reach the right score.",
    icon: 'book-open',
    intro: [
      'Most universities abroad ask for an English proficiency test, and many programmes also need an aptitude test such as the GRE, GMAT or SAT.',
      'We help you choose the right test for your universities, set a target score, plan your preparation and book your exam at the right time.',
    ],
    featuresTitle: 'Tests We Guide For',
    features: [
      'IELTS (Academic)',
      'TOEFL iBT',
      'PTE Academic',
      'Duolingo English Test',
      'GRE',
      'GMAT',
      'SAT',
      'English proficiency waiver checks',
    ],
    highlights: [
      {
        title: 'Diagnostic first',
        text: 'Start with an honest baseline, then set a target score your universities accept.',
        icon: 'gauge',
      },
      {
        title: 'Study plan',
        text: 'A structured plan, resources and mock tests paced around your application deadlines.',
        icon: 'clock',
      },
      {
        title: 'Booking & reporting',
        text: 'Help with test dates, registration and sending scores to the right universities.',
        icon: 'check-circle',
      },
    ],
  },
  {
    slug: 'visa-guidance',
    title: 'Student Visa Guidance',
    headline: 'Visa Preparation, Done Properly',
    short: "Checklists, financial papers, file review and mock interviews — walk in visa-ready.",
    icon: 'shield-check',
    intro: [
      'A student visa application is where small mistakes cost the most. We help you prepare it carefully and completely.',
      'From financial documents to mock interviews, we walk you through every requirement for your destination. Visa decisions rest with the embassy — our job is to make sure your application is as strong as it can be.',
    ],
    featuresTitle: 'What’s Included',
    features: [
      'Country-specific visa checklist',
      'Financial & proof-of-funds documentation',
      'Visa application form review',
      'Statement / cover letter guidance',
      'Mock visa interviews',
      'Biometrics & appointment guidance',
      'Health insurance & medical requirements',
    ],
    highlights: [
      {
        title: 'Complete documentation',
        text: 'A tailored checklist for your country, reviewed line by line before you submit.',
        icon: 'file-text',
      },
      {
        title: 'Interview ready',
        text: 'Mock interviews and feedback so you answer clearly and confidently.',
        icon: 'message-circle',
      },
      {
        title: 'Up-to-date rules',
        text: 'Visa rules change often — we brief you on the current requirements for your intake.',
        icon: 'shield-check',
      },
    ],
    processFlow: ['Checklist', 'Finances', 'Application', 'Mock Interview', 'Submission', 'Decision'],
  },
  {
    slug: 'scholarships-education-loans',
    title: 'Scholarships & Loans',
    headline: 'Make World-Class Education Affordable',
    short: "Find funding you qualify for, plan your budget, and sort out loans and proof of funds.",
    icon: 'wallet',
    intro: [
      'The cost of studying abroad shouldn’t stop a deserving student. With the right planning, it often doesn’t have to.',
      'We help you find scholarships you’re eligible for, prepare strong scholarship applications and plan your finances — including education loans and the proof of funds your visa needs.',
    ],
    featuresTitle: 'What’s Included',
    features: [
      'Scholarship search & eligibility check',
      'Scholarship essay guidance',
      'Tuition & living cost planning',
      'Education loan guidance',
      'Proof-of-funds planning for visas',
      'Part-time work & budgeting briefing',
    ],
    highlights: [
      {
        title: 'Scholarships',
        text: 'University, government and external scholarships matched to your profile.',
        icon: 'award',
      },
      {
        title: 'Education loans',
        text: 'Understand secured and unsecured loan options and prepare your paperwork.',
        icon: 'landmark',
      },
      {
        title: 'Clear budgeting',
        text: 'A realistic view of tuition, living costs and funds — before you commit.',
        icon: 'wallet',
      },
    ],
  },
  {
    slug: 'pre-departure-support',
    title: 'Pre-Departure Support',
    headline: 'Ready for Take-Off',
    short: "Housing, flights, forex and orientation — pack with confidence.",
    icon: 'plane',
    intro: [
      'Your offer letter and visa are just the beginning. Moving to a new country comes with its own long checklist.',
      'Our pre-departure support helps you sort accommodation, travel, money and essentials — and prepares you for life, study and work in your new country.',
    ],
    featuresTitle: 'What’s Included',
    features: [
      'Accommodation guidance',
      'Flight & travel planning',
      'Forex and international money transfers',
      'Pre-departure orientation session',
      'Packing & documents checklist',
      'Student life, part-time work & culture briefing',
      'Airport pickup & arrival guidance',
    ],
    highlights: [
      {
        title: 'Settle in faster',
        text: 'Accommodation, banking, SIM and arrival essentials planned before you leave.',
        icon: 'map-pin',
      },
      {
        title: 'Orientation',
        text: 'What to expect in class, at work and in daily life — straight from people who know.',
        icon: 'users',
      },
      {
        title: 'Still here for you',
        text: 'Our support doesn’t end at the airport. Reach out whenever you need guidance.',
        icon: 'heart-handshake',
      },
    ],
  },
];

headerNav.find((n) => n.to === '/services/').children = [
  { label: 'All Services', to: '/services/' },
  ...services.map((s) => ({ label: s.title, to: `/service/${s.slug}/` })),
];

/**
 * Single-page nav used while homeOnly is on — every item scrolls to a
 * section of the homepage instead of linking to a hidden route.
 */
export const homeSectionNav = [
  { label: 'Home', to: '/' },
  { label: 'Study Abroad', to: '/#services' },
  { label: 'India Admissions', to: '/#india-admissions' },
  { label: 'Test Prep', to: '/#test-prep' },
  { label: 'About', to: '/#about' },
  { label: 'FAQs', to: '/#faq' },
];

export const mainNav = homeOnly ? homeSectionNav : nav;
export const mainHeaderNav = homeOnly ? homeSectionNav : headerNav;

/**
 * Where every "Book counselling" button points. While homeOnly is on the
 * contact page is hidden, so enquiries go straight to WhatsApp instead.
 */
export const counsellingLink = homeOnly
  ? { href: site.whatsappHref, target: '_blank', rel: 'noreferrer' }
  : { to: '/contact-us' };

/** The six-step student journey. */
export const process = {
  eyebrow: 'Your Journey',
  title: 'Six Steps. One Guide. Zero Guesswork.',
  intro:
    'Your counsellor walks beside you all the way — so the next step is always clear.',
  steps: [
    {
      n: '01',
      title: 'Free Counselling',
      text: 'We learn about your marks, interests, goals, budget and timeline.',
      icon: 'message-circle',
    },
    {
      n: '02',
      title: 'Profile & Career Plan',
      text: 'We assess your profile and match it to courses, careers and countries.',
      icon: 'compass',
    },
    {
      n: '03',
      title: 'University Shortlist',
      text: 'Dream, target and safe choices — plus a test and deadline plan.',
      icon: 'target',
    },
    {
      n: '04',
      title: 'Applications',
      text: 'SOPs, LORs, CVs and forms: written, reviewed and submitted on time.',
      icon: 'file-text',
    },
    {
      n: '05',
      title: 'Offers, Funding & Visa',
      text: 'Choose your offer, secure funding and file a strong visa application.',
      icon: 'shield-check',
    },
    {
      n: '06',
      title: 'Pre-Departure',
      text: 'Housing, travel, forex and orientation — land ready to learn.',
      icon: 'plane',
    },
  ],
};

/**
 * Study destinations page copy from client PDF
 */
export const destinationsPage = {
  metaTitle: 'Study Destinations | UK, USA, Canada, Australia, Germany & More — HopeFairy',
  metaDescription:
    'Compare costs, courses, intakes and career outcomes across 8+ countries, and find the one that fits your goals and budget.',
  eyebrow: 'Destinations',
  headline: 'Many Countries. One Right Fit.',
  intro:
    'Each country has its own mix of cost, course length, careers and lifestyle. We compare them side by side so you choose with confidence.',
  countries: [
    'United Kingdom',
    'United States',
    'Canada',
    'Australia',
    'Ireland',
    'Germany',
    'New Zealand',
    'France',
  ],
  alsoCountries: 'Also: Dubai (UAE), Singapore, Netherlands, Italy, Spain, Malta and more.',
  button: 'Find My Country',
};

export const destinationsIntro =
  'Each country has its own mix of cost, course length, careers and lifestyle. We compare them side by side so you choose with confidence.';

export const destinations = [
  {
    slug: 'united-kingdom',
    name: 'United Kingdom',
    code: 'UK',
    flag: 'GB', // ISO 3166 code for <Flag>
    tagline: 'Top-ranked universities, faster degrees.',
    intakes: ['September', 'January'],
    courses: ['Business & Management', 'Data Science', 'Law', 'Engineering', 'Healthcare'],
    highlights: [
      'Many master’s degrees completed in one year',
      'Post-study work route for eligible graduates',
      'Globally recognised, historic institutions',
    ],
  },
  {
    slug: 'united-states',
    name: 'United States',
    code: 'US',
    flag: 'US', // ISO 3166 code for <Flag>
    tagline: 'More choices than anywhere else.',
    intakes: ['Fall (Aug/Sep)', 'Spring (Jan)'],
    courses: ['Computer Science', 'Engineering', 'Business Analytics', 'MBA', 'Life Sciences'],
    highlights: [
      'Flexible curriculum and research opportunities',
      'Practical training options, extended for STEM fields',
      'Home to many of the world’s top-ranked universities',
    ],
  },
  {
    slug: 'canada',
    name: 'Canada',
    code: 'CA',
    flag: 'CA', // ISO 3166 code for <Flag>
    tagline: 'Great degrees, warm welcome.',
    intakes: ['September', 'January', 'May'],
    courses: ['Business', 'Information Technology', 'Engineering', 'Health Sciences', 'Hospitality'],
    highlights: [
      'Co-op programmes with built-in work experience',
      'Post-graduation work permit for eligible graduates',
      'Safe, diverse and student-friendly cities',
    ],
  },
  {
    slug: 'australia',
    name: 'Australia',
    code: 'AU',
    flag: 'AU', // ISO 3166 code for <Flag>
    tagline: 'Strong universities, sunny lifestyle.',
    intakes: ['February', 'July'],
    courses: ['Information Technology', 'Engineering', 'Nursing', 'Accounting', 'Hospitality'],
    highlights: [
      'Globally ranked universities, including the Group of Eight',
      'Post-study work visa for eligible graduates',
      'High quality of life and vibrant student cities',
    ],
  },
  {
    slug: 'ireland',
    name: 'Ireland',
    code: 'IE',
    flag: 'IE', // ISO 3166 code for <Flag>
    tagline: 'English-speaking gateway to Europe’s tech and pharma jobs.',
    intakes: ['September', 'January'],
    courses: ['Computer Science', 'Data Analytics', 'Pharmaceutical Science', 'Finance', 'Business'],
    highlights: [
      'European headquarters of many global tech companies',
      'Stay-back option for eligible graduates',
      'Friendly, English-speaking EU country',
    ],
  },
  {
    slug: 'germany',
    name: 'Germany',
    code: 'DE',
    flag: 'DE', // ISO 3166 code for <Flag>
    tagline: 'World-class engineering — many public universities charge little or no tuition.',
    intakes: ['Winter (Oct)', 'Summer (Apr)'],
    courses: ['Mechanical & Automotive Engineering', 'Computer Science', 'Data Science', 'Management'],
    highlights: [
      'Many public universities charge little or no tuition',
      'Strong industry links and research culture',
      'Growing number of English-taught programmes',
    ],
  },
  {
    slug: 'new-zealand',
    name: 'New Zealand',
    code: 'NZ',
    flag: 'NZ', // ISO 3166 code for <Flag>
    tagline: 'Safe, scenic and hands-on.',
    intakes: ['February', 'July'],
    courses: ['Information Technology', 'Engineering', 'Agriculture', 'Hospitality', 'Business'],
    highlights: [
      'Consistently ranked among the safest countries',
      'Post-study work visa for eligible graduates',
      'Practical, research-led teaching',
    ],
  },
  {
    slug: 'france',
    name: 'France',
    code: 'FR',
    flag: 'FR', // ISO 3166 code for <Flag>
    tagline: 'Leading business schools in the heart of Europe.',
    intakes: ['September', 'January'],
    courses: ['Business & Management', 'Luxury & Fashion', 'Hospitality', 'Engineering', 'Finance'],
    highlights: [
      'Internationally accredited business schools and grandes écoles',
      'Access to travel across the Schengen area',
      'Growing range of English-taught programmes',
    ],
  },
];

/**
 * Homepage country-card design: 'compact' | 'postcard' | 'badge' | 'luxe' |
 * 'glass'. Preview them all side by side at /card-styles.
 */
export const countryCardStyle = 'compact';

/** Shown under the destination grid. */
export const moreDestinations = ['Dubai (UAE)', 'Singapore', 'the Netherlands', 'Italy', 'Spain', 'Malta'];

/** Homepage "Study Destinations" section (client copy). */
export const destinationsSection = {
  eyebrow: 'Top Study Destinations',
  title: 'Pick a Country. Picture Your Future.',
  intro:
    'Fees, course length, job prospects, lifestyle — every country weighs them differently. Let the best abroad admission advisor help you find your best fit.',
  button: 'Compare Countries',
  // Rendered as: {notePrefix} <strong>{moreDestinations}</strong> {noteSuffix}
  notePrefix: 'We also guide students to',
  noteSuffix: 'and more.',
};

export const about = {
  heading: 'About Us',
  metaTitle: 'About HopeFairy | Honest, Personal Admission Guidance',
  metaDescription:
    'HopeFairy is an Indian education consultancy that guides students and families with honest, personal advice — from first counselling to first class.',
  eyebrow: 'About HopeFairy',
  headline: 'A Guide Who Cares. A Plan That Fits.',
  intro:
    'HopeFairy began with one belief: every student deserves honest, personal guidance for the biggest decision of their life. We help students and families choose the right course, country and college — and stay with them until the first day of class.',
  keyPoints: [
    'Our mission: clear advice, never pressure.',
    'Our way: one counsellor, start to finish.',
    'Our promise: Your Dream. Our Guidance. One Destination.',
  ],
  button: 'Meet a Counsellor',

  // Homepage "About HopeFairy" teaser (client copy).
  teaserEyebrow: 'About HopeFairy',
  teaserHeadline: 'A Guide Who Cares. A Plan That Fits.',
  paragraphs: [
    'HopeFairy began with one belief: every student deserves honest, personal guidance for the biggest decision of their life.',
    'We help students and families choose the right course, country and college — and stay with them until the first day of class.',
    'One counsellor stays with you from the first session to departure. No pressure. No generic lists. Just clear advice that fits you.',
  ],
  teaserButton: 'Meet a Counsellor',
  closing: 'Your Dream. Our Guidance. One Destination.',

  // Dedicated About Us page.
  pageHeadline: 'A Guide Who Cares. A Plan That Fits.',
  lead:
    'HopeFairy began with one belief: every student deserves honest, personal guidance for the biggest decision of their life. We help students and families choose the right course, country and college — and stay with them until the first day of class.',
  pageParagraphs: [
    'The name says it all. Like a fairy godmother in the stories, we exist to turn hope into reality — helping ambitious students reach the universities and careers they dream of.',
    'But there’s no magic wand. There is careful counselling, honest advice, well-prepared applications and a team that stays by your side from the first conversation until you land on campus.',
    'We believe the right advice is personal. That is why every student gets a dedicated counsellor, every family gets a voice in the process, and every recommendation is based on what genuinely fits the student.',
  ],
  mission:
    'To make quality international education accessible to every deserving Indian student through honest, personal and expert guidance.',
  vision:
    'To be India’s most trusted study abroad partner — known for the success, confidence and wellbeing of the students we guide.',
  values: [
    {
      title: 'Student First',
      text: 'Every recommendation starts with the student’s goals, strengths and budget.',
      icon: 'heart-handshake',
    },
    {
      title: 'Honesty',
      text: 'Clear, realistic advice — including when a plan needs to change.',
      icon: 'shield-check',
    },
    {
      title: 'Excellence',
      text: 'Careful, detailed work on every application, document and deadline.',
      icon: 'award',
    },
    {
      title: 'Care',
      text: 'Support that continues beyond admission, for students and their families.',
      icon: 'users',
    },
  ],
  audienceTitle: 'Who We Guide',
  audience: [
    {
      title: 'After Class 12',
      text: "Bachelor's, foundation and diploma programmes abroad.",
      icon: 'school',
    },
    {
      title: 'Graduates',
      text: "Master's, MBA and postgraduate diplomas.",
      icon: 'graduation-cap',
    },
    {
      title: 'Working Professionals',
      text: "Master's and MBAs that move your career forward.",
      icon: 'briefcase',
    },
    {
      title: 'Parents',
      text: 'Clear answers on costs, safety, outcomes and process.',
      icon: 'heart-handshake',
    },
  ],
};

/** "Why HopeFairy?" */
export const whyUs = {
  eyebrow: 'Why HopeFairy?',
  headline: 'Personal Care. Honest Advice. Clear Path.',
  copy: 'Studying abroad changes your life. We make sure it changes it for the better.',
  // Black & gold promise panel beside the cards.
  promise: 'Your Dream. Our Guidance. One Destination.',
  promiseLabel: 'The HopeFairy Promise',
  differentiators: [
    {
      title: 'One Counsellor, Start to Finish',
      text: 'One person who knows your story, from the first call to take-off.',
      icon: 'user-check',
    },
    {
      title: 'Advice Made for You',
      text: 'Built on your profile, goals and budget. Never a copy-paste list.',
      icon: 'target',
    },
    {
      title: 'Parents Welcome',
      text: 'Families get clear answers on costs, safety and outcomes.',
      icon: 'heart-handshake',
    },
    {
      title: 'Applications That Are Yours',
      text: 'We help you tell your own story — honestly and well.',
      icon: 'file-text',
    },
    {
      title: 'Everything Under One Roof',
      text: 'Careers, admissions, tests, funding, visas and pre-departure.',
      icon: 'route',
    },
    {
      title: 'Always in the Loop',
      text: 'Know where your application stands and what comes next.',
      icon: 'shield-check',
    },
  ],
};

/**
 * Student testimonials. Left empty on purpose — the section hides itself
 * until real, permission-backed quotes are added here. Shape:
 *   { quote, author, detail: 'MSc Data Science · United Kingdom' }
 */
export const testimonials = [];

/** FAQ section (client copy). */
export const faqSection = {
  eyebrow: 'FAQs',
  title: 'You Ask. We Answer.',
  intro: 'The questions we hear most, answered simply. Got another? Bring it to your free session.',
  // Chat card beside the questions — an illustrative exchange.
  chatName: 'HopeFairy Counsellor',
  chat: [
    { from: 'student', text: "Which country suits my master's budget?" },
    { from: 'counsellor', text: "Let's compare Germany, Ireland and the UK for your profile." },
    { from: 'student', text: 'Can my parents join the session?' },
    { from: 'counsellor', text: 'Absolutely — the more, the merrier.' },
  ],
  helpTitle: 'Still wondering?',
  helpText: "Ask a counsellor — it's free.",
  whatsappLabel: 'WhatsApp Us',
  callLabel: 'Call Us',
};

export const faqs = [
  {
    q: 'When should I start planning to study abroad?',
    a: 'Ideally 12–18 months before your intake. That leaves time for tests, applications, scholarships and the visa. Less time? Talk to us — shorter timelines often still work.',
  },
  {
    q: 'Is the first counselling session free?',
    a: 'Yes. Your first session is completely free, with no obligation.',
  },
  {
    q: 'Do I need IELTS or another English test?',
    a: "Usually, yes — but it depends on the country, the university and your academic background. Some universities accept alternatives or waivers. We'll tell you exactly what you need.",
  },
  {
    q: 'Can you guarantee admission or a visa?',
    a: 'No honest consultant can — those decisions rest with universities and embassies. What we promise is a strong, well-prepared application that gives you the best possible chance.',
  },
  {
    q: 'How much does it cost to study abroad?',
    a: "It depends on the country, course, university and city. Germany can be very affordable; the US and UK usually cost more. We'll build a clear budget for tuition and living costs — and find scholarships you can target.",
  },
  {
    q: 'Can I work part-time while studying?',
    a: "In most popular destinations, yes — within weekly hour limits set by visa rules. Rules differ by country and change often, so we'll give you the latest for your destination.",
  },
];

export const cta = {
  eyebrow: 'Take the first step',
  title: 'Your Future Abroad Starts With One Conversation.',
  text: 'Book a free counselling session with a HopeFairy counsellor. Tell us about your goals — we’ll help you plan the rest.',
  buttonLabel: 'Book Free Counselling',
};

export const contactPage = {
  heading: 'Contact',
  metaTitle: 'Contact HopeFairy | Book Your Free Counselling Session',
  metaDescription:
    'Call, WhatsApp or email HopeFairy to book a free counselling session. Mon – Sat, 10:00 AM – 7:00 PM IST.',
  eyebrow: 'Contact Us',
  kicker: 'Contact Us',
  headline: "Let's Talk About Your Future.",
  intro:
    "Tell us where you are and where you want to go, and we'll help you plan the rest. Your first counselling session is free.",
  call: PHONE_DISPLAY,
  whatsapp: PHONE_DISPLAY,
  email: PRIMARY_EMAIL,
  hours: OFFICE_HOURS,
  formHeading: 'Book Your Free Session — Share a few details and a counsellor will get back to you.',
  formButton: 'Book My Free Session',
  thankYou: 'Thanks for contacting us! Our team will connect with you shortly.',
};

/**
 * Homepage "Send us your query" section + QueryForm.
 */
export const querySection = {
  eyebrow: 'Send Us Your Query',
  title: 'Have a Question? Ask Us.',
  intro:
    'Study abroad, admission in India, Gulf Desk or test preparation — tell us what you’re planning and a counsellor will get back to you.',
  formTitle: 'Send your query',
  formNote: 'Fields marked * are required. We’ll never share your details.',
  messagePlaceholder: 'Tell us about your plans, scores or questions…',
  submitLabel: 'Send My Query',
  successTitle: 'Thanks for contacting us!',
  successNote: 'Our team will connect with you shortly.',
  againLabel: 'Send another query',
};

/** Contact-form select options. */
export const formOptions = {
  interest: [
    'HopeFairy Compass',
    'Study Abroad',
    'India Admissions',
    'Gulf Desk',
    'Test Prep',
    'Psychometric Test',
  ],
  qualification: [
    'Class 12 (pursuing / completed)',
    'Diploma',
    'Bachelor’s (pursuing / completed)',
    'Master’s',
    'Working professional',
  ],
  studyLevel: [
    'Bachelor’s / Undergraduate',
    'Master’s / Postgraduate',
    'MBA',
    'Diploma / Certificate',
    'PhD',
    'Not sure yet',
  ],
  intake: [
    'Within 6 months',
    '6–12 months',
    '12–18 months',
    'More than 18 months',
    'Not sure yet',
  ],
};

/* ================================================================== *
 * Admissions in India (Client PDF: 05 India Admissions)
 * ================================================================== */
export const indiaAdmissions = {
  metaTitle: 'India College Admissions | Best Career Counselling & College Advisory — HopeFairy',
  metaDescription:
    "Expert admission consulting and the best career counselling for India's leading colleges, with guidance on JEE, NEET, CLAT, IPMAT and CUET counselling.",
  eyebrow: 'Admissions in India',
  headline: "India's Best Colleges. Your Best Fit.",
  title: "India's Best Colleges. Your Best Fit.",
  intro:
    'Good scores open doors, and good choices take you through the right one. Our best career counselling experts guide you on college, branch, counselling rounds and seat allotment for UG and PG programmes.',
  button: 'Find My College',
  streamsGuide: [
    { stream: 'Engineering', exams: 'JEE Main · JEE Advanced · State CETs', icon: 'cpu' },
    { stream: 'Medicine', exams: 'NEET-UG', icon: 'stethoscope' },
    { stream: 'Management', exams: 'IPMAT · CUET-UG', icon: 'briefcase' },
    { stream: 'Law', exams: 'CLAT · AILET', icon: 'scale' },
    { stream: 'Liberal Arts', exams: 'CUET-UG · University tests', icon: 'palette' },
  ],
  cta: {
    eyebrow: 'Admissions in India',
    title: 'Your Seat at a Top Indian College Starts Here.',
    text: 'Book a free counselling session to discuss your stream, entrance exam scores and the colleges that fit your goals.',
    buttonLabel: 'Book Free Counselling',
  },
  ctaTitle: 'Unsure which stream suits you?',
  ctaText: 'Share your interests and scores — we’ll show you your options.',
  ctaButton: 'Book Free Counselling',
  streams: [
    {
      slug: 'engineering',
      name: 'Engineering',
      icon: 'cpu',
      text: 'Choose the right college and branch — and move through counselling rounds and seat allotment with ease.',
      ug: { programs: ['B.Tech', 'B.E.'], exams: ['JEE Main', 'JEE Advanced', 'State CETs'] },
      pg: { programs: ['M.Tech', 'M.E.', 'MS (Research)'], exams: ['GATE'] },
    },
    {
      slug: 'medicine',
      name: 'Medicine',
      icon: 'stethoscope',
      text: 'Clear guidance on medical counselling, college choices and paperwork.',
      ug: { programs: ['MBBS', 'BDS', 'BAMS', 'B.Sc Nursing'], exams: ['NEET-UG'] },
      pg: { programs: ['MD', 'MS', 'MDS'], exams: ['NEET-PG', 'INI-CET'] },
    },
    {
      slug: 'management',
      name: 'Management',
      icon: 'briefcase',
      text: 'Shortlist B-schools, sharpen your essays and walk into interviews prepared.',
      ug: { programs: ['BBA', 'BMS', 'Integrated IPM'], exams: ['IPMAT', 'CUET-UG'] },
      pg: { programs: ['MBA', 'PGDM'], exams: ['CAT', 'XAT', 'GMAT', 'CMAT'] },
    },
    {
      slug: 'law',
      name: 'Law',
      icon: 'scale',
      text: 'Find the right NLU or law school, with application and counselling support.',
      ug: { programs: ['BA LL.B', 'BBA LL.B', 'LL.B (3-year)'], exams: ['CLAT', 'AILET'] },
      pg: { programs: ['LL.M'], exams: ['CLAT PG', 'AILET PG'] },
    },
    {
      slug: 'liberal-arts',
      name: 'Liberal Arts',
      icon: 'palette',
      text: 'Discover the right university and programme — and write essays that fit.',
      ug: { programs: ['BA (Hons)', 'B.Sc (Hons)', 'Liberal Arts & Sciences'], exams: ['CUET-UG', 'University tests'] },
      pg: { programs: ['MA', 'M.Sc'], exams: ['CUET-PG', 'University tests'] },
    },
  ],
};

/* ================================================================== *
 * Gulf Desk (Client PDF: 06 Gulf Desk NEW)
 * ================================================================== */
export const gulfDesk = {
  menuLabel: 'Gulf Desk',
  metaTitle: 'Gulf Desk | Best Abroad Admission Advisor & NRI College Admissions — HopeFairy',
  metaDescription:
    'Dedicated admission consulting by the best abroad admission advisor for NRI students in the UAE, Kuwait, Bahrain, Qatar, Oman and Saudi Arabia for premier institutions in India.',
  eyebrow: 'Dedicated Desk for the Gulf',
  headline: 'Living in the Gulf. Studying in India. We Bridge the Gap.',
  intro:
    "Your family works in the Gulf, but your child's dream college is in India. HopeFairy's Gulf Desk gives children and wards of Indian-origin parents dedicated admission consulting by the best abroad admission advisors for India's premier institutions.",
  countries: [
    { name: 'UAE', code: 'AE' },
    { name: 'Kuwait', code: 'KW' },
    { name: 'Bahrain', code: 'BH' },
    { name: 'Qatar', code: 'QA' },
    { name: 'Oman', code: 'OM' },
    { name: 'Saudi Arabia', code: 'SA' },
  ],
  domains: ['Engineering', 'Medicine', 'Management', 'Law', 'Liberal Arts'],
  howWeHelp: [
    {
      title: 'One dedicated Gulf counsellor',
      desc: 'A single contact who knows the needs of NRI families.',
      icon: 'user-check',
    },
    {
      title: 'The right route in',
      desc: 'Clear guidance on eligibility, entrance exams and NRI or special-category seats.',
      icon: 'compass',
    },
    {
      title: 'College and course choice',
      desc: "A shortlist of premier institutions that match your child's goals.",
      icon: 'target',
    },
    {
      title: 'Paperwork made simple',
      desc: 'Forms, documents and deadlines tracked for you.',
      icon: 'file-text',
    },
    {
      title: 'Counselling and seat allotment',
      desc: 'Support through every round, until the seat is confirmed.',
      icon: 'shield-check',
    },
  ],
  tagline: 'Far from India. Close to your dream college.',
  buttons: {
    primary: 'Talk to Our Gulf Desk',
    whatsapp: 'WhatsApp Us',
  },
  homeTeaser: {
    eyebrow: 'Dedicated Desk for the Gulf',
    title:
      "Indian families in the UAE, Kuwait, Bahrain, Qatar, Oman and Saudi Arabia: we help your children get into India's premier institutions.",
    button: 'Know More',
    to: '/gulf-desk',
  },
};

/* ================================================================== *
 * Test Preparation (Client PDF: 07 Test Prep)
 * ================================================================== */
export const testPrep = {
  metaTitle: 'Best IMAT, SAT, IELTS & CELPIP Coaching in India | HopeFairy Test Prep',
  metaDescription:
    'Best test prep coaching in India for IMAT (Italy MBBS), Digital SAT, IELTS Academic (Band 8+), and CELPIP with full mock tests and personal mentor feedback.',
  eyebrow: 'Best Test Prep Coaching',
  headline: 'The Right Score Opens the Right Door.',
  title: 'The Right Score Opens the Right Door.',
  intro:
    'Focused test prep coaching that builds concepts, speed and confidence — with realistic mock tests and personal mentorship at every stage.',
  button: 'View All Programs',
  cta: {
    eyebrow: 'Test Preparation',
    title: 'Ready to Ace IMAT, SAT, CELPIP, GMAT or IELTS?',
    text: 'Book a free session to find your starting level, set a target score and plan your preparation with a HopeFairy mentor.',
    buttonLabel: 'Book a Free Session',
  },
  featuredPrograms: [
    {
      code: 'IMAT',
      name: 'International Medical Admissions Test',
      flag: 'IT',
      tag: '★ FEATURED · STUDY MEDICINE IN ITALY',
      headline: "Your gateway to English-taught Medicine at Italy's public universities.",
      text:
        'Complete preparation in Biology, Chemistry, Physics, Mathematics and Logical Reasoning, with full-length mocks and step-by-step support through the Italian admission process.',
      subjects: ['Biology', 'Chemistry', 'Physics', 'Mathematics', 'Logical Reasoning'],
      cta: 'Enquire About IMAT',
    },
    {
      code: 'SAT',
      name: 'College Board undergraduate admission test',
      flag: 'US',
      tag: '★ FEATURED · UNDERGRADUATE ADMISSIONS',
      headline: 'One test. Doors to universities in the US, worldwide and in India.',
      text:
        "Targeted coaching for the digital SAT's Reading & Writing and Math sections. We help you master the adaptive format, manage your time and reach your target score.",
      subjects: ['Reading & Writing', 'Math', 'Adaptive Format', 'Target Score Planning'],
      cta: 'Enquire About SAT',
    },
    {
      code: 'CELPIP',
      name: 'Canadian English Language Proficiency Index Program',
      flag: 'CA',
      tag: '★ FEATURED · CANADA PR & CITIZENSHIP',
      headline: 'Your English score for life in Canada.',
      text:
        'Practical preparation for all four skills — Listening, Reading, Writing and Speaking — on the computer-based test, so you reach the level your Canadian immigration application needs.',
      subjects: ['Listening', 'Reading', 'Writing', 'Speaking'],
      cta: 'Enquire About CELPIP',
    },
  ],
  featured: {
    code: 'IMAT',
    name: 'International Medical Admissions Test',
    flag: 'IT',
    tag: 'Featured Program',
    tagNote: 'Study Medicine in Italy',
    tagline: "Your gateway to English-taught Medicine at Italy's public universities.",
    text:
      "IMAT is the entrance test for English-taught Medicine and Surgery at Italy's public universities. We prepare you for every section — then guide you through admission.",
    subjects: ['Biology', 'Chemistry', 'Physics', 'Mathematics', 'Logical Reasoning'],
    features: [
      { title: 'Full syllabus coverage', icon: 'book-open' },
      { title: 'Full-length mock tests', icon: 'timer' },
      { title: 'One-on-one performance feedback', icon: 'clipboard-check' },
      { title: 'University & admission support', icon: 'graduation-cap' },
    ],
    cta: 'Enquire About IMAT',
  },
  alsoOffered: [
    {
      code: 'GMAT',
      name: 'Graduate Management Admission Test',
      icon: 'briefcase',
      text: "for MBA and business master's programmes worldwide.",
    },
    {
      code: 'IELTS',
      name: 'International English Language Testing System',
      icon: 'languages',
      text: 'English for study, work and migration.',
    },
  ],
  tests: [
    {
      code: 'GMAT',
      name: 'Graduate Management Admission Test',
      icon: 'briefcase',
      text: "for MBA and business master's programmes worldwide.",
    },
    {
      code: 'IELTS',
      name: 'International English Language Testing System',
      icon: 'languages',
      text: 'English for study, work and migration.',
    },
    {
      code: 'CELPIP',
      name: 'Canadian English Language Proficiency Index Program',
      icon: 'message-circle',
      flag: 'CA',
      text: "Canada's English test for permanent residence and citizenship.",
    },
  ],
};

/**
 * Psychometric Assessment & Career Profiling Section
 * Features the flagship "HopeFairy Compass" program
 */
export const psychometricSection = {
  eyebrow: 'Best Career Counselling · HopeFairy Compass',
  title: 'Your Potential.',
  headlineAccent: 'Design Your Future.',
  intro:
    'Every student is unique, with inherent strengths, untapped potential and individual aspirations. Recognized as the best career counselling initiative, our comprehensive programme combines scientifically designed psychometric assessments with personalised one-to-one counselling to help students of Classes IX–XII identify their aptitude, interests, personality traits and natural inclinations. We empower students to make informed subject choices, explore suitable academic pathways and discover career opportunities aligned with their true potential. Because the right guidance at the right time can transform a student’s potential into a lifetime of achievement.',
  ctaPrimary: 'Book One to One Consultation',
  ctaSecondary: 'Talk to an Advisor',
  trustBadges: [
    { label: 'Classes IX–XII Focus', icon: 'graduation-cap' },
    { label: '1:1 Career Strategy Session', icon: 'heart-handshake' },
    { label: 'Globally Validated Framework', icon: 'shield-check' },
    { label: '25+ Page Diagnostic Report', icon: 'file-text' },
  ],
  pillars: [
    {
      num: '01',
      title: 'Personality & Behavioral Traits',
      short:
        'Uncover working styles, interpersonal dynamics, emotional intelligence, and natural inclinations based on validated psychometric models.',
      icon: 'brain',
    },
    {
      num: '02',
      title: 'Aptitude & Cognitive Strengths',
      short:
        'Evaluate critical reasoning, logical deduction, numerical agility, spatial perception, and problem-solving velocity.',
      icon: 'lightbulb',
    },
    {
      num: '03',
      title: 'Career & Industry Alignment',
      short:
        'Scientifically match your unique profile against 150+ emerging career disciplines across STEM, Business, Law, Healthcare, and Design.',
      icon: 'compass',
    },
    {
      num: '04',
      title: '1-on-1 Counsellor Roadmap',
      short:
        'A deep-dive debrief with a senior HopeFairy education counsellor to translate your score into an actionable college shortlist.',
      icon: 'graduation-cap',
    },
  ],
  stages: [
    {
      grade: 'Class 9 – 10',
      badge: 'Stream Selection',
      desc: 'Clarity on Science (PCM/PCB), Commerce, or Humanities based on true cognitive abilities.',
    },
    {
      grade: 'Class 11 – 12',
      badge: 'Degree & College Target',
      desc: 'Pinpoint target bachelor degrees and ideal entrance pathways (JEE, NEET, CLAT, SAT, IMAT, CUET).',
    },
    {
      grade: 'College & Graduates',
      badge: 'Career Realignment',
      desc: 'Master’s degree roadmap, MBA vs MS decision, and transition into high-growth global professions.',
    },
  ],
};
