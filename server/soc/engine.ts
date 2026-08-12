import { randomUUID } from "node:crypto";
import type { DetectedCase, EvidenceItem, LabEvent, RiskFactor } from "@shared/soc";
import { getRule, riskFactorsFor, SCENARIOS, severityFor, type DetectionRule, type ScenarioKey } from "./catalog";
import { buildAttackCoverageMatrix } from "./coverage";

const sourceIp = "198.51.100.77";
const target = "decoy-gateway-01";
const startTime = new Date("2026-08-12T09:00:00.000Z");

function event(
  scenarioKey: ScenarioKey,
  offsetMinutes: number,
  eventType: LabEvent["eventType"],
  message: string,
  extras: Partial<Omit<LabEvent, "id" | "scenarioKey" | "occurredAt" | "eventType" | "message" | "target" | "sourceIp" | "metadata">> = {},
): LabEvent {
  return {
    id: randomUUID(),
    scenarioKey,
    occurredAt: new Date(startTime.getTime() + offsetMinutes * 60_000),
    sourceIp,
    target,
    eventType,
    message,
    metadata: { source: "mirage-synthetic-generator", generated: true },
    ...extras,
  };
}

export function generateScenario(scenarioKey: ScenarioKey): LabEvent[] {
  if (scenarioKey === "benign-admin") {
    return [
      event(scenarioKey, 0, "auth_success", "Authorized admin login accepted.", { username: "admin" }),
      event(scenarioKey, 7, "discovery", "Approved maintenance inventory command recorded.", { username: "admin", command: "hostnamectl" }),
    ];
  }

  const repeatedFailureRule = getRule("repeated-auth-failures");
  const failureCount = scenarioKey === "threshold-boundary"
    ? Math.max(0, (repeatedFailureRule.threshold.minimumFailures ?? 1) - 1)
    : scenarioKey === "full-pipeline" ? 6 : 5;
  const failures = Array.from({ length: failureCount }, (_, index) =>
    event(scenarioKey, index, "auth_failure", `SSH authentication failed for account candidate ${index + 1}.`, { username: index % 2 ? "root" : "ops" }),
  );

  if (scenarioKey === "threshold-boundary") return failures;

  const success = event(scenarioKey, 7, "auth_success", "SSH authentication succeeded after repeated failures.", { username: "ops" });
  if (scenarioKey === "credential-probe") return [...failures, success];

  return [
    ...failures,
    success,
    event(scenarioKey, 8, "decoy_interaction", "Session opened with controlled decoy SSH service.", { username: "ops" }),
    event(scenarioKey, 9, "discovery", "Discovery-like command observed: id", { username: "ops", command: "id" }),
    event(scenarioKey, 10, "discovery", "Discovery-like command observed: cat /etc/passwd", { username: "ops", command: "cat /etc/passwd" }),
  ];
}

function asEvidence(events: LabEvent[]): EvidenceItem[] {
  return events.map(item => ({
    eventId: item.id,
    occurredAt: item.occurredAt,
    label: item.eventType.replaceAll("_", " "),
    detail: item.message,
    eventType: item.eventType,
  }));
}

function withinMinutes(events: LabEvent[], windowMinutes: number): boolean {
  if (events.length < 2) return true;
  const start = events[0]?.occurredAt.getTime() ?? 0;
  const end = events.at(-1)?.occurredAt.getTime() ?? start;
  return end - start <= windowMinutes * 60_000;
}

function caseFrom(rule: DetectionRule, scenarioKey: string, events: LabEvent[], details: Record<string, string | number> = {}): DetectedCase {
  const factors: RiskFactor[] = riskFactorsFor(rule, details);
  return {
    id: randomUUID(),
    scenarioKey,
    title: rule.title,
    severity: severityFor(rule),
    riskScore: rule.severityGuidance.riskScore,
    ruleId: rule.id,
    sourceIp: events[0]?.sourceIp ?? "unknown",
    summary: rule.summary,
    evidence: asEvidence(events),
    riskBreakdown: factors,
    startedAt: events[0]?.occurredAt ?? new Date(),
    lastSeenAt: events.at(-1)?.occurredAt ?? new Date(),
  };
}

