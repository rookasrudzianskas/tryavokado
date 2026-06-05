import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  FileText,
  FolderTree,
  Gauge,
  History,
  Image as ImageIcon,
  Layers,
  PauseCircle,
  ScrollText,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Users,
  Wand2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Features",
  description:
    "A close look at how Avokado works: brand intelligence and brand books, a creative studio, Meta campaign automation, grounded analytics, a structured asset library, and the safety and approval controls that sit underneath all of it.",
};

type Capability = { title: string; body: string };

type Feature = {
  id: string;
  eyebrow: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  capabilities: Capability[];
  /** Small supporting panel rendered opposite the prose. */
  aside: { label: string; items: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }[] };
};

const FEATURES: Feature[] = [
  {
    id: "brand-intelligence",
    eyebrow: "Brand intelligence",
    icon: Brain,
    title: "A brand book your whole workspace can stand behind.",
    body: "Avokado inspects your store and website and turns what it finds into a structured, editable brand book — voice, audience, positioning, products, and visual identity. Nothing is asserted without something to point at, and every field stays in your hands.",
    capabilities: [
      {
        title: "Guided inspection of your store and site",
        body: "Point Avokado at a Shopify or WooCommerce store, or any website URL, and it reads product pages, copy, and imagery to draft the first version for you.",
      },
      {
        title: "Structured, editable fields",
        body: "Voice and tone, audience segments, value propositions, objections, and visual cues live in clean fields you can refine — not a wall of generated text.",
      },
      {
        title: "Evidence drawer behind every claim",
        body: "Open any field to see the exact pages and snippets it was drawn from, so you can confirm, correct, or reject a conclusion with full context.",
      },
      {
        title: "Versioning you can trust",
        body: "Each meaningful edit is captured as a version. Compare what changed, see who changed it, and roll back without losing earlier work.",
      },
      {
        title: "A designed PDF export",
        body: "Produce a polished brand-book document you can share with collaborators, freelancers, or stakeholders — laid out, not dumped.",
      },
    ],
    aside: {
      label: "Inside the brand book",
      items: [
        { icon: FileText, title: "Editable fields", body: "Voice, audience, positioning, and visuals as discrete, reviewable inputs." },
        { icon: History, title: "Version history", body: "Diff, attribute, and revert any change with confidence." },
        { icon: ScrollText, title: "Designed export", body: "A presentable PDF, not a transcript of model output." },
      ],
    },
  },
  {
    id: "creative-studio",
    eyebrow: "Creative studio",
    icon: Wand2,
    title: "Creative that stays anchored to your brand and brief.",
    body: "The creative studio turns your brand book into campaign-ready ideas — concepts, hooks, and copy in the formats Meta actually uses. Everything it generates references the same source of truth, so the output sounds like you and ladders up to a real advertising brief.",
    capabilities: [
      {
        title: "Concepts and angles",
        body: "Explore distinct creative directions for a product or audience, each with the reasoning behind why it might land.",
      },
      {
        title: "Hooks and ad copy",
        body: "Generate primary text, headlines, and descriptions sized for placements, with variations you can keep, edit, or discard.",
      },
      {
        title: "Scripts for UGC, founder story, and demo",
        body: "Draft scripts in the formats that perform — creator-style UGC, an authentic founder narrative, and clear product demos.",
      },
      {
        title: "Storyboards and briefs",
        body: "Turn a concept into a shot-by-shot storyboard and a structured brief a creator or editor can actually produce against.",
      },
      {
        title: "Tied to the advertising brief",
        body: "Every asset references your brand book and campaign objective, so creative and strategy never drift apart.",
      },
    ],
    aside: {
      label: "Formats it speaks",
      items: [
        { icon: Sparkles, title: "Concepts & hooks", body: "Angles and openers grounded in your positioning." },
        { icon: FileText, title: "Copy that fits", body: "Primary text, headlines, and descriptions per placement." },
        { icon: Layers, title: "Storyboards", body: "Shot-by-shot plans and briefs ready to hand off." },
      ],
    },
  },
  {
    id: "campaign-automation",
    eyebrow: "Meta campaign automation",
    icon: Layers,
    title: "Campaigns assembled from real products and approved assets.",
    body: "Avokado builds the full Meta hierarchy — campaign, ad sets, and ads — from your actual catalog and the creative you've signed off on. By default everything is created paused or as a draft, so the structure exists for you to review before a single impression is served.",
    capabilities: [
      {
        title: "Full campaign hierarchy",
        body: "Generate a coherent campaign, ad sets, and ads together, with naming and structure that stay readable as you scale.",
      },
      {
        title: "Built from your catalog",
        body: "Ads are populated from your real products — not stand-ins — so what you review is what would actually run.",
      },
      {
        title: "Only approved assets ship",
        body: "Campaigns can only draw on creative you've explicitly approved in the asset library, keeping unreviewed work out of live ads.",
      },
      {
        title: "Paused and draft by default",
        body: "New entities arrive paused or as drafts. Activation is a deliberate, separate step — campaigns never silently launch.",
      },
      {
        title: "Review before anything spends",
        body: "Inspect the whole structure, adjust it, and approve activation on your terms, within the limits your workspace enforces.",
      },
    ],
    aside: {
      label: "How it ships",
      items: [
        { icon: Layers, title: "Campaign → ad set → ad", body: "A complete, legible hierarchy generated as one unit." },
        { icon: ImageIcon, title: "Approved assets only", body: "Live ads can use signed-off creative exclusively." },
        { icon: PauseCircle, title: "Created paused", body: "Drafts by default; activation is always your call." },
      ],
    },
  },
  {
    id: "analytics",
    eyebrow: "Analytics & recommendations",
    icon: BarChart3,
    title: "Performance you can read, and advice that earns its confidence.",
    body: "See spend, ROAS, CPA, CTR, and the breakdowns that explain them in a calm, legible view. The AI analyst sits on top — but it only acts on data that has cleared validation thresholds, and every recommendation arrives with its evidence and a way to reverse it.",
    capabilities: [
      {
        title: "The metrics that matter",
        body: "Spend, ROAS, CPA, CTR, impressions, and conversions, presented clearly instead of buried in a dense reporting grid.",
      },
      {
        title: "Breakdowns and segments",
        body: "Slice performance by campaign, ad set, creative, and audience to understand what is genuinely working — and what isn't.",
      },
      {
        title: "An analyst that waits for signal",
        body: "Recommendations only fire once spend, impressions, and conversions clear minimum thresholds, so advice isn't built on noise.",
      },
      {
        title: "Evidence with every suggestion",
        body: "Each recommendation shows the numbers behind it and a confidence level, so you can judge it rather than take it on faith.",
      },
      {
        title: "Reversible by design",
        body: "Proposed actions describe exactly how to undo them, and nothing is applied to a live campaign without your approval.",
      },
    ],
    aside: {
      label: "The analyst's guardrails",
      items: [
        { icon: Gauge, title: "Validated data only", body: "No recommendation until the data crosses its thresholds." },
        { icon: BarChart3, title: "Shown its work", body: "Numbers and confidence attached to every suggestion." },
        { icon: History, title: "Always reversible", body: "Each action includes a clear path to undo it." },
      ],
    },
  },
  {
    id: "asset-library",
    eyebrow: "Asset library",
    icon: ImageIcon,
    title: "A home for every asset, with inspection kept apart from approval.",
    body: "Upload images, video, UGC, and logos straight to storage with resumable, signed transfers, then organize everything with folders and tags. Avokado can inspect and describe what it sees — but that analysis stays separate from the human approval that decides what is allowed into live ads.",
    capabilities: [
      {
        title: "Signed, direct-to-storage uploads",
        body: "Files go straight to storage over signed URLs, so large creative never has to round-trip through an intermediary.",
      },
      {
        title: "Resumable transfers",
        body: "Big videos and batches survive flaky connections — interrupted uploads pick up where they left off instead of starting over.",
      },
      {
        title: "Folders and tags",
        body: "Keep work organized by product, campaign, format, or creator, and find the right asset fast when it's time to build.",
      },
      {
        title: "AI inspection, clearly labelled",
        body: "Avokado can describe, categorize, and surface attributes of an asset to speed up triage — as assistance, never as a verdict.",
      },
      {
        title: "Approval is a separate gate",
        body: "Inspection never approves anything. A person decides what's cleared for use, and that decision is what campaigns honor.",
      },
    ],
    aside: {
      label: "Built for real files",
      items: [
        { icon: UploadCloud, title: "Resumable uploads", body: "Signed, direct-to-storage transfers that resume cleanly." },
        { icon: FolderTree, title: "Folders & tags", body: "Structure that keeps a growing library findable." },
        { icon: ShieldCheck, title: "Inspection ≠ approval", body: "AI assists triage; people decide what ships." },
      ],
    },
  },
  {
    id: "safety",
    eyebrow: "Safety & approval controls",
    icon: ShieldCheck,
    title: "The layer that makes everything above safe to use.",
    body: "Avokado never lets a language model directly change budgets or launch campaigns. Every action passes through a deterministic policy engine, sits behind hard limits and draft-first creation, and is written to an audit log. Roles decide who can do what — and an emergency stop is always within reach.",
    capabilities: [
      {
        title: "Deterministic policy engine",
        body: "Actions are validated by explicit, predictable rules — not model judgment — before anything is allowed to execute.",
      },
      {
        title: "Hard budget limits",
        body: "Workspace caps bound what any automation can spend. Budgets never change silently and never exceed the limits you set.",
      },
      {
        title: "Draft-first creation",
        body: "Campaigns and entities are created paused or as drafts. Going live is an explicit decision, every time.",
      },
      {
        title: "Full audit log",
        body: "Who did what, when, with before-and-after detail — so any change is accountable and easy to trace.",
      },
      {
        title: "Role-based access control",
        body: "Owner, admin, marketer, analyst, and viewer roles scope exactly what each member can see and do.",
      },
      {
        title: "Emergency stop",
        body: "Pause activity across the workspace immediately when you need to, no matter what automation is in flight.",
      },
    ],
    aside: {
      label: "Controls that never sleep",
      items: [
        { icon: ShieldCheck, title: "Policy engine", body: "Deterministic validation gates every action." },
        { icon: Users, title: "RBAC", body: "Five roles, clearly scoped permissions." },
        { icon: PauseCircle, title: "Emergency stop", body: "Halt everything across the workspace at once." },
      ],
    },
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-grain">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.52_0.105_135/0.10),transparent)]"
        />
        <div className="mx-auto max-w-3xl px-5 pb-12 pt-16 text-center lg:pt-24">
          <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1">
            <Sparkles className="size-3 text-primary" />
            What {APP_NAME} does
          </Badge>
          <h1 className="mt-5 text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            Six connected pieces, one{" "}
            <span className="text-primary">calm workspace</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">
            From understanding your brand to building, launching, and improving
            Meta campaigns — each part of Avokado is designed to be reviewable,
            grounded in real data, and safe by default.
          </p>
        </div>

        {/* Quick nav into each area */}
        <div className="mx-auto max-w-6xl px-5 pb-16">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.id} delay={(i % 3) * 0.06}>
                <a
                  href={`#${feature.id}`}
                  className="group flex h-full items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {feature.eyebrow}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      Jump to section
                      <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Feature sections, alternating */}
      {FEATURES.map((feature, index) => {
        const reversed = index % 2 === 1;
        return (
          <section
            key={feature.id}
            id={feature.id}
            className={
              "scroll-mt-24 border-t border-border " +
              (reversed ? "bg-card/40" : "bg-background")
            }
          >
            <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-14">
              {/* Prose + capabilities */}
              <Reveal className={reversed ? "lg:order-2" : undefined}>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <feature.icon className="size-5" />
                    </span>
                    <Badge variant="muted" className="rounded-full">
                      {feature.eyebrow}
                    </Badge>
                  </div>
                  <h2 className="mt-5 text-balance font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {feature.title}
                  </h2>
                  <p className="mt-4 max-w-xl text-pretty text-lg text-muted-foreground">
                    {feature.body}
                  </p>

                  <ul className="mt-8 space-y-5">
                    {feature.capabilities.map((cap) => (
                      <li key={cap.title} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">
                            {cap.title}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {cap.body}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              {/* Supporting aside */}
              <Reveal
                delay={0.1}
                className={
                  "lg:sticky lg:top-24 " + (reversed ? "lg:order-1" : undefined)
                }
              >
                <Card className="bg-card/80">
                  <CardHeader>
                    <CardDescription className="text-[11px] font-semibold uppercase tracking-wider">
                      {feature.aside.label}
                    </CardDescription>
                    <CardTitle className="font-display text-xl">
                      {feature.eyebrow}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {feature.aside.items.map((item) => (
                      <div
                        key={item.title}
                        className="flex items-start gap-3 rounded-xl border border-border bg-background/60 p-4"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <item.icon className="size-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.body}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </Reveal>
            </div>
          </section>
        );
      })}

      {/* CTA band */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-primary px-8 py-14 text-center text-primary-foreground sm:px-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,oklch(1_0_0/0.14),transparent)]"
            />
            <h2 className="relative font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              See all six working together.
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-primary-foreground/85">
              Start in demo mode — no store, no ad account, no risk. Explore the
              brand book, creative studio, campaigns, and analytics end to end,
              then connect the real thing when you&rsquo;re ready.
            </p>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" variant="secondary">
                <Link href="/register">
                  Create your workspace <ArrowRight className="size-4" />
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
          </div>
        </div>
      </section>
    </>
  );
}
