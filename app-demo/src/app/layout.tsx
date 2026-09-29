import type { Metadata, Viewport } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import { withBasePath } from "@/lib/paths";
import { SITE } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const workSans = Work_Sans({ variable: "--font-work-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  appleWebApp: { capable: true, title: SITE.name, statusBarStyle: "default" },
  // Declared here rather than as app/icon.* / apple-icon.* files: Next's generated
  // apple-touch-icon link omits the basePath. PNGs come from app/icons/[name].
  icons: {
    icon: { url: withBasePath("/icon.svg"), type: "image/svg+xml" },
    apple: { url: withBasePath("/icons/apple"), sizes: "180x180", type: "image/png" },
  },
  formatDetection: { telephone: false },
  openGraph: { type: "website", siteName: SITE.name, locale: "en_CA", url: "/" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F7FAF9",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-CA" className={`${fraunces.variable} ${workSans.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
