CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`actor_member_id` text,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`details` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `audit_event_idx` ON `audit_log` (`event_id`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`base_currency` text DEFAULT 'MXN' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`closed_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_slug_unique` ON `events` (`slug`);--> statement-breakpoint
CREATE TABLE `expense_shares` (
	`expense_id` text NOT NULL,
	`member_id` text NOT NULL,
	`share_cents` integer NOT NULL,
	PRIMARY KEY(`expense_id`, `member_id`),
	FOREIGN KEY (`expense_id`) REFERENCES `expenses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `expense_shares_member_idx` ON `expense_shares` (`member_id`);--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`title` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`currency` text NOT NULL,
	`fx_millis` integer DEFAULT 1000 NOT NULL,
	`payer_member_id` text NOT NULL,
	`created_by_member_id` text NOT NULL,
	`spent_on` text NOT NULL,
	`created_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`payer_member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by_member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `expenses_event_idx` ON `expenses` (`event_id`);--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`session_token` text,
	`claim_token` text,
	`clabe` text,
	`bank` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `members_event_idx` ON `members` (`event_id`);--> statement-breakpoint
CREATE INDEX `members_session_idx` ON `members` (`session_token`);--> statement-breakpoint
CREATE UNIQUE INDEX `members_claim_unique` ON `members` (`claim_token`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`from_member_id` text NOT NULL,
	`to_member_id` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`confirmed_by_member_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`from_member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`confirmed_by_member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `payments_event_idx` ON `payments` (`event_id`);