import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { primaryId, softDelete, timestamps } from "./_helpers";
import {
  connectionStatusEnum,
  inspectionStatusEnum,
  platformEnum,
} from "./enums";
import { workspaces } from "./workspaces";

export const connectedStores = pgTable(
  "connected_stores",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    platform: platformEnum("platform").notNull(),
    status: connectionStatusEnum("status").notNull().default("pending"),
    isMock: boolean("is_mock").notNull().default(false),
    displayName: text("display_name").notNull(),
    domain: text("domain"),
    externalStoreId: text("external_store_id"),
    currency: text("currency"),
    country: text("country"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    scopes: text("scopes").array(),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    lastError: text("last_error"),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    index("connected_stores_workspace_idx").on(t.workspaceId),
    index("connected_stores_status_idx").on(t.workspaceId, t.status),
  ],
);

/**
 * Encrypted credentials, kept in a SEPARATE table from connection metadata so
 * the encrypted blob is never accidentally serialized with store listings.
 */
export const storeCredentials = pgTable(
  "store_credentials",
  {
    id: primaryId(),
    storeId: text("store_id")
      .notNull()
      .references(() => connectedStores.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    // AES-256-GCM encrypted JSON. NEVER returned to the client.
    encryptedPayload: text("encrypted_payload").notNull(),
    keyVersion: text("key_version").notNull().default("v1"),
    rotatedAt: timestamp("rotated_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [uniqueIndex("store_credentials_store_idx").on(t.storeId)],
);

export const websiteInspections = pgTable(
  "website_inspections",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    storeId: text("store_id").references(() => connectedStores.id, {
      onDelete: "set null",
    }),
    url: text("url").notNull(),
    normalizedDomain: text("normalized_domain").notNull(),
    status: inspectionStatusEnum("status").notNull().default("queued"),
    isMock: boolean("is_mock").notNull().default(false),
    progress: integer("progress").notNull().default(0),
    robotsAllowed: boolean("robots_allowed"),
    pagesDiscovered: integer("pages_discovered").notNull().default(0),
    pagesProcessed: integer("pages_processed").notNull().default(0),
    result: jsonb("result").$type<Record<string, unknown>>(),
    failureReason: text("failure_reason"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("website_inspections_workspace_idx").on(t.workspaceId)],
);

export const inspectedPages = pgTable(
  "inspected_pages",
  {
    id: primaryId(),
    inspectionId: text("inspection_id")
      .notNull()
      .references(() => websiteInspections.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    pageType: text("page_type"),
    title: text("title"),
    statusCode: integer("status_code"),
    extracted: jsonb("extracted").$type<Record<string, unknown>>(),
    screenshotAssetId: text("screenshot_asset_id"),
    contentLength: integer("content_length"),
    ...timestamps,
  },
  (t) => [index("inspected_pages_inspection_idx").on(t.inspectionId)],
);

export const products = pgTable(
  "products",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    storeId: text("store_id").references(() => connectedStores.id, {
      onDelete: "set null",
    }),
    externalId: text("external_id"),
    title: text("title").notNull(),
    handle: text("handle"),
    description: text("description"),
    status: text("status").notNull().default("active"),
    vendor: text("vendor"),
    productType: text("product_type"),
    tags: text("tags").array(),
    priceMin: numeric("price_min", { precision: 12, scale: 2 }),
    priceMax: numeric("price_max", { precision: 12, scale: 2 }),
    currency: text("currency"),
    imageUrls: text("image_urls").array(),
    featuredImageUrl: text("featured_image_url"),
    isHero: boolean("is_hero").notNull().default(false),
    margin: numeric("margin", { precision: 5, scale: 2 }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    index("products_workspace_idx").on(t.workspaceId),
    uniqueIndex("products_store_external_idx").on(t.storeId, t.externalId),
  ],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: primaryId(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    externalId: text("external_id"),
    title: text("title").notNull(),
    sku: text("sku"),
    price: numeric("price", { precision: 12, scale: 2 }),
    compareAtPrice: numeric("compare_at_price", { precision: 12, scale: 2 }),
    inventoryQuantity: integer("inventory_quantity"),
    available: boolean("available").notNull().default(true),
    options: jsonb("options").$type<Record<string, string>>(),
    ...timestamps,
  },
  (t) => [index("product_variants_product_idx").on(t.productId)],
);

export const productCollections = pgTable(
  "product_collections",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    storeId: text("store_id").references(() => connectedStores.id, {
      onDelete: "set null",
    }),
    externalId: text("external_id"),
    title: text("title").notNull(),
    handle: text("handle"),
    description: text("description"),
    productExternalIds: text("product_external_ids").array(),
    imageUrl: text("image_url"),
    ...timestamps,
  },
  (t) => [index("product_collections_workspace_idx").on(t.workspaceId)],
);
