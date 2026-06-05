import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of Avokado, including accounts, acceptable use, third-party integrations, billing, and limitations of liability.",
};

const LAST_UPDATED = "June 5, 2026";

const SECTIONS = [
  { id: "acceptance", label: "1. Acceptance of terms" },
  { id: "service", label: "2. Description of the service" },
  { id: "accounts", label: "3. Accounts & workspaces" },
  { id: "acceptable-use", label: "4. Acceptable use" },
  { id: "integrations", label: "5. Third-party integrations" },
  { id: "billing", label: "6. Billing & subscriptions" },
  { id: "performance", label: "7. No guarantee of advertising performance" },
  { id: "ip", label: "8. Intellectual property" },
  { id: "disclaimers", label: "9. Disclaimers" },
  { id: "liability", label: "10. Limitation of liability" },
  { id: "termination", label: "11. Termination" },
  { id: "changes", label: "12. Changes to these terms" },
  { id: "contact", label: "13. Contact" },
];

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <header className="border-b border-border pb-8">
        <Badge variant="outline" className="rounded-full px-3 py-1">
          Legal
        </Badge>
        <h1 className="mt-5 text-balance font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-pretty text-lg text-muted-foreground">
          These terms govern your access to and use of {APP_NAME}. Please read
          them carefully — by using the service you agree to be bound by them.
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
        <section
          id="acceptance"
          className="scroll-mt-24 space-y-4 border-l-2 border-transparent"
        >
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            1. Acceptance of terms
          </h2>
          <p>
            By creating an account, accessing, or using {APP_NAME} (the
            &ldquo;Service&rdquo;), you agree to these Terms of Service (the
            &ldquo;Terms&rdquo;) and to our{" "}
            <Link href="/privacy">Privacy Policy</Link>. If you are using the
            Service on behalf of an organization, you represent that you have the
            authority to bind that organization, and &ldquo;you&rdquo; refers to
            that organization.
          </p>
          <p>
            You must be at least 18 years old, or the age of majority in your
            jurisdiction, to use the Service. If you do not agree with any part
            of these Terms, you may not use the Service.
          </p>
        </section>

        <section id="service" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            2. Description of the service
          </h2>
          <p>
            {APP_NAME} is a software platform that helps ecommerce brands plan,
            create, and manage advertising. The Service can connect to your
            store, build a structured brand profile, generate advertising
            creative and campaign drafts, and surface analytics and
            recommendations grounded in your data.
          </p>
          <p>
            {APP_NAME} is designed to keep you in control. Campaigns and related
            entities are created as drafts or in a paused state by default.
            Actions that spend money or change live campaigns require your
            explicit approval, or must fit within automation rules and hard
            safety limits that you configure. We may add, change, or remove
            features over time.
          </p>
        </section>

        <section id="accounts" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            3. Accounts &amp; workspaces
          </h2>
          <p>
            To use most features you must create an account and a workspace. You
            are responsible for the accuracy of the information you provide and
            for maintaining the confidentiality of your login credentials. You
            are responsible for all activity that occurs under your account.
          </p>
          <h3 className="text-lg font-semibold text-foreground">
            Workspace members and roles
          </h3>
          <p>
            A workspace may have multiple members with different roles, ranging
            from owner to read-only viewer. The workspace owner and admins are
            responsible for managing membership, permissions, and connected
            integrations. You agree that anyone you invite is authorized to act
            within the limits of the role you assign them.
          </p>
          <ul className="ml-5 list-disc space-y-2 marker:text-primary">
            <li>
              Keep your credentials secure and notify us promptly of any
              unauthorized access.
            </li>
            <li>
              Ensure that each member only retains access while they require it.
            </li>
            <li>
              You are responsible for the actions of your workspace members,
              including approvals they grant.
            </li>
          </ul>
        </section>

        <section id="acceptable-use" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            4. Acceptable use
          </h2>
          <p>
            You agree to use the Service lawfully and responsibly. You may not,
            and may not permit others to:
          </p>
          <ul className="ml-5 list-disc space-y-2 marker:text-primary">
            <li>
              Violate any applicable law, regulation, or third-party right,
              including advertising, consumer-protection, and data-protection
              laws.
            </li>
            <li>
              Create or promote advertising for prohibited, deceptive, or
              infringing products, or content that is unlawful, harmful, or
              discriminatory.
            </li>
            <li>
              Upload content you do not have the rights to use, or misrepresent
              your products, brand, or business.
            </li>
            <li>
              Reverse engineer, scrape, overload, probe, or attempt to gain
              unauthorized access to the Service or its infrastructure.
            </li>
            <li>
              Resell, sublicense, or provide the Service to third parties except
              as expressly permitted by your plan.
            </li>
            <li>
              Use the Service to generate content that is misleading about its
              automated origin where disclosure is required.
            </li>
          </ul>
          <p>
            We may suspend or limit access to protect the Service, our users, or
            third parties if we reasonably believe these Terms have been
            violated.
          </p>
        </section>

        <section id="integrations" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            5. Third-party integrations
          </h2>
          <p>
            The Service integrates with third-party platforms, including Meta
            (Facebook and Instagram advertising), Shopify and other commerce
            platforms, and Google services. When you connect an integration, you
            authorize {APP_NAME} to access and act on data from that platform on
            your behalf, within the scope you grant.
          </p>
          <p>
            Your use of each third-party platform remains subject to that
            platform&rsquo;s own terms, policies, and advertising standards.{" "}
            <strong className="font-semibold text-foreground">
              You are solely responsible for complying with the terms of any
              platform you connect
            </strong>
            , including Meta&rsquo;s Advertising Standards, Shopify&rsquo;s terms
            of service, and Google&rsquo;s applicable policies. {APP_NAME} does
            not control those platforms and is not responsible for their
            availability, decisions, account actions, or changes to their APIs.
          </p>
          <p>
            You may disconnect an integration at any time. Doing so revokes the
            credentials we hold for it and stops further actions against that
            platform.
          </p>
        </section>

        <section id="billing" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            6. Billing &amp; subscriptions
          </h2>
          <p>
            Paid plans are billed in advance on a recurring basis through our
            payment processor. By subscribing, you authorize us to charge the
            applicable fees, plus any taxes, to your payment method until you
            cancel.
          </p>
          <ul className="ml-5 list-disc space-y-2 marker:text-primary">
            <li>
              Subscriptions renew automatically at the end of each billing
              period unless cancelled beforehand.
            </li>
            <li>
              You may cancel at any time; cancellation takes effect at the end of
              the current billing period, and access continues until then.
            </li>
            <li>
              Fees are non-refundable except where required by law or expressly
              stated otherwise.
            </li>
            <li>
              We may change plan pricing or features with reasonable advance
              notice, effective on your next renewal.
            </li>
          </ul>
          <p>
            Advertising spend itself is charged by the advertising platform
            directly to your own ad account and billing relationship with that
            platform. {APP_NAME} subscription fees are separate from, and do not
            include, your advertising budget or media spend.
          </p>
        </section>

        <section id="performance" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            7. No guarantee of advertising performance
          </h2>
          <p>
            {APP_NAME} provides tools, creative, and recommendations to support
            your advertising. We do{" "}
            <strong className="font-semibold text-foreground">not</strong>{" "}
            guarantee any particular advertising outcome, including reach,
            impressions, clicks, conversions, return on ad spend, revenue, or
            account approval. Advertising results depend on many factors outside
            our control, such as your products, pricing, market conditions,
            creative, audience, and the policies and algorithms of the
            advertising platforms.
          </p>
          <p>
            Recommendations generated by the Service, including any produced with
            assistance from AI models, are suggestions only. You are responsible
            for reviewing them and deciding whether to act. You bear full
            responsibility for your advertising budgets, campaigns, and spend.
          </p>
        </section>

        <section id="ip" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            8. Intellectual property
          </h2>
          <h3 className="text-lg font-semibold text-foreground">Our rights</h3>
          <p>
            The Service, including its software, design, and trademarks, is owned
            by {APP_NAME} and its licensors and is protected by intellectual
            property laws. We grant you a limited, non-exclusive,
            non-transferable right to use the Service in accordance with these
            Terms. No other rights are granted.
          </p>
          <h3 className="text-lg font-semibold text-foreground">
            Your content
          </h3>
          <p>
            You retain ownership of the content you provide, including your
            brand assets, product data, and uploaded media (&ldquo;Your
            Content&rdquo;). You grant {APP_NAME} a worldwide, non-exclusive
            license to host, process, and use Your Content solely to operate and
            improve the Service for you, and to perform the actions you request,
            such as building campaigns and generating creative.
          </p>
          <p>
            Subject to these Terms and our rights in the underlying Service, you
            own the advertising outputs generated for you. You are responsible
            for ensuring that Your Content and the outputs you publish do not
            infringe the rights of others.
          </p>
        </section>

        <section id="disclaimers" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            9. Disclaimers
          </h2>
          <p>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; without warranties of any kind, whether express,
            implied, or statutory, including any implied warranties of
            merchantability, fitness for a particular purpose, title, and
            non-infringement. We do not warrant that the Service will be
            uninterrupted, error-free, secure, or that any AI-generated content
            will be accurate, complete, or suitable for your purposes.
          </p>
          <p>
            You are responsible for reviewing all content and actions before they
            go live, and for maintaining your own backups of important data.
          </p>
        </section>

        <section id="liability" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            10. Limitation of liability
          </h2>
          <p>
            To the maximum extent permitted by law, {APP_NAME} and its officers,
            employees, and suppliers will not be liable for any indirect,
            incidental, special, consequential, or punitive damages, or for any
            loss of profits, revenue, data, goodwill, or advertising spend,
            arising out of or related to your use of the Service, even if we have
            been advised of the possibility of such damages.
          </p>
          <p>
            To the extent we are found liable, our total aggregate liability for
            all claims relating to the Service will not exceed the amount you
            paid us for the Service in the twelve months preceding the event
            giving rise to the claim. Some jurisdictions do not allow certain
            limitations, so some of the above may not apply to you.
          </p>
        </section>

        <section id="termination" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            11. Termination
          </h2>
          <p>
            You may stop using the Service and close your account at any time. We
            may suspend or terminate your access if you breach these Terms, if
            required by law, or to protect the Service or its users. We may also
            discontinue the Service with reasonable notice.
          </p>
          <p>
            On termination, your right to use the Service ends. We may delete your
            workspace data after a reasonable period, subject to our data
            retention practices and any legal obligations. Sections that by their
            nature should survive termination — including intellectual property,
            disclaimers, and limitation of liability — will survive.
          </p>
        </section>

        <section id="changes" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            12. Changes to these terms
          </h2>
          <p>
            We may update these Terms from time to time. When we make material
            changes, we will update the &ldquo;Last updated&rdquo; date above and,
            where appropriate, provide additional notice. Your continued use of
            the Service after changes take effect constitutes acceptance of the
            revised Terms.
          </p>
        </section>

        <section id="contact" className="scroll-mt-24 space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            13. Contact
          </h2>
          <p>
            Questions about these Terms? Reach out through our{" "}
            <Link href="/contact">contact page</Link> and we&rsquo;ll be glad to
            help.
          </p>
        </section>

        <aside className="rounded-2xl border border-border bg-muted/40 p-6 text-sm">
          <p className="font-semibold text-foreground">A note on this template</p>
          <p className="mt-2">
            This document is a reasonable, general-purpose template provided for
            convenience. It is not legal advice and is not tailored to any
            specific jurisdiction or situation. Please consult qualified legal
            counsel before relying on these Terms for your business.
          </p>
        </aside>
      </div>
    </article>
  );
}
