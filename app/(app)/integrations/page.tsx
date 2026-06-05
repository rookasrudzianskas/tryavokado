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
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DemoModePill } from "@/components/app/demo-mode-pill";

export const metadata: Metadata = { title: "Integrations" };

type Status = "mock" | "configured" | "not_connected";

function StatusBadge({ status }: { status: Status }) {
  if (status === "configured")
    return <Badge variant="success">Configured</Badge>;
  if (status === "mock") return <Badge variant="warning">Mock</Badge>;
  return <Badge variant="muted">Not connected</Badge>;
}

export default async function IntegrationsPage() {
  await requireWorkspaceContext();

  const stores = [
    { name: "Shopify", icon: ShoppingBag, description: "Import products, collections, and orders via OAuth.", status: "not_connected" as Status },
    { name: "WooCommerce", icon: Store, description: "Connect with store URL and REST API keys.", status: "not_connected" as Status },
    { name: "Website inspection", icon: Globe, description: "Inspect any public store URL, compliantly.", status: "not_connected" as Status },
    { name: "Meta", icon: Boxes, description: "Businesses, ad accounts, pages, pixels, and catalogs.", status: "not_connected" as Status },
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
          {stores.map((item) => (
            <Card key={item.name}>
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium text-foreground">{item.name}</h3>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Guided connection flow ships in onboarding. Until then this
                    workspace uses labelled mock data.
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
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
