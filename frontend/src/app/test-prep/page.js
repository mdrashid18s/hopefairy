import TestPrepClient from './TestPrepClient.jsx';
import { pageMetadata } from '../../lib/seo.js';
import { testPrep } from '../../data/site.js';

export const metadata = pageMetadata({
  title: 'Test Prep Coaching | Best IMAT, SAT, IELTS & CELPIP Classes — HopeFairy',
  description:
    'Premier entrance test coaching by HopeFairy mentors: high-scoring classes for IMAT (Italy MBBS), Digital SAT, IELTS Academic (Band 8+), and CELPIP (Canada PR) with personal feedback.',
  keywords: [
    'best IMAT coaching in India',
    'IMAT Italy MBBS preparation classes',
    'best SAT coaching classes',
    'best IELTS coaching online',
    'best CELPIP coaching for Canada PR',
    'test prep coaching India',
    'best abroad admission advisor test prep',
    'GMAT coaching classes online',
    'study abroad entrance test prep',
    'HopeFairy test prep',
  ],
  path: '/test-prep',
});

export default function TestPrepPage() {
  return <TestPrepClient />;
}
