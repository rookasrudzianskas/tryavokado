"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Circle,
  Loader2,
  Megaphone,
  MessageSquare,
  Palette,
  PauseCircle,
  RotateCcw,
  Sparkles,
  TriangleAlert,
  UserRound,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";
import { AdPreview } from "@/components/brand/ad-preview";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { formatCurrency } from "@/lib/utils";
import { HUMAN_HELP } from "@/lib/constants";
import type { AdPlan, BrandPreview } from "@/lib/brand/types";

const STEPS = [
  "Analyzing your store",
  "Building your brand book",
  "Devising your ad strategy",
  "Writing your ad creative",
  "Drafting your campaign",
];

type Status = "running" | "done" | "error";

export default function GeneratePage() {
  const router = useRouter();
  const started = useRef(false);
  const [url, setUrl] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>("running");
  const [plan, setPlan] = useState<AdPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const target = new URLSearchParams(window.location.search).get("url");
    if (!target) {
      router.replace("/");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(target);

    const start = Date.now();
    const interval = setInterval(
      () => setStep((s) => Math.min(s + 1, STEPS.length - 1)),
      760,
    );

    (async () => {
      try {
        const res = await fetch("/api/brand/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: target }),
        });
        const json = await res.json();
        const elapsed = Date.now() - start;
        if (elapsed < 3800) await new Promise((r) => setTimeout(r, 3800 - elapsed));
        clearInterval(interval);
        setStep(STEPS.length);
        if (res.ok && json.plan) {
          setPlan(json.plan as AdPlan);
          setStatus("done");
        } else {
          setError(json.error ?? "We couldn't analyze that site.");
          setStatus("error");
        }
      } catch {
        clearInterval(interval);
        setError("Something went wrong. Please try again.");
        setStatus("error");
      }
    })();
  }, [router]);

  const domain = (() => {
    try {
      return url ? new URL(url).hostname.replace(/^www\./, "") : "";
    } catch {
      return url ?? "";
    }
  })();

  /* --------------------------------- error --------------------------------- */
  if (status === "error") {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-border bg-card text-warning">
          <TriangleAlert className="size-5" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-semibold text-foreground">
          We couldn&rsquo;t read {domain || "that site"}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{error}</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild variant="outline">
            <Link href="/">
              <RotateCcw className="size-4" /> Try another site
            </Link>
          </Button>
          <Button asChild>
            <Link href="/register">Explore in demo mode</Link>
          </Button>
        </div>
      </div>
    );
  }

  /* -------------------------------- running -------------------------------- */
  if (status === "running") {
    const pct = Math.round((step / STEPS.length) * 100);
    return (
      <div className="mx-auto max-w-xl px-5 py-24">
        <div className="text-center">
          <Badge variant="outline" className="gap-1.5">
            <Sparkles className="size-3 text-brand" /> Building your plan automatically
          </Badge>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-foreground">
            Designing an ad plan for{" "}
            <span className="bg-gradient-to-r from-foreground to-foreground/55 bg-clip-text text-transparent">
              {domain}
            </span>
          </h1>
        </div>
        <Card className="mt-10 overflow-hidden p-0">
          <div className="h-1 w-full bg-border/70">
            <div
              className="h-full bg-foreground transition-[width] duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <ol className="divide-y divide-border/60 p-2">
            {STEPS.map((label, i) => {
              const done = i < step;
              const current = i === step;
              return (
                <li key={label} className="flex items-center gap-3 px-4 py-3.5">
                  {done ? (
                    <span className="flex size-5 items-center justify-center rounded-full bg-brand/15 text-brand">
                      <Check className="size-3.5" />
                    </span>
                  ) : current ? (
                    <Loader2 className="size-5 animate-spin text-brand" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground/30" />
                  )}
                  <span
                    className={
                      done
                        ? "text-sm text-muted-foreground"
                        : current
                          ? "text-sm font-medium text-foreground"
                          : "text-sm text-muted-foreground/50"
                    }
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        </Card>
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Fully automatic. Reading only your public homepage — no account needed.
        </p>
      </div>
    );
  }

  /* --------------------------------- done ---------------------------------- */
  if (!plan) return null;
  const { brand, strategy, creatives, campaign } = plan;
  const stats: StatChip[] = [
    { value: strategy.angles.length, suffix: " ad angles" },
    { value: creatives.length, suffix: " ad concepts" },
    { value: campaign.adSets.length, suffix: " ad sets" },
    { value: strategy.dailyBudget, prefix: "€", suffix: "/day" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      {/* COVER */}
      <Reveal>
        <BrandCover brand={brand} domain={brand.domain} stats={stats} />
      </Reveal>

      <div className="mt-16 space-y-16 sm:mt-24 sm:space-y-24">
        {/* IDENTITY */}
        <section>
          <Reveal>
            <SectionHeader
              kicker="Visual identity"
              title="The brand, distilled"
              description={brand.summary}
            />
          </Reveal>
          <Reveal delay={0.05}>
            <div className="mt-8 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2">
                  <Palette className="size-4 text-brand" />
                  <h3 className="font-semibold text-foreground">Color palette</h3>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {brand.palette.map((c) => (
                    <div
                      key={c.name}
                      className="overflow-hidden rounded-xl border border-border"
                    >
                      <div className="aspect-square" style={{ backgroundColor: c.hex }} />
                      <div className="px-2.5 py-2">
                        <p className="text-xs font-medium text-foreground">{c.name}</p>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {c.hex}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-brand" />
                  <h3 className="font-semibold text-foreground">Voice &amp; tone</h3>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {brand.voice.map((v) => (
                    <span
                      key={v}
                      className="rounded-full border border-border bg-muted/40 px-4 py-2 text-sm font-medium text-foreground"
                    >
                      {v}
                    </span>
                  ))}
                </div>
                {brand.keywords.length > 0 && (
                  <>
                    <p className="mt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Themes
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {brand.keywords.map((k) => (
                        <span
                          key={k}
                          className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </Reveal>
        </section>

        {/* POSITIONING */}
        <section>
          <Reveal>
            <SectionHeader kicker="Positioning" title="Who we reach, and what we say" />
          </Reveal>
          <Reveal delay={0.05}>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-brand" />
                  <h3 className="font-semibold text-foreground">Primary audiences</h3>
                </div>
                <ul className="mt-4 space-y-3">
                  {brand.audience.map((a) => (
                    <li
                      key={a}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-brand" />
                  <h3 className="font-semibold text-foreground">Value props</h3>
                </div>
                <ul className="mt-4 space-y-3">
                  {brand.valueProps.map((v) => (
                    <li
                      key={v}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                      {v}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </section>

        {/* CREATIVE — showpiece */}
        <section>
          <Reveal>
            <SectionHeader
              kicker="Ad creative"
              title="Your ads, previewed in-feed"
              description="Three concepts — copy and art direction generated automatically in your brand's colors. Edit anything once you save."
            />
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {creatives.map((c, i) => (
              <Reveal key={c.name} delay={i * 0.06}>
                <div className="space-y-3">
                  <AdPreview concept={c} brand={brand} />
                  <div className="px-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-brand/90">
                      {c.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.angle}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* STRATEGY */}
        <section>
          <Reveal>
            <SectionHeader kicker="Strategy" title="How we’ll win attention" />
          </Reveal>
          <Reveal delay={0.05}>
            <div className="mt-8 rounded-2xl border border-border bg-card p-6">
              <div className="grid gap-6 sm:grid-cols-3">
                <Detail label="Objective" value={strategy.objective} />
                <Detail
                  label="Suggested budget"
                  value={`${formatCurrency(strategy.dailyBudget, strategy.currency)} / day`}
                />
                <Detail
                  label="Approach"
                  value={`Test ${strategy.angles.length} angles, scale the winners`}
                />
              </div>
              <p className="mt-5 border-t border-border/60 pt-4 text-sm text-muted-foreground">
                {strategy.testingPlan}
              </p>
            </div>
          </Reveal>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {strategy.angles.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.05}>
                <div className="h-full rounded-2xl border border-border bg-card p-6">
                  <div className="flex size-7 items-center justify-center rounded-full border border-brand/30 bg-brand/10 text-xs font-semibold text-brand">
                    {i + 1}
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{a.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    &ldquo;{a.hook}&rdquo;
                  </p>
                  <div className="mt-4 border-t border-border/60 pt-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Audience
                    </p>
                    <p className="mt-0.5 text-xs text-foreground/80">{a.audience}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CAMPAIGN */}
        <section>
          <Reveal>
            <SectionHeader
              kicker="Campaign"
              title="Ready to launch — as a draft"
              description="Created paused in your Meta account on sign-up. Nothing goes live without your explicit approval."
            />
          </Reveal>
          <Reveal delay={0.05}>
            <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Megaphone className="size-4 text-brand" />
                  <div>
                    <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                    <p className="text-xs text-muted-foreground">{campaign.objective}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <PauseCircle className="size-3" /> {campaign.status}
                  </Badge>
                  <Badge variant="muted">
                    {formatCurrency(campaign.dailyBudget, campaign.currency)}/day
                  </Badge>
                </div>
              </div>
              <div className="divide-y divide-border">
                {campaign.adSets.map((s) => (
                  <div
                    key={s.name}
                    className="flex flex-wrap items-center justify-between gap-2 px-6 py-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.audience}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{s.optimization}</Badge>
                      <Badge variant="muted">{s.ads} ads</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* CTA + HUMAN HELP */}
        <section>
          <Reveal>
            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8">
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-brand/60 to-transparent"
                />
                <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                  Save your plan &amp; launch — automatically
                </h2>
                <p className="mt-2 max-w-md text-muted-foreground">
                  Create your workspace to refine every section with AI, connect
                  your store and Meta, and turn this into paused campaign drafts in
                  a click.
                </p>
                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                  <Button asChild size="lg">
                    <Link href="/register">
                      Save &amp; continue <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/">
                      <RotateCcw className="size-4" /> Analyze another site
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card/60 p-6">
                <div className="flex items-center gap-2">
                  <UserRound className="size-4 text-brand" />
                  <h3 className="font-semibold text-foreground">Add human help</h3>
                  <Badge variant="muted" className="ml-auto">
                    Optional
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Everything above is automatic AI. If you&rsquo;d rather a senior
                  specialist review your plan and launch it with you, add it on.
                </p>
                <p className="mt-4 font-display text-2xl font-semibold text-foreground">
                  {formatCurrency(HUMAN_HELP.priceEur)}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    one-time
                  </span>
                </p>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link href="/register">Add a specialist</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );
}

/* -------------------------------- helpers --------------------------------- */

type StatChip = { value: number; prefix?: string; suffix: string };

function BrandCover({
  brand,
  domain,
  stats,
}: {
  brand: BrandPreview;
  domain: string;
  stats: StatChip[];
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
      {/* hairline grid + soft top highlight (monochrome, Vercel-style) */}
      <div aria-hidden className="absolute inset-0 bg-grid opacity-50 mask-fade-b" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(75% 55% at 18% 0%, oklch(1 0 0 / 0.07), transparent 60%)",
        }}
      />
      <div className="relative p-7 sm:p-12">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/50 px-2.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <Sparkles className="size-3" /> AI brand book
          </span>
          <span className="text-sm text-muted-foreground">{domain}</span>
        </div>
        <h1 className="mt-6 font-display text-5xl font-semibold leading-[0.95] tracking-tight text-foreground sm:text-7xl">
          {brand.companyName}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground sm:text-xl">
          {brand.tagline}
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {stats.map((s) => (
            <span
              key={s.suffix}
              className="inline-flex items-center rounded-full border border-border bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground"
            >
              {s.prefix}
              <AnimatedNumber value={s.value} />
              {s.suffix}
            </span>
          ))}
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <PauseCircle className="size-3" /> Draft — approval required
          </span>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-medium uppercase tracking-widest text-brand">{kicker}</p>
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      {description && <p className="mt-2 text-muted-foreground">{description}</p>}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
