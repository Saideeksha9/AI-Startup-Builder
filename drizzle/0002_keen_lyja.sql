CREATE TABLE `chatConversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`activeStartupId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatConversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`userId` int NOT NULL,
	`savedBlueprintId` int,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`linkedRecordType` varchar(64),
	`linkedRecordId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crisisPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`savedBlueprintId` int NOT NULL,
	`riskId` int,
	`title` varchar(240) NOT NULL,
	`triggerConditions` text,
	`responseSteps` text,
	`owner` varchar(160),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crisisPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interestFields` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `interestFields_id` PRIMARY KEY(`id`),
	CONSTRAINT `interestFields_name_unique` UNIQUE(`name`),
	CONSTRAINT `interestFields_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `interestPendingReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`savedBlueprintId` int NOT NULL,
	`submittedText` text NOT NULL,
	`status` enum('pending','promoted','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `interestPendingReviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interestTopics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fieldId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `interestTopics_id` PRIMARY KEY(`id`),
	CONSTRAINT `interestTopics_field_slug_unique` UNIQUE(`fieldId`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `investmentScenarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`savedBlueprintId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`fundingAmount` decimal(15,2),
	`valuation` decimal(15,2),
	`runwayMonths` int,
	`useOfFunds` text,
	`version` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `investmentScenarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`savedBlueprintId` int NOT NULL,
	`title` varchar(240) NOT NULL,
	`targetDate` date,
	`status` enum('planned','in_progress','done','blocked') NOT NULL DEFAULT 'planned',
	`dependsOnId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `risks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`savedBlueprintId` int NOT NULL,
	`title` varchar(240) NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`likelihood` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`mitigationNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `risks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `savedBlueprints` ADD `interestTopicId` int;--> statement-breakpoint
ALTER TABLE `savedBlueprints` ADD `interestOtherText` text;--> statement-breakpoint
ALTER TABLE `chatConversations` ADD CONSTRAINT `chatConversations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chatConversations` ADD CONSTRAINT `chatConversations_activeStartupId_savedBlueprints_id_fk` FOREIGN KEY (`activeStartupId`) REFERENCES `savedBlueprints`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chatMessages` ADD CONSTRAINT `chatMessages_conversationId_chatConversations_id_fk` FOREIGN KEY (`conversationId`) REFERENCES `chatConversations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chatMessages` ADD CONSTRAINT `chatMessages_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chatMessages` ADD CONSTRAINT `chatMessages_savedBlueprintId_savedBlueprints_id_fk` FOREIGN KEY (`savedBlueprintId`) REFERENCES `savedBlueprints`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crisisPlans` ADD CONSTRAINT `crisisPlans_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crisisPlans` ADD CONSTRAINT `crisisPlans_savedBlueprintId_savedBlueprints_id_fk` FOREIGN KEY (`savedBlueprintId`) REFERENCES `savedBlueprints`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crisisPlans` ADD CONSTRAINT `crisisPlans_riskId_risks_id_fk` FOREIGN KEY (`riskId`) REFERENCES `risks`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interestPendingReviews` ADD CONSTRAINT `interestPendingReviews_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interestPendingReviews` ADD CONSTRAINT `interestPendingReviews_savedBlueprintId_savedBlueprints_id_fk` FOREIGN KEY (`savedBlueprintId`) REFERENCES `savedBlueprints`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interestTopics` ADD CONSTRAINT `interestTopics_fieldId_interestFields_id_fk` FOREIGN KEY (`fieldId`) REFERENCES `interestFields`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `investmentScenarios` ADD CONSTRAINT `investmentScenarios_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `investmentScenarios` ADD CONSTRAINT `investmentScenarios_savedBlueprintId_savedBlueprints_id_fk` FOREIGN KEY (`savedBlueprintId`) REFERENCES `savedBlueprints`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `milestones` ADD CONSTRAINT `milestones_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `milestones` ADD CONSTRAINT `milestones_savedBlueprintId_savedBlueprints_id_fk` FOREIGN KEY (`savedBlueprintId`) REFERENCES `savedBlueprints`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `risks` ADD CONSTRAINT `risks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `risks` ADD CONSTRAINT `risks_savedBlueprintId_savedBlueprints_id_fk` FOREIGN KEY (`savedBlueprintId`) REFERENCES `savedBlueprints`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `chatConversations_user_startup_idx` ON `chatConversations` (`userId`,`activeStartupId`);--> statement-breakpoint
CREATE INDEX `chatMessages_conversation_idx` ON `chatMessages` (`conversationId`);--> statement-breakpoint
CREATE INDEX `chatMessages_user_startup_idx` ON `chatMessages` (`userId`,`savedBlueprintId`);--> statement-breakpoint
CREATE INDEX `crisisPlans_user_startup_idx` ON `crisisPlans` (`userId`,`savedBlueprintId`);--> statement-breakpoint
CREATE INDEX `interestPendingReviews_user_idx` ON `interestPendingReviews` (`userId`);--> statement-breakpoint
CREATE INDEX `interestPendingReviews_startup_idx` ON `interestPendingReviews` (`savedBlueprintId`);--> statement-breakpoint
CREATE INDEX `interestTopics_field_idx` ON `interestTopics` (`fieldId`);--> statement-breakpoint
CREATE INDEX `investmentScenarios_user_startup_idx` ON `investmentScenarios` (`userId`,`savedBlueprintId`);--> statement-breakpoint
CREATE INDEX `milestones_user_startup_idx` ON `milestones` (`userId`,`savedBlueprintId`);--> statement-breakpoint
CREATE INDEX `risks_user_startup_idx` ON `risks` (`userId`,`savedBlueprintId`);--> statement-breakpoint
ALTER TABLE `savedBlueprints` ADD CONSTRAINT `savedBlueprints_interestTopicId_interestTopics_id_fk` FOREIGN KEY (`interestTopicId`) REFERENCES `interestTopics`(`id`) ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
INSERT INTO `interestFields` (`name`, `slug`) VALUES
  ('Science', 'science'),
  ('Medical/Healthcare', 'medical-healthcare'),
  ('Agriculture', 'agriculture'),
  ('Technology', 'technology'),
  ('Finance', 'finance'),
  ('Education', 'education'),
  ('Retail/E-commerce', 'retail-ecommerce'),
  ('Energy', 'energy');
--> statement-breakpoint
INSERT INTO `interestTopics` (`fieldId`, `name`, `slug`)
SELECT `id`, 'Climate Science', 'climate-science' FROM `interestFields` WHERE `slug` = 'science'
UNION ALL SELECT `id`, 'Life Sciences', 'life-sciences' FROM `interestFields` WHERE `slug` = 'science'
UNION ALL SELECT `id`, 'Materials', 'materials' FROM `interestFields` WHERE `slug` = 'science'
UNION ALL SELECT `id`, 'Telemedicine', 'telemedicine' FROM `interestFields` WHERE `slug` = 'medical-healthcare'
UNION ALL SELECT `id`, 'Diagnostics', 'diagnostics' FROM `interestFields` WHERE `slug` = 'medical-healthcare'
UNION ALL SELECT `id`, 'Mental Health', 'mental-health' FROM `interestFields` WHERE `slug` = 'medical-healthcare'
UNION ALL SELECT `id`, 'Medtech Devices', 'medtech-devices' FROM `interestFields` WHERE `slug` = 'medical-healthcare'
UNION ALL SELECT `id`, 'Precision Farming', 'precision-farming' FROM `interestFields` WHERE `slug` = 'agriculture'
UNION ALL SELECT `id`, 'Farm Operations', 'farm-operations' FROM `interestFields` WHERE `slug` = 'agriculture'
UNION ALL SELECT `id`, 'Agri Supply Chains', 'agri-supply-chains' FROM `interestFields` WHERE `slug` = 'agriculture'
UNION ALL SELECT `id`, 'AI Software', 'ai-software' FROM `interestFields` WHERE `slug` = 'technology'
UNION ALL SELECT `id`, 'Developer Tools', 'developer-tools' FROM `interestFields` WHERE `slug` = 'technology'
UNION ALL SELECT `id`, 'Cybersecurity', 'cybersecurity' FROM `interestFields` WHERE `slug` = 'technology'
UNION ALL SELECT `id`, 'Fintech', 'fintech' FROM `interestFields` WHERE `slug` = 'finance'
UNION ALL SELECT `id`, 'Financial Operations', 'financial-operations' FROM `interestFields` WHERE `slug` = 'finance'
UNION ALL SELECT `id`, 'Financial Literacy', 'financial-literacy' FROM `interestFields` WHERE `slug` = 'finance'
UNION ALL SELECT `id`, 'Learning Platforms', 'learning-platforms' FROM `interestFields` WHERE `slug` = 'education'
UNION ALL SELECT `id`, 'Workforce Upskilling', 'workforce-upskilling' FROM `interestFields` WHERE `slug` = 'education'
UNION ALL SELECT `id`, 'Assessment Tools', 'assessment-tools' FROM `interestFields` WHERE `slug` = 'education'
UNION ALL SELECT `id`, 'Marketplace Operations', 'marketplace-operations' FROM `interestFields` WHERE `slug` = 'retail-ecommerce'
UNION ALL SELECT `id`, 'Commerce Enablement', 'commerce-enablement' FROM `interestFields` WHERE `slug` = 'retail-ecommerce'
UNION ALL SELECT `id`, 'Customer Retention', 'customer-retention' FROM `interestFields` WHERE `slug` = 'retail-ecommerce'
UNION ALL SELECT `id`, 'Grid Technology', 'grid-technology' FROM `interestFields` WHERE `slug` = 'energy'
UNION ALL SELECT `id`, 'Renewables', 'renewables' FROM `interestFields` WHERE `slug` = 'energy'
UNION ALL SELECT `id`, 'Energy Efficiency', 'energy-efficiency' FROM `interestFields` WHERE `slug` = 'energy';
