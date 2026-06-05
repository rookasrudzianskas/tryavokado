import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Cloud,
  Eye,
  Globe,
  KeyRound,
  Lock,
  PauseCircle,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Reveal } from "@/components/marketing/reveal";

export const metadata: Metadata = {
  title: "Security",
  description:
    "How Avokado protects your secrets, your ad accounts, and your spend — encryption at rest, draft-first automation, SSRF-hardened inspection, RBAC, and a full audit log. Honest specifics, no certification claims.",
};

type Section = {
  icon: typeof ShieldCheck;
  eyebrow: string;
  title: string;
  intro: string;
  points: { term: string; detail: string }[];
};

const SECTIONS: Section[] = [
  {
    icon: KeyRound,
    eyebrow: "Secrets & tokens",
    title: "Your credentials are encrypted, isolated, and disposable",
    intro:
      "Avokado holds OAuth tokens and API keys for the platforms you connect. They are treated as the most sensitive data in the system and are kept away from anything a browser or a log file can reach.",
    points: [
      {
        term: "Encrypted at rest",
        detail:
          "Every third-party token and API key is encrypted with AES-256-GCM before it touches storage, using keys held in a managed secret store rather than in the database.",
      },
      {
        term: "Never sent to the browser",
        detail:
          "Decrypted secrets exist only server-side, for the duration of a single outbound API call. They are never serialized into pages, API responses, or client state.",
      },
      {
        term: "Never logged",
        detail:
          "Token values are redacted from request logs, error traces, and analytics. We log that a call happened, not the credential that authorized it.",
      },
      {
        term: "Revoked on disconnect",
        detail:
          "Disconnecting a store or ad account revokes the token with the provider where supported and deletes the encrypted copy from our systems.",
      },
    ],
  },
  {
    icon: Cloud,
    eyebrow: "Google Cloud authentication",
    title: "No private keys live in the application",
    intro:
      "Where Avokado talks to Google Cloud and Google Ads, it authenticates through platform-native identity instead of long-lived key files shipped inside the app.",
    points: [
      {
        term: "Application Default Credentials",
        detail:
          "Workloads resolve identity through ADC and Workload Identity, so credentials are issued by the platform at runtime rather than stored as files we manage.",
      },
      {
        term: "Managed secret store",
        detail:
          "Any configuration that must be a secret — client identifiers, refresh tokens — lives in a managed secret store with access scoped to the services that need it.",
      },
      {
        term: "Least-privilege service accounts",
        detail:
          "Service accounts are granted only the specific roles a task requires, and are separated by responsibility so one component cannot reach another's permissions.",
      },
      {
        term: "Rotated, not embedded",
        detail:
          "Credentials are rotated on a schedule, and there are no static private-key JSON files baked into application images or repositories.",
      },
    ],
  },
  {
    icon: PauseCircle,
    eyebrow: "Draft-first & approvals",
    title: "Avokado proposes. You approve. A policy engine enforces.",
    intro:
      "Nothing that spends money or changes a live campaign happens because a language model suggested it. Every state-changing action is gated behind explicit human approval and a deterministic check.",
    points: [
      {
        term: "Created paused by default",
        detail:
          "Campaigns, ad sets, and ads are built as drafts or paused entities. Going live is a separate, deliberate action you take.",
      },
      {
        term: "No silent budget changes",
        detail:
          "Budgets never change and campaigns never launch in the background. Each change is an explicit, reviewable step with a clear before and after.",
      },
      {
        term: "Deterministic policy engine",
        detail:
          "A rules-based engine — not the model — validates every proposed action against your settings before it can execute. The same input always yields the same decision.",
      },
      {
        term: "Hard workspace limits & emergency stop",
        detail:
          "Workspace-level caps bound what automation can ever do, and an emergency stop halts pending and automated actions across the workspace at once.",
      },
    ],
  },
  {
    icon: Globe,
    eyebrow: "Website inspection safety",
    title: "Fetching your store, safely and politely",
    intro:
      "Brand intelligence reads public pages from URLs you provide. That fetch path is hardened so it cannot be turned into a way to reach internal infrastructure.",
    points: [
      {
        term: "URL validation",
        detail:
          "Inputs must be well-formed public HTTP(S) URLs. Other schemes and malformed addresses are rejected before any request is made.",
      },
      {
        term: "SSRF protection",
        detail:
          "Resolved addresses are checked against private, loopback, and link-local ranges and the cloud metadata endpoint — requests to internal targets are blocked.",
      },
      {
        term: "Respects robots rules",
        detail:
          "The inspector honors robots directives and identifies itself, so it behaves like a well-mannered crawler against your site.",
      },
      {
        term: "Page, size & time limits",
        detail:
          "Crawls are bounded by a page count, a maximum response size, and request timeouts, so a single inspection cannot run away with resources.",
      },
    ],
  },
  {
    icon: ShieldCheck,
    eyebrow: "Application security",
    title: "Defense in depth across the whole app",
    intro:
      "Authorization is enforced on every request, and the surface area around it is protected with standard, well-understood controls.",
    points: [
      {
        term: "Workspace-scoped authorization",
        detail:
          "Every record belongs to a workspace, and each request is checked so members can only ever read or change data inside workspaces they belong to.",
      },
      {
        term: "Role-based access control",
        detail:
          "Five roles — Owner, Admin, Marketer, Analyst, and Viewer — gate what a member can do, from approving spend down to read-only access.",
      },
      {
        term: "CSRF & rate limiting",
        detail:
          "State-changing requests carry CSRF protection, and sensitive endpoints are rate limited to blunt abuse and brute-force attempts.",
      },
      {
        term: "Signed uploads & secure headers",
        detail:
          "Asset uploads use short-lived signed URLs, and responses ship strict security headers including a content security policy.",
      },
      {
        term: "Webhook signature verification",
        detail:
          "Inbound webhooks from connected platforms are rejected unless their cryptographic signature verifies, so we never act on a spoofed event.",
      },
    ],
  },
  {
    icon: ClipboardList,
    eyebrow: "Auditability",
    title: "A complete, reviewable record of every action",
    intro:
      "When something changes in your workspace, you can see exactly what happened, who caused it, and what the result was — for your own review and for accountability.",
    points: [
      {
        term: "Actor & action",
        detail:
          "Each entry records who acted — a specific member, an automation rule, or the system — and precisely what they did.",
      },
      {
        term: "Before & after",
        detail:
          "For changes to budgets, campaigns, and settings, the log captures the prior and resulting state so the difference is unambiguous.",
      },
      {
        term: "Result & source",
        detail:
          "Entries note whether an action succeeded or failed and the surface it came from — the dashboard, an automation rule, or an API call.",
      },
    ],
  },
];

