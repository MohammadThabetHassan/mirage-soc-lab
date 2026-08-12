import type { AttackMapping } from "@shared/soc";

export const ATTACK_MAPPINGS: AttackMapping[] = [
  {
    ruleId: "repeated-auth-failures",
    techniqueId: "T1110",
    techniqueName: "Brute Force",
    tactic: "Credential Access",
    rationale: "Multiple failed SSH authentications from one source in a short time window may indicate password guessing or credential testing.",
    caveat: "A failed-login burst can also come from a misconfigured service or a user repeatedly entering an incorrect password.",
    referenceUrl: "https://attack.mitre.org/techniques/T1110/",
  },
  {
    ruleId: "success-after-failure",
    techniqueId: "T1078",
    techniqueName: "Valid Accounts",
    tactic: "Defense Evasion",
    rationale: "A successful authentication immediately after several failures warrants review because an account may have been accessed using a guessed or otherwise obtained credential.",
    caveat: "A legitimate user can make several mistakes before successfully authenticating; the signal requires analyst context.",
    referenceUrl: "https://attack.mitre.org/techniques/T1078/",
  },
  {
    ruleId: "multi-stage-sequence",
    techniqueId: "T1087",
    techniqueName: "Account Discovery",
    tactic: "Discovery",
    rationale: "A correlated sequence of credential activity, decoy engagement, and discovery-like commands is stronger evidence than any individual event.",
    caveat: "This lab mapping explains observed behavior only; it does not attribute activity to a specific threat actor or prove compromise of a real asset.",
    referenceUrl: "https://attack.mitre.org/techniques/T1087/",
  },
];

export const SCENARIOS = [
  {
    key: "full-pipeline",
    label: "Full pipeline story",
    description: "Brute-force attempts progress to decoy interaction and discovery behavior.",
    expectedDetections: 3,
  },
  {
    key: "credential-probe",
    label: "Credential probe",
    description: "Authentication failures followed by a successful login.",
    expectedDetections: 2,
  },
  {
    key: "benign-admin",
    label: "Benign admin activity",
    description: "Normal administrative access that should not create a case.",
    expectedDetections: 0,
  },
] as const;

export type ScenarioKey = (typeof SCENARIOS)[number]["key"];
