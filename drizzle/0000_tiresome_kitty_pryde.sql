CREATE TYPE "public"."approval_state" AS ENUM('draft', 'pending', 'approved', 'rejected', 'archived');--> statement-breakpoint
CREATE TYPE "public"."asset_status" AS ENUM('uploading', 'processing', 'ready', 'approved', 'rejected', 'archived', 'failed');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('image', 'video', 'logo', 'product_photo', 'ugc', 'testimonial', 'screenshot', 'graphic', 'document');--> statement-breakpoint
CREATE TYPE "public"."audit_result" AS ENUM('success', 'failure');--> statement-breakpoint
CREATE TYPE "public"."automation_action" AS ENUM('notify', 'pause_ad', 'pause_ad_set', 'increase_budget', 'reduce_budget', 'shift_budget');--> statement-breakpoint
CREATE TYPE "public"."campaign_objective" AS ENUM('sales', 'leads', 'traffic', 'awareness', 'engagement', 'app_promotion');--> statement-breakpoint
CREATE TYPE "public"."confidence_level" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."connection_status" AS ENUM('disconnected', 'pending', 'connected', 'error', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."entity_status" AS ENUM('draft', 'paused', 'active', 'archived', 'deleted', 'in_review', 'error');--> statement-breakpoint
CREATE TYPE "public"."funnel_stage" AS ENUM('awareness', 'consideration', 'conversion', 'retention');--> statement-breakpoint
CREATE TYPE "public"."advertising_goal" AS ENUM('sales', 'new_customers', 'product_launch', 'retargeting', 'lead_generation', 'creative_testing');--> statement-breakpoint
CREATE TYPE "public"."inspection_status" AS ENUM('queued', 'preparing', 'discovering', 'extracting', 'analyzing', 'building', 'complete', 'failed');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('queued', 'running', 'succeeded', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."model_call_status" AS ENUM('success', 'error', 'timeout');--> statement-breakpoint
CREATE TYPE "public"."ecommerce_platform" AS ENUM('shopify', 'woocommerce', 'website');--> statement-breakpoint
CREATE TYPE "public"."recommendation_status" AS ENUM('new', 'reviewing', 'approved', 'applied', 'dismissed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."recommendation_type" AS ENUM('pause_ad', 'keep_collecting', 'refresh_creative', 'test_new_hook', 'test_new_format', 'shift_budget', 'increase_budget', 'reduce_budget', 'investigate_landing_page', 'investigate_tracking', 'investigate_offer', 'add_retargeting', 'add_exclusions');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'none');--> statement-breakpoint
CREATE TYPE "public"."workspace_role" AS ENUM('owner', 'admin', 'marketer', 'analyst', 'viewer');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"active_workspace_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"active_workspace_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"actor_user_id" text,
	"actor_label" text,
	"action" text NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"source" text DEFAULT 'app' NOT NULL,
	"result" "audit_result" DEFAULT 'success' NOT NULL,
	"summary" text,
	"before" jsonb,
	"after" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "model_usage_records" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"provider" text DEFAULT 'vertex' NOT NULL,
	"model" text NOT NULL,
	"operation" text NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"latency_ms" integer,
	"status" "model_call_status" DEFAULT 'success' NOT NULL,
	"cost_micros" integer,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text,
	"kind" text DEFAULT 'info' NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"href" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"plan" text DEFAULT 'starter' NOT NULL,
	"status" "subscription_status" DEFAULT 'none' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" text DEFAULT 'false' NOT NULL,
	"seats" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"email" text NOT NULL,
	"role" "workspace_role" DEFAULT 'marketer' NOT NULL,
	"token" text NOT NULL,
	"invited_by_user_id" text,
	"accepted_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workspace_invitations_token_unique" UNIQUE("token"),
	CONSTRAINT "workspace_invitations_email_unique" UNIQUE("workspace_id","email")
);
--> statement-breakpoint
CREATE TABLE "workspace_members" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "workspace_role" DEFAULT 'viewer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"company_name" text,
	"primary_platform" text,
	"logo_asset_id" text,
	"onboarding_step" text DEFAULT 'created' NOT NULL,
	"onboarding_completed_at" timestamp with time zone,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"automation_enabled" text DEFAULT 'false' NOT NULL,
	"monthly_spend_limit" integer,
	"created_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "workspaces_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "connected_stores" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"platform" "ecommerce_platform" NOT NULL,
	"status" "connection_status" DEFAULT 'pending' NOT NULL,
	"is_mock" boolean DEFAULT false NOT NULL,
	"display_name" text NOT NULL,
	"domain" text,
	"external_store_id" text,
	"currency" text,
	"country" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"scopes" text[],
	"last_synced_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "inspected_pages" (
	"id" text PRIMARY KEY NOT NULL,
	"inspection_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"url" text NOT NULL,
	"page_type" text,
	"title" text,
	"status_code" integer,
	"extracted" jsonb,
	"screenshot_asset_id" text,
	"content_length" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_collections" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"store_id" text,
	"external_id" text,
	"title" text NOT NULL,
	"handle" text,
	"description" text,
	"product_external_ids" text[],
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"external_id" text,
	"title" text NOT NULL,
	"sku" text,
	"price" numeric(12, 2),
	"compare_at_price" numeric(12, 2),
	"inventory_quantity" integer,
	"available" boolean DEFAULT true NOT NULL,
	"options" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"store_id" text,
	"external_id" text,
	"title" text NOT NULL,
	"handle" text,
	"description" text,
	"status" text DEFAULT 'active' NOT NULL,
	"vendor" text,
	"product_type" text,
	"tags" text[],
	"price_min" numeric(12, 2),
	"price_max" numeric(12, 2),
	"currency" text,
	"image_urls" text[],
	"featured_image_url" text,
	"is_hero" boolean DEFAULT false NOT NULL,
	"margin" numeric(5, 2),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "store_credentials" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"encrypted_payload" text NOT NULL,
	"key_version" text DEFAULT 'v1' NOT NULL,
	"rotated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "website_inspections" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"store_id" text,
	"url" text NOT NULL,
	"normalized_domain" text NOT NULL,
	"status" "inspection_status" DEFAULT 'queued' NOT NULL,
	"is_mock" boolean DEFAULT false NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"robots_allowed" boolean,
	"pages_discovered" integer DEFAULT 0 NOT NULL,
	"pages_processed" integer DEFAULT 0 NOT NULL,
	"result" jsonb,
	"failure_reason" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "advertising_briefs" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text DEFAULT 'Advertising brief' NOT NULL,
	"primary_goal" "advertising_goal",
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "brand_book_exports" (
	"id" text PRIMARY KEY NOT NULL,
	"brand_profile_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"version" integer NOT NULL,
	"status" "job_status" DEFAULT 'queued' NOT NULL,
	"file_key" text,
	"file_url" text,
	"file_size" integer,
	"requested_by_user_id" text,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_evidence" (
	"id" text PRIMARY KEY NOT NULL,
	"brand_profile_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"field" text NOT NULL,
	"source_type" text NOT NULL,
	"source_url" text,
	"excerpt" text,
	"confidence" "confidence_level" DEFAULT 'medium' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_profile_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"brand_profile_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"version" integer NOT NULL,
	"data" jsonb NOT NULL,
	"change_summary" text,
	"created_by_user_id" text,
	"source" text DEFAULT 'edit' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"store_id" text,
	"inspection_id" text,
	"name" text DEFAULT 'Brand book' NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"completion_score" integer DEFAULT 0 NOT NULL,
	"current_version" integer DEFAULT 1 NOT NULL,
	"generated_by_model" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "strategy_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"brief_id" text,
	"name" text DEFAULT 'Strategy proposal' NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"generated_by_model" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "asset_analyses" (
	"id" text PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"status" "job_status" DEFAULT 'queued' NOT NULL,
	"detected_text" text,
	"detected_products" text[],
	"detected_logos" boolean,
	"detected_people" boolean,
	"composition" jsonb,
	"suggested_placements" text[],
	"suggested_crops" jsonb,
	"suggested_angles" text[],
	"compliance_flags" jsonb,
	"low_resolution" boolean,
	"unsupported_format" boolean,
	"confidence" "confidence_level" DEFAULT 'medium' NOT NULL,
	"model" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset_folders" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"parent_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset_tags" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"label" text NOT NULL,
	"color" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset_uploads" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"asset_id" text,
	"storage_key" text NOT NULL,
	"upload_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"bytes_total" integer,
	"bytes_received" integer DEFAULT 0 NOT NULL,
	"parts" jsonb,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"folder_id" text,
	"type" "asset_type" DEFAULT 'image' NOT NULL,
	"status" "asset_status" DEFAULT 'processing' NOT NULL,
	"approval" "approval_state" DEFAULT 'draft' NOT NULL,
	"is_mock" boolean DEFAULT false NOT NULL,
	"file_name" text NOT NULL,
	"title" text,
	"mime_type" text,
	"file_size" integer,
	"width" integer,
	"height" integer,
	"duration_ms" integer,
	"aspect_ratio" text,
	"checksum" text,
	"storage_key" text,
	"url" text,
	"thumbnail_url" text,
	"tags" text[],
	"rejection_note" text,
	"uploaded_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "creative_concepts" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"product_id" text,
	"audience" text,
	"funnel_stage" "funnel_stage" DEFAULT 'awareness' NOT NULL,
	"angle" text,
	"hook" text,
	"core_message" text,
	"proof" text,
	"objection_addressed" text,
	"cta" text,
	"recommended_format" text,
	"recommended_placements" text[],
	"required_asset_ids" text[],
	"compliance_notes" text,
	"approval" "approval_state" DEFAULT 'draft' NOT NULL,
	"generated_by_model" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "creative_variants" (
	"id" text PRIMARY KEY NOT NULL,
	"concept_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"variant_type" text NOT NULL,
	"primary_text" text,
	"headline" text,
	"description" text,
	"cta" text,
	"asset_id" text,
	"approval" "approval_state" DEFAULT 'draft' NOT NULL,
	"score" numeric(4, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meta_ad_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"connection_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"external_id" text NOT NULL,
	"name" text NOT NULL,
	"currency" text,
	"timezone" text,
	"account_status" text,
	"disable_reason" text,
	"funding_ready" boolean,
	"capabilities" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meta_businesses" (
	"id" text PRIMARY KEY NOT NULL,
	"connection_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"external_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meta_catalogs" (
	"id" text PRIMARY KEY NOT NULL,
	"connection_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"external_id" text NOT NULL,
	"name" text NOT NULL,
	"product_count" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meta_connections" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"status" "connection_status" DEFAULT 'pending' NOT NULL,
	"is_mock" boolean DEFAULT false NOT NULL,
	"adapter" text DEFAULT 'mock' NOT NULL,
	"meta_user_id" text,
	"meta_user_name" text,
	"encrypted_token" text,
	"granted_scopes" text[],
	"token_expires_at" timestamp with time zone,
	"selected_business_id" text,
	"selected_ad_account_id" text,
	"selected_page_id" text,
	"selected_instagram_id" text,
	"selected_pixel_id" text,
	"selected_catalog_id" text,
	"last_error" text,
	"last_checked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meta_instagram_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"connection_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"external_id" text NOT NULL,
	"username" text NOT NULL,
	"page_external_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meta_pages" (
	"id" text PRIMARY KEY NOT NULL,
	"connection_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"external_id" text NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meta_pixels" (
	"id" text PRIMARY KEY NOT NULL,
	"connection_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"external_id" text NOT NULL,
	"name" text NOT NULL,
	"last_fired_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ad_sets" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"external_id" text,
	"name" text NOT NULL,
	"status" "entity_status" DEFAULT 'paused' NOT NULL,
	"daily_budget" numeric(12, 2),
	"optimization_goal" text,
	"billing_event" text,
	"conversion_event" text,
	"targeting" jsonb,
	"placements" text[],
	"external_response" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ads" (
	"id" text PRIMARY KEY NOT NULL,
	"ad_set_id" text NOT NULL,
	"campaign_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"external_id" text,
	"external_creative_id" text,
	"name" text NOT NULL,
	"status" "entity_status" DEFAULT 'paused' NOT NULL,
	"concept_id" text,
	"primary_text" text,
	"headline" text,
	"description" text,
	"cta" text,
	"external_response" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "approvals" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"kind" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"status" "approval_state" DEFAULT 'pending' NOT NULL,
	"requested_by_user_id" text,
	"decided_by_user_id" text,
	"decided_at" timestamp with time zone,
	"payload" jsonb,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_executions" (
	"id" text PRIMARY KEY NOT NULL,
	"rule_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"status" text DEFAULT 'evaluated' NOT NULL,
	"triggered" boolean DEFAULT false NOT NULL,
	"blocked_reason" text,
	"evaluation" jsonb,
	"action_taken" jsonb,
	"requires_approval" boolean DEFAULT true NOT NULL,
	"approved_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"trigger" jsonb NOT NULL,
	"conditions" jsonb NOT NULL,
	"minimum_data" jsonb,
	"action" "automation_action" NOT NULL,
	"action_params" jsonb,
	"max_frequency" text DEFAULT 'daily' NOT NULL,
	"budget_limit" numeric(12, 2),
	"requires_approval" boolean DEFAULT true NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"last_executed_at" timestamp with time zone,
	"created_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "campaign_drafts" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"objective" "campaign_objective" DEFAULT 'sales' NOT NULL,
	"strategy_plan_id" text,
	"brief_id" text,
	"plan" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"daily_budget" numeric(12, 2),
	"lifetime_budget" numeric(12, 2),
	"currency" text DEFAULT 'USD' NOT NULL,
	"approval" "approval_state" DEFAULT 'draft' NOT NULL,
	"validation_warnings" jsonb,
	"approved_by_user_id" text,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"draft_id" text,
	"external_id" text,
	"name" text NOT NULL,
	"objective" "campaign_objective" DEFAULT 'sales' NOT NULL,
	"status" "entity_status" DEFAULT 'paused' NOT NULL,
	"is_mock" boolean DEFAULT false NOT NULL,
	"daily_budget" numeric(12, 2),
	"lifetime_budget" numeric(12, 2),
	"currency" text DEFAULT 'USD' NOT NULL,
	"start_at" timestamp with time zone,
	"end_at" timestamp with time zone,
	"external_response" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "creative_mappings" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"ad_id" text,
	"asset_id" text,
	"role" text DEFAULT 'primary' NOT NULL,
	"external_media_id" text,
	"external_media_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"type" text NOT NULL,
	"status" "job_status" DEFAULT 'queued' NOT NULL,
	"idempotency_key" text,
	"progress" integer DEFAULT 0 NOT NULL,
	"step" text,
	"input" jsonb,
	"result" jsonb,
	"error" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "performance_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"external_entity_id" text,
	"date" timestamp with time zone NOT NULL,
	"is_mock" boolean DEFAULT false NOT NULL,
	"spend" numeric(14, 2) DEFAULT '0' NOT NULL,
	"revenue" numeric(14, 2) DEFAULT '0' NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"reach" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"purchases" integer DEFAULT 0 NOT NULL,
	"add_to_cart" integer DEFAULT 0 NOT NULL,
	"checkouts" integer DEFAULT 0 NOT NULL,
	"frequency" numeric(6, 2),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"type" "recommendation_type" NOT NULL,
	"status" "recommendation_status" DEFAULT 'new' NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"reason" text,
	"confidence" "confidence_level" DEFAULT 'medium' NOT NULL,
	"supporting_metrics" jsonb,
	"expected_tradeoffs" text,
	"risks" text,
	"minimum_data_met" boolean DEFAULT false NOT NULL,
	"requires_approval" boolean DEFAULT true NOT NULL,
	"reversible_plan" jsonb,
	"next_review_at" timestamp with time zone,
	"generated_by_model" text,
	"applied_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_usage_records" ADD CONSTRAINT "model_usage_records_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connected_stores" ADD CONSTRAINT "connected_stores_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspected_pages" ADD CONSTRAINT "inspected_pages_inspection_id_website_inspections_id_fk" FOREIGN KEY ("inspection_id") REFERENCES "public"."website_inspections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspected_pages" ADD CONSTRAINT "inspected_pages_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_collections" ADD CONSTRAINT "product_collections_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_collections" ADD CONSTRAINT "product_collections_store_id_connected_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."connected_stores"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_store_id_connected_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."connected_stores"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_credentials" ADD CONSTRAINT "store_credentials_store_id_connected_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."connected_stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_credentials" ADD CONSTRAINT "store_credentials_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_inspections" ADD CONSTRAINT "website_inspections_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_inspections" ADD CONSTRAINT "website_inspections_store_id_connected_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."connected_stores"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advertising_briefs" ADD CONSTRAINT "advertising_briefs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_book_exports" ADD CONSTRAINT "brand_book_exports_brand_profile_id_brand_profiles_id_fk" FOREIGN KEY ("brand_profile_id") REFERENCES "public"."brand_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_book_exports" ADD CONSTRAINT "brand_book_exports_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_book_exports" ADD CONSTRAINT "brand_book_exports_requested_by_user_id_users_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_evidence" ADD CONSTRAINT "brand_evidence_brand_profile_id_brand_profiles_id_fk" FOREIGN KEY ("brand_profile_id") REFERENCES "public"."brand_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_evidence" ADD CONSTRAINT "brand_evidence_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_profile_versions" ADD CONSTRAINT "brand_profile_versions_brand_profile_id_brand_profiles_id_fk" FOREIGN KEY ("brand_profile_id") REFERENCES "public"."brand_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_profile_versions" ADD CONSTRAINT "brand_profile_versions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_profile_versions" ADD CONSTRAINT "brand_profile_versions_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_profiles" ADD CONSTRAINT "brand_profiles_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_plans" ADD CONSTRAINT "strategy_plans_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_plans" ADD CONSTRAINT "strategy_plans_brief_id_advertising_briefs_id_fk" FOREIGN KEY ("brief_id") REFERENCES "public"."advertising_briefs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_analyses" ADD CONSTRAINT "asset_analyses_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_analyses" ADD CONSTRAINT "asset_analyses_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_folders" ADD CONSTRAINT "asset_folders_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_tags" ADD CONSTRAINT "asset_tags_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_uploads" ADD CONSTRAINT "asset_uploads_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_uploads" ADD CONSTRAINT "asset_uploads_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_folder_id_asset_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."asset_folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creative_concepts" ADD CONSTRAINT "creative_concepts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creative_variants" ADD CONSTRAINT "creative_variants_concept_id_creative_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."creative_concepts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creative_variants" ADD CONSTRAINT "creative_variants_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creative_variants" ADD CONSTRAINT "creative_variants_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_ad_accounts" ADD CONSTRAINT "meta_ad_accounts_connection_id_meta_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."meta_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_ad_accounts" ADD CONSTRAINT "meta_ad_accounts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_businesses" ADD CONSTRAINT "meta_businesses_connection_id_meta_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."meta_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_businesses" ADD CONSTRAINT "meta_businesses_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_catalogs" ADD CONSTRAINT "meta_catalogs_connection_id_meta_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."meta_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_catalogs" ADD CONSTRAINT "meta_catalogs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_connections" ADD CONSTRAINT "meta_connections_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_instagram_accounts" ADD CONSTRAINT "meta_instagram_accounts_connection_id_meta_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."meta_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_instagram_accounts" ADD CONSTRAINT "meta_instagram_accounts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_pages" ADD CONSTRAINT "meta_pages_connection_id_meta_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."meta_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_pages" ADD CONSTRAINT "meta_pages_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_pixels" ADD CONSTRAINT "meta_pixels_connection_id_meta_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."meta_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_pixels" ADD CONSTRAINT "meta_pixels_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_sets" ADD CONSTRAINT "ad_sets_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_sets" ADD CONSTRAINT "ad_sets_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ads" ADD CONSTRAINT "ads_ad_set_id_ad_sets_id_fk" FOREIGN KEY ("ad_set_id") REFERENCES "public"."ad_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ads" ADD CONSTRAINT "ads_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ads" ADD CONSTRAINT "ads_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_requested_by_user_id_users_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_decided_by_user_id_users_id_fk" FOREIGN KEY ("decided_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_executions" ADD CONSTRAINT "automation_executions_rule_id_automation_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."automation_rules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_executions" ADD CONSTRAINT "automation_executions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_executions" ADD CONSTRAINT "automation_executions_approved_by_user_id_users_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_drafts" ADD CONSTRAINT "campaign_drafts_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_drafts" ADD CONSTRAINT "campaign_drafts_approved_by_user_id_users_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_draft_id_campaign_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."campaign_drafts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creative_mappings" ADD CONSTRAINT "creative_mappings_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creative_mappings" ADD CONSTRAINT "creative_mappings_ad_id_ads_id_fk" FOREIGN KEY ("ad_id") REFERENCES "public"."ads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_jobs" ADD CONSTRAINT "integration_jobs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_snapshots" ADD CONSTRAINT "performance_snapshots_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "audit_logs_workspace_idx" ON "audit_logs" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "model_usage_workspace_idx" ON "model_usage_records" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_workspace_idx" ON "notifications" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_workspace_idx" ON "subscriptions" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "subscriptions_stripe_customer_idx" ON "subscriptions" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "workspace_invitations_workspace_idx" ON "workspace_invitations" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_members_unique" ON "workspace_members" USING btree ("workspace_id","user_id");--> statement-breakpoint
CREATE INDEX "workspace_members_user_idx" ON "workspace_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workspaces_slug_idx" ON "workspaces" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "connected_stores_workspace_idx" ON "connected_stores" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "connected_stores_status_idx" ON "connected_stores" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "inspected_pages_inspection_idx" ON "inspected_pages" USING btree ("inspection_id");--> statement-breakpoint
CREATE INDEX "product_collections_workspace_idx" ON "product_collections" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "product_variants_product_idx" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "products_workspace_idx" ON "products" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_store_external_idx" ON "products" USING btree ("store_id","external_id");--> statement-breakpoint
CREATE UNIQUE INDEX "store_credentials_store_idx" ON "store_credentials" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "website_inspections_workspace_idx" ON "website_inspections" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "advertising_briefs_workspace_idx" ON "advertising_briefs" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "brand_book_exports_profile_idx" ON "brand_book_exports" USING btree ("brand_profile_id");--> statement-breakpoint
CREATE INDEX "brand_evidence_field_idx" ON "brand_evidence" USING btree ("brand_profile_id","field");--> statement-breakpoint
CREATE UNIQUE INDEX "brand_profile_versions_unique" ON "brand_profile_versions" USING btree ("brand_profile_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "brand_profiles_workspace_idx" ON "brand_profiles" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "strategy_plans_workspace_idx" ON "strategy_plans" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "asset_analyses_asset_idx" ON "asset_analyses" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "asset_folders_workspace_idx" ON "asset_folders" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "asset_tags_unique" ON "asset_tags" USING btree ("workspace_id","label");--> statement-breakpoint
CREATE INDEX "asset_uploads_workspace_idx" ON "asset_uploads" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "assets_workspace_idx" ON "assets" USING btree ("workspace_id","type");--> statement-breakpoint
CREATE INDEX "assets_status_idx" ON "assets" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "assets_checksum_idx" ON "assets" USING btree ("workspace_id","checksum");--> statement-breakpoint
CREATE INDEX "creative_concepts_workspace_idx" ON "creative_concepts" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "creative_variants_concept_idx" ON "creative_variants" USING btree ("concept_id");--> statement-breakpoint
CREATE UNIQUE INDEX "meta_ad_accounts_unique" ON "meta_ad_accounts" USING btree ("connection_id","external_id");--> statement-breakpoint
CREATE UNIQUE INDEX "meta_businesses_unique" ON "meta_businesses" USING btree ("connection_id","external_id");--> statement-breakpoint
CREATE UNIQUE INDEX "meta_catalogs_unique" ON "meta_catalogs" USING btree ("connection_id","external_id");--> statement-breakpoint
CREATE UNIQUE INDEX "meta_connections_workspace_idx" ON "meta_connections" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "meta_instagram_unique" ON "meta_instagram_accounts" USING btree ("connection_id","external_id");--> statement-breakpoint
CREATE UNIQUE INDEX "meta_pages_unique" ON "meta_pages" USING btree ("connection_id","external_id");--> statement-breakpoint
CREATE UNIQUE INDEX "meta_pixels_unique" ON "meta_pixels" USING btree ("connection_id","external_id");--> statement-breakpoint
CREATE INDEX "ad_sets_campaign_idx" ON "ad_sets" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "ads_ad_set_idx" ON "ads" USING btree ("ad_set_id");--> statement-breakpoint
CREATE INDEX "approvals_workspace_idx" ON "approvals" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "automation_executions_rule_idx" ON "automation_executions" USING btree ("rule_id");--> statement-breakpoint
CREATE INDEX "automation_rules_workspace_idx" ON "automation_rules" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "campaign_drafts_workspace_idx" ON "campaign_drafts" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "campaigns_workspace_idx" ON "campaigns" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "campaigns_external_idx" ON "campaigns" USING btree ("workspace_id","external_id");--> statement-breakpoint
CREATE INDEX "creative_mappings_ad_idx" ON "creative_mappings" USING btree ("ad_id");--> statement-breakpoint
CREATE INDEX "integration_jobs_workspace_idx" ON "integration_jobs" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "integration_jobs_idempotency_idx" ON "integration_jobs" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "performance_entity_idx" ON "performance_snapshots" USING btree ("workspace_id","entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "performance_unique_day" ON "performance_snapshots" USING btree ("entity_type","entity_id","date");--> statement-breakpoint
CREATE INDEX "recommendations_workspace_idx" ON "recommendations" USING btree ("workspace_id","status");