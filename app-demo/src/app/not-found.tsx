import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo className="text-3xl" />
      <div>
        <h1 className="font-serif text-4xl font-semibold">We couldn’t find that page.</h1>
        <p className="mx-auto mt-3 max-w-sm text-ink-soft">It may have moved, or the profile or chat is no longer available.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn-primary">
          Go to Sidekick
        </Link>
        <Link href="/support" className="btn-secondary">
          Get help
        </Link>
      </div>
    </main>
  );
}
