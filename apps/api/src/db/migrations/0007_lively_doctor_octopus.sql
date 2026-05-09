CREATE TABLE `news` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`excerpt` text NOT NULL,
	`content` text NOT NULL,
	`cover_image` text,
	`read_time` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`author_id` text NOT NULL,
	`category_id` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `news_category`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `news_author_id_idx` ON `news` (`author_id`);--> statement-breakpoint
CREATE INDEX `news_status_idx` ON `news` (`status`);--> statement-breakpoint
CREATE INDEX `news_category_id_idx` ON `news` (`category_id`);--> statement-breakpoint
CREATE INDEX `news_created_at_idx` ON `news` (`created_at`);--> statement-breakpoint
CREATE TABLE `news_category` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `news_category_name_unique` ON `news_category` (`name`);