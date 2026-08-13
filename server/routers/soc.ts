import { randomUUID } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  dispositionSocCase,
  getSocCase,
  getSocSnapshot,
  persistControlledCowrieEvents,
  persistScenarioRun,
} from "../db";
import { importControlledCowrieJson } from "../soc/cowrie";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";
import {
  ATTACK_MAPPINGS,
  DETECTION_CATALOG,
  SCENARIOS,
  type ScenarioKey,
} from "../soc/catalog";
import {
  detectCases,
  evaluateDefinitions,
  generateScenario,
} from "../soc/engine";
import { assessCaseIntegrity } from "../soc/integrity";
import {
  evaluateAnalystExercise,
  listAnalystExercises,
} from "../soc/exercises";
import {
  createSlidingWindowRateLimiter,
  type RateLimitPolicy,
} from "../soc/rateLimit";

const scenarioSchema = z.enum([
  "full-pipeline",
  "credential-probe",
  "benign-admin",
  "low-and-slow-pressure",
  "scheduled-service-retries",
  "low-and-slow-boundary",
  "unapproved-policy-change",
  "authorized-policy-change",
  "policy-change-without-auth",
]);

const actionLimiter = createSlidingWindowRateLimiter();
const ACTION_POLICIES = {
  controlledImport: { maxRequests: 6, windowMs: 60_000 },
  scenarioReplay: { maxRequests: 12, windowMs: 60_000 },
  exerciseEvaluation: { maxRequests: 30, windowMs: 60_000 },
  disposition: { maxRequests: 20, windowMs: 60_000 },
} as const satisfies Record<string, RateLimitPolicy>;

function enforceActionRateLimit(
  userId: number,
  action: keyof typeof ACTION_POLICIES
) {
  const result = actionLimiter.consume(
    `analyst:${userId}:${action}`,
    ACTION_POLICIES[action]
  );
  if (!result.allowed) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit reached. Try again in ${Math.ceil(result.retryAfterMs / 1_000)} seconds.`,
    });
  }
}

export const socRouter = router({
  snapshot: protectedProcedure.query(() => getSocSnapshot()),
  attackMappings: protectedProcedure.query(() => ATTACK_MAPPINGS),
  detectionCatalog: protectedProcedure.query(() => DETECTION_CATALOG),
  analystExercises: protectedProcedure.query(() => listAnalystExercises()),
  evaluateAnalystExercise: protectedProcedure
    .input(
      z.object({
        exerciseId: z.string().min(3).max(64),
        responses: z
          .array(
            z.object({
              questionId: z.string().min(3).max(64),
              optionId: z.string().min(3).max(64),
            })
          )
          .min(1)
          .max(8),
      })
    )
    .mutation(({ input, ctx }) => {
      enforceActionRateLimit(ctx.user.id, "exerciseEvaluation");
      return evaluateAnalystExercise(input.exerciseId, input.responses);
    }),
  importControlledCowrie: adminProcedure
    .input(
      z.object({
        /** Local, redacted JSON-lines payload copied from the documented lab fixture flow. */
        jsonLines: z.string().min(1).max(2_000_000),
        scenarioKey: z
          .string()
          .trim()
          .min(3)
          .max(64)
          .default("controlled-cowrie-fixture"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      enforceActionRateLimit(ctx.user.id, "controlledImport");
      const result = importControlledCowrieJson(
        input.jsonLines,
        input.scenarioKey
      );
      await persistControlledCowrieEvents(
        result.imported.map(event => ({
          id: event.id,
          scenarioKey: event.scenarioKey,
          occurredAt: event.occurredAt,
          sourceIp: event.sourceIp,
          username: event.username ?? null,
          target: event.target,
          eventType: event.eventType,
          command: event.command ?? null,
          message: event.message,
          metadataJson: JSON.stringify(event.metadata),
        }))
      );
      return {
        importedCount: result.imported.length,
        rejected: result.rejected,
        acceptedEventIds: result.acceptedEventIds,
        notice:
          "Raw Cowrie payload, passwords, tty logs, and transferred-file content were not stored.",
      };
    }),
  evaluation: protectedProcedure.query(() => evaluateDefinitions()),
  getCase: protectedProcedure
    .input(z.object({ caseId: z.string().uuid() }))
    .query(({ input }) => getSocCase(input.caseId)),
  verifyCaseIntegrity: protectedProcedure
    .input(z.object({ caseId: z.string().uuid() }))
    .query(async ({ input }) => {
      const item = await getSocCase(input.caseId);
      if (!item)
        return {
          found: false,
          verified: false,
          evidence: { verified: false, entries: 0 },
          dispositions: { verified: false, entries: 0 },
        };
      return {
        found: true,
        ...assessCaseIntegrity({
          evidenceLineage: item.evidenceLineage,
          dispositionHistory: item.history,
        }),
      };
    }),
  runScenario: protectedProcedure
    .input(z.object({ scenarioKey: scenarioSchema }))
    .mutation(async ({ input, ctx }) => {
      enforceActionRateLimit(ctx.user.id, "scenarioReplay");
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
      return {
        runId,
        eventsGenerated: events.length,
        casesGenerated: cases.length,
      };
    }),
  dispositionCase: protectedProcedure
    .input(
      z.object({
        caseId: z.string().uuid(),
        disposition: z.enum(["benign", "suspicious", "confirmed"]),
        note: z.string().trim().min(1).max(2_000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      enforceActionRateLimit(ctx.user.id, "disposition");
      await dispositionSocCase({
        ...input,
        noteId: randomUUID(),
        authorName: ctx.user.name || ctx.user.email || "MIRAGE analyst",
      });
      return { success: true };
    }),
});
