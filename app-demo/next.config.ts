import type { NextConfig } from "next";

// The whole app is served under trysidekick.ca/app-demo. Links, router navigation
// and redirect() add this prefix automatically; URLs built by hand (<img src>,
// fetch) use withBasePath() from src/lib/paths.ts.
const basePath = "/app-demo";

const nextConfig: NextConfig = {
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },

  async redirects() {
    return [
      // The bare domain and links from before the move (e.g. /login, /discover,
      // home-screen shortcuts) land in the app. Temporary, so the root can host
      // something else later without browsers caching the redirect.
      { source: "/", destination: basePath, basePath: false, permanent: false },
      {
        source: `/:first((?!${basePath.slice(1)}(?:/|$))[^/]+)/:rest*`,
        destination: `${basePath}/:first/:rest*`,
        basePath: false,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
