import { describe, expect, it } from "vitest";
import {
  DETECTION_CATALOG,
  DETECTION_RULES,
  SCENARIOS,
  validateDetectionCatalog,
} from "./catalog";

describe("detection-as-code catalog", () => {
  it("provides complete, scenario-backed metadata for every rule", () => {
    expect(DETECTION_CATALOG.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(DETECTION_RULES).toHaveLength(3);
    for (const rule of DETECTION_RULES) {
      expect(rule.inputFields.length).toBeGreaterThan(0);
      expect(rule.correlationWindowMinutes).toBeGreaterThan(0);
      expect(rule.mitreMappings.length).toBeGreaterThan(0);
      expect(rule.expectedBenignCases.length).toBeGreaterThan(0);
      expect(
        rule.riskScoreFactors.reduce(
          (total, factor) => total + factor.points,
          0
        )
      ).toBe(rule.severityGuidance.riskScore);
      expect(
        SCENARIOS.some(scenario => scenario.expectedRuleIds.includes(rule.id))
      ).toBe(true);
    }
  });

  it("rejects incomplete rules and scenarios referencing unknown rules", () => {
    const incomplete = structuredClone(DETECTION_CATALOG);
    incomplete.rules[0]!.mitreMappings = [];
    expect(() => validateDetectionCatalog(incomplete)).toThrow();

    const unknownReference = structuredClone(DETECTION_CATALOG);
    unknownReference.scenarios[0]!.expectedRuleIds = ["does-not-exist"];
    expect(() => validateDetectionCatalog(unknownReference)).toThrow(
      /references missing rule/
    );
  });
});
