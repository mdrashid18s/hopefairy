import DestinationsClient from './DestinationsClient.jsx';
import { getDestinations } from '../../services/api.js';
import { pageMetadata } from '../../lib/seo.js';
import { destinationsPage } from '../../data/site.js';

export const metadata = pageMetadata({
  title: 'Top Study Destinations | Best Abroad Admission Advisor — HopeFairy',
  description:
    'Compare top global study destinations with the best abroad admission advisor. Expert insights into university tuition costs, post-study work visas (PSW), intakes, and scholarships for UK, USA, Canada, Germany & Australia.',
  keywords: [
    'best abroad admission advisor',
    'study abroad destinations',
    'study in UK admission advisor',
    'study in USA STEM programs',
    'study in Canada PGWP colleges',
    'study in Australia Group of Eight',
    'study in Germany free public universities',
    'study in Ireland tech jobs',
    'best foreign education consultancy',
    'overseas education country guide',
  ],
  path: '/destinations',
});

export default async function DestinationsPage() {
  const data = await getDestinations();
  return <DestinationsClient data={data} />;
}
