import { notFound } from 'next/navigation';
import ServiceDetailClient from './ServiceDetailClient.jsx';
import { getService } from '../../../services/api.js';
import { pageMetadata } from '../../../lib/seo.js';
import { services } from '../../../data/site.js';

// Static export needs every possible [slug] known at build time.
export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

const SERVICE_SEO_MAP = {
  'career-counselling': {
    title: 'Best Career Counselling & Course Mapping in India | HopeFairy Advisory',
    description:
      'Recognized as the best career counselling service in India. 1-on-1 psychometric aptitude evaluation, career roadmap design, and country-course matching by senior mentors.',
    keywords: [
      'best career counselling',
      'best career counsellor in India',
      'best career counselling after 12th',
      'career aptitude assessment India',
      'psychometric career test',
      'course country mapping',
      'HopeFairy career advisory',
    ],
  },
  'university-admissions': {
    title: 'Best Abroad Admission Advisor | Global University Applications — HopeFairy',
    description:
      'Partner with India’s best abroad admission advisor for bachelor’s and master’s admissions in UK, USA, Canada, Germany & Australia. High admit rates and scholarship strategy.',
    keywords: [
      'best abroad admission advisor',
      'best foreign education consultant',
      'university admissions consulting',
      'study abroad application help',
      'university shortlisting India',
      'overseas admissions consultant',
      'HopeFairy admissions',
    ],
  },
  'sop-lor-essays': {
    title: 'SOP, LOR & Admission Essay Review Services — HopeFairy',
    description:
      'Professional Statement of Purpose (SOP) drafting, Letter of Recommendation (LOR) structuring, and college essay editing for top global universities by expert advisors.',
    keywords: [
      'SOP review service',
      'statement of purpose writing guidance',
      'LOR editing abroad',
      'university application essays',
      'best abroad admission advisor',
      'HopeFairy SOP review',
    ],
  },
  'scholarships-loans': {
    title: 'Scholarships & Education Loan Assistance for Study Abroad — HopeFairy',
    description:
      'Maximize merit scholarships and secure fast education loan approvals with lowest interest rates for overseas education through HopeFairy’s best abroad admission advisors.',
    keywords: [
      'study abroad scholarships India',
      'education loan without collateral',
      'merit scholarship guidance',
      'overseas student loans',
      'best abroad admission advisor',
      'HopeFairy scholarships',
    ],
  },
  'student-visa': {
    title: 'Student Visa Guidance & Mock Interview Preparation — HopeFairy',
    description:
      'High-success student visa filing for UK, USA F1, Canada study permit, Schengen, and Australia with complete financial documentation and mock interviews from top advisors.',
    keywords: [
      'student visa consultant India',
      'USA F1 visa interview preparation',
      'UK student visa guidance',
      'Canada study permit application',
      'best abroad admission advisor',
      'HopeFairy visa guidance',
    ],
  },
  'pre-departure': {
    title: 'Pre-Departure Briefing & Student Relocation Support — HopeFairy',
    description:
      'Comprehensive pre-departure sessions covering student housing, forex card, international SIM, health insurance, and campus packing checklists with trusted mentors.',
    keywords: [
      'pre departure briefing study abroad',
      'international student accommodation',
      'student forex card advice',
      'overseas student health cover',
      'best abroad admission advisor',
      'HopeFairy pre departure',
    ],
  },
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = await getService(slug).catch(() => null);
  if (!service) return {};
  const seo = SERVICE_SEO_MAP[slug];
  return pageMetadata({
    title: seo?.title || `${service.title} | HopeFairy Advisory`,
    description:
      seo?.description ||
      service.short ||
      `Expert ${service.title} guidance with personalized counselling at HopeFairy.`,
    keywords: seo?.keywords || [
      service.title,
      'study abroad services',
      'university counselling',
      'admissions support',
      'HopeFairy',
    ],
    path: `/service/${slug}`,
  });
}

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const service = await getService(slug).catch(() => null);
  if (!service) notFound();
  return <ServiceDetailClient service={service} />;
}
