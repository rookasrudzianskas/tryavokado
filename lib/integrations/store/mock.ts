import type {
  CursorPage,
  StoreAdapter,
  StoreCollection,
  StoreConnectionInfo,
  StoreMetadata,
  StoreProduct,
  OrderSummary,
} from "../types";
import {
  DEMO_COLLECTIONS,
  DEMO_ORDER_SUMMARY,
  DEMO_PRODUCTS,
  DEMO_STORE,
} from "@/lib/mock/data";

/** Labelled mock store adapter — serves the demo dataset for Shopify or WooCommerce. */
export class MockStoreAdapter implements StoreAdapter {
  readonly mode = "mock" as const;

  constructor(
    private readonly platform: "shopify" | "woocommerce" = "shopify",
  ) {}

  async verifyConnection(): Promise<StoreConnectionInfo> {
    return {
      ok: true,
      platform: this.platform,
      displayName: DEMO_STORE.name,
      domain: DEMO_STORE.domain,
      currency: DEMO_STORE.currency,
      country: DEMO_STORE.country,
      isMock: true,
    };
  }

  async getStoreMetadata(): Promise<StoreMetadata> {
    return DEMO_STORE;
  }

  async listProducts(): Promise<CursorPage<StoreProduct>> {
    return { items: DEMO_PRODUCTS, nextCursor: null };
  }

  async listCollections(): Promise<StoreCollection[]> {
    return DEMO_COLLECTIONS;
  }

  async getOrderSummary(): Promise<OrderSummary> {
    return DEMO_ORDER_SUMMARY;
  }
}
