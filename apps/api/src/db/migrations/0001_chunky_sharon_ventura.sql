CREATE TABLE `connection_request_log` (
	`user_id` text NOT NULL,
	`request_date` text NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`user_id`, `request_date`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_education_user_program_unique` ON `user_education` (`user_id`,`program_id`);