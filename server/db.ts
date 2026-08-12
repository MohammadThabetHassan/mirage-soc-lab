import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { caseNotes, InsertCaseNote, InsertSocCase, InsertSocEvent, InsertUser, scenarioRuns, socCases, socEvents, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getSocSnapshot() {
  const db = await getDb();
  if (!db) return { cases: [], events: [], runs: [] };
  const [cases, events, runs] = await Promise.all([
    db.select().from(socCases).orderBy(desc(socCases.updatedAt)).limit(50),
    db.select().from(socEvents).orderBy(desc(socEvents.occurredAt)).limit(80),
    db.select().from(scenarioRuns).orderBy(desc(scenarioRuns.createdAt)).limit(10),
  ]);
  return { cases, events, runs };
}

export async function getSocCase(caseId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const [item] = await db.select().from(socCases).where(eq(socCases.id, caseId)).limit(1);
  if (!item) return undefined;
  const notes = await db.select().from(caseNotes).where(eq(caseNotes.caseId, caseId)).orderBy(desc(caseNotes.createdAt));
  const events = await db.select().from(socEvents).where(eq(socEvents.caseId, caseId)).orderBy(socEvents.occurredAt);
  return { ...item, notes, events };
}

export async function persistScenarioRun(input: {
  run: { id: string; scenarioKey: string; label: string; eventsGenerated: number; casesGenerated: number; startedAt: Date; finishedAt: Date };
  events: InsertSocEvent[];
  cases: InsertSocCase[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable. Configure the MIRAGE database before running a scenario.");
  await db.insert(scenarioRuns).values({ ...input.run, status: "completed" });
  await db.insert(socCases).values(input.cases);
  const caseByRule = new Map(input.cases.map(item => [item.ruleId, item.id]));
  await db.insert(socEvents).values(input.events.map(item => ({
    ...item,
    caseId: item.eventType === "auth_failure" ? caseByRule.get("repeated-auth-failures") ?? null :
      item.eventType === "auth_success" ? caseByRule.get("success-after-failure") ?? null :
      ["decoy_interaction", "discovery"].includes(item.eventType) ? caseByRule.get("multi-stage-sequence") ?? null : null,
  })));
}

export async function dispositionSocCase(input: { caseId: string; disposition: "benign" | "suspicious" | "confirmed"; note: string; authorName: string; noteId: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable. Configure the MIRAGE database before changing a case.");
  await db.update(socCases).set({ disposition: input.disposition }).where(eq(socCases.id, input.caseId));
  const note: InsertCaseNote = {
    id: input.noteId,
    caseId: input.caseId,
    disposition: input.disposition,
    body: input.note,
    authorName: input.authorName,
  };
  await db.insert(caseNotes).values(note);
}
