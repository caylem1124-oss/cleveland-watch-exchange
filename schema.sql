CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`method` text NOT NULL,
	`watch` text NOT NULL,
	`callback_at` text,
	`timezone` text NOT NULL,
	`message` text NOT NULL,
	`photos` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`attribution` text NOT NULL,
	`notification` text DEFAULT 'pending' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`consent_version` text NOT NULL
);

CREATE INDEX `inquiries_created_idx` ON `inquiries` (`created_at`);
CREATE TABLE `inquiry_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 1 NOT NULL
);
