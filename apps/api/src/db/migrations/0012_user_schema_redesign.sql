-- Rename user_type to type
ALTER TABLE `user` RENAME COLUMN `user_type` TO `type`;

-- Add bio column
ALTER TABLE `user` ADD COLUMN `bio` text;

-- Create user_settings table
CREATE TABLE `user_settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email_visible` integer DEFAULT false NOT NULL,
	`phone_number_visible` integer DEFAULT false NOT NULL,
	`is_visible_in_galaxy` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- Create student_profile table
CREATE TABLE `student_profile` (
	`user_id` text PRIMARY KEY NOT NULL,
	`graduation_year` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- Create alumni_profile table
CREATE TABLE `alumni_profile` (
	`user_id` text PRIMARY KEY NOT NULL,
	`graduation_year` integer,
	`title` text,
	`company` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- Create faculty_profile table
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

-- Create links table
CREATE TABLE `links` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`platform` text NOT NULL,
	`url` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- Migrate existing alumni data to alumni_profile
INSERT INTO `alumni_profile` (`user_id`, `title`, `company`, `created_at`, `updated_at`)
SELECT `id`, `title`, `company`, `created_at`, `updated_at`
FROM `user`
WHERE `type` = 'alumni' AND (`title` IS NOT NULL OR `company` IS NOT NULL);
--> statement-breakpoint

-- Migrate existing faculty data to faculty_profile
INSERT INTO `faculty_profile` (`user_id`, `title`, `created_at`, `updated_at`)
SELECT `id`, `title`, `created_at`, `updated_at`
FROM `user`
WHERE `type` = 'faculty' AND `title` IS NOT NULL;
--> statement-breakpoint

-- Drop company and title from user
ALTER TABLE `user` DROP COLUMN `company`;
--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `title`;
