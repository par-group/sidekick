// Checks the SMTP settings in .env.local: logs in to the mail server, then sends
// one test email. Usage: npm run email:test -- yourname@my.yorku.ca
// Uses the same defaults as lib/mailer.ts; keep the two in sync.
import { createTransport } from "nodemailer";

const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;
const to = process.argv[2];

const host = SMTP_HOST || (SMTP_USER?.trim().toLowerCase().endsWith("@gmail.com") ? "smtp.gmail.com" : "");
const missing = [!host && "SMTP_HOST", !SMTP_USER && "SMTP_USER", !SMTP_PASS && "SMTP_PASS"].filter(Boolean);
if (missing.length) {
  console.error(`✗ Missing in .env.local: ${missing.join(", ")} (uncomment the lines and fill them in).`);
  process.exit(1);
}

const port = Number(SMTP_PORT || 465);
const pass = host === "smtp.gmail.com" ? SMTP_PASS.replace(/\s+/g, "") : SMTP_PASS;
const transport = createTransport({
  host,
  port,
  secure: SMTP_SECURE ? SMTP_SECURE === "true" : port === 465,
  auth: { user: SMTP_USER, pass },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 10_000,
});

console.log(`Connecting to ${host}:${port} as ${SMTP_USER} …`);
try {
  await transport.verify();
  console.log("✓ Logged in to the mail server.");
} catch (error) {
  if (error.code === "EAUTH") {
    console.error("✗ The server refused the login. Check SMTP_USER and SMTP_PASS (use an app-specific password).");
    console.error("  On Zoho's free plan, apps can't send mail at all. See README \"Set up verification emails\".");
  } else {
    console.error(`✗ Couldn't reach ${host}:${port} (${error.code ?? error.message}). Check SMTP_HOST and SMTP_PORT.`);
  }
  process.exit(1);
}

if (!to) {
  console.log("Settings work. Add an address to also send a test email: npm run email:test -- yourname@my.yorku.ca");
  process.exit(0);
}
try {
  const info = await transport.sendMail({
    from: EMAIL_FROM || `Sidekick <${SMTP_USER}>`,
    to,
    subject: "Sidekick email test",
    text: "If you can read this, Sidekick can send sign-in codes. Check your spam folder if it didn't arrive in the inbox.",
  });
  console.log(`✓ Test email accepted for ${info.accepted.join(", ")}. Check that inbox (and spam).`);
} catch (error) {
  console.error(`✗ Login worked but sending failed: ${error.response ?? error.message}`);
  console.error("  If it mentions the sender or relaying, EMAIL_FROM must be your Zoho address (or remove EMAIL_FROM).");
  process.exit(1);
}
