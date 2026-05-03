CREATE TABLE `story` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`content` text NOT NULL,
	`category` text NOT NULL,
	`story_date` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	`author_id` text NOT NULL,
	`reviewed_by` text,
	`review_notes` text,
	`reviewed_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reviewed_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `story_author_id_idx` ON `story` (`author_id`);--> statement-breakpoint
CREATE INDEX `story_status_idx` ON `story` (`status`);--> statement-breakpoint
CREATE INDEX `story_category_idx` ON `story` (`category`);--> statement-breakpoint
CREATE INDEX `story_created_at_idx` ON `story` (`created_at`);