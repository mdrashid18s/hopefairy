import IndiaAdmissionsClient from './IndiaAdmissionsClient.jsx';
import { pageMetadata } from '../../lib/seo.js';
import { indiaAdmissions } from '../../data/site.js';

export const metadata = pageMetadata({
  title: 'India College Admissions | Best Career Counselling & College Advisory — HopeFairy',
  description:
    "Expert admission consulting and the best career counselling for India's leading colleges across B.Tech, MBBS, MBA, Law and Liberal Arts with JEE, NEET, IPMAT, and CUET counselling.",
  keywords: [
    'best career counselling',
    'best admission consultant for engineering',
    'India college admissions',
    'MBBS admission consultant India',
    'engineering admissions India BTech',
    'MBA BBA admissions India IPMAT',
    'JEE Main JEE Advanced counselling',
    'NEET UG counselling guidance',
    'CUET admission guidance',
    'top private universities India admission',
  ],
  path: '/india-admissions',
});

export default function IndiaAdmissionsPage() {
  return <IndiaAdmissionsClient />;
}
