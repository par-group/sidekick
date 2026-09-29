"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { useEffect } from "react";
import { Logo } from "@/components/brand/Logo";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    // Shows up in the Vercel function / browser logs; the digest matches the server log entry.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo className="text-3xl" />
      <div>
        <h1 className="font-serif text-4xl font-semibold">Something went wrong.</h1>
        <p className="mx-auto mt-3 max-w-sm text-ink-soft">
          Please try again. If it keeps happening, let us know on the support page{error.digest ? ` and mention code ${error.digest}` : ""}.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={() => retry()} className="btn-primary">
          Try again
        </button>
        <Link href="/support" className="btn-secondary">
          Get help
        </Link>
      </div>
    </main>
  );
}
