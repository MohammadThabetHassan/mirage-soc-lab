ALTER TABLE `soc_cases` ADD `ruleVersion` varchar(32) NOT NULL DEFAULT '1.0.0';
--> statement-breakpoint
CREATE TABLE `case_disposition_history` (
  `id` varchar(36) NOT NULL,
  `caseId` varchar(36) NOT NULL,
  `disposition` enum('benign','suspicious','confirmed') NOT NULL,
  `note` text NOT NULL,
  `authorName` varchar(160) NOT NULL,
  `previousHash` varchar(64),
  `entryHash` varchar(64) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `case_disposition_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `case_evidence_lineage` (
  `id` varchar(36) NOT NULL,
  `caseId` varchar(36) NOT NULL,
  `eventId` varchar(36) NOT NULL,
  `ruleId` varchar(80) NOT NULL,
  `ruleVersion` varchar(32) NOT NULL,
  `previousHash` varchar(64),
  `entryHash` varchar(64) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `case_evidence_lineage_id` PRIMARY KEY(`id`)
);
