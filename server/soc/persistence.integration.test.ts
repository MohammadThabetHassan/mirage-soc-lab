import { inArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import {
  caseDispositionHistory,
  caseEvidenceLineage,
  caseNotes,
  scenarioRuns,
  socCases,
  socEvents,
} from "../../drizzle/schema";
import {
  dispositionSocCase,
  getDb,
  getSocCase,
  persistScenarioRun,
} from "../db";
import { DETECTION_CATALOG } from "./catalog";
import { detectCases, generateScenario } from "./engine";
import { assessCaseIntegrity } from "./integrity";

const describeDatabase = process.env.DATABASE_URL ? describe : describe.skip;

async function requireDatabase() {
  const db = await getDb();
  if (!db) {
    throw new Error(
      "DATABASE_URL is configured but MIRAGE could not create a database connection."
    );
  }
  return db;
}

describeDatabase("MySQL persistence integration", () => {
  let scenarioRunId: string | undefined;
  let caseIds: string[] = [];
  let eventIds: string[] = [];

  afterEach(async () => {
    const db = await requireDatabase();
    if (caseIds.length) {
      await db
        .delete(caseDispositionHistory)
        .where(inArray(caseDispositionHistory.caseId, caseIds));
      await db.delete(caseNotes).where(inArray(caseNotes.caseId, caseIds));
      await db
        .delete(caseEvidenceLineage)
        .where(inArray(caseEvidenceLineage.caseId, caseIds));
      await db.delete(socEvents).where(inArray(socEvents.caseId, caseIds));
      await db.delete(socCases).where(inArray(socCases.id, caseIds));
    }
    if (eventIds.length) {
      await db.delete(socEvents).where(inArray(socEvents.id, eventIds));
    }
    if (scenarioRunId) {
      await db
        .delete(scenarioRuns)
        .where(inArray(scenarioRuns.id, [scenarioRunId]));
    }
    scenarioRunId = undefined;
    caseIds = [];
    eventIds = [];
  });

  it("migrates and preserves a complete controlled scenario with verifiable audit chains", async () => {
    const events = generateScenario("full-pipeline");
    const detectedCases = detectCases(events);
    const now = new Date();
    scenarioRunId = randomUUID();
    caseIds = detectedCases.map(item => item.id);
    eventIds = events.map(item => item.id);

    await persistScenarioRun({
      run: {
        id: scenarioRunId,
        scenarioKey: "full-pipeline",
        label: "MySQL persistence integration fixture",
        eventsGenerated: events.length,
        casesGenerated: detectedCases.length,
        startedAt: events[0]?.occurredAt ?? now,
        finishedAt: events.at(-1)?.occurredAt ?? now,
      },
      cases: detectedCases.map(item => ({
        id: item.id,
        scenarioKey: item.scenarioKey,
        title: item.title,
        severity: item.severity,
        disposition: "open" as const,
        riskScore: item.riskScore,
        ruleId: item.ruleId,
        ruleVersion: DETECTION_CATALOG.version,
        sourceIp: item.sourceIp,
        summary: item.summary,
        evidenceJson: JSON.stringify(item.evidence),
        riskBreakdownJson: JSON.stringify(item.riskBreakdown),
        startedAt: item.startedAt,
        lastSeenAt: item.lastSeenAt,
      })),
      events: events.map(item => ({
        id: item.id,
        scenarioKey: item.scenarioKey,
        occurredAt: item.occurredAt,
        sourceIp: item.sourceIp,
        username: item.username ?? null,
        target: item.target,
        eventType: item.eventType,
        command: item.command ?? null,
        message: item.message,
        metadataJson: JSON.stringify(item.metadata),
      })),
    });

    const persisted = await Promise.all(
      detectedCases.map(item => getSocCase(item.id))
    );
    expect(persisted).toHaveLength(detectedCases.length);
    expect(persisted.every(Boolean)).toBe(true);

    const completeCases = persisted.filter(
      (item): item is NonNullable<typeof item> => Boolean(item)
    );
    expect(completeCases.flatMap(item => item.events)).toHaveLength(
      events.length
    );
    expect(completeCases.flatMap(item => item.evidenceLineage)).toHaveLength(
      events.length
    );

    for (const socCase of completeCases) {
      const integrity = assessCaseIntegrity({
        evidenceLineage: socCase.evidenceLineage,
        dispositionHistory: socCase.history,
      });
      expect(integrity.verified).toBe(true);
      expect(integrity.evidence.entries).toBe(socCase.events.length);
      expect(integrity.dispositions.entries).toBe(0);
    }

    const targetCase = completeCases[0];
    expect(targetCase).toBeDefined();
    await dispositionSocCase({
      caseId: targetCase!.id,
      disposition: "confirmed",
      note: "Validated by the disposable MySQL integration fixture.",
      authorName: "MIRAGE integration test",
      noteId: randomUUID(),
    });

    const afterDisposition = await getSocCase(targetCase!.id);
    expect(afterDisposition?.disposition).toBe("confirmed");
    expect(afterDisposition?.notes).toHaveLength(1);
    expect(afterDisposition?.history).toHaveLength(1);
    expect(
      assessCaseIntegrity({
        evidenceLineage: afterDisposition?.evidenceLineage ?? [],
        dispositionHistory: afterDisposition?.history ?? [],
      }).verified
    ).toBe(true);
  });
});
