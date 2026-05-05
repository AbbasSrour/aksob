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
DROP INDEX "story_author_id_idx";--> statement-breakpoint
DROP INDEX "story_status_idx";--> statement-breakpoint
DROP INDEX "story_category_idx";--> statement-breakpoint
DROP INDEX "story_created_at_idx";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "user_phone_number_unique";--> statement-breakpoint
ALTER TABLE `story` ALTER COLUMN "story_date" TO "story_date" integer NOT NULL;--> statement-breakpoint
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