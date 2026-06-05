import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Boxes,
  Brain,
  CheckCircle2,
  FileSearch,
  Gauge,
  KeyRound,
  Link2,
  PauseCircle,
  Palette,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Store,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Avokado in five stages: connect your store, understand your brand with evidence and confidence, build campaign-ready creative, launch paused for your approval, and improve with a deterministic policy engine and full audit log.",
};

type Stage = {
  number: string;
  icon: typeof Store;
  eyebrow: string;
  title: string;
  summary: string;
  detail: { icon: typeof Store; title: string; body: string }[];
  note?: { title: string; body: string };
};

const STAGES: Stage[] = [
  {
    number: "01",
    icon: Store,
    eyebrow: "Connect",
    title: "Bring your store in, your way",
    summary:
      "Start from wherever you are. Avokado meets your stack instead of forcing a migration, and you can explore everything in demo mode before connecting anything real.",
    detail: [
      {
        icon: Store,
        title: "Shopify OAuth",
        body: "Authorize Avokado with the official OAuth flow. We request only the scopes we need, and disconnecting revokes and deletes the credentials.",
      },
      {
        icon: KeyRound,
        title: "WooCommerce REST keys",
        body: "Paste read-scoped REST API keys for your WooCommerce store. Keys are encrypted at rest with AES-256-GCM and never exposed to the browser.",
      },
      {
        icon: FileSearch,
        title: "Any website URL",
        body: "No storefront platform? Point Avokado at your site and a compliant inspection pipeline reads public pages to seed your brand and catalog.",
      },
    ],
    note: {
      title: "Demo mode first",
      body: "Every integration ships with a clearly-labelled mock adapter, so you can walk the entire journey — brand book, creative, campaigns, analytics — before authorizing a single real account.",
    },
  },
  {
    number: "02",
    icon: Brain,
    eyebrow: "Understand",
    title: "Structured brand intelligence, with the receipts",
    summary:
      "Vertex AI inspects your store and site to build an editable brand book — voice, audience, positioning, and visual identity. Nothing is asserted without a source.",
    detail: [
      {
        icon: Brain,
        title: "Structured fields",
        body: "Tone, value propositions, target audience, and product themes are captured as discrete, editable fields — not a wall of prose you have to untangle.",
      },
      {
        icon: ScrollText,
        title: "Evidence per field",
        body: "Each conclusion links back to the exact page, product, or copy it was drawn from, so you can verify or correct it in seconds.",
      },
      {
        icon: Gauge,
        title: "Confidence per field",
        body: "A confidence score flags what Avokado is sure about versus what it inferred — so you know precisely where your review attention is worth spending.",
      },
    ],
  },
  {
    number: "03",
    icon: Palette,
    eyebrow: "Build",
    title: "From strategy brief to campaign-ready creative",
    summary:
      "A strategy brief becomes a concrete plan. From there Avokado generates concepts, copy, and asset combinations — every one tied back to your approved brand book.",
    detail: [
      {
        icon: Workflow,
        title: "Brief to plan",
        body: "Turn objectives, audience, and budget into a structured strategy brief, then expand it into a plan of angles, offers, and creative directions.",
      },
      {
        icon: Sparkles,
        title: "Concepts & copy",
        body: "Hooks, primary text, headlines, UGC scripts, and storyboards are written to match your tone — drafts you can edit, regenerate, or discard.",
      },
      {
        icon: Boxes,
        title: "Asset combinations",
        body: "Approved images, video, and logos are paired with copy into ready-to-ship ad variations, each traceable to the brand book it came from.",
      },
    ],
  },
  {
    number: "04",
    icon: PauseCircle,
    eyebrow: "Launch",
    title: "Nothing goes live without your word",
    summary:
      "Avokado builds campaigns from your real products and approved assets — but creates them paused or as drafts. Spend begins only when you explicitly confirm.",
    detail: [
      {
        icon: BadgeCheck,
        title: "Meta readiness check",
        body: "Before anything is built, Avokado verifies pixel, catalog, and ad-account prerequisites and surfaces exactly what to fix first.",
      },
      {
        icon: PauseCircle,
        title: "Paused by default",
        body: "Campaigns, ad sets, and ads are created as drafts or paused entities. No budget is committed at creation time, full stop.",
      },
      {
        icon: CheckCircle2,
        title: "Explicit activation",
        body: "Going live is a deliberate, separate confirmation — never a side effect of building, and never something the AI can trigger on its own.",
      },
    ],
  },
  {
    number: "05",
    icon: BarChart3,
    eyebrow: "Improve",
    title: "Recommendations grounded in real performance",
    summary:
      "Once campaigns run, the loop tightens. Avokado works only from validated analytics, and every proposed change passes through policy, your approval, and an audit log.",
    detail: [
      {
        icon: BarChart3,
        title: "Validated analytics",
        body: "The AI analyst reads only data that clears minimum spend, impression, and conversion thresholds — so recommendations rest on signal, not noise.",
      },
      {
        icon: ShieldCheck,
        title: "Deterministic policy engine",
        body: "Every suggestion is checked against hard safety limits — budgets can't jump silently, and out-of-bounds actions are blocked before you ever see them.",
      },
      {
        icon: ScrollText,
        title: "Typed execution + audit log",
        body: "Approved changes run through typed integration adapters, and each one is recorded with who, what, when, and full before/after detail.",
      },
    ],
    note: {
      title: "Reversible by design",
      body: "Every recommendation arrives with its confidence, its supporting evidence, and a clear way to undo it — so improving is never a one-way door.",
    },
  },
];

