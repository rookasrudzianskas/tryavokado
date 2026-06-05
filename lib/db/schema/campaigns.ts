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
  automationActionEnum,
  campaignObjectiveEnum,
  confidenceEnum,
  entityStatusEnum,
  jobStatusEnum,
  recommendationStatusEnum,
  recommendationTypeEnum,
} from "./enums";
import { workspaces } from "./workspaces";
import { users } from "./auth";

export const campaignDrafts = pgTable(
  "campaign_drafts",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    objective: campaignObjectiveEnum("objective").notNull().default("sales"),
    strategyPlanId: text("strategy_plan_id"),
    briefId: text("brief_id"),
    // Full nested plan: campaign → ad sets → ads → creative variants.
    plan: jsonb("plan").$type<Record<string, unknown>>().notNull().default({}),
    dailyBudget: numeric("daily_budget", { precision: 12, scale: 2 }),
    lifetimeBudget: numeric("lifetime_budget", { precision: 12, scale: 2 }),
    currency: text("currency").notNull().default("EUR"),
    approval: approvalStateEnum("approval").notNull().default("draft"),
    validationWarnings: jsonb("validation_warnings").$type<
      Record<string, unknown>[]
    >(),
    approvedByUserId: text("approved_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index("campaign_drafts_workspace_idx").on(t.workspaceId)],
);

export const campaigns = pgTable(
  "campaigns",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    draftId: text("draft_id").references(() => campaignDrafts.id, {
      onDelete: "set null",
    }),
    externalId: text("external_id"),
    name: text("name").notNull(),
    objective: campaignObjectiveEnum("objective").notNull().default("sales"),
    status: entityStatusEnum("status").notNull().default("paused"),
    isMock: boolean("is_mock").notNull().default(false),
    dailyBudget: numeric("daily_budget", { precision: 12, scale: 2 }),
    lifetimeBudget: numeric("lifetime_budget", { precision: 12, scale: 2 }),
    currency: text("currency").notNull().default("EUR"),
    startAt: timestamp("start_at", { withTimezone: true }),
    endAt: timestamp("end_at", { withTimezone: true }),
    externalResponse: jsonb("external_response").$type<Record<string, unknown>>(),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    index("campaigns_workspace_idx").on(t.workspaceId, t.status),
    uniqueIndex("campaigns_external_idx").on(t.workspaceId, t.externalId),
  ],
);

export const adSets = pgTable(
  "ad_sets",
  {
    id: primaryId(),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    externalId: text("external_id"),
    name: text("name").notNull(),
    status: entityStatusEnum("status").notNull().default("paused"),
    dailyBudget: numeric("daily_budget", { precision: 12, scale: 2 }),
    optimizationGoal: text("optimization_goal"),
    billingEvent: text("billing_event"),
    conversionEvent: text("conversion_event"),
    targeting: jsonb("targeting").$type<Record<string, unknown>>(),
    placements: text("placements").array(),
    externalResponse: jsonb("external_response").$type<Record<string, unknown>>(),
    ...timestamps,
  },
  (t) => [index("ad_sets_campaign_idx").on(t.campaignId)],
);

export const ads = pgTable(
  "ads",
  {
    id: primaryId(),
    adSetId: text("ad_set_id")
      .notNull()
      .references(() => adSets.id, { onDelete: "cascade" }),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    externalId: text("external_id"),
    externalCreativeId: text("external_creative_id"),
    name: text("name").notNull(),
    status: entityStatusEnum("status").notNull().default("paused"),
    conceptId: text("concept_id"),
    primaryText: text("primary_text"),
    headline: text("headline"),
    description: text("description"),
    cta: text("cta"),
    externalResponse: jsonb("external_response").$type<Record<string, unknown>>(),
    ...timestamps,
  },
  (t) => [index("ads_ad_set_idx").on(t.adSetId)],
);

/** Links an ad/creative to the Avokado assets it was built from. */
export const creativeMappings = pgTable(
  "creative_mappings",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    adId: text("ad_id").references(() => ads.id, { onDelete: "cascade" }),
    assetId: text("asset_id"),
    role: text("role").notNull().default("primary"),
    externalMediaId: text("external_media_id"),
    externalMediaHash: text("external_media_hash"),
    ...timestamps,
  },
  (t) => [index("creative_mappings_ad_idx").on(t.adId)],
);

