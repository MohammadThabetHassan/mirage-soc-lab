import { z } from "zod";
import catalogJson from "./rules/catalog.json";
import type { AttackMapping, RiskFactor, Severity } from "@shared/soc";

const severitySchema = z.enum(["critical", "high", "medium", "low"]);
const factorSchema = z.object({
  label: z.string().min(1),
  points: z.number().int().min(0).max(100),
  rationale: z.string().min(1),
});
const telemetryRequirementSchema = z.object({
  field: z.string().min(1),
  purpose: z.string().min(1),
});
const triageGuidanceSchema = z.object({
  investigationQuestions: z.array(z.string().min(1)).min(2),
  dispositionBoundary: z.string().min(1),
});
const strategySchema = z.object({
  id: z.string().regex(/^STRAT-[A-Z0-9-]+$/),
  name: z.string().min(3),
  objective: z.string().min(20),
});
const evaluationContractSchema = z.object({
  positiveScenarioKeys: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1),
  negativeScenarioKeys: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1),
  edgeScenarioKeys: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1),
});
const ruleSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  strategy: strategySchema,
  analyticVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  changeClass: z.enum(["new", "revised"]),
  evaluationContract: evaluationContractSchema,
  inputFields: z.array(z.string().min(1)).min(1),
  telemetryRequirements: z.array(telemetryRequirementSchema).min(1),
  triageGuidance: triageGuidanceSchema,
  threshold: z.object({
    minimumFailures: z.number().int().min(0).optional(),
    minimumDiscoveryEvents: z.number().int().min(0).optional(),
    minimumPolicyChanges: z.number().int().min(0).optional(),
    minimumSpanMinutes: z.number().int().min(0).optional(),
    requiresDecoyInteraction: z.boolean().optional(),
    requiresAuthSuccess: z.boolean().optional(),
  }),
  correlationWindowMinutes: z.number().int().positive(),
  mitreMappings: z
    .array(
      z.object({
        techniqueId: z.string().regex(/^T\d{4}$/),
        techniqueName: z.string().min(1),
        tactic: z.string().min(1),
        referenceUrl: z.string().url(),
      })
    )
    .min(1),
  expectedBenignCases: z.array(z.string().min(1)).min(1),
  severityGuidance: z.object({
    severity: severitySchema,
    riskScore: z.number().int().min(0).max(100),
    rationale: z.string().min(1),
  }),
  riskScoreFactors: z.array(factorSchema).min(1),
});
const scenarioSchema = z.object({
  key: z.string().regex(/^[a-z0-9-]+$/),
  label: z.string().min(1),
  description: z.string().min(1),
  useCase: z.object({
    learningObjective: z.string().min(20),
    validationSteps: z.array(z.string().min(10)).min(3),
    expectedOutcome: z.string().min(20),
  }),
  classification: z.enum(["known-positive", "known-benign", "edge-case"]),
  expectedRuleIds: z.array(z.string()),
});
const catalogSchema = z
  .object({
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    rules: z.array(ruleSchema).min(1),
    scenarios: z.array(scenarioSchema).min(1),
  })
  .superRefine((catalog, ctx) => {
    const ids = new Set(catalog.rules.map(rule => rule.id));
    const scenarioByKey = new Map(
      catalog.scenarios.map(scenario => [scenario.key, scenario])
    );
    if (ids.size !== catalog.rules.length)
      ctx.addIssue({ code: "custom", message: "Rule IDs must be unique." });
    for (const scenario of catalog.scenarios) {
      for (const ruleId of scenario.expectedRuleIds) {
        if (!ids.has(ruleId))
          ctx.addIssue({
            code: "custom",
            message: `Scenario ${scenario.key} references missing rule ${ruleId}.`,
          });
      }
    }
    for (const rule of catalog.rules) {
      const contract = rule.evaluationContract;
      const referencedScenarioKeys = [
        ...contract.positiveScenarioKeys,
        ...contract.negativeScenarioKeys,
        ...contract.edgeScenarioKeys,
      ];
      for (const scenarioKey of referencedScenarioKeys) {
        if (!scenarioByKey.has(scenarioKey)) {
          ctx.addIssue({
            code: "custom",
            message: `Rule ${rule.id} references missing evaluation scenario ${scenarioKey}.`,
          });
        }
      }
      for (const scenarioKey of contract.positiveScenarioKeys) {
        if (
          !scenarioByKey.get(scenarioKey)?.expectedRuleIds.includes(rule.id)
        ) {
          ctx.addIssue({
            code: "custom",
            message: `Rule ${rule.id} must be expected by positive scenario ${scenarioKey}.`,
          });
        }
      }
      for (const scenarioKey of [
        ...contract.negativeScenarioKeys,
        ...contract.edgeScenarioKeys,
      ]) {
        if (scenarioByKey.get(scenarioKey)?.expectedRuleIds.includes(rule.id)) {
          ctx.addIssue({
            code: "custom",
            message: `Rule ${rule.id} must not be expected by control scenario ${scenarioKey}.`,
          });
        }
      }
    }
  });

export type DetectionRule = z.infer<typeof ruleSchema>;
export type CatalogScenario = z.infer<typeof scenarioSchema>;
export type ScenarioKey = CatalogScenario["key"];

export function validateDetectionCatalog(input: unknown) {
  return catalogSchema.parse(input);
}

export const DETECTION_CATALOG = validateDetectionCatalog(catalogJson);
export const DETECTION_RULES: DetectionRule[] = DETECTION_CATALOG.rules;
export const SCENARIOS: CatalogScenario[] = DETECTION_CATALOG.scenarios;

export function getRule(ruleId: string): DetectionRule {
  const rule = DETECTION_RULES.find(item => item.id === ruleId);
  if (!rule) throw new Error(`Detection rule not found: ${ruleId}`);
  return rule;
}

export const ATTACK_MAPPINGS: AttackMapping[] = DETECTION_RULES.flatMap(rule =>
  rule.mitreMappings.map(mapping => ({
    ruleId: rule.id,
    techniqueId: mapping.techniqueId,
    techniqueName: mapping.techniqueName,
    tactic: mapping.tactic,
    strategy: rule.strategy,
    analyticVersion: rule.analyticVersion,
    changeClass: rule.changeClass,
    evaluationContract: rule.evaluationContract,
    rationale: rule.summary,
    caveat: rule.expectedBenignCases.join(" "),
    referenceUrl: mapping.referenceUrl,
    telemetryRequirements: rule.telemetryRequirements,
    triageGuidance: rule.triageGuidance,
  }))
);

export function riskFactorsFor(
  rule: DetectionRule,
  details: Record<string, string | number> = {}
): RiskFactor[] {
  return rule.riskScoreFactors.map(factor => ({
    ...factor,
    rationale: factor.rationale.replaceAll(
      "{{failureCount}}",
      String(details.failureCount ?? "configured")
    ),
  }));
}

export function severityFor(rule: DetectionRule): Severity {
  return rule.severityGuidance.severity;
}
