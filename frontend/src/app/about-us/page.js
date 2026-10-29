import AboutClient from './AboutClient.jsx';
import { pageMetadata } from '../../lib/seo.js';
import { about } from '../../data/site.js';

export const metadata = pageMetadata({
  title: 'About Us | Best Abroad Admission Advisor & Career Mentors — HopeFairy',
  description:
    'Meet HopeFairy — India’s best abroad admission advisor and dedicated career counselling team. Honest profile evaluation, university shortlists, and 100% transparent guidance from first session to arrival.',
  keywords: [
    'best abroad admission advisor',
    'best career counselling',
    'best career counsellor in India',
    'about HopeFairy',
    'study abroad counsellors India',
    'honest overseas education mentors',
    'career guidance experts',
    'foreign university admission advisors',
    'trusted study abroad consultancy',
  ],
  path: '/about-us',
});

export default function AboutPage() {
  return <AboutClient />;
}