export const performanceSnapshots = pgTable(
  "performance_snapshots",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    externalEntityId: text("external_entity_id"),
    date: timestamp("date", { withTimezone: true }).notNull(),
    isMock: boolean("is_mock").notNull().default(false),
    spend: numeric("spend", { precision: 14, scale: 2 }).notNull().default("0"),
    revenue: numeric("revenue", { precision: 14, scale: 2 }).notNull().default("0"),
    impressions: integer("impressions").notNull().default(0),
    reach: integer("reach").notNull().default(0),
    clicks: integer("clicks").notNull().default(0),
    purchases: integer("purchases").notNull().default(0),
    addToCart: integer("add_to_cart").notNull().default(0),
    checkouts: integer("checkouts").notNull().default(0),
    frequency: numeric("frequency", { precision: 6, scale: 2 }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...timestamps,
  },
  (t) => [
    index("performance_entity_idx").on(t.workspaceId, t.entityType, t.entityId),
    uniqueIndex("performance_unique_day").on(t.entityType, t.entityId, t.date),
  ],
);

export const recommendations = pgTable(
  "recommendations",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    type: recommendationTypeEnum("type").notNull(),
    status: recommendationStatusEnum("status").notNull().default("new"),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    reason: text("reason"),
    confidence: confidenceEnum("confidence").notNull().default("medium"),
    supportingMetrics: jsonb("supporting_metrics").$type<Record<string, unknown>>(),
    expectedTradeoffs: text("expected_tradeoffs"),
    risks: text("risks"),
    minimumDataMet: boolean("minimum_data_met").notNull().default(false),
    requiresApproval: boolean("requires_approval").notNull().default(true),
    reversiblePlan: jsonb("reversible_plan").$type<Record<string, unknown>>(),
    nextReviewAt: timestamp("next_review_at", { withTimezone: true }),
    generatedByModel: text("generated_by_model"),
    appliedAt: timestamp("applied_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("recommendations_workspace_idx").on(t.workspaceId, t.status),
  ],
);

export const automationRules = pgTable(
  "automation_rules",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    trigger: jsonb("trigger").$type<Record<string, unknown>>().notNull(),
    conditions: jsonb("conditions").$type<Record<string, unknown>[]>().notNull(),
    minimumData: jsonb("minimum_data").$type<Record<string, unknown>>(),
    action: automationActionEnum("action").notNull(),
    actionParams: jsonb("action_params").$type<Record<string, unknown>>(),
    maxFrequency: text("max_frequency").notNull().default("daily"),
    budgetLimit: numeric("budget_limit", { precision: 12, scale: 2 }),
    requiresApproval: boolean("requires_approval").notNull().default(true),
    active: boolean("active").notNull().default(false),
    lastExecutedAt: timestamp("last_executed_at", { withTimezone: true }),
    createdByUserId: text("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index("automation_rules_workspace_idx").on(t.workspaceId)],
);

export const automationExecutions = pgTable(
  "automation_executions",
  {
    id: primaryId(),
    ruleId: text("rule_id")
      .notNull()
      .references(() => automationRules.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("evaluated"),
    triggered: boolean("triggered").notNull().default(false),
    blockedReason: text("blocked_reason"),
    evaluation: jsonb("evaluation").$type<Record<string, unknown>>(),
    actionTaken: jsonb("action_taken").$type<Record<string, unknown>>(),
    requiresApproval: boolean("requires_approval").notNull().default(true),
    approvedByUserId: text("approved_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("automation_executions_rule_idx").on(t.ruleId)],
);

export const approvals = pgTable(
  "approvals",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    status: approvalStateEnum("status").notNull().default("pending"),
    requestedByUserId: text("requested_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    decidedByUserId: text("decided_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    payload: jsonb("payload").$type<Record<string, unknown>>(),
    note: text("note"),
    ...timestamps,
  },
  (t) => [index("approvals_workspace_idx").on(t.workspaceId, t.status)],
);

export const integrationJobs = pgTable(
  "integration_jobs",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    status: jobStatusEnum("status").notNull().default("queued"),
    idempotencyKey: text("idempotency_key"),
    progress: integer("progress").notNull().default(0),
    step: text("step"),
    input: jsonb("input").$type<Record<string, unknown>>(),
    result: jsonb("result").$type<Record<string, unknown>>(),
    error: text("error"),
    attempts: integer("attempts").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("integration_jobs_workspace_idx").on(t.workspaceId, t.status),
    uniqueIndex("integration_jobs_idempotency_idx").on(t.idempotencyKey),
  ],
);
