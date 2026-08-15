ALTER TABLE `chatMessages` ADD `attachmentFileName` varchar(255);--> statement-breakpoint
ALTER TABLE `chatMessages` ADD `attachmentFileKey` varchar(512);--> statement-breakpoint
ALTER TABLE `chatMessages` ADD `attachmentUrl` varchar(2048);--> statement-breakpoint
ALTER TABLE `chatMessages` ADD `attachmentMimeType` varchar(160);--> statement-breakpoint
ALTER TABLE `chatMessages` ADD `attachmentSize` int;