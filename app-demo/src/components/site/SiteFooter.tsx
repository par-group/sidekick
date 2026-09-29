import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { SITE } from "@/lib/site";

const COLUMNS = [
  {
    title: "Sidekick",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#safety", label: "Safety" },
      { href: "/login", label: "Sign in" },
    ],
  },
  {
    title: "Help & legal",
    links: [
      { href: "/support", label: "Support" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Use" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="site-container grid gap-10 py-12 sm:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">Friends, not dates. Made for students at York University.</p>
          <a href={`mailto:${SITE.supportEmail}`} className="mt-4 inline-block text-sm font-semibold text-green hover:underline">
            {SITE.supportEmail}
          </a>
        </div>
        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="label">{column.title}</p>
            <ul className="mt-3 flex flex-col gap-2.5 text-sm">
              {column.links.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-ink-soft transition hover:text-ink">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="site-container border-t border-line py-6 text-xs leading-relaxed text-ink-soft">
        © {new Date().getFullYear()} {SITE.name}. Sidekick is independent and isn&apos;t affiliated with or endorsed by York University.
      </div>
    </footer>
  );
}
