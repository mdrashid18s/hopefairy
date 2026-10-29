import { Inter } from 'next/font/google';
import Script from 'next/script';
import AppShell from '../components/layout/AppShell.jsx';
import { asset } from '../lib/asset.js';
import { SITE_ORIGIN, SITE_URL, SITE_NAME, DEFAULT_IMAGE } from '../lib/seo.js';
import { site } from '../data/site.js';
import { SHOW_THEME_TOGGLE } from '../config/launch.js';
import { PHONE_SCHEMA } from '../config/contact.js';
import './globals.css';

// The one site font. Applied only to <body> (via its className) — every
// other element inherits it; nothing sets its own font-family.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

const DEFAULT_TITLE = `${SITE_NAME} — Best Abroad Admission Advisor & Best Career Counselling`;
const DEFAULT_DESCRIPTION =
  'HopeFairy is recognized as the best abroad admission advisor and premier career counselling consultancy in India & GCC. We provide 1-on-1 global university admissions (UK, USA, Canada, Germany, Europe), premier India college admissions, SOP reviews, student visa guidance, and top test prep (IMAT, SAT, IELTS, CELPIP).';
const DEFAULT_KEYWORDS = [
  'best abroad admission advisor',
  'best career counselling',
  'best career counsellor in India',
  'best career counselling after 12th',
  'top abroad education consultants',
  'best study abroad consultancy in India',
  'overseas admission advisor',
  'foreign university admission consultant',
  'best consultancy for masters abroad',
  'study abroad consultants India',
  'study in UK admission advisor',
  'study in Germany free education consultancy',
  'study in USA admission counsellor',
  'study in Canada admission consultant',
  'best IMAT coaching in India',
  'IMAT Italy MBBS preparation',
  'best SAT coaching classes',
  'best IELTS coaching online',
  'best CELPIP coaching for Canada PR',
  'best admission consultant for engineering',
  'MBBS college admission guidance India',
  'Gulf NRI admissions consultant Dubai Qatar Saudi',
  'HopeFairy education advisory',
];

export const metadata = {
  metadataBase: new URL(`${SITE_ORIGIN}/`),
  title: {
    default: DEFAULT_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  robots: { index: true, follow: true },
  icons: {
    icon: asset('/favicon.png'),
    apple: asset('/apple-touch-icon.png'),
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: `${SITE_URL}/`,
    images: [{ url: DEFAULT_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_IMAGE],
  },
};

export const viewport = {
  themeColor: '#faf8f3',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['EducationalOrganization', 'LocalBusiness'],
  name: SITE_NAME,
  alternateName: [
    'HopeFairy Best Abroad Admission Advisor',
    'HopeFairy Career Counselling India',
    'HopeFairy Study Abroad Consultants',
  ],
  slogan: site.tagline,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/brand/hopefairy-emblem.png`,
  image: DEFAULT_IMAGE,
  description: DEFAULT_DESCRIPTION,
  knowsAbout: [
    'Best Abroad Admission Advisory',
    'Best Career Counselling for Students',
    'Study Abroad in UK, USA, Canada, Germany & Australia',
    'IMAT Coaching for Italy MBBS',
    'Digital SAT Coaching',
    'IELTS Academic Band 8 Preparation',
    'CELPIP Coaching for Canada PR',
    'Premier Indian College Admissions & JEE NEET Guidance',
    'Gulf NRI Admissions (DASA and CIWG)',
    'Student Visa Guidance & Mock Interviews',
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
    addressRegion: 'India',
  },
  email: site.email,
  telephone: PHONE_SCHEMA,
  priceRange: '$$',
  areaServed: [
    { '@type': 'Country', name: 'India' },
    { '@type': 'Country', name: 'United Arab Emirates' },
    { '@type': 'Country', name: 'Saudi Arabia' },
    { '@type': 'Country', name: 'Kuwait' },
    { '@type': 'Country', name: 'Qatar' },
    { '@type': 'Country', name: 'Oman' },
    { '@type': 'Country', name: 'Bahrain' },
    { '@type': 'Country', name: 'United Kingdom' },
    { '@type': 'Country', name: 'United States' },
    { '@type': 'Country', name: 'Canada' },
    { '@type': 'Country', name: 'Germany' },
    { '@type': 'Country', name: 'Australia' },
    { '@type': 'Country', name: 'Ireland' },
  ],
  sameAs: site.socials.map((s) => s.href),
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: PHONE_SCHEMA,
    contactType: 'customer support',
    areaServed: ['IN', 'AE', 'SA', 'KW', 'QA', 'OM', 'BH'],
    availableLanguage: ['English', 'Hindi'],
  },
};

const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  alternateName: 'HopeFairy Education Consultancy',
  url: `${SITE_URL}/`,
  description: DEFAULT_DESCRIPTION,
  inLanguage: 'en-IN',
};

export default function RootLayout({ children }) {
  return (
    // Light is the default. suppressHydrationWarning: the inline script
    // below adds `.dark` before React hydrates when the visitor previously
    // chose the dark theme (prevents a theme flash) — the documented
    // pattern for class-based dark mode.
    <html
      lang="en-IN"
      className="scroll-smooth"
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
        {/* Intro loader plays once per session: runs before first paint, so a repeat view never flashes it */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('hf_preloaded')==='1'){document.documentElement.classList.add('hf-preloaded')}else{sessionStorage.setItem('hf_preloaded','1')}}catch(e){}`,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* Only honour a saved theme while visitors can actually change it. */}
        {SHOW_THEME_TOGGLE && (
          <Script id="theme-init" strategy="beforeInteractive">
            {`try{if(localStorage.getItem('hf-theme')==='dark'){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}}catch(e){}`}
          </Script>
        )}
        <AppShell>{children}</AppShell>
        {/* Google tag (gtag.js) — loaded once the page is idle so analytics never delays the first render */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NGDS8GXD31"
          strategy="lazyOnload"
        />
        <Script id="gtag-init" strategy="lazyOnload">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-NGDS8GXD31');`}
        </Script>
      </body>
    </html>
  );
}
