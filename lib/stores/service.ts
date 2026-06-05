import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  connectedStores,
  productCollections,
  productVariants,
  products,
  workspaces,
} from "@/lib/db/schema";
import { getStoreAdapter } from "@/lib/integrations/registry";
import { recordAudit } from "@/lib/audit";
import type { EcommercePlatform } from "@/lib/constants";

/**
 * Connect a labelled demo store and import its catalog into the workspace.
 * Idempotent: re-running refreshes the same mock store rather than duplicating it.
 * Real (live) store connection uses the same shape with encrypted OAuth/API
 * credentials — see docs/shopify-setup.md and docs/woocommerce-setup.md.
 */
export async function connectDemoStore(input: {
  workspaceId: string;
  platform: EcommercePlatform;
  userId: string;
}) {
  const platform = input.platform === "website" ? "shopify" : input.platform;
  const adapter = getStoreAdapter({ platform, isMockStore: true });

  const [connection, metadata, productPage, collections, orders] =
    await Promise.all([
      adapter.verifyConnection(),
      adapter.getStoreMetadata(),
      adapter.listProducts(),
      adapter.listCollections(),
      adapter.getOrderSummary(),
    ]);

  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(connectedStores)
      .where(
        and(
          eq(connectedStores.workspaceId, input.workspaceId),
          eq(connectedStores.platform, input.platform),
          eq(connectedStores.isMock, true),
        ),
      )
      .limit(1);

    const storeValues = {
      workspaceId: input.workspaceId,
      platform: input.platform,
      status: "connected" as const,
      isMock: true,
      displayName: connection.displayName,
      domain: connection.domain,
      currency: connection.currency,
      country: connection.country ?? null,
      metadata: { orders, description: metadata.description },
      lastSyncedAt: new Date(),
    };

    let storeId: string;
    if (existing) {
      storeId = existing.id;
      await tx
        .update(connectedStores)
        .set(storeValues)
        .where(eq(connectedStores.id, existing.id));
      // Clear prior demo catalog for a clean idempotent refresh.
      await tx.delete(products).where(eq(products.storeId, existing.id));
      await tx
        .delete(productCollections)
        .where(eq(productCollections.storeId, existing.id));
    } else {
      const [created] = await tx
        .insert(connectedStores)
        .values(storeValues)
        .returning({ id: connectedStores.id });
      storeId = created.id;
    }

    for (const p of productPage.items) {
      const [insertedProduct] = await tx
        .insert(products)
        .values({
          workspaceId: input.workspaceId,
          storeId,
          externalId: p.externalId,
          title: p.title,
          handle: p.handle,
          description: p.description,
          status: p.status,
          vendor: p.vendor ?? null,
          productType: p.productType ?? null,
          tags: p.tags,
          priceMin: p.priceMin.toString(),
          priceMax: p.priceMax.toString(),
          currency: p.currency,
          imageUrls: p.images.map((i) => i.url),
          featuredImageUrl: p.featuredImageUrl ?? null,
          isHero: p.tags.includes("hero") || p.tags.includes("bestseller"),
        })
        .returning({ id: products.id });

      if (p.variants.length) {
        await tx.insert(productVariants).values(
          p.variants.map((v) => ({
            productId: insertedProduct.id,
            workspaceId: input.workspaceId,
            externalId: v.externalId,
            title: v.title,
            sku: v.sku ?? null,
            price: v.price.toString(),
            compareAtPrice: v.compareAtPrice?.toString() ?? null,
            inventoryQuantity: v.inventoryQuantity ?? null,
            available: v.available,
            options: v.options ?? null,
          })),
        );
      }
    }

    if (collections.length) {
      await tx.insert(productCollections).values(
        collections.map((c) => ({
          workspaceId: input.workspaceId,
          storeId,
          externalId: c.externalId,
          title: c.title,
          handle: c.handle,
          description: c.description ?? null,
          productExternalIds: c.productExternalIds,
          imageUrl: c.imageUrl ?? null,
        })),
      );
    }

    await tx
      .update(workspaces)
      .set({ onboardingStep: "brand" })
      .where(eq(workspaces.id, input.workspaceId));

    await recordAudit(
      {
        workspaceId: input.workspaceId,
        action: "store.connected",
        actorUserId: input.userId,
        entityType: "connected_store",
        entityId: storeId,
        summary: `Connected demo ${input.platform} store “${connection.displayName}” and imported ${productPage.items.length} products.`,
        metadata: { isMock: true, products: productPage.items.length },
      },
      tx,
    );

    return { storeId, productCount: productPage.items.length };
  });
}
