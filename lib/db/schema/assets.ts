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
  approvalStateEnum,
  assetStatusEnum,
  assetTypeEnum,
  confidenceEnum,
  funnelStageEnum,
  jobStatusEnum,
} from "./enums";
import { workspaces } from "./workspaces";
import { users } from "./auth";

export const assetFolders = pgTable(
  "asset_folders",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    parentId: text("parent_id"),
    ...timestamps,
  },
  (t) => [index("asset_folders_workspace_idx").on(t.workspaceId)],
);

export const assets = pgTable(
  "assets",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    folderId: text("folder_id").references(() => assetFolders.id, {
      onDelete: "set null",
    }),
    type: assetTypeEnum("type").notNull().default("image"),
    status: assetStatusEnum("status").notNull().default("processing"),
    approval: approvalStateEnum("approval").notNull().default("draft"),
    isMock: boolean("is_mock").notNull().default(false),
    fileName: text("file_name").notNull(),
    title: text("title"),
    mimeType: text("mime_type"),
    fileSize: integer("file_size"),
    width: integer("width"),
    height: integer("height"),
    durationMs: integer("duration_ms"),
    aspectRatio: text("aspect_ratio"),
    checksum: text("checksum"),
    storageKey: text("storage_key"),
    url: text("url"),
    thumbnailUrl: text("thumbnail_url"),
    // User-approved metadata, kept separate from AI analysis.
    tags: text("tags").array(),
    rejectionNote: text("rejection_note"),
    uploadedByUserId: text("uploaded_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    index("assets_workspace_idx").on(t.workspaceId, t.type),
    index("assets_status_idx").on(t.workspaceId, t.status),
    index("assets_checksum_idx").on(t.workspaceId, t.checksum),
  ],
);

export const assetUploads = pgTable(
  "asset_uploads",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    assetId: text("asset_id").references(() => assets.id, {
      onDelete: "cascade",
    }),
    storageKey: text("storage_key").notNull(),
    uploadId: text("upload_id"),
    status: text("status").notNull().default("pending"),
    bytesTotal: integer("bytes_total"),
    bytesReceived: integer("bytes_received").notNull().default(0),
    parts: jsonb("parts").$type<Record<string, unknown>[]>(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("asset_uploads_workspace_idx").on(t.workspaceId)],
);

/** AI-derived analysis, stored separately from user-approved asset metadata. */
export const assetAnalyses = pgTable(
  "asset_analyses",
  {
    id: primaryId(),
    assetId: text("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    status: jobStatusEnum("status").notNull().default("queued"),
    detectedText: text("detected_text"),
    detectedProducts: text("detected_products").array(),
    detectedLogos: boolean("detected_logos"),
    detectedPeople: boolean("detected_people"),
    composition: jsonb("composition").$type<Record<string, unknown>>(),
    suggestedPlacements: text("suggested_placements").array(),
    suggestedCrops: jsonb("suggested_crops").$type<Record<string, unknown>[]>(),
    suggestedAngles: text("suggested_angles").array(),
    complianceFlags: jsonb("compliance_flags").$type<Record<string, unknown>[]>(),
    lowResolution: boolean("low_resolution"),
    unsupportedFormat: boolean("unsupported_format"),
    confidence: confidenceEnum("confidence").notNull().default("medium"),
    model: text("model"),
    ...timestamps,
  },
  (t) => [uniqueIndex("asset_analyses_asset_idx").on(t.assetId)],
);

export const assetTags = pgTable(
  "asset_tags",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    color: text("color"),
    ...timestamps,
  },
  (t) => [uniqueIndex("asset_tags_unique").on(t.workspaceId, t.label)],
);

export const creativeConcepts = pgTable(
  "creative_concepts",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    productId: text("product_id"),
    audience: text("audience"),
    funnelStage: funnelStageEnum("funnel_stage").notNull().default("awareness"),
    angle: text("angle"),
    hook: text("hook"),
    coreMessage: text("core_message"),
    proof: text("proof"),
    objectionAddressed: text("objection_addressed"),
    cta: text("cta"),
    recommendedFormat: text("recommended_format"),
    recommendedPlacements: text("recommended_placements").array(),
    requiredAssetIds: text("required_asset_ids").array(),
    complianceNotes: text("compliance_notes"),
    approval: approvalStateEnum("approval").notNull().default("draft"),
    generatedByModel: text("generated_by_model"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index("creative_concepts_workspace_idx").on(t.workspaceId)],
);

export const creativeVariants = pgTable(
  "creative_variants",
  {
    id: primaryId(),
    conceptId: text("concept_id")
      .notNull()
      .references(() => creativeConcepts.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    variantType: text("variant_type").notNull(),
    primaryText: text("primary_text"),
    headline: text("headline"),
    description: text("description"),
    cta: text("cta"),
    assetId: text("asset_id").references(() => assets.id, {
      onDelete: "set null",
    }),
    approval: approvalStateEnum("approval").notNull().default("draft"),
    score: numeric("score", { precision: 4, scale: 2 }),
    ...timestamps,
  },
  (t) => [index("creative_variants_concept_idx").on(t.conceptId)],
);
