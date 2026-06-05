import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { primaryId, timestamps } from "./_helpers";
import { connectionStatusEnum } from "./enums";
import { workspaces } from "./workspaces";

export const metaConnections = pgTable(
  "meta_connections",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    status: connectionStatusEnum("status").notNull().default("pending"),
    isMock: boolean("is_mock").notNull().default(false),
    adapter: text("adapter").notNull().default("mock"),
    metaUserId: text("meta_user_id"),
    metaUserName: text("meta_user_name"),
    // AES-256-GCM encrypted access token JSON. Never returned to client.
    encryptedToken: text("encrypted_token"),
    grantedScopes: text("granted_scopes").array(),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    // Active selections for campaign creation.
    selectedBusinessId: text("selected_business_id"),
    selectedAdAccountId: text("selected_ad_account_id"),
    selectedPageId: text("selected_page_id"),
    selectedInstagramId: text("selected_instagram_id"),
    selectedPixelId: text("selected_pixel_id"),
    selectedCatalogId: text("selected_catalog_id"),
    lastError: text("last_error"),
    lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [uniqueIndex("meta_connections_workspace_idx").on(t.workspaceId)],
);

export const metaBusinesses = pgTable(
  "meta_businesses",
  {
    id: primaryId(),
    connectionId: text("connection_id")
      .notNull()
      .references(() => metaConnections.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    externalId: text("external_id").notNull(),
    name: text("name").notNull(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("meta_businesses_unique").on(t.connectionId, t.externalId),
  ],
);

export const metaAdAccounts = pgTable(
  "meta_ad_accounts",
  {
    id: primaryId(),
    connectionId: text("connection_id")
      .notNull()
      .references(() => metaConnections.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    externalId: text("external_id").notNull(),
    name: text("name").notNull(),
    currency: text("currency"),
    timezone: text("timezone"),
    accountStatus: text("account_status"),
    disableReason: text("disable_reason"),
    fundingReady: boolean("funding_ready"),
    capabilities: jsonb("capabilities").$type<Record<string, unknown>>(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("meta_ad_accounts_unique").on(t.connectionId, t.externalId),
  ],
);

export const metaPages = pgTable(
  "meta_pages",
  {
    id: primaryId(),
    connectionId: text("connection_id")
      .notNull()
      .references(() => metaConnections.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    externalId: text("external_id").notNull(),
    name: text("name").notNull(),
    category: text("category"),
    ...timestamps,
  },
  (t) => [uniqueIndex("meta_pages_unique").on(t.connectionId, t.externalId)],
);

export const metaInstagramAccounts = pgTable(
  "meta_instagram_accounts",
  {
    id: primaryId(),
    connectionId: text("connection_id")
      .notNull()
      .references(() => metaConnections.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    externalId: text("external_id").notNull(),
    username: text("username").notNull(),
    pageExternalId: text("page_external_id"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("meta_instagram_unique").on(t.connectionId, t.externalId),
  ],
);

export const metaPixels = pgTable(
  "meta_pixels",
  {
    id: primaryId(),
    connectionId: text("connection_id")
      .notNull()
      .references(() => metaConnections.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    externalId: text("external_id").notNull(),
    name: text("name").notNull(),
    lastFiredAt: timestamp("last_fired_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [uniqueIndex("meta_pixels_unique").on(t.connectionId, t.externalId)],
);

export const metaCatalogs = pgTable(
  "meta_catalogs",
  {
    id: primaryId(),
    connectionId: text("connection_id")
      .notNull()
      .references(() => metaConnections.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    externalId: text("external_id").notNull(),
    name: text("name").notNull(),
    productCount: text("product_count"),
    ...timestamps,
  },
  (t) => [uniqueIndex("meta_catalogs_unique").on(t.connectionId, t.externalId)],
);
