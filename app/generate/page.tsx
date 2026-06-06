"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Circle,
  Loader2,
  MessageSquare,
  Palette,
  RotateCcw,
  Sparkles,
  Tag,
  TriangleAlert,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";
import type { BrandPreview } from "@/lib/brand/types";

const STEPS = [
  "Preparing",
  "Fetching your homepage",
  "Reading your content",
  "Detecting your brand identity",
  "Composing your brand book",
];

type Status = "running" | "done" | "error";

export default function GeneratePage() {
  const router = useRouter();
  const started = useRef(false);
  const [url, setUrl] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>("running");
  const [preview, setPreview] = useState<BrandPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const target = new URLSearchParams(window.location.search).get("url");
    if (!target) {
      router.replace("/");
      return;
    }
    // One-time hydration of the target URL from the query string.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(target);

    const start = Date.now();
    const interval = setInterval(
      () => setStep((s) => Math.min(s + 1, STEPS.length - 1)),
      750,
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
        if (elapsed < 3000) {
          await new Promise((r) => setTimeout(r, 3000 - elapsed));
        }
        clearInterval(interval);
        setStep(STEPS.length);
        if (res.ok && json.preview) {
          setPreview(json.preview as BrandPreview);
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
            <Sparkles className="size-3 text-brand" /> Drafting your brand book
          </Badge>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-foreground">
            Analyzing{" "}
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
                    className={cn(
                      "text-sm",
                      done && "text-muted-foreground",
                      current && "font-medium text-foreground",
                      !done && !current && "text-muted-foreground/50",
                    )}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        </Card>
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Reading only your public homepage. No account needed.
        </p>
      </div>
    );
  }

  if (!preview) return null;

  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <Reveal>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <Sparkles className="size-3 text-brand" /> Preview brand book
          </Badge>
          <span className="text-sm text-muted-foreground">{preview.domain}</span>
        </div>
        <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {preview.companyName}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-brand">{preview.tagline}</p>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
          {preview.summary}
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <Reveal delay={0.05}>
          <BookCard icon={Users} title="Primary audiences">
            <ul className="space-y-2">
              {preview.audience.map((a) => (
                <li key={a} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                  {a}
                </li>
              ))}
            </ul>
          </BookCard>
        </Reveal>

        <Reveal delay={0.1}>
          <BookCard icon={MessageSquare} title="Voice & tone">
            <div className="flex flex-wrap gap-2">
              {preview.voice.map((v) => (
                <Badge key={v} variant="muted">
                  {v}
                </Badge>
              ))}
            </div>
          </BookCard>
        </Reveal>

        <Reveal delay={0.05}>
          <BookCard icon={Sparkles} title="Value props">
            <ul className="space-y-2">
              {preview.valueProps.map((v) => (
                <li key={v} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                  {v}
                </li>
              ))}
            </ul>
          </BookCard>
        </Reveal>

        <Reveal delay={0.1}>
          <BookCard icon={Palette} title="Color palette">
            <div className="flex flex-wrap gap-3">
              {preview.palette.map((c) => (
                <div key={c.name} className="text-center">
                  <div
                    className="size-12 rounded-lg border border-border"
                    style={{ backgroundColor: c.hex }}
                  />
                  <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">
                    {c.name}
                  </p>
                  <p className="font-mono text-[10px] uppercase text-muted-foreground/60">
                    {c.hex}
                  </p>
                </div>
              ))}
            </div>
          </BookCard>
        </Reveal>

        {preview.keywords.length > 0 && (
          <Reveal delay={0.05} className="md:col-span-2">
            <BookCard icon={Tag} title="Keywords">
              <div className="flex flex-wrap gap-2">
                {preview.keywords.map((k) => (
                  <Badge key={k} variant="outline">
                    {k}
                  </Badge>
                ))}
              </div>
            </BookCard>
          </Reveal>
        )}
      </div>

      <Reveal delay={0.1}>
        <div className="relative mt-12 overflow-hidden rounded-2xl border border-border bg-card px-6 py-12 text-center sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-brand/60 to-transparent"
          />
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Make it yours, then build the campaigns
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Create your workspace to edit every section, refine it with AI, and
            turn it into Meta campaign drafts from your real products.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
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
          <p className="mt-5 text-xs text-muted-foreground">
            This preview is drafted from your public homepage. The full brand book
            is generated and editable inside your workspace.
          </p>
        </div>
      </Reveal>
    </div>
  );
}

function BookCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center gap-2 pb-3">
        <Icon className="size-4 text-brand" />
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
