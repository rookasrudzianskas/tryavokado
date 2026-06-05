"use client";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Boxes,
  Brain,
  CreditCard,
  Flame,
  Globe,
  HardDrive,
  Mail,
  ShoppingBag,
  Store,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useWorkspace } from "@/components/firebase/workspace-provider";
import { listStores } from "@/lib/firebase/stores";
import { getMetaConnection } from "@/lib/firebase/meta";
import { Button } from "@/components/ui/button";
import { publicEnv } from "@/lib/env-public";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DemoModePill } from "@/components/app/demo-mode-pill";
import { DemoBadge } from "@/components/app/demo-badge";
import { ConnectDemoStoreButton } from "@/components/integrations/connect-demo-store-button";
import { formatRelativeTime } from "@/lib/utils";
import type { EcommercePlatform } from "@/lib/constants";

type Status = "mock" | "configured" | "not_connected";

function StatusBadge({ status }: { status: Status }) {
  if (status === "configured") return <Badge variant="success">Configured</Badge>;
  if (status === "mock") return <Badge variant="warning">Mock</Badge>;
  return <Badge variant="muted">Not connected</Badge>;
}

const STORE_PLATFORMS: {
  platform: EcommercePlatform;
  name: string;
  icon: typeof ShoppingBag;
  description: string;
}[] = [
  { platform: "shopify", name: "Shopify", icon: ShoppingBag, description: "Import products, collections, and orders via OAuth." },
  { platform: "woocommerce", name: "WooCommerce", icon: Store, description: "Connect with store URL and REST API keys." },
  { platform: "website", name: "Website inspection", icon: Globe, description: "Inspect any public store URL, compliantly." },
];

export default function IntegrationsPage() {
  const { active } = useWorkspace();
  const { data: meta } = useQuery({
    queryKey: ["meta-conn", active?.id],
    enabled: !!active,
    queryFn: () => getMetaConnection(active!.id),
  });
  const { data: stores, isLoading } = useQuery({
    queryKey: ["stores", active?.id],
    enabled: !!active,
    queryFn: () => listStores(active!.id),
  });

  const services = [
    { name: "Firebase", icon: Flame, description: "Auth, Firestore, and Storage.", status: "configured" as Status },
    { name: "Google Vertex AI", icon: Brain, description: "Brand intelligence and structured generation.", status: "mock" as Status },
    { name: "Stripe", icon: CreditCard, description: "Avokado subscription & specialist billing.", status: (publicEnv.stripePublishableKey ? "configured" : "mock") as Status },
    { name: "Object storage", icon: HardDrive, description: "Direct-to-storage asset uploads (Firebase Storage).", status: "configured" as Status },
    { name: "Email", icon: Mail, description: "Transactional emails.", status: "mock" as Status },
    { name: "Analytics", icon: Activity, description: "Product analytics.", status: "mock" as Status },
  ];

  return (
    <>
      <PageHeader
        title="Integrations"
        description="Connect your store and ad platform, and review platform services."
      >
        <DemoModePill />
      </PageHeader>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Stores &amp; ad platforms</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {STORE_PLATFORMS.map((item) => {
            const store = stores?.find((s) => s.platform === item.platform);
            return (
              <Card key={item.platform}>
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-foreground">{item.name}</h3>
                      {isLoading ? (
                        <Skeleton className="h-5 w-20" />
                      ) : store ? (
                        <Badge variant="success">Connected</Badge>
                      ) : (
                        <Badge variant="muted">Not connected</Badge>
                      )}
                    </div>
                    {store ? (
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="truncate">{store.displayName}</span>
                        {store.isMock && <DemoBadge />}
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    )}
                    {store?.lastSyncedAt && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Synced {formatRelativeTime(store.lastSyncedAt)}
                      </p>
                    )}
                    <div className="mt-3">
                      <ConnectDemoStoreButton platform={item.platform} connected={Boolean(store)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Card>
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Boxes className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-foreground">Meta</h3>
                  {meta?.connected ? (
                    <Badge variant="success">Connected</Badge>
                  ) : (
                    <StatusBadge status="not_connected" />
                  )}
                </div>
                {meta?.connected ? (
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="truncate">
                      Ad account ready · {meta.readinessScore ?? "—"}/100
                    </span>
                    <DemoBadge />
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Businesses, ad accounts, pages, pixels, and catalogs.
                  </p>
                )}
                <div className="mt-3">
                  <Button asChild size="sm" variant={meta?.connected ? "outline" : "default"}>
                    <Link href="/integrations/meta">
                      {meta?.connected ? "Manage readiness" : "Connect Meta"}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Platform services</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((item) => (
            <Card key={item.name}>
              <CardContent className="space-y-2 p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <item.icon className="size-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-foreground">{item.name}</h3>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
