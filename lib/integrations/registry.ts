import "server-only";
import { env, integrations, isMockMode } from "@/lib/env";
import type { MetaAdapter, StoreAdapter, VertexAdapter } from "./types";
import { MockStoreAdapter } from "./store/mock";
import { MockMetaAdapter } from "./meta/mock";
import { MockVertexAdapter } from "./vertex/mock";
import { MetaMarketingApiAdapter, MetaMcpAdapter } from "./meta/live";

/**
 * Adapter selection. The rest of the app calls these and receives an interface —
 * never a concrete class. Selection rules:
 *  - mock mode, or the entity is a mock record, or required credentials are
 *    absent  -> labelled Mock adapter.
 *  - live mode + credentials present       -> Live adapter.
 */

export function getStoreAdapter(opts: {
  platform: "shopify" | "woocommerce";
  isMockStore?: boolean;
}): StoreAdapter {
  // Live store adapters use per-store encrypted credentials (Phase 2). Until a
  // real store is connected — and always in mock mode — serve the demo dataset.
  if (isMockMode || opts.isMockStore) return new MockStoreAdapter(opts.platform);
  return new MockStoreAdapter(opts.platform);
}

export function getMetaAdapter(opts?: {
  accessToken?: string;
  isMockConnection?: boolean;
}): MetaAdapter {
  if (
    isMockMode ||
    opts?.isMockConnection ||
    !integrations.meta ||
    !opts?.accessToken
  ) {
    return new MockMetaAdapter();
  }
  const ctx = {
    accessToken: opts.accessToken,
    apiVersion: env.META_GRAPH_API_VERSION,
  };
  return integrations.metaMcp
    ? new MetaMcpAdapter(ctx)
    : new MetaMarketingApiAdapter(ctx);
}

export function getVertexAdapter(): VertexAdapter {
  if (isMockMode || !integrations.vertex) return new MockVertexAdapter();
  // The live Vertex adapter is wired in the brand-intelligence phase; until then
  // live mode without that wiring uses the labelled mock rather than failing.
  return new MockVertexAdapter();
}
