// Admin portal build (backend.zip). It is deployed as its own "zone" inside the website's
// public_html at /backend/: basePath puts every page, link and JS/CSS file under /backend, so it
// never collides with the public website's /_next files. Pages live in the app/(admin) route group,
// so the dashboard is /backend/ and the login is /backend/login/.
// build-hope.mjs then packages out/ as the backend folder.
const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? '/backend' : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
  env: {
    // shared code (lib/asset.js) builds public-file URLs from this; the website serves /brand etc.
    NEXT_PUBLIC_BASE_PATH: '',
    // for plain window.location redirects, which basePath does not rewrite
    NEXT_PUBLIC_ADMIN_BASE_PATH: basePath,
  },
};

export default nextConfig;
