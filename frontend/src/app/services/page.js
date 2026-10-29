import ServicesClient from './ServicesClient.jsx';
import { getServices } from '../../services/api.js';
import { pageMetadata } from '../../lib/seo.js';
import { studyAbroadPage } from '../../data/site.js';

export const metadata = pageMetadata({
  title: 'Study Abroad Services | Best Abroad Admission Advisor & Visa Support — HopeFairy',
  description:
    'Comprehensive overseas guidance from the best abroad admission advisor: university applications, SOP/LOR drafting, scholarship search, student visa filing, and pre-departure support.',
  keywords: [
    'best abroad admission advisor',
    'best career counselling for study abroad',
    'study abroad services',
    'foreign admission consultant',
    'study abroad consultants India',
    'SOP writing service for visa',
    'student visa guidance UK USA Canada Germany',
    'scholarships for Indian students abroad',
    'university application management',
    'pre departure briefing',
  ],
  path: '/services',
});

export default async function ServicesPage() {
  const data = await getServices();
  return <ServicesClient data={data} />;
}
