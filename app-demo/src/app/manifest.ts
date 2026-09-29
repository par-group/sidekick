import type { MetadataRoute } from "next";
import { withBasePath } from "@/lib/paths";
import { SITE } from "@/lib/site";

/** Lets students install Sidekick to their home screen until the App Store release. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: withBasePath("/"),
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.description,
    // Opens straight into the app; signed-out visitors are sent to sign in.
    start_url: withBasePath("/discover"),
    scope: withBasePath("/"),
    display: "standalone",
    orientation: "portrait",
    background_color: "#F7FAF9",
    theme_color: "#F7FAF9",
    categories: ["social", "lifestyle"],
    icons: [
      { src: withBasePath("/icons/192"), sizes: "192x192", type: "image/png", purpose: "any" },
      { src: withBasePath("/icons/512"), sizes: "512x512", type: "image/png", purpose: "any" },
      { src: withBasePath("/icons/maskable-512"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
