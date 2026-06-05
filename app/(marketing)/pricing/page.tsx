import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  FileLock2,
  PlugZap,
  ScrollText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/marketing/reveal";
import { PLANS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for Avokado. Start in demo mode for free, then upgrade when you connect a real store and ad account. No spend leaves your account without approval.",
};

const INCLUDED = [
  {
    icon: Sparkles,
    title: "Full demo mode",
    body: "Explore every screen with realistic mock data before connecting anything.",
  },
  {
    icon: ShieldCheck,
    title: "Draft-first by default",
    body: "Campaigns are created paused — nothing launches without your approval.",
  },
  {
    icon: FileLock2,
    title: "Encrypted tokens",
    body: "Store and ad-account credentials are encrypted at rest, never sent to the browser.",
  },
  {
    icon: ScrollText,
    title: "Full audit log",
    body: "Every action recorded with who, when, and before/after detail.",
  },
  {
    icon: PlugZap,
    title: "All integrations available",
    body: "Shopify, WooCommerce, website, and Meta on every plan — no feature paywalls.",
  },
];

const FAQ = [
  {
    q: "How does billing work?",
    a: "Plans are billed monthly per workspace at the listed price. You can start in demo mode for free, then upgrade when you connect a real store and ad account. Changing plans takes effect immediately and is prorated against your current period.",
  },
  {
    q: "Can I try Avokado without connecting a store or ad account?",
    a: "Yes. Every account includes a full demo mode. Each integration has a clearly-labelled mock adapter, so you can build a brand book, generate creative, draft campaigns, and review analytics end to end before connecting anything real.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel from your workspace billing settings at any time, and you keep access until the end of the current billing period. We don't lock you into annual contracts, and there are no cancellation fees.",
  },
  {
    q: "What counts as ad spend, and does Avokado take a cut of it?",
    a: "Ad spend is the budget your campaigns spend on Meta — it's paid directly to Meta from your own ad account, not to us. Avokado never takes a percentage of your media spend. The monthly ad-spend figure on each plan is a managed-volume guideline, not a fee.",
  },
  {
    q: "Will Avokado ever spend money on its own?",
    a: "No. Activation, budget increases, and any change that spends money require your explicit approval, or must fit an automation rule you configured within hard safety limits. A deterministic policy engine enforces those limits regardless of plan.",
  },
  {
    q: "How is my data kept secure?",
    a: "Third-party tokens are encrypted at rest with AES-256-GCM and are never exposed to the browser or written to logs. Disconnecting a store revokes and deletes its credentials. Higher plans add audit-log exports, advanced approval workflows, and SSO on request.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden bg-grain">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.52_0.105_135/0.10),transparent)]"
        />
        <div className="mx-auto max-w-3xl px-5 pb-10 pt-16 text-center lg:pt-24">
          <Reveal>
            <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1">
              <Sparkles className="size-3 text-primary" />
              Pricing
            </Badge>
            <h1 className="mt-5 text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              Pricing that scales with your{" "}
              <span className="text-primary">advertising</span>, not your anxiety.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
              Start in demo mode for free and explore the entire product. Upgrade
              when you connect a real store and ad account. No spend ever leaves
              your account without approval.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-6xl px-5 pb-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 0.06}>
              <div
                className={
                  "relative flex h-full flex-col rounded-2xl border bg-card p-6 " +
                  (plan.highlighted
                    ? "border-primary/40 shadow-md ring-1 ring-primary/20"
                    : "border-border")
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    {plan.name}
                  </h2>
                  {plan.highlighted && (
                    <Badge className="shrink-0">Most popular</Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{plan.blurb}</p>
                <p className="mt-5 font-display text-4xl font-semibold tracking-tight text-foreground">
                  {formatCurrency(plan.priceMonthly)}
                  <span className="align-baseline text-sm font-normal text-muted-foreground">
                    {" "}
                    / month
                  </span>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Billed monthly per workspace. Cancel anytime.
                </p>

                <Button
                  asChild
                  size="lg"
                  variant={plan.highlighted ? "default" : "outline"}
                  className="mt-6 w-full"
                >
                  <Link href="/register">
                    Start free
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>

                <div className="mt-6 border-t border-border pt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    What&apos;s included
                  </p>
                  <ul className="mt-4 space-y-3 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                        <span className="text-foreground/90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Need a custom volume, multi-brand, or procurement arrangement?{" "}
          <Link
            href="/contact"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Talk to us
          </Link>
          .
        </p>
      </section>

      {/* Everything includes */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground">
                Every plan includes the essentials
              </h2>
              <p className="mt-3 text-muted-foreground">
                The safety, transparency, and integrations that make Avokado
                trustworthy are never behind a higher tier.
              </p>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {INCLUDED.map((item, i) => (
              <Reveal key={item.title} delay={(i % 5) * 0.05}>
                <div className="h-full rounded-xl border border-border bg-card p-5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="size-5" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-20">
        <Reveal>
          <div className="text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground">
              Billing questions, answered honestly
            </h2>
            <p className="mt-3 text-muted-foreground">
              No hidden fees, no media-spend cut, no surprise charges.
            </p>
          </div>
        </Reveal>
        <div className="mt-10 space-y-3">
          {FAQ.map((item, i) => (
            <Reveal key={item.q} delay={(i % 3) * 0.05}>
              <details className="group rounded-xl border border-border bg-card px-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-medium text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                  {item.q}
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="pb-5 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Still have a question?{" "}
          <Link
            href="/contact"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Get in touch
          </Link>{" "}
          or read more about{" "}
          <Link
            href="/security"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            how we keep your data safe
          </Link>
          .
        </p>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-primary px-8 py-14 text-center text-primary-foreground sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,oklch(1_0_0/0.14),transparent)]"
          />
          <h2 className="relative font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Try the whole product before you pay.
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-primary-foreground/85">
            Spin up a workspace in demo mode, build a real campaign, and see how
            Avokado works — then pick a plan when you connect your store.
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary">
              <Link href="/register">
                Create your workspace
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link href="/how-it-works">See how it works</Link>
            </Button>
          </div>
          <p className="relative mt-6 inline-flex items-center gap-1.5 text-sm text-primary-foreground/80">
            <CreditCard className="size-4" />
            No credit card required to start in demo mode.
          </p>
        </div>
      </section>
    </>
  );
}
