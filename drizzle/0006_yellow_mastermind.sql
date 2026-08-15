CREATE TABLE `landingLeads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`savedBlueprintId` int NOT NULL,
	`visitorName` varchar(160) NOT NULL,
	`visitorEmail` varchar(320) NOT NULL,
	`companyName` varchar(160),
	`message` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `landingLeads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `landingLeads` ADD CONSTRAINT `landingLeads_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `landingLeads` ADD CONSTRAINT `landingLeads_savedBlueprintId_savedBlueprints_id_fk` FOREIGN KEY (`savedBlueprintId`) REFERENCES `savedBlueprints`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `landingLeads_owner_venture_created_idx` ON `landingLeads` (`userId`,`savedBlueprintId`,`createdAt`);