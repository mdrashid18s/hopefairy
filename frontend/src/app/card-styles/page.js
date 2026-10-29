import CardStylesClient from './CardStylesClient.jsx';
import { pageMetadata } from '../../lib/seo.js';

// Internal design preview — not linked anywhere and kept out of search.
export const metadata = pageMetadata({
  title: 'Country card styles',
  description: 'Internal preview of the country card designs.',
  path: '/card-styles',
  noindex: true,
});

export default function CardStylesPage() {
  return <CardStylesClient />;
}
