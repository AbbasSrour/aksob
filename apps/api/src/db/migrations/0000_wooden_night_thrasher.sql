CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	`impersonated_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
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
CREATE TABLE `conversation` (
	`id` text PRIMARY KEY NOT NULL,
	`dm_key` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `conversation_dm_key_unique` ON `conversation` (`dm_key`);--> statement-breakpoint
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
CREATE TABLE `connection` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`requester_id` text NOT NULL,
	`matched_user_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`message` text,
	`match_explanation` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`requester_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`matched_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `conn_requester_idx` ON `connection` (`requester_id`);--> statement-breakpoint
CREATE INDEX `conn_matched_user_idx` ON `connection` (`matched_user_id`);--> statement-breakpoint
CREATE INDEX `conn_type_idx` ON `connection` (`type`);--> statement-breakpoint
CREATE INDEX `conn_status_idx` ON `connection` (`status`);--> statement-breakpoint
CREATE TABLE `user_connection_preference` (
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	PRIMARY KEY(`user_id`, `type`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `event` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`cover_image` text,
	`event_type` text NOT NULL,
	`location` text,
	`meeting_platform` text,
	`meeting_url` text,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`registration_deadline` integer,
	`requires_registration` integer DEFAULT true NOT NULL,
	`registration_mode` text DEFAULT 'open' NOT NULL,
	`capacity` integer,
	`registration_closed` integer DEFAULT false NOT NULL,
	`registration_closed_at` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`rejection_reason` text,
	`check_in_enabled` integer DEFAULT false NOT NULL,
	`reminders_enabled` integer DEFAULT true NOT NULL,
	`attendee_list_visible` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `event_status_idx` ON `event` (`status`);--> statement-breakpoint
CREATE INDEX `event_start_date_idx` ON `event` (`start_date`);--> statement-breakpoint
CREATE INDEX `event_end_date_idx` ON `event` (`end_date`);--> statement-breakpoint
CREATE INDEX `event_registration_deadline_idx` ON `event` (`registration_deadline`);--> statement-breakpoint
CREATE TABLE `event_attendee` (
	`member_id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`show_in_attendee_list` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `event_member`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `event_attendee_status_idx` ON `event_attendee` (`status`);--> statement-breakpoint
CREATE TABLE `event_member` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'attendee' NOT NULL,
	`ticket_token` text,
	`checked_in` integer DEFAULT false NOT NULL,
	`checked_in_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `event`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `event_member_ticket_token_unique` ON `event_member` (`ticket_token`);--> statement-breakpoint
CREATE INDEX `event_member_event_id_idx` ON `event_member` (`event_id`);--> statement-breakpoint
CREATE INDEX `event_member_user_id_idx` ON `event_member` (`user_id`);--> statement-breakpoint
CREATE INDEX `event_member_role_idx` ON `event_member` (`role`);--> statement-breakpoint
CREATE INDEX `event_member_ticket_token_idx` ON `event_member` (`ticket_token`);--> statement-breakpoint
CREATE UNIQUE INDEX `event_member_event_user_role_unique` ON `event_member` (`event_id`,`user_id`,`role`);--> statement-breakpoint
CREATE TABLE `event_organizer` (
	`member_id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `event_member`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `event_reminder` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`send_at` integer NOT NULL,
	`sent_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `event`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `event_reminder_event_id_idx` ON `event_reminder` (`event_id`);--> statement-breakpoint
CREATE INDEX `event_reminder_send_at_idx` ON `event_reminder` (`send_at`);--> statement-breakpoint
CREATE INDEX `event_reminder_sent_at_idx` ON `event_reminder` (`sent_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `event_reminder_event_send_at_unique` ON `event_reminder` (`event_id`,`send_at`);--> statement-breakpoint
CREATE TABLE `event_survey` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`audience` text NOT NULL,
	`url` text NOT NULL,
	`send_at` integer NOT NULL,
	`sent_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `event`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `event_survey_event_id_idx` ON `event_survey` (`event_id`);--> statement-breakpoint
CREATE INDEX `event_survey_audience_idx` ON `event_survey` (`audience`);--> statement-breakpoint
CREATE INDEX `event_survey_send_at_idx` ON `event_survey` (`send_at`);--> statement-breakpoint
CREATE INDEX `event_survey_sent_at_idx` ON `event_survey` (`sent_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `event_survey_event_audience_unique` ON `event_survey` (`event_id`,`audience`);--> statement-breakpoint
CREATE TABLE `news` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`excerpt` text NOT NULL,
	`content` text NOT NULL,
	`cover_image` text,
	`thumbnail_image` text,
	`read_time` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` integer,
	`date` integer,
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
CREATE UNIQUE INDEX `news_category_name_unique` ON `news_category` (`name`);--> statement-breakpoint
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
CREATE TABLE `program` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`level` text NOT NULL,
	`description` text,
	`credits` integer,
	`duration` real,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `program_name_unique` ON `program` (`name`);--> statement-breakpoint
CREATE INDEX `program_is_active_idx` ON `program` (`is_active`);--> statement-breakpoint
CREATE INDEX `program_name_idx` ON `program` (`name`);--> statement-breakpoint
CREATE INDEX `program_level_idx` ON `program` (`level`);--> statement-breakpoint
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
CREATE TABLE `story` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`content` text NOT NULL,
	`cover_image` text,
	`thumbnail_image` text,
	`category` text NOT NULL,
	`story_date` integer NOT NULL,
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
CREATE INDEX `story_created_at_idx` ON `story` (`created_at`);--> statement-breakpoint
CREATE TABLE `alumni_profile` (
	`user_id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `experience` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`company` text NOT NULL,
	`start_date` text,
	`end_date` text,
	`is_current` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `experience_user_id_idx` ON `experience` (`user_id`);--> statement-breakpoint
CREATE TABLE `faculty_profile` (
	`user_id` text PRIMARY KEY NOT NULL,
	`title` text,
	`department` text,
	`office_location` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `links` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`platform` text NOT NULL,
	`url` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `student_profile` (
	`user_id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_education` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`program_id` text NOT NULL,
	`graduation_year` integer,
	`is_primary` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`program_id`) REFERENCES `program`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `user_education_user_id_idx` ON `user_education` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_education_program_id_idx` ON `user_education` (`program_id`);--> statement-breakpoint
CREATE TABLE `user_settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email_visible` integer DEFAULT false NOT NULL,
	`phone_number_visible` integer DEFAULT false NOT NULL,
	`is_visible_in_galaxy` integer DEFAULT true NOT NULL,
	`embedding` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_tag` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`category` text NOT NULL,
	`value` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `user_tag_user_id_idx` ON `user_tag` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_tag_category_idx` ON `user_tag` (`category`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`type` text DEFAULT 'student' NOT NULL,
	`bio` text,
	`onboarding` text DEFAULT 'welcome' NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`role` text,
	`banned` integer DEFAULT false,
	`ban_reason` text,
	`ban_expires` integer,
	`phone_number` text,
	`phone_number_verified` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_phone_number_unique` ON `user` (`phone_number`);