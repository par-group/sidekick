// The app is served under a sub-path (`basePath` in next.config.ts). next/link,
// the router and redirect() add it automatically; <img src>, fetch() and URLs
// built by hand need withBasePath(). Stored URLs (photos, placeholders) stay
// app-relative ("/api/uploads/…") so they don't depend on where the app is mounted.

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix an app-relative path ("/api/…") with the base path. Absolute URLs and already-prefixed paths are returned unchanged. */
export function withBasePath(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  if (BASE_PATH && (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`))) return path;
  return `${BASE_PATH}${path}`;
}
