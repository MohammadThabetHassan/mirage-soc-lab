import { randomUUID } from "node:crypto";
import { z } from "zod";
import { dispositionSocCase, getSocCase, getSocSnapshot, persistScenarioRun } from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { ATTACK_MAPPINGS, SCENARIOS, type ScenarioKey } from "../soc/catalog";
import { detectCases, evaluateDefinitions, generateScenario } from "../soc/engine";

const scenarioSchema = z.enum(["full-pipeline", "credential-probe", "benign-admin"]);

export const socRouter = router({
  snapshot: protectedProcedure.query(() => getSocSnapshot()),
  attackMappings: protectedProcedure.query(() => ATTACK_MAPPINGS),
  evaluation: protectedProcedure.query(() => evaluateDefinitions()),
  getCase: protectedProcedure.input(z.object({ caseId: z.string().uuid() })).query(({ input }) => getSocCase(input.caseId)),
  runScenario: protectedProcedure.input(z.object({ scenarioKey: scenarioSchema })).mutation(async ({ input }) => {
    const scenario = SCENARIOS.find(item => item.key === input.scenarioKey);
    const events = generateScenario(input.scenarioKey as ScenarioKey);
    const cases = detectCases(events);
    const runId = randomUUID();
    const now = new Date();
    await persistScenarioRun({
      run: {
        id: runId,
        scenarioKey: input.scenarioKey,
        label: scenario?.label ?? input.scenarioKey,
        eventsGenerated: events.length,
        casesGenerated: cases.length,
        startedAt: events[0]?.occurredAt ?? now,
        finishedAt: events.at(-1)?.occurredAt ?? now,
      },
      cases: cases.map(item => ({
        id: item.id,
        scenarioKey: item.scenarioKey,
        title: item.title,
        severity: item.severity,
        disposition: "open",
        riskScore: item.riskScore,
        ruleId: item.ruleId,
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
    return { runId, eventsGenerated: events.length, casesGenerated: cases.length };
  }),
  dispositionCase: protectedProcedure.input(z.object({
    caseId: z.string().uuid(),
    disposition: z.enum(["benign", "suspicious", "confirmed"]),
    note: z.string().trim().min(1).max(2_000),
  })).mutation(async ({ input, ctx }) => {
    await dispositionSocCase({
      ...input,
      noteId: randomUUID(),
      authorName: ctx.user.name || ctx.user.email || "MIRAGE analyst",
    });
    return { success: true };
  }),
});
