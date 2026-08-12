CREATE TABLE `case_notes` (
	`id` varchar(36) NOT NULL,
	`caseId` varchar(36) NOT NULL,
	`authorName` varchar(160) NOT NULL,
	`disposition` enum('benign','suspicious','confirmed') NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `case_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scenario_runs` (
	`id` varchar(36) NOT NULL,
	`scenarioKey` varchar(64) NOT NULL,
	`label` varchar(160) NOT NULL,
	`status` enum('completed') NOT NULL DEFAULT 'completed',
	`eventsGenerated` int NOT NULL,
	`casesGenerated` int NOT NULL,
	`startedAt` timestamp NOT NULL,
	`finishedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scenario_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `soc_cases` (
	`id` varchar(36) NOT NULL,
	`scenarioKey` varchar(64) NOT NULL,
	`title` varchar(240) NOT NULL,
	`severity` enum('critical','high','medium','low') NOT NULL,
	`disposition` enum('open','benign','suspicious','confirmed') NOT NULL DEFAULT 'open',
	`riskScore` int NOT NULL,
	`ruleId` varchar(80) NOT NULL,
	`sourceIp` varchar(45) NOT NULL,
	`summary` text NOT NULL,
	`evidenceJson` text NOT NULL,
	`riskBreakdownJson` text NOT NULL,
	`startedAt` timestamp NOT NULL,
	`lastSeenAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `soc_cases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `soc_events` (
	`id` varchar(36) NOT NULL,
	`caseId` varchar(36),
	`scenarioKey` varchar(64) NOT NULL,
	`occurredAt` timestamp NOT NULL,
	`sourceIp` varchar(45) NOT NULL,
	`username` varchar(120),
	`target` varchar(160) NOT NULL,
	`eventType` enum('auth_failure','auth_success','decoy_interaction','discovery') NOT NULL,
	`command` varchar(255),
	`message` text NOT NULL,
	`metadataJson` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `soc_events_id` PRIMARY KEY(`id`)
);
