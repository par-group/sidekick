import { PromptCard } from "@/components/profile/PromptCard";
import { CheckIcon, CommentIcon, XIcon } from "@/components/ui/icons";
import { TagPill } from "@/components/ui/TagPill";

/** Illustrative Discover card for the homepage, built from the app's own components. */
export function ProfilePreview() {
  return (
    <div className="relative mx-auto w-full max-w-[340px]" aria-hidden>
      <div className="overflow-hidden rounded-[2.75rem] border-[10px] border-frame bg-bg shadow-[0_30px_80px_rgb(11_31_34/0.28)]">
        <div className="flex flex-col gap-3 p-3 pb-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-accent">
            <div className="absolute -top-10 -left-12 size-56 rounded-full bg-green-soft/40" />
            <div className="absolute -right-10 bottom-16 size-40 rounded-full bg-mustard" />
            <span className="absolute inset-0 grid place-items-center pb-10 text-[5.5rem]">☕</span>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent px-4 pt-12 pb-4 text-white">
              <p className="font-serif text-3xl font-semibold">
                Maya, <span className="font-normal">20</span>
              </p>
              <p className="text-sm text-white/90">Psychology · BA · Keele</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 px-1 text-[13px]">
            <TagPill highlighted>☕ Coffee</TagPill>
            <TagPill highlighted>🎲 Board games</TagPill>
            <TagPill>📷 Photography</TagPill>
          </div>
          <PromptCard question="A perfect study break" answer="Bubble tea run, then pretending the library is a café." />
        </div>
      </div>

      <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 gap-4">
        <span className="grid size-14 place-items-center rounded-full border border-line bg-surface text-ink-soft shadow-card">
          <XIcon className="size-6" />
        </span>
        <span className="grid size-14 place-items-center rounded-full bg-accent text-white shadow-[0_8px_20px_rgb(15_118_110/0.4)]">
          <CheckIcon className="size-6" />
        </span>
      </div>

      <div className="absolute top-24 -left-4 hidden items-center gap-2 rounded-2xl bg-surface px-3.5 py-2.5 text-sm font-semibold shadow-card sm:flex lg:-left-16">
        <span className="size-2.5 rounded-full bg-mustard" /> 2 shared interests
      </div>
      <div className="absolute top-56 -right-3 hidden items-center gap-2 rounded-2xl bg-surface px-3.5 py-2.5 text-sm font-semibold shadow-card sm:flex lg:-right-14">
        <CommentIcon className="size-4 text-accent" /> Maya replied to your prompt
      </div>
    </div>
  );
}
