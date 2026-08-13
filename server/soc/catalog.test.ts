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
    expect(DETECTION_RULES).toHaveLength(5);
    for (const rule of DETECTION_RULES) {
      expect(rule.inputFields.length).toBeGreaterThan(0);
      expect(rule.telemetryRequirements.length).toBeGreaterThan(0);
      expect(rule.triageGuidance.investigationQuestions).toHaveLength(2);
      expect(rule.triageGuidance.dispositionBoundary).toBeTruthy();
      expect(rule.correlationWindowMinutes).toBeGreaterThan(0);
      expect(rule.mitreMappings.length).toBeGreaterThan(0);
      expect(rule.expectedBenignCases.length).toBeGreaterThan(0);
      expect(rule.strategy.id).toMatch(/^STRAT-[A-Z0-9-]+$/);
      expect(rule.analyticVersion).toMatch(/^\d+\.\d+\.\d+$/);
      expect(
        rule.evaluationContract.positiveScenarioKeys.length
      ).toBeGreaterThan(0);
      expect(
        rule.evaluationContract.negativeScenarioKeys.length
      ).toBeGreaterThan(0);
      expect(rule.evaluationContract.edgeScenarioKeys.length).toBeGreaterThan(
        0
      );
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

    for (const scenario of SCENARIOS) {
      expect(scenario.useCase.learningObjective.length).toBeGreaterThan(20);
      expect(scenario.useCase.validationSteps).toHaveLength(3);
      expect(scenario.useCase.expectedOutcome.length).toBeGreaterThan(20);
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

    const invalidControl = structuredClone(DETECTION_CATALOG);
    invalidControl.rules[0]!.evaluationContract.positiveScenarioKeys = [
      "missing-control",
    ];
    expect(() => validateDetectionCatalog(invalidControl)).toThrow(
      /references missing evaluation scenario/
    );
  });
});
