import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { firestore } from "./client";
import { recordAudit } from "./data";
import {
  DEMO_PRODUCTS,
  DEMO_STORE,
} from "@/lib/mock/data";
import type { EcommercePlatform } from "@/lib/constants";
import type { ConnectedStoreDoc, ProductDoc } from "./types";

function millis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === "number") return value;
  return Date.now();
}
function millisOrNull(value: unknown): number | null {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === "number") return value;
  return null;
}

/**
 * Connect a labelled demo store and import its catalog into Firestore under
 * `workspaces/{id}/connectedStores` and `workspaces/{id}/products`.
 * Idempotent: deterministic ids mean reconnecting overwrites instead of dupes.
 */
export async function connectDemoStore(input: {
  workspaceId: string;
  platform: EcommercePlatform;
  uid: string;
  actorName: string;
}): Promise<{ productCount: number }> {
  const { workspaceId, platform } = input;
  const storeId = `mock-${platform}`;
  const batch = writeBatch(firestore);

  batch.set(
    doc(firestore, "workspaces", workspaceId, "connectedStores", storeId),
    {
      id: storeId,
      platform,
      status: "connected",
      isMock: true,
      displayName: DEMO_STORE.name,
      domain: DEMO_STORE.domain,
      currency: DEMO_STORE.currency,
      country: DEMO_STORE.country ?? null,
      productCount: DEMO_PRODUCTS.length,
      lastSyncedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
  );

  for (const p of DEMO_PRODUCTS) {
    batch.set(
      doc(firestore, "workspaces", workspaceId, "products", p.externalId),
      {
        id: p.externalId,
        externalId: p.externalId,
        storeId,
        title: p.title,
        handle: p.handle,
        description: p.description,
        status: p.status,
        tags: p.tags,
        priceMin: p.priceMin,
        priceMax: p.priceMax,
        currency: p.currency,
        featuredImageUrl: p.featuredImageUrl ?? null,
        isHero: p.tags.includes("hero") || p.tags.includes("bestseller"),
        createdAt: serverTimestamp(),
      },
    );
  }

  await batch.commit();

  await recordAudit(workspaceId, {
    action: "store.connected",
    actorUid: input.uid,
    actorLabel: input.actorName,
    entityType: "connected_store",
    entityId: storeId,
    summary: `Connected demo ${platform} store “${DEMO_STORE.name}” and imported ${DEMO_PRODUCTS.length} products.`,
  });

  return { productCount: DEMO_PRODUCTS.length };
}

export async function listStores(
  workspaceId: string,
): Promise<ConnectedStoreDoc[]> {
  const snap = await getDocs(
    collection(firestore, "workspaces", workspaceId, "connectedStores"),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: data.id,
      platform: data.platform,
      status: data.status,
      isMock: data.isMock,
      displayName: data.displayName,
      domain: data.domain ?? null,
      currency: data.currency,
      country: data.country ?? null,
      productCount: data.productCount ?? 0,
      lastSyncedAt: millisOrNull(data.lastSyncedAt),
      createdAt: millis(data.createdAt),
    };
  });
}

export async function listProducts(
  workspaceId: string,
): Promise<ProductDoc[]> {
  const snap = await getDocs(
    collection(firestore, "workspaces", workspaceId, "products"),
  );
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: data.id,
        externalId: data.externalId,
        storeId: data.storeId,
        title: data.title,
        handle: data.handle,
        description: data.description,
        status: data.status,
        tags: (data.tags as string[]) ?? [],
        priceMin: data.priceMin,
        priceMax: data.priceMax,
        currency: data.currency,
        featuredImageUrl: data.featuredImageUrl ?? null,
        isHero: data.isHero ?? false,
        createdAt: millis(data.createdAt),
      };
    })
    .sort((a, b) => Number(b.isHero) - Number(a.isHero));
}
