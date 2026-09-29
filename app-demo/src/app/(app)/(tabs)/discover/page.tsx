import type { Metadata } from "next";
import { requireOnboardedUser } from "@/server/auth/session";
import { buildDeck } from "@/server/deck";
import { Deck } from "./Deck";

export const metadata: Metadata = { title: "Discover" };

export default async function DiscoverPage() {
  const user = await requireOnboardedUser();
  const deck = await buildDeck(user);
  // Keyed by the batch contents so a refresh that returns new people resets the client deck.
  return <Deck key={deck.map((c) => c.profile.id).join()} cards={deck} />;
}
