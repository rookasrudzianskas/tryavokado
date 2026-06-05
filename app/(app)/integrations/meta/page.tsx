"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  ArrowLeft,
  Boxes,
  Check,
  CircleAlert,
  CreditCard,
  Loader2,
  X,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/components/firebase/auth-provider";
import { useWorkspace } from "@/components/firebase/workspace-provider";
import {
  connectMeta,
  disconnectMeta,
  getMetaConnection,
  updateMetaSelection,
} from "@/lib/firebase/meta";
import { PageHeader } from "@/components/app/page-header";
import { DemoBadge } from "@/components/app/demo-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { roleAtLeast } from "@/lib/constants";
import type {
  MetaAdAccount,
  MetaBusiness,
  MetaCatalog,
  MetaInstagramAccount,
  MetaPage,
  MetaPermission,
  MetaPixel,
  MetaReadiness,
} from "@/lib/integrations/types";
import type { MetaConnectionDoc } from "@/lib/firebase/meta";

interface Overview {
  adapter: "mock" | "live";
  businesses: MetaBusiness[];
  adAccounts: MetaAdAccount[];
  pages: MetaPage[];
  instagram: MetaInstagramAccount[];
  permissions: MetaPermission[];
  catalogs: MetaCatalog[];
  pixels: MetaPixel[];
  readiness: MetaReadiness | null;
}

