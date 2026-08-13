import { DETECTION_RULES, SCENARIOS } from "./catalog";

export type ScenarioEvaluation = {
  key: string;
  expectedRuleIds: string[];
  observedRuleIds: string[];
};

export function buildAttackCoverageMatrix(scenarios: ScenarioEvaluation[]) {
  return DETECTION_RULES.map(rule => {
    const supportingScenarios = SCENARIOS.filter(scenario =>
      scenario.expectedRuleIds.includes(rule.id)
    );
    const scenarioIds = supportingScenarios.map(scenario => scenario.key);
    const observedByScenario = scenarioIds.map(scenarioId => ({
      scenarioId,
      observed:
        scenarios
          .find(result => result.key === scenarioId)
          ?.observedRuleIds.includes(rule.id) ?? false,
    }));
    const mapping = rule.mitreMappings[0]!;
    const thresholdSummary = Object.entries(rule.threshold)
      .map(([key, value]) => `${key}=${value}`)
      .join(", ");

    return {
      ruleId: rule.id,
      technique: `${mapping.techniqueId} — ${mapping.techniqueName}`,
      tactic: mapping.tactic,
      strategyId: rule.strategy.id,
      strategyName: rule.strategy.name,
      analyticVersion: rule.analyticVersion,
      changeClass: rule.changeClass,
      supportingEventFields: rule.inputFields,
      telemetryRequirements: rule.telemetryRequirements,
      evidenceField: rule.inputFields[0]!,
      scenarioIds,
      testCaseIds: scenarioIds,
      positiveScenarioIds: rule.evaluationContract.positiveScenarioKeys,
      controlScenarioIds: [
        ...rule.evaluationContract.negativeScenarioKeys,
        ...rule.evaluationContract.edgeScenarioKeys,
      ],
      detectionLogic: `${thresholdSummary}; correlation window ${rule.correlationWindowMinutes} minutes.`,
      caveat: rule.expectedBenignCases.join(" "),
      triageBoundary: rule.triageGuidance.dispositionBoundary,
      expectedResult: `Detect in ${rule.evaluationContract.positiveScenarioKeys.join(", ")}; remain silent in ${[
        ...rule.evaluationContract.negativeScenarioKeys,
        ...rule.evaluationContract.edgeScenarioKeys,
      ].join(", ")}.`,
      currentStatus: observedByScenario.every(result => result.observed)
        ? "validated"
        : "gap",
    };
  });
}
