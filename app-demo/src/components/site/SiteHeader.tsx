import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const SECTION_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#safety", label: "Safety" },
  { href: "/support", label: "Support" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/90 backdrop-blur">
      <div className="site-container flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Sidekick home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 text-sm font-semibold">
          {SECTION_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="hidden rounded-full px-3 py-2 text-ink-soft transition hover:text-ink md:block">
              {label}
            </Link>
          ))}
          <Link href="/login" className="rounded-full px-3 py-2 text-ink-soft transition hover:text-ink">
            Sign in
          </Link>
          <Link href="/login" className="btn-primary px-4 py-2 text-sm">
            Join
          </Link>
        </nav>
      </div>
    </header>
  );
}
