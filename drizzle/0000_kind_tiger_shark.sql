CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `vocabulary_entries` (
	`id` varchar(191) NOT NULL,
	`userId` int NOT NULL,
	`text` varchar(500) NOT NULL,
	`kind` enum('Word','Phrase','Sentence') NOT NULL,
	`partOfSpeech` varchar(32) NOT NULL,
	`meaning` text NOT NULL,
	`createdAt` bigint NOT NULL,
	`favorite` boolean NOT NULL DEFAULT false,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vocabulary_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `vocabulary_entries_user_id_idx` ON `vocabulary_entries` (`userId`);