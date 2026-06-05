import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { primaryId, softDelete, timestamps } from "./_helpers";
import { confidenceEnum, goalEnum, jobStatusEnum } from "./enums";
import { workspaces } from "./workspaces";
import { users } from "./auth";

export const brandProfiles = pgTable(
  "brand_profiles",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    storeId: text("store_id"),
    inspectionId: text("inspection_id"),
    name: text("name").notNull().default("Brand book"),
    // The full BrandIntelligence document (validated by Zod on write).
    data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
    completionScore: integer("completion_score").notNull().default(0),
    currentVersion: integer("current_version").notNull().default(1),
    generatedByModel: text("generated_by_model"),
    status: text("status").notNull().default("draft"),
    ...timestamps,
    ...softDelete,
  },
  (t) => [uniqueIndex("brand_profiles_workspace_idx").on(t.workspaceId)],
);

export const brandProfileVersions = pgTable(
  "brand_profile_versions",
  {
    id: primaryId(),
    brandProfileId: text("brand_profile_id")
      .notNull()
      .references(() => brandProfiles.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    data: jsonb("data").$type<Record<string, unknown>>().notNull(),
    changeSummary: text("change_summary"),
    createdByUserId: text("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    source: text("source").notNull().default("edit"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("brand_profile_versions_unique").on(
      t.brandProfileId,
      t.version,
    ),
  ],
);

export const brandEvidence = pgTable(
  "brand_evidence",
  {
    id: primaryId(),
    brandProfileId: text("brand_profile_id")
      .notNull()
      .references(() => brandProfiles.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    field: text("field").notNull(),
    sourceType: text("source_type").notNull(),
    sourceUrl: text("source_url"),
    excerpt: text("excerpt"),
    confidence: confidenceEnum("confidence").notNull().default("medium"),
    ...timestamps,
  },
  (t) => [index("brand_evidence_field_idx").on(t.brandProfileId, t.field)],
);

export const brandBookExports = pgTable(
  "brand_book_exports",
  {
    id: primaryId(),
    brandProfileId: text("brand_profile_id")
      .notNull()
      .references(() => brandProfiles.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    status: jobStatusEnum("status").notNull().default("queued"),
    fileKey: text("file_key"),
    fileUrl: text("file_url"),
    fileSize: integer("file_size"),
    requestedByUserId: text("requested_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    error: text("error"),
    ...timestamps,
  },
  (t) => [index("brand_book_exports_profile_idx").on(t.brandProfileId)],
);

export const advertisingBriefs = pgTable(
  "advertising_briefs",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull().default("Advertising brief"),
    primaryGoal: goalEnum("primary_goal"),
    // Structured AdvertisingBrief (business info, budget, goals, prefs).
    data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
    currency: text("currency").notNull().default("USD"),
    status: text("status").notNull().default("draft"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index("advertising_briefs_workspace_idx").on(t.workspaceId)],
);

export const strategyPlans = pgTable(
  "strategy_plans",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    briefId: text("brief_id").references(() => advertisingBriefs.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull().default("Strategy proposal"),
    // Structured StrategyPlan (structure, allocation, audiences, measurement).
    data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
    status: text("status").notNull().default("draft"),
    generatedByModel: text("generated_by_model"),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index("strategy_plans_workspace_idx").on(t.workspaceId)],
);
