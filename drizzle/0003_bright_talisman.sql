CREATE TABLE `ventureNotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`savedBlueprintId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`topic` varchar(160),
	`content` text NOT NULL,
	`referenceUrl` varchar(2048),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ventureNotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ventureNotes` ADD CONSTRAINT `ventureNotes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ventureNotes` ADD CONSTRAINT `ventureNotes_savedBlueprintId_savedBlueprints_id_fk` FOREIGN KEY (`savedBlueprintId`) REFERENCES `savedBlueprints`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `ventureNotes_user_startup_idx` ON `ventureNotes` (`userId`,`savedBlueprintId`);