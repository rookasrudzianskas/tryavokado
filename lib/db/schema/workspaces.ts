import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { primaryId, softDelete, timestamps } from "./_helpers";
import {
  auditResultEnum,
  modelCallStatusEnum,
  subscriptionStatusEnum,
  workspaceRoleEnum,
} from "./enums";
import { users } from "./auth";

export const workspaces = pgTable(
  "workspaces",
  {
    id: primaryId(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    companyName: text("company_name"),
    primaryPlatform: text("primary_platform"),
    logoAssetId: text("logo_asset_id"),
    onboardingStep: text("onboarding_step").notNull().default("created"),
    onboardingCompletedAt: timestamp("onboarding_completed_at", {
      withTimezone: true,
    }),
    settings: jsonb("settings").$type<Record<string, unknown>>().default({}),
    automationEnabled: text("automation_enabled").notNull().default("false"),
    monthlySpendLimit: integer("monthly_spend_limit"),
    createdByUserId: text("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index("workspaces_slug_idx").on(t.slug)],
);

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: workspaceRoleEnum("role").notNull().default("viewer"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("workspace_members_unique").on(t.workspaceId, t.userId),
    index("workspace_members_user_idx").on(t.userId),
  ],
);

export const workspaceInvitations = pgTable(
  "workspace_invitations",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: workspaceRoleEnum("role").notNull().default("marketer"),
    token: text("token").notNull().unique(),
    invitedByUserId: text("invited_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (t) => [
    index("workspace_invitations_workspace_idx").on(t.workspaceId),
    unique("workspace_invitations_email_unique").on(t.workspaceId, t.email),
  ],
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    plan: text("plan").notNull().default("starter"),
    status: subscriptionStatusEnum("status").notNull().default("none"),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelAtPeriodEnd: text("cancel_at_period_end").notNull().default("false"),
    seats: integer("seats").notNull().default(1),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("subscriptions_workspace_idx").on(t.workspaceId),
    index("subscriptions_stripe_customer_idx").on(t.stripeCustomerId),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    actorUserId: text("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    actorLabel: text("actor_label"),
    action: text("action").notNull(),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    source: text("source").notNull().default("app"),
    result: auditResultEnum("result").notNull().default("success"),
    summary: text("summary"),
    before: jsonb("before").$type<Record<string, unknown>>(),
    after: jsonb("after").$type<Record<string, unknown>>(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("audit_logs_workspace_idx").on(t.workspaceId, t.createdAt),
    index("audit_logs_entity_idx").on(t.entityType, t.entityId),
  ],
);

export const notifications = pgTable(
  "notifications",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind").notNull().default("info"),
    title: text("title").notNull(),
    body: text("body"),
    href: text("href"),
    readAt: timestamp("read_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("notifications_workspace_idx").on(t.workspaceId, t.createdAt)],
);

export const modelUsageRecords = pgTable(
  "model_usage_records",
  {
    id: primaryId(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    provider: text("provider").notNull().default("vertex"),
    model: text("model").notNull(),
    operation: text("operation").notNull(),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    latencyMs: integer("latency_ms"),
    status: modelCallStatusEnum("status").notNull().default("success"),
    costMicros: integer("cost_micros"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("model_usage_workspace_idx").on(t.workspaceId, t.createdAt)],
);
