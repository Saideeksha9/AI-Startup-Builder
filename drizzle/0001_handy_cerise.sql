CREATE TABLE `savedBlueprints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`idea` text NOT NULL,
	`blueprint` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `savedBlueprints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `savedBlueprints` ADD CONSTRAINT `savedBlueprints_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `savedBlueprints_user_created_idx` ON `savedBlueprints` (`userId`,`createdAt`);