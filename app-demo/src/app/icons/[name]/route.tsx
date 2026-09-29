import { ImageResponse } from "next/og";
import { AppIconArt } from "@/components/brand/AppIconArt";

// PNG app icons, rendered once at build time: the web app manifest's icons
// (Android home screen, install prompts) and the Apple touch icon (iPhone home
// screen, square because iOS rounds it). Linked from manifest.ts and layout.tsx.
const ICONS = {
  apple: { size: 180, scale: 1, rounded: false },
  "192": { size: 192, scale: 1, rounded: true },
  "512": { size: 512, scale: 1, rounded: true },
  "maskable-512": { size: 512, scale: 0.8, rounded: false },
} as const;

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(ICONS).map((name) => ({ name }));
}

export async function GET(_request: Request, ctx: RouteContext<"/icons/[name]">) {
  const { name } = await ctx.params;
  const icon = ICONS[name as keyof typeof ICONS];
  if (!icon) return new Response("Not found", { status: 404 });
  return new ImageResponse(<AppIconArt size={icon.size} scale={icon.scale} rounded={icon.rounded} />, { width: icon.size, height: icon.size });
}
