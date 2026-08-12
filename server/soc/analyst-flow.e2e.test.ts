import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "../_core/context";

const dbMocks = vi.hoisted(() => ({
  getSocSnapshot: vi.fn(),
  getSocCase: vi.fn(),
  persistScenarioRun: vi.fn(),
  persistControlledCowrieEvents: vi.fn(),
  dispositionSocCase: vi.fn(),
}));

vi.mock("../db", () => dbMocks);

import { appRouter } from "../routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function authenticatedContext(
  role: AuthenticatedUser["role"] = "user"
): TrpcContext {
  const user: AuthenticatedUser = {
    id: 7,
    openId: "e2e-analyst",
    email: "analyst@example.test",
    name: "E2E Analyst",
    loginMethod: "test",
    role,
    createdAt: new Date("2026-08-12T09:00:00.000Z"),
    updatedAt: new Date("2026-08-12T09:00:00.000Z"),
    lastSignedIn: new Date("2026-08-12T09:00:00.000Z"),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("authenticated analyst journey", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.getSocSnapshot.mockResolvedValue({
      cases: [],
      events: [],
      runs: [],
    });
    dbMocks.getSocCase.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      ruleVersion: "1.0.0",
      notes: [],
      history: [],
      evidenceLineage: [],
      events: [],
    });
    dbMocks.persistScenarioRun.mockResolvedValue(undefined);
    dbMocks.dispositionSocCase.mockResolvedValue(undefined);
  });

  it("allows an administrator to access the controlled telemetry import boundary", async () => {
    const admin = appRouter.createCaller(authenticatedContext("admin"));
    await expect(
      admin.soc.importControlledCowrie({
        jsonLines: '{"eventid":"cowrie.login.failed"}',
      })
    ).resolves.toMatchObject({ importedCount: 0 });
  });

  it("requires sign-in and supports replay, selection, note disposition, and evaluation", async () => {
    const anonymous = appRouter.createCaller({
      ...authenticatedContext(),
      user: null,
    });
    await expect(anonymous.soc.snapshot()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });

    const caller = appRouter.createCaller(authenticatedContext());
    await expect(caller.soc.snapshot()).resolves.toEqual({
      cases: [],
      events: [],
      runs: [],
    });

    await expect(
      caller.soc.importControlledCowrie({
        jsonLines: '{"eventid":"cowrie.session.connect"}',
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    const replay = await caller.soc.runScenario({
      scenarioKey: "full-pipeline",
    });
    expect(replay).toMatchObject({ eventsGenerated: 10, casesGenerated: 3 });
    expect(dbMocks.persistScenarioRun).toHaveBeenCalledTimes(1);

    const caseId = "11111111-1111-4111-8111-111111111111";
    await expect(caller.soc.getCase({ caseId })).resolves.toMatchObject({
      id: caseId,
      ruleVersion: "1.0.0",
    });
    await expect(caller.soc.verifyCaseIntegrity({ caseId })).resolves.toEqual({
      found: true,
      verified: true,
      evidence: { verified: true, entries: 0 },
      dispositions: { verified: true, entries: 0 },
    });

    await expect(
      caller.soc.dispositionCase({
        caseId,
        disposition: "confirmed",
        note: "Validated through the controlled analyst-flow test.",
      })
    ).resolves.toEqual({ success: true });
    expect(dbMocks.dispositionSocCase).toHaveBeenCalledWith(
      expect.objectContaining({
        caseId,
        disposition: "confirmed",
        note: "Validated through the controlled analyst-flow test.",
        authorName: "E2E Analyst",
      })
    );

    const evaluation = await caller.soc.evaluation();
    expect(evaluation.coverage).toBe(100);
    expect(evaluation.scenarios.map(item => item.classification)).toEqual([
      "known-positive",
      "known-positive",
      "known-benign",
      "edge-case",
    ]);
    expect(
      evaluation.coverageMatrix.every(
        item => item.currentStatus === "validated"
      )
    ).toBe(true);
  });
});
