CREATE TABLE `major` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`credits` integer,
	`duration` real,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `major_name_unique` ON `major` (`name`);--> statement-breakpoint
CREATE INDEX `major_is_active_idx` ON `major` (`is_active`);--> statement-breakpoint
CREATE INDEX `major_name_idx` ON `major` (`name`);