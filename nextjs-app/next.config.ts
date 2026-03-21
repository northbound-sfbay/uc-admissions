import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../"),
  async redirects() {
    return [
      {
        // Upgrade old ?school=ID links to /school/{slug}
        // We redirect to the ID-only path; the page component handles it
        source: '/',
        has: [{ type: 'query', key: 'school' }],
        destination: '/school/:school',
        permanent: true,
      },
    ]
  },
}

export default nextConfig;
