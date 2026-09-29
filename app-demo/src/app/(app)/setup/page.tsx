import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { getProfile, getPromptBank, getTagTaxonomy } from "@/server/profiles";
import type { ProfileInput } from "@/server/actions/profile";
import { ProfileWizard } from "./ProfileWizard";
import { isDemoAccount } from "@/server/demo/account";

export const metadata: Metadata = { title: "Set up your profile" };

export default async function SetupPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.is_active) redirect("/deactivated");
  if (!user.phone) redirect("/login/phone");

  // Editing an existing profile re-uses the same wizard, pre-filled.
  const existing = user.profile_complete ? await getProfile(user.id) : null;
  const initial: ProfileInput | null = existing && {
    photos: [0, 1, 2, 3].map((i) => existing.photos.find((p) => p.position === i)?.url ?? null),
    name: existing.name,
    birthDate: user.birth_date ?? "",
    major: existing.major,
    mainCampus: existing.mainCampus,
    degree: existing.degree,
    hometown: existing.hometown ?? "",
    residenceStatus: existing.residenceStatus,
    residenceId: user.residence_status === "residence" ? user.residence_id : null,
    gender: user.gender,
    genderFilterMode: user.gender_filter_mode,
    tagIds: existing.interests.map((t) => t.id),
    customTag: existing.customTag?.text ?? "",
    prompts: existing.prompts.map((p) => ({ promptId: p.promptId, answer: p.answerText, imageUrl: p.imageUrl })),
  };

  const [tags, prompts] = await Promise.all([getTagTaxonomy(), getPromptBank()]);
  return <ProfileWizard key={user.id} tags={tags} prompts={prompts} initial={initial} isDemo={isDemoAccount(user)} />;
}
