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
  Tag,
  Target,
  TriangleAlert,
  UserRound,
  Users,
  Wand2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reveal } from "@/components/marketing/reveal";
import { formatCurrency } from "@/lib/utils";
import { HUMAN_HELP } from "@/lib/constants";
import type { AdPlan } from "@/lib/brand/types";

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
      720,
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
        if (elapsed < 3600) await new Promise((r) => setTimeout(r, 3600 - elapsed));
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

  if (status === "running") {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24">
        <div className="text-center">
          <Badge variant="outline" className="gap-1.5">
            <Sparkles className="size-3 text-brand" /> Building your plan automatically
          </Badge>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-foreground">
            Building an ad plan for{" "}
            <span className="bg-gradient-to-r from-[oklch(0.84_0.16_142)] to-[oklch(0.72_0.13_215)] bg-clip-text text-transparent">
              {domain}
            </span>
          </h1>
        </div>
        <Card className="mt-10 p-2">
          <ol className="divide-y divide-border/60">
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

  if (!plan) return null;
  const { brand, strategy, creatives, campaign } = plan;

  return (
    <div className="mx-auto max-w-5xl px-5 py-14">
      <Reveal>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <Sparkles className="size-3 text-brand" /> AI-built ad plan
          </Badge>
          <span className="text-sm text-muted-foreground">{brand.domain}</span>
        </div>
        <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {brand.companyName}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-brand">{brand.tagline}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Stat>{strategy.angles.length} ad angles</Stat>
          <Stat>{creatives.length} ad concepts</Stat>
          <Stat>{campaign.adSets.length} ad sets</Stat>
          <Stat>{formatCurrency(strategy.dailyBudget, strategy.currency)}/day suggested</Stat>
          <Badge variant="warning" className="gap-1">
            <PauseCircle className="size-3" /> Draft — approval required
          </Badge>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <Tabs defaultValue="brand" className="mt-10">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="brand" className="gap-1.5">
              <Sparkles className="size-3.5" /> Brand book
            </TabsTrigger>
            <TabsTrigger value="strategy" className="gap-1.5">
              <Target className="size-3.5" /> Strategy
            </TabsTrigger>
            <TabsTrigger value="creative" className="gap-1.5">
              <Wand2 className="size-3.5" /> Creative
            </TabsTrigger>
            <TabsTrigger value="campaign" className="gap-1.5">
              <Megaphone className="size-3.5" /> Campaign
            </TabsTrigger>
          </TabsList>

          {/* Brand */}
          <TabsContent value="brand" className="grid gap-4 md:grid-cols-2">
            <PlanCard icon={MessageSquare} title="Voice & tone">
              <ChipRow items={brand.voice} />
            </PlanCard>
            <PlanCard icon={Users} title="Primary audiences">
              <BulletList items={brand.audience} />
            </PlanCard>
            <PlanCard icon={Sparkles} title="Value props">
              <BulletList items={brand.valueProps} check />
            </PlanCard>
            <PlanCard icon={Palette} title="Color palette">
              <div className="flex flex-wrap gap-3">
                {brand.palette.map((c) => (
                  <div key={c.name} className="text-center">
                    <div className="size-11 rounded-lg border border-border" style={{ backgroundColor: c.hex }} />
                    <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">{c.name}</p>
                  </div>
                ))}
              </div>
            </PlanCard>
            {brand.keywords.length > 0 && (
              <PlanCard icon={Tag} title="Keywords" className="md:col-span-2">
                <ChipRow items={brand.keywords} variant="outline" />
              </PlanCard>
            )}
          </TabsContent>

          {/* Strategy */}
          <TabsContent value="strategy" className="space-y-4">
            <PlanCard icon={Target} title="Objective">
              <p className="text-sm text-foreground">{strategy.objective}</p>
              <p className="mt-3 text-sm text-muted-foreground">{strategy.testingPlan}</p>
            </PlanCard>
            <div className="grid gap-4 md:grid-cols-3">
              {strategy.angles.map((a) => (
                <Card key={a.title} className="p-5">
                  <p className="text-xs font-medium uppercase tracking-widest text-brand/90">Angle</p>
                  <h3 className="mt-2 font-semibold text-foreground">{a.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">“{a.hook}”</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    <span className="text-foreground/70">Audience:</span> {a.audience}
                  </p>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Creative */}
          <TabsContent value="creative" className="grid gap-4 md:grid-cols-3">
            {creatives.map((c) => (
              <Card key={c.name} className="flex flex-col p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{c.name}</h3>
                  <Badge variant="muted">{c.format}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{c.angle}</p>
                <div className="mt-4 space-y-3 text-sm">
                  <Field label="Primary text">{c.primaryText}</Field>
                  <Field label="Headline">{c.headline}</Field>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-xs text-muted-foreground">CTA</span>
                  <Badge>{c.cta}</Badge>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Campaign */}
          <TabsContent value="campaign" className="space-y-4">
            <Card className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{campaign.objective}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning" className="gap-1">
                    <PauseCircle className="size-3" /> {campaign.status}
                  </Badge>
                  <Badge variant="muted">
                    {formatCurrency(campaign.dailyBudget, campaign.currency)}/day
                  </Badge>
                </div>
              </div>
              <div className="mt-5 space-y-2">
                {campaign.adSets.map((s) => (
                  <div
                    key={s.name}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-4 py-3"
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
            </Card>
            <p className="px-1 text-xs text-muted-foreground">
              Nothing is launched. On sign-up these are created as paused/draft
              entities in Meta and never go live without your explicit approval.
            </p>
          </TabsContent>
        </Tabs>
      </Reveal>

      {/* CTA + human help add-on */}
      <Reveal delay={0.1}>
        <div className="mt-12 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-brand/60 to-transparent"
            />
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Save your plan & launch — automatically
            </h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              Create your workspace to refine every section with AI, connect your
              store and Meta, and turn this into paused campaign drafts in a click.
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
              <Badge variant="muted" className="ml-auto">Optional</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything above is automatic AI. If you&rsquo;d rather a senior
              specialist review your plan and launch it with you, add it on.
            </p>
            <p className="mt-4 font-display text-2xl font-semibold text-foreground">
              {formatCurrency(HUMAN_HELP.priceEur)}
              <span className="text-sm font-normal text-muted-foreground"> one-time</span>
            </p>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link href="/register">Add a specialist</Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function Stat({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function PlanCard({
  icon: Icon,
  title,
  className,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={"h-full " + (className ?? "")}>
      <CardHeader className="flex-row items-center gap-2 pb-3">
        <Icon className="size-4 text-brand" />
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ChipRow({
  items,
  variant = "muted",
}: {
  items: string[];
  variant?: "muted" | "outline";
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((i) => (
        <Badge key={i} variant={variant}>
          {i}
        </Badge>
      ))}
    </div>
  );
}

function BulletList({ items, check }: { items: string[]; check?: boolean }) {
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
          {check ? (
            <Check className="mt-0.5 size-4 shrink-0 text-brand" />
          ) : (
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
          )}
          {i}
        </li>
      ))}
    </ul>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-foreground">{children}</p>
    </div>
  );
}
