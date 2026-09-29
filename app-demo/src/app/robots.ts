import type { MetadataRoute } from "next";
import { BASE_PATH } from "@/lib/paths";
import { SITE } from "@/lib/site";

// Only the public website is crawlable. App screens also send `noindex` (see (app)/layout.tsx).
// Served at /app-demo/robots.txt; the domain's /robots.txt redirects here (next.config.ts).
const APP_PATHS = ["/api/", "/login", "/setup", "/discover", "/inbox", "/matches", "/people", "/profile", "/settings", "/chat", "/deactivated"].map(
  (path) => `${BASE_PATH}${path}`,
);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: APP_PATHS },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
