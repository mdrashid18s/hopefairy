import LegalDocument from '../../components/sections/LegalDocument.jsx';
import { pageMetadata } from '../../lib/seo.js';
import { privacyPolicy, legalSeo } from '../../data/legal.js';

export const metadata = pageMetadata(legalSeo.privacy);

export default function PrivacyPolicyPage() {
  return <LegalDocument doc={privacyPolicy} seo={legalSeo.privacy} summary="How we handle your information" />;
}
