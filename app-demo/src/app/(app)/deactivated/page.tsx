import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { logout } from "@/server/actions/auth";
import { AccountActivation } from "@/components/account/AccountActivation";
import { Logo } from "@/components/brand/Logo";

export const metadata: Metadata = { title: "Account deactivated" };

export default async function DeactivatedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.is_active) redirect("/discover");
  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10">
      <Logo />
      <div className="mt-8">
        <h1 className="font-serif text-3xl font-semibold">Your account is deactivated</h1>
        <p className="mt-3 leading-relaxed text-ink-soft">Take all the time you need. Your profile is hidden, and you can’t browse other profiles or chat while your account is off. Your information and friendships are saved for when you return.</p>
      </div>
      <AccountActivation active={false} />
      <Link href="/settings" className="btn-secondary">Settings</Link>
      <form action={logout}><button className="btn-ghost w-full">Log out</button></form>
    </main>
  );
}