export function detectCases(events: LabEvent[]): DetectedCase[] {
  const sorted = [...events].sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
  const failures = sorted.filter(item => item.eventType === "auth_failure");
  const success = sorted.find(item => item.eventType === "auth_success");
  const decoy = sorted.find(item => item.eventType === "decoy_interaction");
  const discovery = sorted.filter(item => item.eventType === "discovery");
  const detected: DetectedCase[] = [];
  const scenarioKey = sorted[0]?.scenarioKey ?? "unknown";

  const repeatedRule = getRule("repeated-auth-failures");
  if (failures.length >= (repeatedRule.threshold.minimumFailures ?? Number.MAX_SAFE_INTEGER) && withinMinutes(failures, repeatedRule.correlationWindowMinutes)) {
    detected.push(caseFrom(repeatedRule, scenarioKey, failures, { failureCount: failures.length }));
  }

  const successRule = getRule("success-after-failure");
  if (success && failures.length >= (successRule.threshold.minimumFailures ?? Number.MAX_SAFE_INTEGER) &&
      success.occurredAt.getTime() - (failures.at(-1)?.occurredAt.getTime() ?? success.occurredAt.getTime()) <= successRule.correlationWindowMinutes * 60_000) {
    detected.push(caseFrom(successRule, scenarioKey, [...failures, success], { failureCount: failures.length }));
  }

  const multiStageRule = getRule("multi-stage-sequence");
  const allSequenceEvents = success && decoy ? [...failures, success, decoy, ...discovery] : [];
  if (success && decoy &&
      failures.length >= (multiStageRule.threshold.minimumFailures ?? Number.MAX_SAFE_INTEGER) &&
      discovery.length >= (multiStageRule.threshold.minimumDiscoveryEvents ?? Number.MAX_SAFE_INTEGER) &&
      multiStageRule.threshold.requiresAuthSuccess !== false && multiStageRule.threshold.requiresDecoyInteraction !== false &&
      withinMinutes(allSequenceEvents, multiStageRule.correlationWindowMinutes)) {
    detected.push(caseFrom(multiStageRule, scenarioKey, allSequenceEvents, { failureCount: failures.length }));
  }

  return detected;
}

export function evaluateDefinitions() {
  const scenarios = SCENARIOS.map(scenario => {
    const events = generateScenario(scenario.key);
    const detections = detectCases(events);
    const firstEvent = events[0]?.occurredAt.getTime() ?? 0;
    const averageTimeToDetect = detections.length
      ? Math.round(detections.reduce((sum, item) => sum + (item.lastSeenAt.getTime() - firstEvent) / 60_000, 0) / detections.length * 10) / 10
      : 0;
    const observedRuleIds = detections.map(item => item.ruleId);
    const matchedExpected = scenario.expectedRuleIds.filter(ruleId => observedRuleIds.includes(ruleId)).length;
    return {
      ...scenario,
      expectedDetections: scenario.expectedRuleIds.length,
      observedDetections: detections.length,
      matchedExpected,
      observedRuleIds,
      falsePositives: scenario.classification === "known-benign" ? detections.length : 0,
      averageTimeToDetect,
    };
  });
  const expectedTotal = scenarios.reduce((sum, item) => sum + item.expectedDetections, 0);
  const observedTotal = scenarios.reduce((sum, item) => sum + item.observedDetections, 0);
  const falsePositives = scenarios.reduce((sum, item) => sum + item.falsePositives, 0);
  const detectedScenarioCount = scenarios.filter(item => item.observedDetections > 0).length;
  const scenarioClasses = ["known-positive", "known-benign", "edge-case"] as const;
  const classMetrics = scenarioClasses.map(classification => {
    const classScenarios = scenarios.filter(item => item.classification === classification);
    const expected = classScenarios.reduce((sum, item) => sum + item.expectedDetections, 0);
    const observed = classScenarios.reduce((sum, item) => sum + item.observedDetections, 0);
    const matched = classScenarios.reduce((sum, item) => sum + item.matchedExpected, 0);
    const classFalsePositives = classScenarios.reduce((sum, item) => sum + item.falsePositives, 0);
    const detected = classScenarios.filter(item => item.observedDetections > 0);
    return {
      classification,
      scenarios: classScenarios.length,
      precision: observed ? ((observed - classFalsePositives) / observed) * 100 : 0,
      recallCoverage: expected ? (matched / expected) * 100 : 0,
      falsePositiveRate: classScenarios.length ? (classFalsePositives / classScenarios.length) * 100 : 0,
      averageTimeToDetect: detected.length ? Math.round(detected.reduce((sum, item) => sum + item.averageTimeToDetect, 0) / detected.length * 10) / 10 : 0,
    };
  });
  return {
    catalogVersion: "1.0.0",
    scenarios,
    coverage: expectedTotal ? (scenarios.reduce((sum, item) => sum + item.matchedExpected, 0) / expectedTotal) * 100 : 0,
    alertPrecision: observedTotal ? ((observedTotal - falsePositives) / observedTotal) * 100 : 0,
    falsePositiveRate: scenarios.filter(item => item.classification === "known-benign").length ? falsePositives / scenarios.filter(item => item.classification === "known-benign").length * 100 : 0,
    averageTimeToDetect: detectedScenarioCount ? Math.round(scenarios.filter(item => item.observedDetections > 0).reduce((sum, item) => sum + item.averageTimeToDetect, 0) / detectedScenarioCount * 10) / 10 : 0,
    classMetrics,
    coverageMatrix: buildAttackCoverageMatrix(scenarios),
  };
}
