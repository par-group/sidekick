import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfilePreview } from "@/components/site/ProfilePreview";
import { SITE } from "@/lib/site";
import { appHomeFor, getCurrentUser } from "@/server/auth/session";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const STEPS = [
  { title: "Sign in with York", text: "Enter your @my.yorku.ca email and we’ll send you a 6-digit code. No password to remember." },
  { title: "Make your profile", text: "Add four photos, a few interests and answers to three prompts. It takes about five minutes." },
  { title: "Find your people", text: "Tap Friend or pass. When it’s mutual, you can chat. Or reply to someone’s prompt to start talking right away." },
];

const FEATURES = [
  { icon: "🏫", title: "Matched on what you share", text: "Your deck leans toward people on your campus, in your major and into the same things, with a few surprises mixed in." },
  { icon: "💬", title: "Start with a reply", text: "Comment on someone’s photo, prompt or tag. If they reply back, you’re friends. No mutual swipe needed." },
  { icon: "🤝", title: "Friends, not dates", text: "Sidekick is only for friendship: study buddies, gym partners, and people to grab lunch with between classes." },
  { icon: "🕊️", title: "No awkward passes", text: "Passing is private and nobody is told. People you pass on get one second look after 30 days." },
];

const SAFETY = [
  { icon: "🎓", title: "York students only", text: "Every account is verified with a code sent to a @my.yorku.ca email." },
  { icon: "📵", title: "Block by phone number", text: "Add someone’s number and you’ll never see each other, even if they join later. They’re never told." },
  { icon: "🔒", title: "Private details stay private", text: "Your email, phone number and birth date are never shown. Profiles show your first name and age." },
  { icon: "🧭", title: "You choose who you see", text: "See everyone, or only people of your own gender, and only be shown to them too." },
  { icon: "⏸️", title: "Take a break anytime", text: "Deactivate from Settings to hide your profile. Your friendships are saved for when you’re back." },
  { icon: "🚩", title: "Easy to report", text: "If anyone makes you uncomfortable, email us and we’ll look into it. You can block them right away too." },
];

const INSTALL = [
  { device: "iPhone", steps: [`Open ${SITE.displayUrl} in Safari`, "Tap the Share button", "Choose Add to Home Screen"] },
  { device: "Android", steps: [`Open ${SITE.displayUrl} in Chrome`, "Tap the ⋮ menu", "Choose Add to Home screen or Install app"] },
];

function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold tracking-wide text-green uppercase">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-3xl leading-tight font-semibold sm:text-4xl">{title}</h2>
      {intro && <p className="mt-4 text-lg leading-relaxed text-ink-soft">{intro}</p>}
    </div>
  );
}

export default async function HomePage() {
  // Signed-in visitors, including the home-screen app, go straight into Sidekick.
  const user = await getCurrentUser();
  if (user) redirect(appHomeFor(user));

  return (
    <>
      <section className="overflow-hidden">
        <div className="site-container grid items-center gap-16 pt-14 pb-24 lg:grid-cols-[1.1fr_1fr] lg:pt-20 lg:pb-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-green-soft px-3 py-1.5 text-sm font-semibold text-green">
              <span className="size-2 rounded-full bg-accent" /> For York University students
            </p>
            <h1 className="mt-6 font-serif text-5xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
              Find your people <span className="whitespace-nowrap text-green italic">at York.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              Sidekick is a friends-only app for York students. Meet people who share your campus, classes and interests, and turn a conversation
              into plans.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="btn-primary px-7 py-3.5">
                Join with your York email
              </Link>
              <Link href="/#how-it-works" className="btn-secondary px-7 py-3.5">
                How it works
              </Link>
            </div>
            <p className="mt-5 text-sm text-ink-soft">@my.yorku.ca emails only · Friends, not dates</p>
          </div>
          <ProfilePreview />
        </div>
      </section>

      <section id="how-it-works" className="border-t border-line bg-surface py-20 sm:py-28">
        <div className="site-container">
          <SectionHeading eyebrow="How it works" title="From sign-in to your first plan in three steps." />
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="rounded-3xl border border-line bg-bg p-6">
                <span className="grid size-10 place-items-center rounded-full bg-accent font-serif text-lg font-semibold text-white">{i + 1}</span>
                <h3 className="mt-5 font-serif text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="site-container">
          <SectionHeading
            eyebrow="Made for campus life"
            title="Less small talk. More “wait, same!”"
            intro="Sidekick puts what you have in common up front, so the first message is easy."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card p-6">
                <span className="text-3xl" aria-hidden>
                  {feature.icon}
                </span>
                <h3 className="mt-4 font-serif text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="safety" className="bg-frame py-20 text-white sm:py-28">
        <div className="site-container">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-mustard uppercase">Safety</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight font-semibold sm:text-4xl">Your comfort comes first.</h2>
            <p className="mt-4 text-lg leading-relaxed text-white/75">Meeting new people should feel easy, not risky. These protections are on for everyone.</p>
          </div>
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SAFETY.map((item) => (
              <li key={item.title} className="rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10">
                <span className="text-2xl" aria-hidden>
                  {item.icon}
                </span>
                <h3 className="mt-3 font-serif text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-white/75">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="get-the-app" className="py-20 sm:py-28">
        <div className="site-container grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <SectionHeading
            eyebrow="Coming to the App Store"
            title="The app is on its way. Sidekick already works in your browser."
            intro="Add it to your home screen and it opens like an app, full screen, in one tap."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            {INSTALL.map(({ device, steps }) => (
              <div key={device} className="card p-6">
                <h3 className="font-serif text-xl font-semibold">{device}</h3>
                <ol className="mt-4 flex flex-col gap-3">
                  {steps.map((step, i) => (
                    <li key={step} className="flex gap-3 text-[15px] leading-snug text-ink-soft">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-green-soft text-xs font-bold text-green">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="site-container">
          <div className="relative overflow-hidden rounded-[2rem] bg-accent px-6 py-14 text-center text-white sm:px-12">
            <div className="absolute -top-16 -left-16 size-56 rounded-full bg-white/10" aria-hidden />
            <div className="absolute -right-10 -bottom-20 size-64 rounded-full bg-green" aria-hidden />
            <h2 className="relative font-serif text-3xl font-semibold sm:text-4xl">Your people are out there.</h2>
            <p className="relative mx-auto mt-3 max-w-md text-lg text-white/85">Sign up with your York email and meet them this week.</p>
            <Link href="/login" className="btn relative mt-8 bg-white px-7 py-3.5 text-accent hover:bg-green-soft">
              Join Sidekick
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
