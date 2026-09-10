CREATE TABLE `vocabulary_groups` (
	`id` varchar(191) NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`note` text NOT NULL,
	`createdAt` bigint NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vocabulary_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `vocabulary_entries` ADD `groupId` varchar(191);--> statement-breakpoint
CREATE INDEX `vocabulary_groups_user_id_idx` ON `vocabulary_groups` (`userId`);