import { pgEnum } from "drizzle-orm/pg-core";

export const workspaceRoleEnum = pgEnum("workspace_role", [
  "owner",
  "admin",
  "marketer",
  "analyst",
  "viewer",
]);

export const platformEnum = pgEnum("ecommerce_platform", [
  "shopify",
  "woocommerce",
  "website",
]);

export const connectionStatusEnum = pgEnum("connection_status", [
  "disconnected",
  "pending",
  "connected",
  "error",
  "revoked",
]);

export const inspectionStatusEnum = pgEnum("inspection_status", [
  "queued",
  "preparing",
  "discovering",
  "extracting",
  "analyzing",
  "building",
  "complete",
  "failed",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "queued",
  "running",
  "succeeded",
  "failed",
  "cancelled",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete",
  "none",
]);

export const confidenceEnum = pgEnum("confidence_level", [
  "low",
  "medium",
  "high",
]);

export const approvalStateEnum = pgEnum("approval_state", [
  "draft",
  "pending",
  "approved",
  "rejected",
  "archived",
]);

export const assetTypeEnum = pgEnum("asset_type", [
  "image",
  "video",
  "logo",
  "product_photo",
  "ugc",
  "testimonial",
  "screenshot",
  "graphic",
  "document",
]);

export const assetStatusEnum = pgEnum("asset_status", [
  "uploading",
  "processing",
  "ready",
  "approved",
  "rejected",
  "archived",
  "failed",
]);

export const funnelStageEnum = pgEnum("funnel_stage", [
  "awareness",
  "consideration",
  "conversion",
  "retention",
]);

export const campaignObjectiveEnum = pgEnum("campaign_objective", [
  "sales",
  "leads",
  "traffic",
  "awareness",
  "engagement",
  "app_promotion",
]);

export const entityStatusEnum = pgEnum("entity_status", [
  "draft",
  "paused",
  "active",
  "archived",
  "deleted",
  "in_review",
  "error",
]);

export const recommendationTypeEnum = pgEnum("recommendation_type", [
  "pause_ad",
  "keep_collecting",
  "refresh_creative",
  "test_new_hook",
  "test_new_format",
  "shift_budget",
  "increase_budget",
  "reduce_budget",
  "investigate_landing_page",
  "investigate_tracking",
  "investigate_offer",
  "add_retargeting",
  "add_exclusions",
]);

export const recommendationStatusEnum = pgEnum("recommendation_status", [
  "new",
  "reviewing",
  "approved",
  "applied",
  "dismissed",
  "expired",
]);

export const automationActionEnum = pgEnum("automation_action", [
  "notify",
  "pause_ad",
  "pause_ad_set",
  "increase_budget",
  "reduce_budget",
  "shift_budget",
]);

export const auditResultEnum = pgEnum("audit_result", ["success", "failure"]);

export const goalEnum = pgEnum("advertising_goal", [
  "sales",
  "new_customers",
  "product_launch",
  "retargeting",
  "lead_generation",
  "creative_testing",
]);

export const modelCallStatusEnum = pgEnum("model_call_status", [
  "success",
  "error",
  "timeout",
]);
