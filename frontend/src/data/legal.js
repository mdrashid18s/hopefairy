/**
 * Sitemap, Privacy Policy and Terms of Use content.
 * The sitemap groups are built from the same data as the navbar/footer, so a new page,
 * service or destination shows up here automatically.
 */
import { nav, services, destinations, site } from './site.js';
import { CONTACT_ADDRESS } from '../config/contact.js';

export const LEGAL_UPDATED = '22 October 2026';
export const LEGAL_UPDATED_ISO = '2026-10-22';

/** Search metadata for the three pages (title, description, keywords, path). */
export const legalSeo = {
  sitemap: {
    path: '/sitemap',
    title: 'Sitemap — All Study Abroad & Career Counselling Pages | HopeFairy',
    description:
      'All HopeFairy pages in one place: study abroad admissions, career counselling, India admissions, test prep, visa help and destinations like the UK and USA.',
    keywords: [
      'HopeFairy sitemap',
      'study abroad consultant pages',
      'career counselling services list',
      'study abroad destinations',
      'abroad admission advisor India',
    ],
  },
  privacy: {
    path: '/privacy-policy',
    title: 'Privacy Policy | HopeFairy Study Abroad & Career Counselling',
    description:
      'How HopeFairy, a study abroad and career counselling consultancy, collects, uses and protects student data, and your rights under India’s DPDP Act, 2023.',
    keywords: [
      'HopeFairy privacy policy',
      'study abroad consultant privacy policy',
      'student data protection',
      'DPDP Act 2023 privacy',
      'career counselling privacy',
    ],
  },
  terms: {
    path: '/terms-of-use',
    title: 'Terms of Use | HopeFairy Study Abroad & Career Counselling',
    description:
      'Terms for using the HopeFairy website and our study abroad admission, career counselling, visa guidance and test prep services, including no-guarantee terms.',
    keywords: [
      'HopeFairy terms of use',
      'study abroad consultant terms and conditions',
      'admission counselling terms',
      'visa guidance disclaimer',
      'website terms India',
    ],
  },
};

/** Footer links shown under "Contact". */
export const legalNav = [
  { label: 'Sitemap', to: '/sitemap/' },
  { label: 'Privacy Policy', to: '/privacy-policy/' },
  { label: 'Terms of Use', to: '/terms-of-use/' },
];

export const sitemapGroups = [
  {
    title: 'Main Pages',
    icon: 'compass',
    text: 'Study abroad, India admissions, the Gulf Desk for GCC families and test prep.',
    links: nav.map((n) => ({ label: n.label, to: n.to })),
  },
  {
    title: 'Our Services',
    icon: 'sparkles',
    text: 'One-on-one guidance from career choice to your first day on campus.',
    links: services.map((s) => ({ label: s.title, to: `/service/${s.slug}/` })),
  },
  {
    title: 'Study Destinations',
    icon: 'globe',
    text: 'Courses, tuition, living costs, intakes and work rights by country.',
    links: destinations.map((d) => ({ label: `Study in ${d.name}`, to: `/destinations/#${d.slug}` })),
  },
  {
    title: 'Legal & Help',
    icon: 'shield-check',
    text: 'How we handle your data, our terms, and how to reach a counsellor.',
    links: [...legalNav.filter((l) => l.to !== '/sitemap/'), { label: 'Contact Us', to: '/contact-us/' }],
  },
];

const contactLines = [
  `${CONTACT_ADDRESS.legalName || site.name}`,
  site.address,
  `Email: ${site.email}`,
  `Phone: ${site.phone}`,
];

export const privacyPolicy = {
  title: 'Privacy Policy',
  intro:
    'This policy explains what personal information HopeFairy collects when you use myhopefairy.com or our counselling services, how we use it, and the choices you have.',
  sections: [
    {
      id: 'who-we-are',
      heading: 'Who we are',
      paras: [
        `${site.name} provides study abroad admission advice, career counselling, India admissions guidance and test preparation. In this policy, "we", "us" and "our" mean ${site.name}, and "you" means anyone who visits our website or uses our services.`,
      ],
    },
    {
      id: 'information-we-collect',
      heading: 'Information we collect',
      paras: ['We only collect the information we need to guide you. This includes:'],
      list: [
        'Contact details you share through our forms, phone, email or WhatsApp, such as your name, email address, phone number and city.',
        'Details about your plans, such as the course, country, service or intake you are interested in, and any message you send us.',
        'Information needed for applications once you enrol with us, such as academic records, test scores, work experience, passport details and financial documents.',
        'Technical information collected automatically when you browse, such as your device and browser type, pages visited and approximate location, through cookies and analytics tools.',
      ],
    },
    {
      id: 'how-we-use',
      heading: 'How we use your information',
      list: [
        'To reply to your enquiry and arrange counselling sessions.',
        'To recommend courses, universities, colleges and destinations that suit your profile.',
        'To prepare and submit applications, visa files, scholarship and education loan requests on your behalf, with your consent.',
        'To send updates about your application, intakes, deadlines and events. You can opt out of non-essential messages at any time.',
        'To improve our website, services and security, and to meet our legal obligations.',
      ],
    },
    {
      id: 'sharing',
      heading: 'When we share information',
      paras: ['We do not sell your personal information. We share it only when it is needed to help you, or when the law requires it:'],
      list: [
        'With universities, colleges, test bodies, visa authorities, scholarship providers and education lenders you choose to apply to, with your consent.',
        'With trusted service providers who help us run our business, such as website hosting, email and analytics providers, under confidentiality obligations.',
        'With government or law enforcement authorities when required by law.',
      ],
    },
    {
      id: 'international',
      heading: 'International transfers',
      paras: [
        'Because we help students apply abroad, your information may be sent to institutions and authorities in other countries, such as the UK, USA, Canada, Australia, Ireland, Germany, New Zealand and France. We share only what each application needs.',
      ],
    },
    {
      id: 'cookies',
      heading: 'Cookies and analytics',
      paras: [
        'Our website uses cookies and Google Analytics to understand how visitors use the site, so we can improve it. These tools collect information in a way that does not directly identify you. You can block or delete cookies in your browser settings; the site will still work.',
      ],
    },
    {
      id: 'retention-security',
      heading: 'How long we keep it and how we protect it',
      paras: [
        'We keep your information only as long as needed for the purposes above, or as required by law. We use reasonable technical and organisational measures, such as secure servers, encrypted connections and restricted staff access, to protect it. No online system is completely secure, so please share sensitive documents only through the channels we provide.',
      ],
    },
    {
      id: 'your-rights',
      heading: 'Your rights',
      paras: ['Under applicable data protection laws, including India’s Digital Personal Data Protection Act, 2023, you can:'],
      list: [
        'Ask for a copy of the personal information we hold about you.',
        'Ask us to correct or update inaccurate information.',
        'Ask us to delete your information, where we are not required to keep it.',
        'Withdraw your consent to our use of your information at any time.',
        'Raise a concern with us, and if unresolved, with the relevant data protection authority.',
      ],
    },
    {
      id: 'children',
      heading: 'Students under 18',
      paras: [
        'Many of the students we guide are under 18. For them, we collect and use personal information with the involvement and consent of a parent or guardian.',
      ],
    },
    {
      id: 'links',
      heading: 'Links to other websites',
      paras: [
        'Our website may link to university, government and partner websites. Their privacy practices are their own, so please read their policies before sharing information with them.',
      ],
    },
    {
      id: 'changes',
      heading: 'Changes to this policy',
      paras: [
        'We may update this policy from time to time. The "Last updated" date at the top shows when it was last changed. Significant changes will be highlighted on our website.',
      ],
    },
    {
      id: 'contact',
      heading: 'Contact us',
      paras: ['For any privacy question or request, please contact us:'],
      list: contactLines,
    },
  ],
};

