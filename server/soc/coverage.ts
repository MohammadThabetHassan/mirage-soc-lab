import { DETECTION_RULES, SCENARIOS } from "./catalog";

export type ScenarioEvaluation = {
  key: string;
  expectedRuleIds: string[];
  observedRuleIds: string[];
};

export function buildAttackCoverageMatrix(scenarios: ScenarioEvaluation[]) {
  return DETECTION_RULES.map(rule => {
    const supportingScenarios = SCENARIOS.filter(scenario => scenario.expectedRuleIds.includes(rule.id));
    const scenarioIds = supportingScenarios.map(scenario => scenario.key);
    const observedByScenario = scenarioIds.map(scenarioId => ({
      scenarioId,
      observed: scenarios.find(result => result.key === scenarioId)?.observedRuleIds.includes(rule.id) ?? false,
    }));
    const mapping = rule.mitreMappings[0]!;
    const thresholdSummary = Object.entries(rule.threshold)
      .map(([key, value]) => `${key}=${value}`)
      .join(", ");

    return {
      ruleId: rule.id,
      technique: `${mapping.techniqueId} — ${mapping.techniqueName}`,
      tactic: mapping.tactic,
      supportingEventFields: rule.inputFields,
      evidenceField: rule.inputFields[0]!,
      scenarioIds,
      testCaseIds: scenarioIds,
      detectionLogic: `${thresholdSummary}; correlation window ${rule.correlationWindowMinutes} minutes.`,
      caveat: rule.expectedBenignCases.join(" "),
      expectedResult: `Detect in ${scenarioIds.join(", ")}.`,
      currentStatus: observedByScenario.every(result => result.observed) ? "validated" : "gap",
    };
  });
}
