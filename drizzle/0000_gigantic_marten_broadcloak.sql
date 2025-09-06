CREATE TABLE `bookmarks` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`created_at` integer NOT NULL
);
