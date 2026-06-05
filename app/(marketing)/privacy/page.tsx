import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Avokado collects, uses, and protects your account, workspace, and connected-store data — including processors, encryption, retention, and your rights.",
};

const LAST_UPDATED = "June 5, 2026";
const CONTACT_EMAIL = "hello@tryavokado.com";

const SECTIONS = [
  { id: "collect", label: "1. Information we collect" },
  { id: "use", label: "2. How we use information" },
  { id: "processors", label: "3. Third-party processors" },
  { id: "encryption", label: "4. Token encryption at rest" },
  { id: "retention", label: "5. Data retention" },
  { id: "rights", label: "6. Your rights" },
  { id: "cookies", label: "7. Cookies" },
  { id: "children", label: "8. Children" },
  { id: "transfers", label: "9. International transfers" },
  { id: "changes", label: "10. Changes to this policy" },
  { id: "contact", label: "11. Contact" },
];

const PROCESSORS = [
  {
    category: "Cloud hosting & infrastructure",
    purpose:
      "Running the application, databases, and background processing that power the Service.",
  },
  {
    category: "Google Vertex AI",
    purpose:
      "Generating brand analysis, advertising creative, and recommendations from the data you provide.",
  },
  {
    category: "Meta",
    purpose:
      "Creating and managing advertising campaigns and retrieving performance data for stores you connect.",
  },
  {
    category: "Stripe",
    purpose:
      "Processing subscription payments. Card details are handled by Stripe and not stored by us.",
  },
  {
    category: "Resend",
    purpose:
      "Sending transactional email such as sign-in, account, and notification messages.",
  },
  {
    category: "Sentry",
    purpose:
      "Capturing application errors and diagnostics to keep the Service reliable.",
  },
  {
    category: "PostHog",
    purpose:
      "Understanding product usage in aggregate to improve features and reliability.",
  },
];

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <header className="border-b border-border pb-8">
        <Badge variant="outline" className="rounded-full px-3 py-1">
          Legal
        </Badge>
        <h1 className="mt-5 text-balance font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-pretty text-lg text-muted-foreground">
          This policy explains what {APP_NAME} collects, how we use it, who we
          share it with, and the choices you have. We aim to collect only what we
          need to run the Service well.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Last updated: <time dateTime="2026-06-05">{LAST_UPDATED}</time>
        </p>
      </header>

      <nav
        aria-label="Table of contents"
        className="mt-10 rounded-2xl border border-border bg-card/50 p-6"
      >
        <p className="text-sm font-semibold text-foreground">On this page</p>
        <ol className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-12 space-y-12 text-[15px] leading-relaxed text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline">
        <section id="collect" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            1. Information we collect
          </h2>
          <p>
            We collect information you provide directly, information generated as
            you use the Service, and information from platforms you choose to
            connect.
          </p>
          <h3 className="text-lg font-semibold text-foreground">
            Account information
          </h3>
          <p>
            Your name, email address, authentication details, and billing contact
            information used to create and secure your account.
          </p>
          <h3 className="text-lg font-semibold text-foreground">
            Workspace information
          </h3>
          <p>
            Workspace names, member roles and invitations, settings, brand
            profiles, uploaded assets, generated creative, and audit-log records
            of actions taken in your workspace.
          </p>
          <h3 className="text-lg font-semibold text-foreground">
            Connected-store and advertising data
          </h3>
          <p>
            When you connect a store or ad platform, we access data within the
            scope you authorize, such as products, catalog details, and campaign
            and performance metrics. We also store the access tokens needed to
            act on your behalf, which are encrypted as described below.
          </p>
          <h3 className="text-lg font-semibold text-foreground">
            Usage and technical data
          </h3>
          <p>
            Standard technical information such as device and browser type, log
            data, and product-usage events that help us operate, secure, and
            improve the Service.
          </p>
        </section>

        <section id="use" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            2. How we use information
          </h2>
          <p>We use the information we collect to:</p>
          <ul className="ml-5 list-disc space-y-2 marker:text-primary">
            <li>Provide, maintain, and secure the Service and your account.</li>
            <li>
              Build brand profiles, generate advertising creative, and produce
              recommendations from your data.
            </li>
            <li>
              Create and manage campaigns on connected platforms when you request
              or approve those actions.
            </li>
            <li>Process payments and manage subscriptions.</li>
            <li>
              Communicate with you about your account, security, and service
              updates.
            </li>
            <li>
              Monitor performance, debug issues, and improve features and
              reliability.
            </li>
            <li>Detect, prevent, and respond to fraud, abuse, and security risks.</li>
            <li>Comply with legal obligations and enforce our terms.</li>
          </ul>
          <p>
            We do not sell your personal information, and we do not use the
            content of your connected-store or advertising data to train shared
            or general-purpose AI models.
          </p>
        </section>

        <section id="processors" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            3. Third-party processors
          </h2>
          <p>
            We rely on a small set of trusted service providers to operate the
            Service. They process data on our behalf, under contractual
            obligations, and only for the purposes described here. The categories
            of processors we use include:
          </p>
          <ul className="space-y-3">
            {PROCESSORS.map((processor) => (
              <li
                key={processor.category}
                className="rounded-xl border border-border bg-card p-4"
              >
                <p className="font-semibold text-foreground">
                  {processor.category}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {processor.purpose}
                </p>
              </li>
            ))}
          </ul>
          <p>
            Each connected platform — including Meta, your commerce platform, and
            Google services — also processes data under its own privacy policy.
            We encourage you to review those policies for the platforms you use.
          </p>
        </section>

        <section id="encryption" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            4. Token encryption at rest
          </h2>
          <p>
            Access tokens and credentials for your connected stores and ad
            accounts are encrypted at rest using strong, industry-standard
            authenticated encryption. These tokens are never exposed to the
            browser and are not written to application logs. When you disconnect
            an integration, the associated credentials are revoked and deleted.
          </p>
          <p>
            We use encryption in transit and at rest for data more broadly, along
            with access controls and other safeguards designed to protect your
            information. No method of transmission or storage is completely
            secure, but we work to protect your data and to respond promptly to
            any issues.
          </p>
        </section>

        <section id="retention" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            5. Data retention
          </h2>
          <p>
            We retain personal information for as long as your account is active
            and as needed to provide the Service. After you close your account or
            delete a workspace, we delete or anonymize the associated data within
            a reasonable period, except where we must retain certain records to
            comply with legal, accounting, or security obligations, or to resolve
            disputes.
          </p>
        </section>

        <section id="rights" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            6. Your rights
          </h2>
          <p>
            Depending on where you live, you may have rights over your personal
            information, including the right to:
          </p>
          <ul className="ml-5 list-disc space-y-2 marker:text-primary">
            <li>Access the personal information we hold about you.</li>
            <li>Correct inaccurate or incomplete information.</li>
            <li>Delete your personal information, subject to legal limits.</li>
            <li>Export a copy of your data in a portable format.</li>
            <li>Object to or restrict certain processing.</li>
            <li>Withdraw consent where processing relies on consent.</li>
          </ul>
          <p>
            You can exercise many of these rights directly in your account
            settings. To make any other request, contact us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We will
            respond in line with applicable law.
          </p>
        </section>

        <section id="cookies" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            7. Cookies
          </h2>
          <p>
            We use cookies and similar technologies to keep you signed in,
            remember your preferences, secure the Service, and understand usage in
            aggregate. Essential cookies are required for the Service to function.
            You can control non-essential cookies through your browser settings;
            disabling some cookies may affect functionality.
          </p>
        </section>

        <section id="children" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            8. Children
          </h2>
          <p>
            The Service is intended for businesses and is not directed to
            children. We do not knowingly collect personal information from
            anyone under 18. If you believe a child has provided us with personal
            information, please contact us and we will take appropriate steps to
            delete it.
          </p>
        </section>

        <section id="transfers" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            9. International transfers
          </h2>
          <p>
            We and our processors may store and process information in countries
            other than the one in which you are located. Where we transfer
            personal information across borders, we take steps to ensure it
            receives an appropriate level of protection, using recognized
            safeguards such as standard contractual clauses where required.
          </p>
        </section>

        <section id="changes" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            10. Changes to this policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. When we make
            material changes, we will update the &ldquo;Last updated&rdquo; date
            above and, where appropriate, provide additional notice. Your
            continued use of the Service after changes take effect constitutes
            acceptance of the updated policy.
          </p>
        </section>

        <section id="contact" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            11. Contact
          </h2>
          <p>
            For privacy questions or to exercise your rights, email us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or visit our{" "}
            <Link href="/contact">contact page</Link>.
          </p>
        </section>

        <aside className="rounded-2xl border border-border bg-muted/40 p-6 text-sm">
          <p className="font-semibold text-foreground">A note on this template</p>
          <p className="mt-2">
            This policy is a reasonable, general-purpose template provided for
            convenience. It is not legal advice and is not tailored to any
            specific jurisdiction or regulatory regime. Please consult qualified
            legal counsel to confirm it fits your business and obligations.
          </p>
        </aside>
      </div>
    </article>
  );
}
