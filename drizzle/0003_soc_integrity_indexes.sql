CREATE INDEX `soc_cases_disposition_last_seen_idx` ON `soc_cases` (`disposition`,`lastSeenAt`);
--> statement-breakpoint
CREATE INDEX `soc_cases_scenario_last_seen_idx` ON `soc_cases` (`scenarioKey`,`lastSeenAt`);
--> statement-breakpoint
CREATE INDEX `soc_events_case_occurred_at_idx` ON `soc_events` (`caseId`,`occurredAt`);
--> statement-breakpoint
CREATE INDEX `soc_events_scenario_occurred_at_idx` ON `soc_events` (`scenarioKey`,`occurredAt`);
--> statement-breakpoint
CREATE INDEX `case_notes_case_created_at_idx` ON `case_notes` (`caseId`,`createdAt`);
--> statement-breakpoint
CREATE INDEX `case_disposition_history_case_created_at_idx` ON `case_disposition_history` (`caseId`,`createdAt`);
--> statement-breakpoint
CREATE UNIQUE INDEX `case_disposition_history_case_entry_hash_unique` ON `case_disposition_history` (`caseId`,`entryHash`);
--> statement-breakpoint
CREATE INDEX `case_evidence_lineage_case_created_at_idx` ON `case_evidence_lineage` (`caseId`,`createdAt`);
--> statement-breakpoint
CREATE UNIQUE INDEX `case_evidence_lineage_case_event_rule_version_unique` ON `case_evidence_lineage` (`caseId`,`eventId`,`ruleId`,`ruleVersion`);
