import ContactClient from './ContactClient.jsx';
import { pageMetadata } from '../../lib/seo.js';
import { contactPage } from '../../data/site.js';

export const metadata = pageMetadata({
  title: 'Contact Us | Best Abroad Admission Advisor & Career Mentors — HopeFairy',
  description:
    'Book a free 1-on-1 session with the best abroad admission advisor and best career counselling team in India. Connect directly via WhatsApp, phone, or online inquiry form.',
  keywords: [
    'best abroad admission advisor contact',
    'best career counselling appointment',
    'contact HopeFairy',
    'book free counselling session',
    'study abroad consultation appointment',
    'overseas education consultants contact',
    'university admission counselling India',
    'Gulf NRI admission helpline',
    'HopeFairy phone number WhatsApp',
  ],
  path: '/contact-us',
});

export default function ContactPage() {
  return <ContactClient />;
}
