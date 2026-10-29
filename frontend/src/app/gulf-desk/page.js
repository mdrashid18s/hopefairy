import GulfDeskClient from './GulfDeskClient.jsx';
import { pageMetadata } from '../../lib/seo.js';
import { gulfDesk } from '../../data/site.js';

export const metadata = pageMetadata({
  title: 'Gulf Desk | Best Abroad Admission Advisor & NRI College Admissions — HopeFairy',
  description:
    'Dedicated advisory by the best abroad admission advisor for NRI students in UAE (Dubai, Abu Dhabi), Saudi Arabia, Qatar, Oman, Kuwait, and Bahrain for premier colleges in India under NRI, DASA, and CIWG quotas.',
  keywords: [
    'best abroad admission advisor',
    'best career counselling for NRI students',
    'Gulf Desk',
    'NRI admissions India',
    'NRI quota admissions Engineering Medical',
    'DASA CIWG scheme counselling',
    'UAE Indian students admissions India',
    'Kuwait Indian student college admission',
    'Saudi Arabia Indian NRI admissions',
    'GCC NRI education consultant',
  ],
  path: '/gulf-desk',
});

export default function GulfDeskPage() {
  return <GulfDeskClient />;
}