const PRINCIPLES = [
  {
    icon: Lock,
    title: "Secrets stay server-side",
    body: "Encrypted at rest, redacted from logs, never shipped to the browser.",
  },
  {
    icon: ShieldAlert,
    title: "Spend is always gated",
    body: "A deterministic policy engine and your approval stand between intent and action.",
  },
  {
    icon: Eye,
    title: "Everything is observable",
    body: "A full audit log captures actor, action, before/after, and result.",
  },
];

export default function SecurityPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-grain">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-80 bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.52_0.105_135/0.10),transparent)]"
        />
        <div className="mx-auto max-w-3xl px-5 pb-12 pt-16 text-center lg:pt-24">
          <Reveal>
            <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1">
              <ShieldCheck className="size-3 text-primary" /> Security & trust
            </Badge>
            <h1 className="mt-5 text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              Built to protect your accounts and your spend
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">
              Avokado connects to your store and ad accounts and can build
              campaigns on your behalf. Here is concretely how we keep your
              credentials safe and make sure money only moves when you say so.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">
              This page describes the controls we have designed and implemented.
              It is intentionally specific and avoids claims we cannot stand
              behind — we do not assert any compliance certification.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Principles */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="grid gap-3 sm:grid-cols-3">
            {PRINCIPLES.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div className="h-full rounded-xl border border-border bg-card p-5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="size-5" />
                  </div>
                  <h2 className="mt-3 text-sm font-semibold text-foreground">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed sections */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
        <div className="grid gap-6">
          {SECTIONS.map((section, i) => (
            <Reveal key={section.eyebrow} delay={(i % 2) * 0.05}>
              <Card className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <section.icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {section.eyebrow}
                      </p>
                      <CardTitle className="mt-0.5 font-display text-xl tracking-tight sm:text-2xl">
                        {section.title}
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="mt-4 text-base leading-relaxed">
                    {section.intro}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Separator className="mb-6" />
                  <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                    {section.points.map((point) => (
                      <div key={point.term}>
                        <dt className="flex items-baseline gap-2 text-sm font-semibold text-foreground">
                          <span
                            aria-hidden
                            className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                          />
                          {point.term}
                        </dt>
                        <dd className="mt-1.5 pl-3.5 text-sm leading-relaxed text-muted-foreground">
                          {point.detail}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Responsible disclosure + CTA */}
      <section className="mx-auto max-w-5xl px-5 pb-20">
        <div className="grid gap-4 lg:grid-cols-2">
          <Reveal>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="font-display text-xl tracking-tight">
                  Responsible disclosure
                </CardTitle>
                <CardDescription className="mt-2 text-base leading-relaxed">
                  Found something that looks wrong? We want to hear about it.
                  Report a suspected vulnerability and we will investigate and
                  respond. Please give us a reasonable window to fix an issue
                  before sharing it publicly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <Link href="/contact">
                    Report a security concern{" "}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </Reveal>
          <Reveal delay={0.08}>
            <Card className="h-full bg-primary/[0.04]">
              <CardHeader>
                <CardTitle className="font-display text-xl tracking-tight">
                  See the safety model in practice
                </CardTitle>
                <CardDescription className="mt-2 text-base leading-relaxed">
                  Explore draft-first creation, approval gates, and the audit log
                  for yourself in demo mode — no store and no ad account
                  required.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/register">
                    Start in demo mode <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/how-it-works">How it works</Link>
                </Button>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </section>
    </>
  );
}
