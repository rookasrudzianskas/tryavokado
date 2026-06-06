import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  PauseCircle,
  Sparkles,
  Store,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/marketing/reveal";
import { UrlPrompt } from "@/components/marketing/url-prompt";
import { HeroBackdrop } from "@/components/marketing/hero-backdrop";
import {
  AnalyticsGraphic,
  BrandGraphic,
  CreativeGraphic,
  HeroCanvas,
  SafetyGraphic,
} from "@/components/marketing/graphics";
import { PLANS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

const PIPELINE = [
  { icon: Store, title: "Connect", body: "Shopify, WooCommerce, or any store URL." },
  { icon: Brain, title: "Understand", body: "Learn your brand, products, and audience." },
  { icon: Wand2, title: "Build", body: "Generate concepts, copy, and asset combinations." },
  { icon: PauseCircle, title: "Launch", body: "Campaigns created paused — you approve activation." },
  { icon: BarChart3, title: "Improve", body: "Recommendations grounded in real performance." },
];

const WORKS_WITH = ["Shopify", "WooCommerce", "Meta Ads", "Stripe", "Google Vertex AI"];

const FAQ = [
  {
    q: "Does Avokado spend my money automatically?",
    a: "No. Campaigns are created paused or as drafts by default. Activation, budget increases, and any spend require your explicit approval — or must fit an automation rule you configured, within hard safety limits.",
  },
  {
    q: "Do I need a Meta or Shopify account to try it?",
    a: "No. Avokado ships with a full demo mode. Every integration has a clearly-labelled mock adapter so you can explore the entire product before connecting anything real.",
  },
  {
    q: "How are my store and ad-account tokens protected?",
    a: "All third-party tokens are encrypted at rest with AES-256-GCM and never exposed to the browser or written to logs. Disconnecting a store revokes and deletes its credentials.",
  },
  {
    q: "Is the AI making the final decisions?",
    a: "Never for actions that spend money or change live campaigns. The model produces structured recommendations; a deterministic policy engine validates them; and you approve before a typed integration executes anything.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <HeroBackdrop />
        <div className="mx-auto grid max-w-6xl gap-14 px-5 pb-20 pt-20 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:pt-28">
          <div>
            <Badge variant="outline" className="gap-1.5 rounded-full border-border/80 px-3 py-1 text-muted-foreground">
              <Sparkles className="size-3 text-brand" />
              Creative OS for ecommerce advertising
            </Badge>
            <h1 className="mt-6 text-balance font-display text-5xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-[4.25rem]">
              Turn your store into{" "}
              <span className="text-foreground">Meta campaigns</span> that fit
              your brand.
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Avokado connects your store, learns your brand and products, and
              builds campaign-ready creative — then helps you launch and improve
              with safety and approval controls at every step.
            </p>
            <div className="mt-8 max-w-xl">
              <UrlPrompt />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Link
                href="/register"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Or explore in demo mode →
              </Link>
              {["No login to start", "Draft-first by default"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-brand" /> {item}
                </span>
              ))}
            </div>
          </div>
          <Reveal delay={0.05}>
            <HeroCanvas />
          </Reveal>
        </div>
      </section>

      {/* Works with */}
      <section className="border-y border-border/70 bg-card/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-10 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">Works with your stack</p>
          <div className="flex flex-wrap items-center justify-center gap-x-9 gap-y-3">
            {WORKS_WITH.map((name) => (
              <span
                key={name}
                className="text-sm font-medium tracking-tight text-muted-foreground/80"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Bento feature grid */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-[2.5rem] sm:leading-[1.1]">
              Everything between “I have a store” and “my ads are working.”
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              One calm workspace for brand intelligence, creative, campaigns, and
              analysis — instead of six disconnected tools and a spreadsheet.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <Reveal className="md:col-span-2">
            <BentoCard
              eyebrow="Brand intelligence"
              title="A structured brand book, built from your store"
              body="Avokado inspects your store and website to extract voice, audience, positioning, and visual identity — with evidence behind every conclusion."
              graphic={<BrandGraphic />}
              className="md:flex-row md:items-center"
            />
          </Reveal>
          <Reveal delay={0.05}>
            <BentoCard
              eyebrow="Creative studio"
              title="On-brand concepts & copy"
              body="Hooks, primary text, headlines, UGC scripts, and storyboards tied to your brand book."
              graphic={<CreativeGraphic />}
            />
          </Reveal>
          <Reveal delay={0.05}>
            <BentoCard
              eyebrow="Analytics"
              title="Performance you can read"
              body="Spend, ROAS, CPA and more, with an analyst that only acts on validated data."
              graphic={<AnalyticsGraphic />}
            />
          </Reveal>
          <Reveal className="md:col-span-2" delay={0.1}>
            <BentoCard
              eyebrow="Safety & approvals"
              title="The AI proposes. You approve. A policy engine enforces."
              body="No language model ever changes a budget or launches a campaign directly. Every action flows through a deterministic policy engine, your approval, and a full audit log."
              graphic={<SafetyGraphic />}
              className="md:flex-row-reverse md:items-center"
            />
          </Reveal>
        </div>
      </section>

      {/* Pipeline */}
      <section className="border-y border-border/70 bg-card/30">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Reveal>
            <p className="text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Connect → understand → build → launch → improve
            </p>
          </Reveal>
          <div className="relative mt-12">
            <div
              aria-hidden
              className="absolute inset-x-[10%] top-6 hidden h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent md:block"
            />
            <div className="grid gap-8 md:grid-cols-5">
              {PIPELINE.map((step, i) => (
                <Reveal key={step.title} delay={i * 0.05} className="text-center">
                  <div className="relative mx-auto flex size-12 items-center justify-center rounded-xl border border-border bg-background text-brand">
                    <step.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-medium text-foreground">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <div className="text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Simple pricing that scales with you
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Start in demo mode for free. Upgrade when you connect a real store
              and ad account.
            </p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 0.05}>
              <div
                className={
                  "flex h-full flex-col rounded-xl border bg-card p-6 transition-colors " +
                  (plan.highlighted
                    ? "border-brand/40 ring-1 ring-brand/15"
                    : "border-border hover:border-foreground/20")
                }
              >
                {plan.highlighted && <Badge className="mb-3 w-fit">Most popular</Badge>}
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.blurb}</p>
                <p className="mt-5 font-display text-4xl font-semibold tracking-tight text-foreground">
                  {formatCurrency(plan.priceMonthly)}
                  <span className="text-base font-normal text-muted-foreground">
                    {" "}
                    / mo
                  </span>
                </p>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={plan.highlighted ? "default" : "outline"}
                  className="mt-7"
                >
                  <Link href="/register">Get started</Link>
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/70 bg-card/30">
        <div className="mx-auto max-w-3xl px-5 py-24">
          <h2 className="text-center font-display text-3xl font-semibold tracking-tight text-foreground">
            Questions, answered honestly
          </h2>
          <div className="mt-12 divide-y divide-border/70">
            {FAQ.map((item) => (
              <div key={item.q} className="py-6">
                <h3 className="font-medium text-foreground">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-8 py-16 text-center sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-dots mask-radial opacity-40"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-brand/60 to-transparent"
          />
          <h2 className="relative font-display text-3xl font-semibold tracking-tight text-foreground sm:text-[2.5rem]">
            Build your first campaign in demo mode today.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-muted-foreground">
            No store, no ad account, no risk. Explore the full product, then
            connect the real thing when you’re ready.
          </p>
          <div className="relative mt-9 flex justify-center">
            <Button asChild size="lg">
              <Link href="/register">
                Create your workspace <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function BentoCard({
  eyebrow,
  title,
  body,
  graphic,
  className,
}: {
  eyebrow: string;
  title: string;
  body: string;
  graphic: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "flex h-full flex-col gap-6 overflow-hidden rounded-xl border border-border bg-card p-6 transition-colors hover:border-foreground/20 sm:p-8 " +
        (className ?? "")
      }
    >
      <div className="relative shrink-0 overflow-hidden rounded-lg border border-border/60 bg-background/40 p-2 sm:max-w-[58%]">
        {graphic}
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-xs font-medium uppercase tracking-widest text-brand/90">
          {eyebrow}
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
