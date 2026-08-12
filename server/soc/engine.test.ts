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
    expect(evaluation.scenarios).toHaveLength(3);
  });

  it("keeps every detection score equal to its visible risk-factor total", () => {
    const cases = detectCases(generateScenario("full-pipeline"));
    expect(cases).toHaveLength(3);
    cases.forEach(item => {
      expect(item.riskBreakdown.reduce((total, factor) => total + factor.points, 0)).toBe(item.riskScore);
      expect(item.riskBreakdown.every(factor => factor.rationale.length > 0)).toBe(true);
    });
  });

  it("publishes a complete ATT&CK context record for every detection rule", () => {
    const ruleIds = ["repeated-auth-failures", "success-after-failure", "multi-stage-sequence"];
    expect(ATTACK_MAPPINGS.map(item => item.ruleId)).toEqual(ruleIds);
    ATTACK_MAPPINGS.forEach(item => {
      expect(item.techniqueId).toMatch(/^T\d{4}$/);
      expect(item.tactic.length).toBeGreaterThan(0);
      expect(item.rationale.length).toBeGreaterThan(20);
      expect(item.caveat.length).toBeGreaterThan(20);
      expect(item.referenceUrl).toMatch(/^https:\/\/attack\.mitre\.org\/techniques\//);
    });
  });
});
