import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "@/components/ui/icons";
import { ProfileView } from "@/components/profile/ProfileView";
import { requireOnboardedUser } from "@/server/auth/session";
import { listMatches } from "@/server/matches";
import { getProfile } from "@/server/profiles";

export const metadata: Metadata = { title: "Profile" };

/** A friend's profile — only reachable for people you're matched with. */
export default async function PersonPage({ params }: PageProps<"/people/[userId]">) {
  const { userId } = await params;
  const user = await requireOnboardedUser();
  const match = (await listMatches(user)).find((m) => m.otherId === userId);
  const profile = match && (await getProfile(userId, user));
  if (!match || !profile) notFound();

  return (
    <div className="flex flex-col gap-4 pt-1">
      <Link href={`/chat/${match.id}`} className="flex w-fit items-center gap-1 pr-3 text-sm font-semibold text-ink-soft hover:text-ink">
        <ChevronLeft className="size-5" /> Back to chat
      </Link>
      <ProfileView profile={profile} />
    </div>
  );
}
