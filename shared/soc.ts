export const EVENT_TYPES = [
  "auth_failure",
  "auth_success",
  "decoy_interaction",
  "discovery",
  "policy_change",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const SEVERITIES = ["critical", "high", "medium", "low"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const DISPOSITIONS = [
  "open",
  "benign",
  "suspicious",
  "confirmed",
] as const;
export type Disposition = (typeof DISPOSITIONS)[number];

export type LabEvent = {
  id: string;
  scenarioKey: string;
  occurredAt: Date;
  sourceIp: string;
  username?: string;
  target: string;
  eventType: EventType;
  command?: string;
  message: string;
  metadata: Record<string, string | number | boolean>;
};

export type EvidenceItem = {
  eventId: string;
  occurredAt: Date;
  label: string;
  detail: string;
  eventType: EventType;
};

export type RiskFactor = {
  label: string;
  points: number;
  rationale: string;
};

export type DetectedCase = {
  id: string;
  scenarioKey: string;
  title: string;
  severity: Severity;
  riskScore: number;
  ruleId: string;
  sourceIp: string;
  summary: string;
  evidence: EvidenceItem[];
  riskBreakdown: RiskFactor[];
  startedAt: Date;
  lastSeenAt: Date;
};

export type AttackMapping = {
  ruleId: string;
  techniqueId: string;
  techniqueName: string;
  tactic: string;
  strategy: {
    id: string;
    name: string;
    objective: string;
  };
  analyticVersion: string;
  changeClass: "new" | "revised";
  evaluationContract: {
    positiveScenarioKeys: string[];
    negativeScenarioKeys: string[];
    edgeScenarioKeys: string[];
  };
  rationale: string;
  caveat: string;
  referenceUrl: string;
  telemetryRequirements: Array<{ field: string; purpose: string }>;
  triageGuidance: {
    investigationQuestions: string[];
    dispositionBoundary: string;
  };
};
