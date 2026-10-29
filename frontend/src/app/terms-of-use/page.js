import LegalDocument from '../../components/sections/LegalDocument.jsx';
import { pageMetadata } from '../../lib/seo.js';
import { termsOfUse, legalSeo } from '../../data/legal.js';

export const metadata = pageMetadata(legalSeo.terms);

export default function TermsOfUsePage() {
  return <LegalDocument doc={termsOfUse} seo={legalSeo.terms} summary="The terms of using our website" />;
}
