import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Support",
  description: "Help with signing in, blocking, reporting, photos and your Sidekick account.",
  alternates: { canonical: "/support" },
};

const FAQ: { question: string; answer: React.ReactNode }[] = [
  {
    question: "I didn’t get my sign-in code",
    answer: (
      <>
        Check your spam or junk folder, since the first code sometimes lands there. Make sure you typed your full <strong>@my.yorku.ca</strong>{" "}
        address. Codes expire after 10 minutes. You can ask for a new one after 60 seconds, up to 5 times an hour.
      </>
    ),
  },
  {
    question: "Why do you need my phone number?",
    answer: (
      <>
        So people can block you by number, and you can block them, even before anyone joins. Your number is never shown on your profile, and each
        number can only belong to one account.
      </>
    ),
  },
  {
    question: "How do I block someone?",
    answer: (
      <>
        Go to <strong>Settings → Block a phone number</strong> and enter their number. You won’t see each other anywhere on Sidekick, even if they
        join later, and they’re never told.
      </>
    ),
  },
  {
    question: "How do I report someone?",
    answer: (
      <>
        Email us at <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> with their first name and what happened. Screenshots help. You
        can also block them right away. If you’re in immediate danger, call 911.
      </>
    ),
  },
  {
    question: "My photo won’t upload",
    answer: (
      <>
        Sidekick accepts JPG, PNG, WebP and GIF photos. iPhone photos (HEIC) work in Safari. In other browsers, save the photo as a JPG first.
      </>
    ),
  },
  {
    question: "Can I change my phone number or email?",
    answer: (
      <>
        To change your number, log out and sign in again with your York email and your new number. Your account stays tied to your York email, so the
        email can’t be changed.
      </>
    ),
  },
  {
    question: "Who can see my profile?",
    answer: (
      <>
        Other York students on Sidekick whose filters match yours, except anyone you’ve blocked. Profiles aren’t public on the web and aren’t shown to
        search engines. See our <Link href="/privacy">Privacy Policy</Link> for details.
      </>
    ),
  },
  {
    question: "How do I take a break or delete my account?",
    answer: (
      <>
        To take a break, turn off <strong>Account active</strong> in Settings. Your profile is hidden until you turn it back on. To delete your
        account, email <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> from your York address.
      </>
    ),
  },
  {
    question: "Is there an app?",
    answer: (
      <>
        The iPhone app is on its way. Until then, you can <Link href="/#get-the-app">add Sidekick to your home screen</Link> and it opens like an
        app.
      </>
    ),
  },
];

export default function SupportPage() {
  return (
    <div className="site-container py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold tracking-wide text-green uppercase">Support</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">How can we help?</h1>
        <div className="card mt-8 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold">Email us</h2>
            <p className="mt-1 text-ink-soft">We read every message. Write from your York email if it’s about your account.</p>
          </div>
          <a href={`mailto:${SITE.supportEmail}`} className="btn-primary shrink-0">
            {SITE.supportEmail}
          </a>
        </div>

        <h2 className="mt-14 font-serif text-2xl font-semibold">Common questions</h2>
        <div className="mt-5 flex flex-col gap-3">
          {FAQ.map(({ question, answer }) => (
            <details key={question} className="group card px-5 py-4 open:pb-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                {question}
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-green-soft text-green transition group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-ink-soft [&_a]:font-semibold [&_a]:text-green [&_a]:underline [&_strong]:text-ink">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
