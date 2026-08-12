import {
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const socCases = mysqlTable(
  "soc_cases",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    scenarioKey: varchar("scenarioKey", { length: 64 }).notNull(),
    title: varchar("title", { length: 240 }).notNull(),
    severity: mysqlEnum("severity", [
      "critical",
      "high",
      "medium",
      "low",
    ]).notNull(),
    disposition: mysqlEnum("disposition", [
      "open",
      "benign",
      "suspicious",
      "confirmed",
    ])
      .default("open")
      .notNull(),
    riskScore: int("riskScore").notNull(),
    ruleId: varchar("ruleId", { length: 80 }).notNull(),
    ruleVersion: varchar("ruleVersion", { length: 32 })
      .default("1.0.0")
      .notNull(),
    sourceIp: varchar("sourceIp", { length: 45 }).notNull(),
    summary: text("summary").notNull(),
    evidenceJson: text("evidenceJson").notNull(),
    riskBreakdownJson: text("riskBreakdownJson").notNull(),
    startedAt: timestamp("startedAt").notNull(),
    lastSeenAt: timestamp("lastSeenAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("soc_cases_disposition_last_seen_idx").on(
      table.disposition,
      table.lastSeenAt
    ),
    index("soc_cases_scenario_last_seen_idx").on(
      table.scenarioKey,
      table.lastSeenAt
    ),
  ]
);

export const socEvents = mysqlTable(
  "soc_events",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    caseId: varchar("caseId", { length: 36 }),
    scenarioKey: varchar("scenarioKey", { length: 64 }).notNull(),
    occurredAt: timestamp("occurredAt").notNull(),
    sourceIp: varchar("sourceIp", { length: 45 }).notNull(),
    username: varchar("username", { length: 120 }),
    target: varchar("target", { length: 160 }).notNull(),
    eventType: mysqlEnum("eventType", [
      "auth_failure",
      "auth_success",
      "decoy_interaction",
      "discovery",
    ]).notNull(),
    command: varchar("command", { length: 255 }),
    message: text("message").notNull(),
    metadataJson: text("metadataJson").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("soc_events_case_occurred_at_idx").on(table.caseId, table.occurredAt),
    index("soc_events_scenario_occurred_at_idx").on(
      table.scenarioKey,
      table.occurredAt
    ),
  ]
);

export const caseNotes = mysqlTable(
  "case_notes",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    caseId: varchar("caseId", { length: 36 }).notNull(),
    authorName: varchar("authorName", { length: 160 }).notNull(),
    disposition: mysqlEnum("disposition", [
      "benign",
      "suspicious",
      "confirmed",
    ]).notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("case_notes_case_created_at_idx").on(table.caseId, table.createdAt),
  ]
);

export const caseDispositionHistory = mysqlTable(
  "case_disposition_history",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    caseId: varchar("caseId", { length: 36 }).notNull(),
    disposition: mysqlEnum("disposition", [
      "benign",
      "suspicious",
      "confirmed",
    ]).notNull(),
    note: text("note").notNull(),
    authorName: varchar("authorName", { length: 160 }).notNull(),
    previousHash: varchar("previousHash", { length: 64 }),
    entryHash: varchar("entryHash", { length: 64 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("case_disposition_history_case_created_at_idx").on(
      table.caseId,
      table.createdAt
    ),
    uniqueIndex("case_disposition_history_case_entry_hash_unique").on(
      table.caseId,
      table.entryHash
    ),
  ]
);

/** Append-only evidence links provide a tamper-evident chain per case. */
export const caseEvidenceLineage = mysqlTable(
  "case_evidence_lineage",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    caseId: varchar("caseId", { length: 36 }).notNull(),
    eventId: varchar("eventId", { length: 36 }).notNull(),
    ruleId: varchar("ruleId", { length: 80 }).notNull(),
    ruleVersion: varchar("ruleVersion", { length: 32 }).notNull(),
    previousHash: varchar("previousHash", { length: 64 }),
    entryHash: varchar("entryHash", { length: 64 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("case_evidence_lineage_case_created_at_idx").on(
      table.caseId,
      table.createdAt
    ),
    uniqueIndex("case_evidence_lineage_case_event_rule_version_unique").on(
      table.caseId,
      table.eventId,
      table.ruleId,
      table.ruleVersion
    ),
  ]
);

export const scenarioRuns = mysqlTable("scenario_runs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  scenarioKey: varchar("scenarioKey", { length: 64 }).notNull(),
  label: varchar("label", { length: 160 }).notNull(),
  status: mysqlEnum("status", ["completed"]).default("completed").notNull(),
  eventsGenerated: int("eventsGenerated").notNull(),
  casesGenerated: int("casesGenerated").notNull(),
  startedAt: timestamp("startedAt").notNull(),
  finishedAt: timestamp("finishedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SocCase = typeof socCases.$inferSelect;
export type InsertSocCase = typeof socCases.$inferInsert;
export type SocEvent = typeof socEvents.$inferSelect;
export type InsertSocEvent = typeof socEvents.$inferInsert;
export type CaseNote = typeof caseNotes.$inferSelect;
export type InsertCaseNote = typeof caseNotes.$inferInsert;
export type CaseDispositionHistory = typeof caseDispositionHistory.$inferSelect;
export type InsertCaseDispositionHistory =
  typeof caseDispositionHistory.$inferInsert;
export type CaseEvidenceLineage = typeof caseEvidenceLineage.$inferSelect;
export type InsertCaseEvidenceLineage = typeof caseEvidenceLineage.$inferInsert;
