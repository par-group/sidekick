import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { PhoneForm } from "./PhoneForm";

export const metadata: Metadata = { title: "Add your phone number" };

export default async function PhonePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.phone) redirect(user.profile_complete ? "/discover" : "/setup");
  return <PhoneForm />;
}
