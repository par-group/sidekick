import type { Metadata } from "next";

// Signed-in screens and sign-in itself: never indexed by search engines.
export const metadata: Metadata = { robots: { index: false, follow: false } };

/** The product: a phone-width column, centred on the dark frame on larger screens. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-dvh bg-frame">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-bg">{children}</div>
    </div>
  );
}