export const termsOfUse = {
  title: 'Terms of Use',
  intro:
    'These terms apply to your use of myhopefairy.com and the information on it. By using this website, you agree to them. Please read them carefully.',
  sections: [
    {
      id: 'about',
      heading: 'About these terms',
      paras: [
        `This website is operated by ${site.name}. "We", "us" and "our" mean ${site.name}; "you" means any visitor or user of the website. If you do not agree to these terms, please do not use the website.`,
      ],
    },
    {
      id: 'our-services',
      heading: 'Our services',
      paras: [
        'HopeFairy offers study abroad admission advice, career counselling, India admissions guidance, test preparation, visa guidance and related support. The specific scope, timelines and fees of any paid service are set out in a separate agreement or confirmation shared with you when you enrol.',
      ],
    },
    {
      id: 'no-guarantee',
      heading: 'No guarantee of admission or visa',
      paras: [
        'Admission, scholarship, education loan and visa decisions are made solely by universities, colleges, lenders and government authorities. We guide and support you to give your application the best chance, but we cannot guarantee any outcome.',
      ],
    },
    {
      id: 'information',
      heading: 'Accuracy of information',
      paras: [
        'We work to keep course details, fees, intakes, rankings and visa rules on this website accurate and up to date. These details are set by third parties and can change without notice, so please confirm them with the institution or authority before making decisions. Information on this website is general guidance, not legal, financial or immigration advice.',
      ],
    },
    {
      id: 'use-of-website',
      heading: 'Using this website',
      paras: ['When using this website, you agree not to:'],
      list: [
        'Submit false, misleading or someone else’s information through our forms.',
        'Use the website for any unlawful, harmful or fraudulent purpose.',
        'Attempt to access, damage or disrupt the website, its servers or other users’ data.',
        'Copy, scrape or reuse our content for commercial purposes without our written permission.',
      ],
    },
    {
      id: 'your-information',
      heading: 'Information you provide',
      paras: [
        'You are responsible for making sure the documents and information you share with us are true, complete and your own. We are not responsible for any outcome caused by incorrect or incomplete information. How we handle your personal information is explained in our Privacy Policy.',
      ],
    },
    {
      id: 'intellectual-property',
      heading: 'Intellectual property',
      paras: [
        `All content on this website, including text, graphics, logos, the ${site.name} name and design, is owned by or licensed to ${site.name} and protected by law. University names and logos belong to their respective owners and are used only for identification.`,
      ],
    },
    {
      id: 'third-party-links',
      heading: 'Third-party websites',
      paras: [
        'This website may link to external websites, such as universities, test bodies and government portals. We do not control them and are not responsible for their content, availability or practices.',
      ],
    },
    {
      id: 'liability',
      heading: 'Limitation of liability',
      paras: [
        'To the fullest extent permitted by law, HopeFairy is not liable for any indirect or consequential loss arising from your use of this website or reliance on its content. The website is provided "as is", and we do not promise it will always be available or error-free.',
      ],
    },
    {
      id: 'changes',
      heading: 'Changes to these terms',
      paras: [
        'We may update these terms from time to time. The "Last updated" date at the top shows when they last changed. Continuing to use the website after a change means you accept the updated terms.',
      ],
    },
    {
      id: 'law',
      heading: 'Governing law',
      paras: ['These terms are governed by the laws of India. Any dispute will be subject to the jurisdiction of the courts of Mumbai, Maharashtra.'],
    },
    {
      id: 'contact',
      heading: 'Contact us',
      paras: ['If you have any questions about these terms, please contact us:'],
      list: contactLines,
    },
  ],
};
