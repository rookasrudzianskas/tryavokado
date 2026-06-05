import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Image as ImageIcon,
  Layers,
  Lightbulb,
  Lock,
  PauseCircle,
  Palette,
  ShieldCheck,
  Sparkles,
  Store,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/marketing/reveal";
import { HeroBackdrop } from "@/components/marketing/hero-backdrop";
import { SpotlightCard } from "@/components/marketing/spotlight-card";
import { Magnetic } from "@/components/marketing/magnetic";
import { GradientBorder } from "@/components/marketing/gradient-border";
import { ProductPreview } from "@/components/marketing/product-preview";
import { PLANS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

const PIPELINE = [
  { icon: Store, title: "Connect", body: "Shopify, WooCommerce, or any store URL." },
  { icon: Brain, title: "Understand", body: "We learn your brand, products, and audience." },
  { icon: Palette, title: "Build", body: "Generate concepts, copy, and asset combinations." },
  { icon: PauseCircle, title: "Launch", body: "Campaigns created paused — you approve activation." },
  { icon: BarChart3, title: "Improve", body: "Recommendations grounded in real performance." },
];

const FEATURES = [
  {
    icon: Brain,
    title: "Brand intelligence",
    body: "Avokado inspects your store and website to build a structured, editable brand book — voice, audience, positioning, and visual identity — with evidence behind every conclusion.",
  },
  {
    icon: Wand2,
    title: "Creative studio",
    body: "Generate ad concepts, hooks, primary text, headlines, UGC scripts, and storyboards that stay tied to your brand book and advertising brief.",
  },
  {
    icon: Layers,
    title: "Meta campaign automation",
    body: "Build campaigns, ad sets, and ads from your real products and approved assets — created as drafts or paused entities by default.",
  },
  {
    icon: BarChart3,
    title: "Analytics & recommendations",
    body: "Clear performance views and an AI analyst that only works from validated data, proposing reversible actions with confidence and evidence.",
  },
  {
    icon: ImageIcon,
    title: "Asset library",
    body: "Upload, organize, inspect, tag, and approve images, video, UGC, and logos. AI analysis is kept separate from your approvals.",
  },
  {
    icon: ShieldCheck,
    title: "Safety & approval controls",
    body: "A deterministic policy engine validates every action. Budgets never silently change, and campaigns never silently launch.",
  },
];

const FAQ = [
  {
    q: "Does Avokado spend my money automatically?",
    a: "No. Campaigns are created paused or as drafts by default. Activation, budget increases, and any spend require your explicit approval — or must fit an automation rule you configured, within hard safety limits.",
  },
  {
    q: "Do I need a Meta or Shopify account to try it?",
    a: "No. Avokado ships with a full demo mode. Every integration has a clearly-labelled mock adapter so you can explore the entire product — brand book, creative, campaigns, analytics — before connecting anything real.",
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
        <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:pt-24">
          <div>
            <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1">
              <Sparkles className="size-3 text-primary" />
              Creative OS for ecommerce advertising
            </Badge>
            <h1 className="mt-5 text-balance font-display text-5xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Turn your store into{" "}
              <span className="text-brand">Meta campaigns</span> that actually
              fit your brand.
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
              Avokado connects your store, learns your brand and products, and
              builds campaign-ready creative — then helps you launch and improve
              with safety and approval controls at every step.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Magnetic>
                <Button asChild size="lg">
                  <Link href="/register">
                    Start free <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </Magnetic>
              <Magnetic>
                <Button asChild size="lg" variant="outline">
                  <Link href="/how-it-works">See how it works</Link>
                </Button>
              </Magnetic>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["Draft-first by default", "Approval required to spend", "Tokens encrypted at rest"].map(
                (item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-primary" /> {item}
                  </span>
                ),
              )}
            </div>
          </div>
          <Reveal delay={0.1}>
            <ProductPreview />
          </Reveal>
        </div>
      </section>

      {/* Pipeline */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {PIPELINE.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.06}>
                <div className="group relative h-full rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <step.icon className="size-5" />
                  </div>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    0{i + 1}
                  </p>
                  <h3 className="mt-1 font-medium text-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Everything between “I have a store” and “my ads are working.”
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              One calm workspace for brand intelligence, creative, campaigns, and
              analysis — instead of six disconnected tools and a spreadsheet.
            </p>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={(i % 3) * 0.06}>
              <SpotlightCard className="h-full p-6">
                <div className="flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.body}
                </p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Safety band */}
      <section className="border-y border-border bg-primary/[0.04]">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <Reveal>
            <div>
              <Badge variant="outline" className="gap-1.5">
                <Lock className="size-3 text-primary" /> Safety by design
              </Badge>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground">
                The AI proposes. You approve. A policy engine enforces.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Avokado never lets a language model directly change budgets or
                launch campaigns. Every action flows through a deterministic
                policy engine, your approval, and a full audit log.
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link href="/security">Read about security</Link>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: PauseCircle, t: "Draft-first creation", d: "Entities are paused until you explicitly activate." },
                { icon: ShieldCheck, t: "Hard budget limits", d: "Workspace caps that automation can never exceed." },
                { icon: Lightbulb, t: "Reversible actions", d: "Every recommendation includes how to undo it." },
                { icon: Layers, t: "Full audit log", d: "Who did what, when, with before/after detail." },
              ].map((item) => (
                <div
                  key={item.t}
                  className="rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20"
                >
                  <item.icon className="size-5 text-primary" />
                  <h3 className="mt-3 text-sm font-semibold text-foreground">
                    {item.t}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.d}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="mx-auto max-w-6xl px-5 py-20">
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
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 0.06}>
              <div
                className={
                  "flex h-full flex-col rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 " +
                  (plan.highlighted
                    ? "border-brand/50 ring-1 ring-brand/25"
                    : "border-border hover:border-foreground/20")
                }
              >
                {plan.highlighted && (
                  <Badge className="mb-3 w-fit">Most popular</Badge>
                )}
                <h3 className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.blurb}</p>
                <p className="mt-4 font-display text-3xl font-semibold text-foreground">
                  {formatCurrency(plan.priceMonthly)}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    / mo
                  </span>
                </p>
                <ul className="mt-5 space-y-2.5 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={plan.highlighted ? "default" : "outline"}
                  className="mt-6"
                >
                  <Link href="/register">Get started</Link>
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-3xl px-5 py-20">
          <h2 className="text-center font-display text-3xl font-semibold tracking-tight text-foreground">
            Questions, answered honestly
          </h2>
          <div className="mt-10 divide-y divide-border">
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

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <GradientBorder>
          <div className="relative overflow-hidden px-8 py-16 text-center sm:px-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-dots mask-radial opacity-50"
            />
            <h2 className="relative font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Build your first campaign in demo mode today.
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-muted-foreground">
              No store, no ad account, no risk. Explore the full product, then
              connect the real thing when you’re ready.
            </p>
            <div className="relative mt-8 flex justify-center">
              <Magnetic>
                <Button asChild size="lg">
                  <Link href="/register">
                    Create your workspace <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </Magnetic>
            </div>
          </div>
        </GradientBorder>
      </section>
    </>
  );
}
