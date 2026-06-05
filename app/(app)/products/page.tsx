import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Boxes, Star } from "lucide-react";
import { requireWorkspaceContext } from "@/lib/auth/session";
import { listProducts } from "@/lib/stores/queries";
import { isMockMode } from "@/lib/env";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { DemoBadge } from "@/components/app/demo-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Products" };

function priceLabel(min: string | null, max: string | null, currency?: string | null) {
  const lo = Number(min ?? 0);
  const hi = Number(max ?? 0);
  const cur = currency ?? "USD";
  if (!lo && !hi) return "—";
  if (lo === hi) return formatCurrency(lo, cur);
  return `${formatCurrency(lo, cur)} – ${formatCurrency(hi, cur)}`;
}

export default async function ProductsPage() {
  const { workspace } = await requireWorkspaceContext();
  const items = await listProducts(workspace.id);

  return (
    <>
      <PageHeader
        title="Products"
        description="Products imported from your connected store, ready to advertise."
      >
        {items.length > 0 && isMockMode && <DemoBadge />}
      </PageHeader>

      {items.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No products yet"
          description="Connect a store to import your catalog. In demo mode you can import a sample store in one click."
          action={
            <Button asChild>
              <Link href="/integrations">Connect a store</Link>
            </Button>
          }
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {items.length} products
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((product) => (
              <Card key={product.id} className="overflow-hidden p-0">
                <div className="relative aspect-square bg-muted">
                  {product.featuredImageUrl ? (
                    <Image
                      src={product.featuredImageUrl}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <Boxes className="size-8 text-muted-foreground/40" />
                    </div>
                  )}
                  {product.isHero && (
                    <Badge className="absolute left-3 top-3 gap-1 shadow-sm">
                      <Star className="size-3" /> Hero
                    </Badge>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 font-medium text-foreground">
                      {product.title}
                    </h3>
                    <span className="shrink-0 text-sm font-semibold text-foreground">
                      {priceLabel(product.priceMin, product.priceMax, product.currency)}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {product.description}
                  </p>
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {product.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="muted">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
}
