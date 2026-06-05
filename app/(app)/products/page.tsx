"use client";
import Image from "next/image";
import Link from "next/link";
import { Boxes, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useWorkspace } from "@/components/firebase/workspace-provider";
import { listProducts } from "@/lib/firebase/stores";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { DemoBadge } from "@/components/app/demo-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

function priceLabel(min: number, max: number, currency: string) {
  if (!min && !max) return "—";
  if (min === max) return formatCurrency(min, currency);
  return `${formatCurrency(min, currency)} – ${formatCurrency(max, currency)}`;
}

export default function ProductsPage() {
  const { active } = useWorkspace();
  const { data: items, isLoading } = useQuery({
    queryKey: ["products", active?.id],
    enabled: !!active,
    queryFn: () => listProducts(active!.id),
  });

  return (
    <>
      <PageHeader
        title="Products"
        description="Products imported from your connected store, ready to advertise."
      >
        {items && items.length > 0 && <DemoBadge />}
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      ) : !items || items.length === 0 ? (
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
          <p className="text-sm text-muted-foreground">{items.length} products</p>
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
                  {product.tags.length > 0 && (
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
