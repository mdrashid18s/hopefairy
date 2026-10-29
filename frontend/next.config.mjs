import { BASE_PATH } from './src/config/deploy.js';

// Production builds use BASE_PATH (src/config/deploy.js); `next dev`
// always stays at "/" so http://localhost:3000/ works during development.
const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: isProd ? BASE_PATH : '',
  trailingSlash: true, // -> out/services/index.html (clean static hosting, no rewrite needed)
  images: { unoptimized: true }, // static export has no image-optimization server
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? BASE_PATH : '',
  },
};

export default nextConfig;
