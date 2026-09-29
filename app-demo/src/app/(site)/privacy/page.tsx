import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument } from "@/components/site/LegalDocument";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What Sidekick collects, who can see it, and how to control or delete it.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  const email = <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>;
  return (
    <LegalDocument
      title="Privacy Policy"
      summary="We collect what Sidekick needs to verify you’re a York student and to introduce you to other students. We don’t sell your information, show ads or use third-party tracking. Your email, phone number and birth date are never shown on your profile."
    >
      <h2>Who we are</h2>
      <p>
        Sidekick (“we”, “us”) runs the Sidekick website at {SITE.url.replace(/^https?:\/\//, "")} and the Sidekick apps. Questions about this policy or
        your information go to {email}.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Sign-in details:</strong> your York email address and your phone number. We send a one-time code to your email to confirm it’s
          yours. Codes are stored only in scrambled (hashed) form and expire after 10 minutes.
        </li>
        <li>
          <strong>Your profile:</strong> your name, birth date, gender, main campus, major, degree, hometown and living situation (including your
          residence building, if you choose to add it), plus your photos, interests, prompt answers and the people you want to see.
        </li>
        <li>
          <strong>What you do on Sidekick:</strong> who you tap Friend or pass on, your matches, comments and messages, and the phone numbers you
          block. Blocked numbers are stored only as a keyed hash, never as the number itself.
        </li>
        <li>
          <strong>Technical details:</strong> a sign-in cookie that keeps you logged in for up to 30 days, and the standard logs (such as IP address
          and browser type) that our hosting provider keeps to run and protect the service.
        </li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To confirm you’re a York student and keep one account per person and per phone number.</li>
        <li>To show you people you might get along with and to show your profile to them.</li>
        <li>To deliver your comments and messages, and to enforce blocks, filters and our Terms.</li>
        <li>To keep Sidekick secure, investigate reports, and fix problems.</li>
      </ul>
      <p>We don’t sell or rent your information, we don’t show ads, and we don’t use third-party analytics or advertising trackers.</p>

      <h2>Who can see what</h2>
      <ul>
        <li>
          <strong>Other Sidekick users</strong> who are shown your profile see your first name, age, photos, campus, major and degree, hometown,
          interests, custom tag and prompt answers. Your residence building is shown only to people who also live in residence.
        </li>
        <li>
          <strong>Never shown:</strong> your email address, phone number, birth date and gender. Gender is used only for the “same gender” filter.
        </li>
        <li>
          <strong>People you block</strong> by phone number can’t see you, and you can’t see them. Nobody is told they’ve been blocked.
        </li>
        <li>
          <strong>Photos</strong> can only be opened by people signed in to Sidekick. Profiles aren’t shown to search engines.
        </li>
      </ul>

      <h2>Service providers</h2>
      <p>
        We use a small number of providers to run Sidekick: Vercel (website hosting and photo storage), Turso (database) and Zoho (sending sign-in
        emails). They process information only on our behalf. Your information may be stored and processed in Canada and the United States.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep your information while your account exists. If you deactivate your account in Settings, your profile is hidden but saved so you can
        come back. To delete your account, email {email} from your York address. We’ll delete your account and the information connected to it,
        including your photos and messages, within 30 days, unless we need to keep something to meet a legal obligation or resolve a safety report.
      </p>

      <h2>Your choices and rights</h2>
      <ul>
        <li>You can view and edit your profile at any time, and change who you see in Settings.</li>
        <li>You can ask us for a copy of your information, ask us to correct it, or ask us to delete it.</li>
        <li>You can withdraw your consent by deleting your account.</li>
      </ul>
      <p>
        If you’re not satisfied with our response, you can contact the{" "}
        <a href="https://www.priv.gc.ca" rel="noreferrer">
          Office of the Privacy Commissioner of Canada
        </a>
        .
      </p>

      <h2>Security</h2>
      <p>
        Sidekick is served over HTTPS. Sign-in codes and blocked numbers are stored as hashes, sign-in cookies are signed, and access to our systems
        is limited to the people who run Sidekick. No system is perfectly secure, so please use a unique password for your York email.
      </p>

      <h2>Age</h2>
      <p>Sidekick is for people 18 and older. We don’t knowingly collect information from anyone younger.</p>

      <h2>Changes</h2>
      <p>
        If we change this policy, we’ll update the date at the top of this page, and tell you in the app for significant changes. See also our{" "}
        <Link href="/terms">Terms of Use</Link>.
      </p>
    </LegalDocument>
  );
}
