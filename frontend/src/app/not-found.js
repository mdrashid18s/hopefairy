import NotFoundClient from './NotFoundClient.jsx';
import { pageMetadata } from '../lib/seo.js';

export const metadata = pageMetadata({
  title: 'Page not found',
  description: "The page you're after has moved or never existed.",
  path: '/404',
  noindex: true,
});

export default function NotFound() {
  return <NotFoundClient />;
}