export default function MetaIntegrationPage() {
  const { user } = useAuth();
  const { active, role } = useWorkspace();
  const queryClient = useQueryClient();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const wsId = active?.id;
  const canManage = role ? roleAtLeast(role, "admin") : false;

  const { data, isLoading } = useQuery({
    queryKey: ["meta", wsId],
    enabled: !!wsId,
    queryFn: async () => {
      const res = await fetch("/api/meta/overview");
      const overview = (await res.json()) as Overview;
      const connection = await getMetaConnection(wsId!);
      return { overview, connection };
    },
  });

  const overview = data?.overview;
  const connection = data?.connection ?? null;
  const connected = connection?.connected ?? false;

  function refresh() {
    return queryClient.invalidateQueries({ queryKey: ["meta", wsId] });
  }

  async function handleConnect() {
    if (!wsId || !user || !overview) return;
    setBusy(true);
    try {
      await connectMeta(wsId, user.uid, {
        adapter: overview.adapter,
        businessId: overview.businesses[0]?.externalId ?? null,
        adAccountId: overview.adAccounts[0]?.externalId ?? null,
        pageId: overview.pages[0]?.externalId ?? null,
        instagramId: overview.instagram[0]?.externalId ?? null,
        pixelId: overview.pixels[0]?.externalId ?? null,
        catalogId: overview.catalogs[0]?.externalId ?? null,
        currency: overview.adAccounts[0]?.currency ?? null,
        timezone: overview.adAccounts[0]?.timezone ?? null,
        readinessScore: overview.readiness?.score ?? null,
      });
      await refresh();
      toast.success("Meta connected.", {
        description: "Demo account via the mock adapter.",
      });
    } catch {
      toast.error("Could not connect Meta.");
    } finally {
      setBusy(false);
    }
  }

  function setSelection(patch: Partial<MetaConnectionDoc>) {
    if (!wsId) return;
    startTransition(async () => {
      await updateMetaSelection(wsId, patch);
      await refresh();
    });
  }

  async function handleDisconnect() {
    if (!wsId || !user) return;
    setBusy(true);
    try {
      await disconnectMeta(wsId, user.uid);
      await refresh();
      toast.success("Meta disconnected.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Meta" description="Connect Facebook & Instagram advertising and check account readiness.">
        <Button asChild variant="ghost" size="sm">
          <Link href="/integrations">
            <ArrowLeft className="size-4" /> Integrations
          </Link>
        </Button>
        {connected && canManage && (
          <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={busy}>
            Disconnect
          </Button>
        )}
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : !connected ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Boxes className="size-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">Connect Meta</h2>
              <p className="mx-auto max-w-md text-sm text-muted-foreground">
                Link your Meta business to build campaigns from your products and
                approved assets — created paused, never launched without you. In
                demo mode this uses a labelled mock account.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleConnect} disabled={busy || !canManage}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                Connect demo Meta account
              </Button>
              {overview && <Badge variant="warning">{overview.adapter} adapter</Badge>}
            </div>
            {!canManage && (
              <p className="text-xs text-muted-foreground">
                You need the Admin role to connect Meta.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
          {/* Readiness */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Account readiness</CardTitle>
                <DemoBadge />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-3">
                  <span className="font-display text-4xl font-semibold text-primary">
                    {overview?.readiness?.score ?? "—"}
                  </span>
                  <span className="pb-1.5 text-sm text-muted-foreground">/ 100</span>
                  {overview?.readiness?.ready ? (
                    <Badge variant="success" className="mb-2 ml-auto gap-1">
                      <Check className="size-3" /> Ready to advertise
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="mb-2 ml-auto gap-1">
                      <CircleAlert className="size-3" /> Needs setup
                    </Badge>
                  )}
                </div>

                <Fact label="Billing" icon={CreditCard}>
                  {overview?.readiness?.fundingReady === null
                    ? "Not determinable — verify in Meta"
                    : overview?.readiness?.fundingReady
                      ? "Payment method ready"
                      : "Add a payment method in Meta"}
                </Fact>

                {overview?.readiness?.missingSteps.length ? (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Missing steps</p>
                    {overview.readiness.missingSteps.map((s) => (
                      <p key={s} className="flex items-center gap-2 text-sm text-foreground">
                        <CircleAlert className="size-3.5 text-warning" /> {s}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No outstanding setup steps.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {overview?.permissions.map((p) => (
                  <div key={p.permission} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-xs text-muted-foreground">{p.permission}</span>
                    {p.granted ? (
                      <Check className="size-4 text-success" />
                    ) : (
                      <X className="size-4 text-destructive" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Selections */}
          <Card>
            <CardHeader>
              <CardTitle>Selected assets</CardTitle>
              <p className="text-sm text-muted-foreground">
                These are used when building and launching campaigns.
              </p>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Business"
                value={connection?.businessId ?? undefined}
                options={(overview?.businesses ?? []).map((b) => ({ value: b.externalId, label: b.name }))}
                onChange={(v) => setSelection({ businessId: v })}
                disabled={pending || !canManage}
              />
              <SelectField
                label="Ad account"
                value={connection?.adAccountId ?? undefined}
                options={(overview?.adAccounts ?? []).map((a) => ({
                  value: a.externalId,
                  label: `${a.name} (${a.currency})`,
                }))}
                onChange={(v) => {
                  const acct = overview?.adAccounts.find((a) => a.externalId === v);
                  setSelection({ adAccountId: v, currency: acct?.currency ?? null, timezone: acct?.timezone ?? null });
                }}
                disabled={pending || !canManage}
              />
              <SelectField
                label="Facebook Page"
                value={connection?.pageId ?? undefined}
                options={(overview?.pages ?? []).map((p) => ({ value: p.externalId, label: p.name }))}
                onChange={(v) => setSelection({ pageId: v })}
                disabled={pending || !canManage}
              />
              <SelectField
                label="Instagram"
                value={connection?.instagramId ?? undefined}
                options={(overview?.instagram ?? []).map((i) => ({ value: i.externalId, label: `@${i.username}` }))}
                onChange={(v) => setSelection({ instagramId: v })}
                disabled={pending || !canManage}
              />
              <SelectField
                label="Pixel / dataset"
                value={connection?.pixelId ?? undefined}
                options={(overview?.pixels ?? []).map((p) => ({ value: p.externalId, label: p.name }))}
                onChange={(v) => setSelection({ pixelId: v })}
                disabled={pending || !canManage}
              />
              <SelectField
                label="Product catalog"
                value={connection?.catalogId ?? undefined}
                options={(overview?.catalogs ?? []).map((c) => ({ value: c.externalId, label: c.name }))}
                onChange={(v) => setSelection({ catalogId: v })}
                disabled={pending || !canManage}
              />

              <div className="grid grid-cols-2 gap-4 sm:col-span-2">
                <Fact label="Currency">{connection?.currency ?? "—"}</Fact>
                <Fact label="Timezone">{connection?.timezone ?? "—"}</Fact>
              </div>
              <p className="sm:col-span-2 text-xs text-muted-foreground">
                Connected via the <span className="font-medium">{connection?.adapter}</span> adapter.
                Switching to the live Marketing API or Meta Ads MCP requires real
                credentials and app review (see docs/meta-setup.md).
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

function Fact({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/60 px-3 py-2">
      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        {Icon && <Icon className="size-3" />}
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{children}</p>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: string | undefined;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Select…" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
