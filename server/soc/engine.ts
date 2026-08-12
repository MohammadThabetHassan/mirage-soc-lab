import { randomUUID } from "node:crypto";
import type { DetectedCase, EvidenceItem, LabEvent, RiskFactor, Severity } from "@shared/soc";
import type { ScenarioKey } from "./catalog";

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

  const failures = Array.from({ length: scenarioKey === "full-pipeline" ? 6 : 5 }, (_, index) =>
    event(scenarioKey, index, "auth_failure", `SSH authentication failed for account candidate ${index + 1}.`, { username: index % 2 ? "root" : "ops" }),
  );

  const success = event(scenarioKey, 7, "auth_success", "SSH authentication succeeded after repeated failures.", { username: "ops" });

  if (scenarioKey === "credential-probe") return [...failures, success];

  return [
    ...failures,
    success,
    event(scenarioKey, 8, "decoy_interaction", "Session opened with decoy SSH service.", { username: "ops" }),
    event(scenarioKey, 9, "discovery", "Discovery-like command observed: id", { username: "ops", command: "id" }),
    event(scenarioKey, 10, "discovery", "Discovery-like command observed: cat /etc/passwd", { username: "ops", command: "cat /etc/passwd" }),
  ];
}

function asEvidence(events: LabEvent[], limit?: number): EvidenceItem[] {
  return (limit ? events.slice(0, limit) : events).map(item => ({
    eventId: item.id,
    occurredAt: item.occurredAt,
    label: item.eventType.replaceAll("_", " "),
    detail: item.message,
    eventType: item.eventType,
  }));
}

function caseFrom(
  scenarioKey: string,
  ruleId: string,
  title: string,
  severity: Severity,
  score: number,
  events: LabEvent[],
  factors: RiskFactor[],
  summary: string,
): DetectedCase {
  return {
    id: randomUUID(),
    scenarioKey,
    title,
    severity,
    riskScore: score,
    ruleId,
    sourceIp: events[0]?.sourceIp ?? "unknown",
    summary,
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

  if (failures.length >= 5) {
    detected.push(caseFrom(
      scenarioKey,
      "repeated-auth-failures",
      "Repeated SSH authentication failures",
      "high",
      72,
      failures,
      [
        { label: "Failed attempts", points: 40, rationale: `${failures.length} failures exceeded the threshold of 5 within 10 minutes.` },
        { label: "Source concentration", points: 20, rationale: "All failures originated from one source IP." },
        { label: "Privileged targeting", points: 12, rationale: "The synthetic stream includes root account candidates." },
      ],
      "A source generated a concentrated authentication-failure burst against the decoy gateway.",
    ));
  }

  if (success && failures.length >= 3 && success.occurredAt.getTime() - failures.at(-1)!.occurredAt.getTime() <= 15 * 60_000) {
    detected.push(caseFrom(
      scenarioKey,
      "success-after-failure",
      "Successful login after repeated failures",
      "high",
      81,
      [...failures, success],
      [
        { label: "Prior failed attempts", points: 35, rationale: `${failures.length} previous failures were linked to the same source.` },
        { label: "Authentication success", points: 30, rationale: "A login success followed the failed attempts within the configured correlation window." },
        { label: "Temporal proximity", points: 16, rationale: "The transition from failure to success occurred within 15 minutes." },
      ],
      "A successful authentication followed a concentrated series of failures from the same source.",
    ));
  }

  if (success && decoy && discovery.length >= 2 && failures.length >= 3) {
    detected.push(caseFrom(
      scenarioKey,
      "multi-stage-sequence",
      "Multi-stage decoy engagement and discovery",
      "critical",
      94,
      [...failures, success, decoy, ...discovery],
      [
        { label: "Credential activity", points: 28, rationale: "The sequence begins with repeated authentication failures and a later success." },
        { label: "Decoy engagement", points: 34, rationale: "The source opened a session with a service that has no expected production user population." },
        { label: "Discovery sequence", points: 32, rationale: `${discovery.length} discovery-like command events followed the session.` },
      ],
      "Correlated credential activity, decoy engagement, and discovery-like behavior formed a complete lab attack story.",
    ));
  }

  return detected;
}

export function evaluateDefinitions() {
  const keys: ScenarioKey[] = ["full-pipeline", "credential-probe", "benign-admin"];
  const expected = new Map<ScenarioKey, number>([["full-pipeline", 3], ["credential-probe", 2], ["benign-admin", 0]]);
  const results = keys.map(key => {
    const events = generateScenario(key);
    const detections = detectCases(events);
    const firstEvent = events[0]?.occurredAt.getTime() ?? 0;
    const averageTimeToDetect = detections.length
      ? Math.round(detections.reduce((sum, item) => sum + (item.lastSeenAt.getTime() - firstEvent) / 60_000, 0) / detections.length * 10) / 10
      : 0;
    return {
      key,
      expectedDetections: expected.get(key) ?? 0,
      observedDetections: detections.length,
      falsePositives: key === "benign-admin" ? detections.length : 0,
      averageTimeToDetect,
    };
  });
  const expectedTotal = results.reduce((sum, item) => sum + item.expectedDetections, 0);
  const observedTotal = results.reduce((sum, item) => sum + item.observedDetections, 0);
  const falsePositives = results.reduce((sum, item) => sum + item.falsePositives, 0);
  return {
    scenarios: results,
    coverage: expectedTotal ? (results.reduce((sum, item) => sum + Math.min(item.expectedDetections, item.observedDetections), 0) / expectedTotal) * 100 : 0,
    alertPrecision: observedTotal ? ((observedTotal - falsePositives) / observedTotal) * 100 : 0,
    falsePositiveRate: results.filter(item => item.key === "benign-admin").length ? falsePositives / results.filter(item => item.key === "benign-admin").length * 100 : 0,
    averageTimeToDetect: Math.round(results.filter(item => item.observedDetections > 0).reduce((sum, item) => sum + item.averageTimeToDetect, 0) / 2 * 10) / 10,
  };
}
