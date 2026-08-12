import { describe, expect, it } from "vitest";
import { ATTACK_MAPPINGS } from "./catalog";
import { detectCases, evaluateDefinitions, generateScenario } from "./engine";

describe("MIRAGE correlation engine", () => {
  it("detects all three rules in the full pipeline scenario", () => {
    const cases = detectCases(generateScenario("full-pipeline"));
    expect(cases.map(item => item.ruleId)).toEqual([
      "repeated-auth-failures",
      "success-after-failure",
      "multi-stage-sequence",
    ]);
    expect(cases.at(-1)?.riskScore).toBe(94);
  });

  it("does not alert on the documented benign administrator scenario", () => {
    expect(detectCases(generateScenario("benign-admin"))).toEqual([]);
  });

  it("reports deterministic evaluation metrics for the scenario definitions", () => {
    const evaluation = evaluateDefinitions();
    expect(evaluation.coverage).toBe(100);
    expect(evaluation.falsePositiveRate).toBe(0);
    expect(evaluation.scenarios).toHaveLength(4);
    expect(evaluation.classMetrics.map(item => item.classification)).toEqual([
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

  it("does not detect a static edge-case corpus entry one event below the configured threshold", () => {
    const events = Array.from({ length: 4 }, (_, index) => ({
      id: `boundary-${index}`,
      scenarioKey: "threshold-boundary",
      occurredAt: new Date(`2026-08-12T09:0${index}:00.000Z`),
      sourceIp: "198.51.100.77",
      target: "decoy-gateway-01",
      eventType: "auth_failure" as const,
      message: "Fixed corpus authentication failure.",
      metadata: { source: "static-regression-corpus" },
    }));
    expect(detectCases(events)).toEqual([]);
  });

  it("keeps every detection score equal to its visible risk-factor total", () => {
    const cases = detectCases(generateScenario("full-pipeline"));
    expect(cases).toHaveLength(3);
    cases.forEach(item => {
      expect(
        item.riskBreakdown.reduce((total, factor) => total + factor.points, 0)
      ).toBe(item.riskScore);
      expect(
        item.riskBreakdown.every(factor => factor.rationale.length > 0)
      ).toBe(true);
    });
  });

  it("publishes a complete ATT&CK context record for every detection rule", () => {
    const ruleIds = [
      "repeated-auth-failures",
      "success-after-failure",
      "multi-stage-sequence",
    ];
    expect(ATTACK_MAPPINGS.map(item => item.ruleId)).toEqual(ruleIds);
    ATTACK_MAPPINGS.forEach(item => {
      expect(item.techniqueId).toMatch(/^T\d{4}$/);
      expect(item.tactic.length).toBeGreaterThan(0);
      expect(item.rationale.length).toBeGreaterThan(20);
      expect(item.caveat.length).toBeGreaterThan(20);
      expect(item.referenceUrl).toMatch(
        /^https:\/\/attack\.mitre\.org\/techniques\//
      );
      const coverage = evaluateDefinitions().coverageMatrix.find(
        entry => entry.ruleId === item.ruleId
      );
      expect(coverage?.evidenceField).toBeTruthy();
      expect(coverage?.testCaseIds.length).toBeGreaterThan(0);
    });
  });
});
