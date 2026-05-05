CREATE TABLE `opportunity` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`company` text NOT NULL,
	`contact_email` text,
	`apply_url` text,
	`author_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`reviewed_by` text,
	`review_notes` text,
	`reviewed_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reviewed_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `opp_author_id_idx` ON `opportunity` (`author_id`);--> statement-breakpoint
CREATE INDEX `opp_status_idx` ON `opportunity` (`status`);--> statement-breakpoint
CREATE INDEX `opp_created_at_idx` ON `opportunity` (`created_at`);--> statement-breakpoint
CREATE TABLE `research` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`research_type` text NOT NULL,
	`institution` text NOT NULL,
	`department` text,
	`duration` text,
	`funding` text,
	`location` text,
	`start_date` integer,
	`deadline` integer,
	`education_level` text,
	`field_of_study` text,
	`experience_required` text,
	`skills_required` text,
	`additional_requirements` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`rejection_reason` text,
	`author_id` text NOT NULL,
	`reviewed_by` text,
	`reviewed_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reviewed_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `research_type_idx` ON `research` (`research_type`);--> statement-breakpoint
CREATE INDEX `research_status_idx` ON `research` (`status`);--> statement-breakpoint
CREATE INDEX `research_author_idx` ON `research` (`author_id`);--> statement-breakpoint
CREATE INDEX `research_created_at_idx` ON `research` (`created_at`);--> statement-breakpoint
DROP INDEX "account_userId_idx";--> statement-breakpoint
DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "session_userId_idx";--> statement-breakpoint
DROP INDEX "verification_identifier_idx";--> statement-breakpoint
DROP INDEX "conversation_participant_conversationId_idx";--> statement-breakpoint
DROP INDEX "conversation_participant_userId_idx";--> statement-breakpoint
DROP INDEX "conversation_participant_conversation_user_unique";--> statement-breakpoint
DROP INDEX "conversation_dm_key_unique";--> statement-breakpoint
DROP INDEX "message_conversationId_idx";--> statement-breakpoint
DROP INDEX "message_senderId_idx";--> statement-breakpoint
DROP INDEX "message_conversation_createdAt_idx";--> statement-breakpoint
DROP INDEX "major_name_unique";--> statement-breakpoint
DROP INDEX "major_is_active_idx";--> statement-breakpoint
DROP INDEX "major_name_idx";--> statement-breakpoint
DROP INDEX "opp_author_id_idx";--> statement-breakpoint
DROP INDEX "opp_status_idx";--> statement-breakpoint
DROP INDEX "opp_created_at_idx";--> statement-breakpoint
DROP INDEX "research_type_idx";--> statement-breakpoint
DROP INDEX "research_status_idx";--> statement-breakpoint
DROP INDEX "research_author_idx";--> statement-breakpoint
DROP INDEX "research_created_at_idx";--> statement-breakpoint
DROP INDEX "story_author_id_idx";--> statement-breakpoint
DROP INDEX "story_status_idx";--> statement-breakpoint
DROP INDEX "story_category_idx";--> statement-breakpoint
DROP INDEX "story_created_at_idx";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "user_phone_number_unique";--> statement-breakpoint
ALTER TABLE `user` ALTER COLUMN "major" TO "major" text;--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE INDEX `conversation_participant_conversationId_idx` ON `conversation_participant` (`conversation_id`);--> statement-breakpoint
CREATE INDEX `conversation_participant_userId_idx` ON `conversation_participant` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `conversation_participant_conversation_user_unique` ON `conversation_participant` (`conversation_id`,`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `conversation_dm_key_unique` ON `conversation` (`dm_key`);--> statement-breakpoint
CREATE INDEX `message_conversationId_idx` ON `message` (`conversation_id`);--> statement-breakpoint
CREATE INDEX `message_senderId_idx` ON `message` (`sender_id`);--> statement-breakpoint
CREATE INDEX `message_conversation_createdAt_idx` ON `message` (`conversation_id`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `major_name_unique` ON `major` (`name`);--> statement-breakpoint
CREATE INDEX `major_is_active_idx` ON `major` (`is_active`);--> statement-breakpoint
CREATE INDEX `major_name_idx` ON `major` (`name`);--> statement-breakpoint
CREATE INDEX `story_author_id_idx` ON `story` (`author_id`);--> statement-breakpoint
CREATE INDEX `story_status_idx` ON `story` (`status`);--> statement-breakpoint
CREATE INDEX `story_category_idx` ON `story` (`category`);--> statement-breakpoint
CREATE INDEX `story_created_at_idx` ON `story` (`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_phone_number_unique` ON `user` (`phone_number`);