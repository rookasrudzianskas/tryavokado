/**
 * Typed integration contracts. The rest of the application depends ONLY on these
 * interfaces — never on a concrete Shopify/WooCommerce/Meta/Vertex implementation.
 * Each integration ships a Mock adapter and a Live adapter selected at runtime by
 * `lib/integrations/registry.ts` based on AVOKADO_MODE and credential presence.
 */

export type AdapterMode = "mock" | "live";

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

// ---------------------------------------------------------------------------
// Store adapters (Shopify + WooCommerce share this contract)
// ---------------------------------------------------------------------------

export interface StoreConnectionInfo {
  ok: boolean;
  platform: "shopify" | "woocommerce";
  displayName: string;
  domain: string;
  currency: string;
  country?: string;
  isMock: boolean;
}

export interface StoreProductImage {
  url: string;
  alt?: string;
}

export interface StoreVariant {
  externalId: string;
  title: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  available: boolean;
  inventoryQuantity?: number;
  options?: Record<string, string>;
}

export interface StoreProduct {
  externalId: string;
  title: string;
  handle: string;
  description: string;
  status: "active" | "draft" | "archived";
  vendor?: string;
  productType?: string;
  tags: string[];
  priceMin: number;
  priceMax: number;
  currency: string;
  images: StoreProductImage[];
  featuredImageUrl?: string;
  variants: StoreVariant[];
}

export interface StoreCollection {
  externalId: string;
  title: string;
  handle: string;
  description?: string;
  imageUrl?: string;
  productExternalIds: string[];
}

export interface StoreMetadata {
  name: string;
  domain: string;
  description?: string;
  currency: string;
  country?: string;
  primaryColorHints?: string[];
}

export interface OrderSummary {
  available: boolean;
  currency: string;
  last30dRevenue?: number;
  last30dOrders?: number;
  averageOrderValue?: number;
}

export interface StoreAdapter {
  readonly mode: AdapterMode;
  verifyConnection(): Promise<StoreConnectionInfo>;
  getStoreMetadata(): Promise<StoreMetadata>;
  listProducts(cursor?: string): Promise<CursorPage<StoreProduct>>;
  listCollections(): Promise<StoreCollection[]>;
  getOrderSummary(): Promise<OrderSummary>;
}

// ---------------------------------------------------------------------------
// Meta adapter (Marketing API / MCP / Mock all implement this)
// ---------------------------------------------------------------------------

export interface MetaBusiness {
  externalId: string;
  name: string;
}
export interface MetaAdAccount {
  externalId: string;
  name: string;
  currency: string;
  timezone: string;
  accountStatus: string;
  disableReason?: string | null;
  fundingReady: boolean;
}
export interface MetaPage {
  externalId: string;
  name: string;
  category?: string;
}
export interface MetaInstagramAccount {
  externalId: string;
  username: string;
  pageExternalId?: string;
}
export interface MetaPixel {
  externalId: string;
  name: string;
  lastFiredAt?: string | null;
}
export interface MetaCatalog {
  externalId: string;
  name: string;
  productCount: number;
}
export interface MetaPermission {
  permission: string;
  granted: boolean;
}

export interface MetaReadiness {
  ready: boolean;
  score: number; // 0..100
  currency?: string;
  timezone?: string;
  fundingReady: boolean | null; // null when not programmatically determinable
  accountStatus?: string;
  restrictions: string[];
  missingSteps: string[];
}

export interface MetaCampaignData {
  externalId: string;
  name: string;
  objective: string;
  status: string;
  dailyBudget?: number;
}

export interface MetaInsightRow {
  date: string;
  entityType: "campaign" | "ad_set" | "ad" | "account";
  entityId: string;
  spend: number;
  revenue: number;
  impressions: number;
  reach: number;
  clicks: number;
  purchases: number;
  addToCart: number;
  checkouts: number;
}

export interface MetaUploadResult {
  mediaId: string;
  mediaHash?: string;
}
export interface MetaCreateResult {
  externalId: string;
  status: "PAUSED" | "ACTIVE" | "IN_PROCESS" | "WITH_ISSUES";
  raw?: Record<string, unknown>;
}

export interface MetaCampaignSpec {
  name: string;
  objective: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  // Entities are always created PAUSED. Activation is a separate, approved action.
  status: "PAUSED";
}

export interface MetaAdapter {
  readonly mode: AdapterMode;
  listBusinesses(): Promise<MetaBusiness[]>;
  listAdAccounts(businessId?: string): Promise<MetaAdAccount[]>;
  listPages(): Promise<MetaPage[]>;
  listInstagramAccounts(): Promise<MetaInstagramAccount[]>;
  listPixels(adAccountId: string): Promise<MetaPixel[]>;
  listCatalogs(businessId?: string): Promise<MetaCatalog[]>;
  checkPermissions(): Promise<MetaPermission[]>;
  getAdAccountReadiness(adAccountId: string): Promise<MetaReadiness>;
  fetchCampaigns(adAccountId: string): Promise<MetaCampaignData[]>;
  fetchInsights(params: {
    adAccountId: string;
    since: string;
    until: string;
    level: "account" | "campaign" | "ad_set" | "ad";
  }): Promise<MetaInsightRow[]>;
  uploadImage(input: { adAccountId: string; url: string; name: string }): Promise<MetaUploadResult>;
  uploadVideo(input: { adAccountId: string; url: string; name: string }): Promise<MetaUploadResult>;
  createCampaign(input: { adAccountId: string; spec: MetaCampaignSpec }): Promise<MetaCreateResult>;
  createAdSet(input: { adAccountId: string; campaignId: string; spec: Record<string, unknown> }): Promise<MetaCreateResult>;
  createAd(input: { adAccountId: string; adSetId: string; spec: Record<string, unknown> }): Promise<MetaCreateResult>;
  updateStatus(input: { entityId: string; status: "PAUSED" | "ACTIVE" }): Promise<MetaCreateResult>;
  pauseEntity(entityId: string): Promise<MetaCreateResult>;
}

// ---------------------------------------------------------------------------
// Vertex AI adapter (structured generation)
// ---------------------------------------------------------------------------

export interface ModelUsage {
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  model: string;
}

export interface VertexAdapter {
  readonly mode: AdapterMode;
  generateText(input: {
    prompt: string;
    system?: string;
    model?: string;
  }): Promise<{ text: string; usage: ModelUsage }>;
  /**
   * Generates JSON validated against a caller-provided validator. The Live adapter
   * uses Vertex structured output; the Mock adapter returns a deterministic fixture.
   */
  generateStructured<T>(input: {
    prompt: string;
    system?: string;
    model?: string;
    validate: (value: unknown) => T;
    mockValue: T;
  }): Promise<{ data: T; usage: ModelUsage }>;
}
