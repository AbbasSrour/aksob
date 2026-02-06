CREATE TABLE `conversation` (
	`id` text PRIMARY KEY NOT NULL,
	`dm_key` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `conversation_dm_key_unique` ON `conversation` (`dm_key`);--> statement-breakpoint
CREATE TABLE `conversation_participant` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversation`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `conversation_participant_conversationId_idx` ON `conversation_participant` (`conversation_id`);--> statement-breakpoint
CREATE INDEX `conversation_participant_userId_idx` ON `conversation_participant` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `conversation_participant_conversation_user_unique` ON `conversation_participant` (`conversation_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `message` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversation`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sender_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `message_conversationId_idx` ON `message` (`conversation_id`);--> statement-breakpoint
CREATE INDEX `message_senderId_idx` ON `message` (`sender_id`);--> statement-breakpoint
CREATE INDEX `message_conversation_createdAt_idx` ON `message` (`conversation_id`,`created_at`);--> statement-breakpoint
ALTER TABLE `user` ADD `user_type` text DEFAULT 'student' NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `major` text DEFAULT 'BS in Business' NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `company` text;--> statement-breakpoint
ALTER TABLE `user` ADD `title` text;
