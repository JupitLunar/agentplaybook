CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'qualified', 'closed', 'converted');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."source_kind" AS ENUM('google_places', 'osm', 'official_site', 'manual', 'partner');--> statement-breakpoint
CREATE TYPE "public"."vertical" AS ENUM('wellness', 'travel', 'clinic', 'playground', 'industrial');--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"key_hash" varchar(255) NOT NULL,
	"scopes" jsonb DEFAULT '["read"]'::jsonb NOT NULL,
	"rate_limit" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "api_keys_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"action_type" varchar(64) NOT NULL,
	"vertical" "vertical" NOT NULL,
	"province" varchar(8) NOT NULL,
	"city" varchar(64),
	"email" varchar(255) NOT NULL,
	"phone" varchar(32),
	"name" varchar(128),
	"place_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"message" text,
	"requirements" text,
	"payload" jsonb DEFAULT '{}'::jsonb,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"priority" "priority" DEFAULT 'medium' NOT NULL,
	"assigned_to" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "places" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"vertical" "vertical" NOT NULL,
	"province" varchar(8) NOT NULL,
	"city" varchar(64) NOT NULL,
	"neighborhood" varchar(64),
	"address" text,
	"lat" real,
	"lng" real,
	"phone" varchar(32),
	"website" text,
	"booking_url" text,
	"description" text,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rating" real,
	"review_count" integer DEFAULT 0,
	"sources" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_verified" timestamp with time zone,
	"site_refs" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"raw_data" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leads_email_idx" ON "leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "leads_created_idx" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "places_province_idx" ON "places" USING btree ("province");--> statement-breakpoint
CREATE INDEX "places_city_idx" ON "places" USING btree ("city");--> statement-breakpoint
CREATE INDEX "places_vertical_idx" ON "places" USING btree ("vertical");--> statement-breakpoint
CREATE INDEX "places_tags_idx" ON "places" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "places_geo_idx" ON "places" USING btree ("lat","lng");--> statement-breakpoint
CREATE UNIQUE INDEX "places_slug_city_idx" ON "places" USING btree ("slug","city");