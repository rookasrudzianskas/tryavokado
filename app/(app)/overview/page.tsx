"use client";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  DollarSign,
  Megaphone,
  ShoppingCart,
  Sparkles,
  Target,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/firebase/auth-provider";
import { useWorkspace } from "@/components/firebase/workspace-provider";
import { subcollectionCount } from "@/lib/firebase/data";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function OverviewPage() {
  const { user } = useAuth();
  const { active } = useWorkspace();

  const { data, isLoading } = useQuery({
    queryKey: ["overview-progress", active?.id],
    enabled: !!active,
    queryFn: async () => {
      const wsId = active!.id;
      const [stores, products, brand, briefs, assets, campaigns] =
        await Promise.all([
          subcollectionCount(wsId, "connectedStores"),
          subcollectionCount(wsId, "products"),
          subcollectionCount(wsId, "brandProfiles"),
          subcollectionCount(wsId, "advertisingBriefs"),
          subcollectionCount(wsId, "assets"),
          subcollectionCount(wsId, "campaignDrafts"),
        ]);
      return { stores, products, brand, briefs, assets, campaigns };
    },
  });

  const steps = [
    { label: "Create your workspace", done: true, href: "/settings" },
    { label: "Connect a store or website", done: (data?.stores ?? 0) > 0, href: "/integrations" },
    { label: "Generate your brand book", done: (data?.brand ?? 0) > 0, href: "/brand" },
    { label: "Complete your advertising brief", done: (data?.briefs ?? 0) > 0, href: "/strategy" },
    { label: "Upload creative assets", done: (data?.assets ?? 0) > 0, href: "/assets" },
    { label: "Connect Meta", done: false, href: "/integrations" },
    { label: "Build a campaign draft", done: (data?.campaigns ?? 0) > 0, href: "/campaigns" },
  ];
  const completed = steps.filter((s) => s.done).length;
  const pct = Math.round((completed / steps.length) * 100);
  const firstName = user?.displayName?.split(" ")[0] ?? "there";

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={`Here's where ${active?.name ?? "your workspace"} stands today.`}
      >
        <Button asChild>
          <Link href="/integrations">
            Connect a store <ArrowRight className="size-4" />
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Spend (30d)" value="—" icon={DollarSign} hint="No data yet" />
        <StatCard label="ROAS" value="—" icon={BarChart3} hint="Connect Meta" />
        <StatCard label="Purchases" value="—" icon={ShoppingCart} hint="No data yet" />
        <StatCard label="Products" value={isLoading ? "…" : String(data?.products ?? 0)} icon={Megaphone} hint="Imported" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Getting started</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {completed} of {steps.length} steps complete
              </p>
            </div>
            <span className="font-display text-2xl font-semibold text-primary">
              {pct}%
            </span>
          </CardHeader>
          <CardContent className="space-y-1">
            <Progress value={pct} className="mb-4" />
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              steps.map((step) => (
                <Link
                  key={step.label}
                  href={step.href}
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/50"
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs",
                      step.done
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {step.done ? <Check className="size-3.5" /> : null}
                  </span>
                  <span
                    className={cn(
                      "flex-1 text-sm",
                      step.done
                        ? "text-muted-foreground line-through"
                        : "text-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                  {!step.done && (
                    <ArrowRight className="size-4 text-muted-foreground" />
                  )}
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Jump back in</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { icon: Sparkles, label: "Build your brand book", href: "/brand" },
                { icon: Target, label: "Define your strategy", href: "/strategy" },
                { icon: Megaphone, label: "Draft a campaign", href: "/campaigns" },
              ].map((action) => (
                <Button
                  key={action.href}
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href={action.href}>
                    <action.icon className="size-4 text-primary" />
                    {action.label}
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-primary/[0.04]">
            <CardContent className="space-y-2 p-5">
              <p className="text-sm font-medium text-foreground">
                Need a human?
              </p>
              <p className="text-sm text-muted-foreground">
                Connect a senior Avokado specialist to review what the AI built
                and help you launch.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-1">
                <Link href="/help">Talk to a human</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