const APPROVAL_FLOW = [
  {
    icon: Sparkles,
    step: "AI proposes",
    body: "The model produces a structured recommendation with evidence and confidence — a suggestion, not an action.",
  },
  {
    icon: ShieldCheck,
    step: "Policy validates",
    body: "A deterministic engine checks it against hard budget and safety limits, rejecting anything out of bounds.",
  },
  {
    icon: BadgeCheck,
    step: "You approve",
    body: "Nothing that spends money or changes a live campaign proceeds without an explicit human decision.",
  },
  {
    icon: Workflow,
    step: "Adapter executes",
    body: "A typed integration adapter performs the change exactly as approved — then writes it to the audit log.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-grain">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.52_0.105_135/0.10),transparent)]"
        />
        <div className="mx-auto max-w-3xl px-5 pb-16 pt-16 text-center lg:pt-24">
          <Reveal>
            <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1">
              <Workflow className="size-3 text-primary" />
              The end-to-end journey
            </Badge>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-5 text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              From <span className="text-primary">store</span> to running
              campaigns, with a checkpoint at every step.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">
              Avokado moves through five stages — connect, understand, build,
              launch, and improve. Each one produces something you can inspect,
              and nothing that spends money happens without your approval.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  Start free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/features">Explore the features</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stage rail */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-6">
          <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3 text-sm">
            {STAGES.map((stage, i) => (
              <li key={stage.eyebrow} className="flex items-center gap-2">
                <Link
                  href={`#stage-${stage.number}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <span className="font-mono text-[11px] font-semibold text-primary">
                    {stage.number}
                  </span>
                  {stage.eyebrow}
                </Link>
                {i < STAGES.length - 1 && (
                  <ArrowRight className="hidden size-3.5 text-muted-foreground/50 sm:block" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pipeline stages */}
      <div className="mx-auto max-w-6xl px-5">
        {STAGES.map((stage) => (
          <section
            key={stage.number}
            id={`stage-${stage.number}`}
            className="scroll-mt-24 border-b border-border py-16 last:border-b-0 lg:py-20"
          >
            <Reveal>
              <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-12">
                {/* Stage header */}
                <div className="lg:sticky lg:top-24">
                  <div className="flex items-center gap-4">
                    <span
                      aria-hidden
                      className="font-display text-5xl font-semibold leading-none text-primary/25 sm:text-6xl"
                    >
                      {stage.number}
                    </span>
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <stage.icon className="size-5" />
                    </span>
                  </div>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-primary">
                    {stage.eyebrow}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {stage.title}
                  </h2>
                  <p className="mt-3 text-pretty text-muted-foreground">
                    {stage.summary}
                  </p>
                </div>

                {/* Stage detail */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {stage.detail.map((item) => (
                    <Card
                      key={item.title}
                      className="h-full gap-3 transition-shadow hover:shadow-md"
                    >
                      <CardHeader>
                        <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
                          <item.icon className="size-4.5" />
                        </span>
                        <CardTitle className="mt-3 text-base">
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {item.body}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                  {stage.note && (
                    <Card className="bg-primary/[0.04] sm:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <ShieldCheck className="size-4 text-primary" />
                          {stage.note.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {stage.note.body}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </Reveal>
          </section>
        ))}
      </div>

      {/* How approvals work */}
      <section className="border-t border-border bg-primary/[0.04]">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="gap-1.5">
                <Link2 className="size-3 text-primary" /> How approvals work
              </Badge>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                The AI proposes. The policy engine validates. You approve. A
                typed adapter executes.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                A language model never touches your budgets or live campaigns
                directly. Every money-moving action follows the same four-step
                path — in this exact order, every time.
              </p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {APPROVAL_FLOW.map((item, i) => (
              <Reveal key={item.step} delay={i * 0.06}>
                <div className="relative flex h-full flex-col rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <item.icon className="size-5" />
                    </span>
                    <span className="font-mono text-xs font-semibold text-muted-foreground/60">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">
                    {item.step}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground">
              The result is a complete audit log: who proposed each change, why,
              what the policy engine decided, who approved it, and the exact
              before-and-after of every value that moved.{" "}
              <Link
                href="/security"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Read about security
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-primary px-8 py-14 text-center text-primary-foreground sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,oklch(1_0_0/0.14),transparent)]"
          />
          <h2 className="relative font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Walk the whole journey in demo mode.
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-primary-foreground/85">
            Connect, understand, build, and launch — end to end, with no store
            and no ad account required. Bring the real thing when you’re ready.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary">
              <Link href="/register">
                Create your workspace <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
