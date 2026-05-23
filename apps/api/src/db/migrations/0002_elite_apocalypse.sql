CREATE TABLE `donor` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`position` text NOT NULL,
	`company` text NOT NULL,
	`donation_amount` integer,
	`message` text,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `donor_created_at_idx` ON `donor` (`created_at`);