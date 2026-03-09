ALTER TABLE "movie" ADD COLUMN "watched" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "movie" ADD COLUMN "pinned" boolean DEFAULT false NOT NULL;