CREATE TABLE `connection` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`requester_id` text NOT NULL,
	`matched_user_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`message` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`requester_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`matched_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `conn_requester_idx` ON `connection` (`requester_id`);
--> statement-breakpoint
CREATE INDEX `conn_matched_user_idx` ON `connection` (`matched_user_id`);
--> statement-breakpoint
CREATE INDEX `conn_type_idx` ON `connection` (`type`);
--> statement-breakpoint
CREATE INDEX `conn_status_idx` ON `connection` (`status`);
--> statement-breakpoint
CREATE TABLE `user_connection_preference` (
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	PRIMARY KEY(`user_id`, `type`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
