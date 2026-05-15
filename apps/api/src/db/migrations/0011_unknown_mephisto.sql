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
CREATE UNIQUE INDEX `event_survey_event_audience_unique` ON `event_survey` (`event_id`,`audience`);