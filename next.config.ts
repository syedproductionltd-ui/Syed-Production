import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The site is fully static — every form hands off to WhatsApp, there is no
  // backend. Exporting keeps that guarantee and ships to Vercel as plain files.
  output: 'export',
  trailingSlash: false,
  images: {
    // Static export has no image-optimizer server, so next/image must not try
    // to build optimized variants. Unoptimized keeps <img src> byte-exact.
    unoptimized: true,
  },
  // NOTE: redirects/headers are not applied under `output: export`. The
  // legacy *.html -> clean-URL redirects and the cache headers live in
  // vercel.json, which is applied by the host.
};

export default nextConfig;