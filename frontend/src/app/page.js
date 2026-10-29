import HomeClient from './HomeClient.jsx';
import { getServices, getDestinations, getFaqs } from '../services/api.js';
import { pageMetadata } from '../lib/seo.js';
import { site } from '../data/site.js';

export const metadata = pageMetadata({
  title: 'HopeFairy — Best Abroad Admission Advisor & Best Career Counselling in India',
  description:
    'HopeFairy is rated the best abroad admission advisor and best career counselling consultancy in India. We offer 1-on-1 global university admissions (UK, USA, Canada, Germany & Australia), top India college admissions, and elite coaching for IMAT, SAT, IELTS & CELPIP.',
  keywords: [
    'best abroad admission advisor',
    'best career counselling',
    'best career counsellor in India',
    'best career counselling after 12th',
    'best study abroad consultants India',
    'top overseas education consultants',
    'foreign university admission consultant',
    'best consultancy for masters abroad',
    'study abroad advisors India',
    'study in UK admission advisor',
    'study in Germany free education consultancy',
    'study in USA admission advisor',
    'study in Canada admission consultant',
    'best IMAT coaching in India',
    'IMAT Italy MBBS preparation classes',
    'best SAT coaching classes',
    'best IELTS coaching band 8',
    'best CELPIP coaching for Canada PR',
    'India engineering medical admissions',
    'Gulf NRI admissions consultant Dubai Qatar Saudi',
    'HopeFairy education advisory',
  ],
  path: '/',
});

export default async function Home() {
  const [services, destinationsData, faqsData] = await Promise.all([
    getServices(),
    getDestinations(),
    getFaqs(),
  ]);

  return (
    <HomeClient
      services={services}
      destinations={destinationsData?.items || []}
      faqs={faqsData || []}
    />
  );
}
