ALTER TABLE "categories" DROP CONSTRAINT "categories_name_parent_id_unique";--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_name_unique" UNIQUE("name");