import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { DETECTION_CATALOG, SCENARIOS } from "./catalog";
import { evaluateDefinitions } from "./engine";

type Baseline = {
  baselineVersion: string;
  catalogVersion: string;
  coverage: number;
  alertPrecision: number;
  falsePositiveRate: number;
  scenarios: Array<{
    key: string;
    classification: string;
    expectedRuleIds: string[];
  }>;
};

async function baseline(): Promise<Baseline> {
  return JSON.parse(
    await readFile(
      new URL("./evaluation-baseline.json", import.meta.url),
      "utf8"
    )
  ) as Baseline;
}

describe("versioned evaluation baseline", () => {
  it("keeps the catalog, scenario definition, and observed outcomes aligned to v1.2 evidence", async () => {
    const expected = await baseline();
    const evaluation = evaluateDefinitions();
    expect(expected.baselineVersion).toBe("1.2.0");
    expect(expected.catalogVersion).toBe(DETECTION_CATALOG.version);
    expect(evaluation).toMatchObject({
      catalogVersion: expected.catalogVersion,
      coverage: expected.coverage,
      alertPrecision: expected.alertPrecision,
      falsePositiveRate: expected.falsePositiveRate,
    });
    expect(
      SCENARIOS.map(item => ({
        key: item.key,
        classification: item.classification,
        expectedRuleIds: item.expectedRuleIds,
      }))
    ).toEqual(expected.scenarios);
    expect(
      evaluation.scenarios.map(item => ({
        key: item.key,
        classification: item.classification,
        observedRuleIds: item.observedRuleIds,
      }))
    ).toEqual(
      expected.scenarios.map(item => ({
        key: item.key,
        classification: item.classification,
        observedRuleIds: item.expectedRuleIds,
      }))
    );
  });

  it("keeps known-benign and edge controls silent in the release baseline", async () => {
    const expected = await baseline();
    const controlKeys = expected.scenarios
      .filter(item => item.classification !== "known-positive")
      .map(item => item.key);
    const evaluation = evaluateDefinitions();
    expect(
      evaluation.scenarios
        .filter(item => controlKeys.includes(item.key))
        .every(item => item.observedDetections === 0)
    ).toBe(true);
  });
});
