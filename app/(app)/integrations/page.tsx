import type { Metadata } from "next";
import {
  Boxes,
  Brain,
  CreditCard,
  Globe,
  Mail,
  ShoppingBag,
  Store,
  Activity,
  HardDrive,
} from "lucide-react";
import { requireWorkspaceContext } from "@/lib/auth/session";
import { integrations as integrationStatus, isMockMode } from "@/lib/env";
import { listStores } from "@/lib/stores/queries";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DemoModePill } from "@/components/app/demo-mode-pill";
import { DemoBadge } from "@/components/app/demo-badge";
import { ConnectDemoStoreButton } from "@/components/integrations/connect-demo-store-button";
import { formatRelativeTime } from "@/lib/utils";
import type { EcommercePlatform } from "@/lib/constants";

export const metadata: Metadata = { title: "Integrations" };

type Status = "mock" | "configured" | "not_connected";

function StatusBadge({ status }: { status: Status }) {
  if (status === "configured")
    return <Badge variant="success">Configured</Badge>;
  if (status === "mock") return <Badge variant="warning">Mock</Badge>;
  return <Badge variant="muted">Not connected</Badge>;
}

export default async function IntegrationsPage() {
  const { workspace } = await requireWorkspaceContext();
  const connectedStores = await listStores(workspace.id);

  const storePlatforms: {
    platform: EcommercePlatform;
    name: string;
    icon: typeof ShoppingBag;
    description: string;
  }[] = [
    { platform: "shopify", name: "Shopify", icon: ShoppingBag, description: "Import products, collections, and orders via OAuth." },
    { platform: "woocommerce", name: "WooCommerce", icon: Store, description: "Connect with store URL and REST API keys." },
    { platform: "website", name: "Website inspection", icon: Globe, description: "Inspect any public store URL, compliantly." },
  ];

  const services = [
    { name: "Google Vertex AI", icon: Brain, description: "Brand intelligence and structured generation.", status: (isMockMode ? "mock" : integrationStatus.vertex ? "configured" : "mock") as Status },
    { name: "Object storage (R2)", icon: HardDrive, description: "Signed direct-to-storage asset uploads.", status: (integrationStatus.storage ? "configured" : "mock") as Status },
    { name: "Stripe", icon: CreditCard, description: "Avokado subscription billing.", status: (integrationStatus.stripe ? "configured" : "mock") as Status },
    { name: "Resend", icon: Mail, description: "Transactional emails.", status: (integrationStatus.email ? "configured" : "mock") as Status },
    { name: "PostHog", icon: Activity, description: "Product analytics.", status: (integrationStatus.posthog ? "configured" : "mock") as Status },
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
        <h2 className="text-sm font-semibold text-foreground">
          Stores &amp; ad platforms
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {storePlatforms.map((item) => {
            const store = connectedStores.find(
              (s) => s.platform === item.platform,
            );
            return (
              <Card key={item.platform}>
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-foreground">{item.name}</h3>
                      {store ? (
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
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                    {store?.lastSyncedAt && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Synced {formatRelativeTime(store.lastSyncedAt)}
                      </p>
                    )}
                    <div className="mt-3">
                      <ConnectDemoStoreButton
                        platform={item.platform}
                        connected={Boolean(store)}
                      />
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
                  <StatusBadge status={isMockMode ? "mock" : "not_connected"} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Businesses, ad accounts, pages, pixels, and catalogs.
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  The Meta readiness check and draft-first campaign flow run on
                  the labelled mock account in demo mode.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Platform services
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((item) => (
            <Card key={item.name}>
              <CardContent className="space-y-2 p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <item.icon className="size-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-foreground">
                      {item.name}
                    </h3>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
