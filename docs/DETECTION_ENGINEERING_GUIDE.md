# Detection Engineering Guide

MIRAGE treats each detection as a versioned, testable statement about a **controlled lab observation**. The goal is not to color an ATT&CK matrix; it is to make the detection logic, required evidence, expected benign behavior, and evaluation result inspectable by an analyst or contributor.

> **Controlled-scope reminder.** The catalog models only safe synthetic telemetry and an optional private Cowrie lab fixture. It is not a source of production threat intelligence, a scanner, or an instruction set for external collection.

## Detection contract

Every MIRAGE rule is defined in `server/soc/rules/catalog.json` and validated by Zod before use. A contribution is complete only when its catalog record, deterministic scenario, regression expectation, and analyst-facing context agree.

| Contract element                  | Purpose                                                                                          | Analyst benefit                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Rule summary and threshold        | States the bounded behavior the lab detects.                                                     | Makes the alert condition understandable without reverse-engineering implementation code. |
| ATT&CK mapping                    | Records the tactic, technique, reference, and rationale.                                         | Connects a behavior to a shared defensive vocabulary.                                     |
| Telemetry prerequisites           | States which normalized fields are necessary and why.                                            | Makes missing-observability limits visible before a disposition is made.                  |
| Benign caveat and triage boundary | States plausible benign explanations and the evidence required to cross the rule’s lab boundary. | Reduces the risk of treating a rule match as a verdict.                                   |
| Scenario-backed evaluation        | Links the rule to deterministic positive, benign, and edge-case exercises.                       | Provides a reproducible validation trail.                                                 |

## Current controlled coverage

| Rule                     | ATT&CK context                          | Minimum lab evidence                                                                                  | Evaluation intent                                                                                  |
| ------------------------ | --------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `repeated-auth-failures` | T1110 — Brute Force, Credential Access  | A bounded failure burst from one source, correlated by time.                                          | Detect the known positive without creating a case for benign admin access.                         |
| `success-after-failure`  | T1078 — Valid Accounts, Defense Evasion | A source-bound sequence of failures followed by a success inside the correlation window.              | Show why a later success deserves context but is not automatically malicious.                      |
| `multi-stage-sequence`   | T1087 — Account Discovery, Discovery    | Credential activity, controlled decoy engagement, and allowlisted discovery evidence from one source. | Require every stage of the critical synthetic story; isolated inventory activity must not qualify. |

MITRE describes ATT&CK tactics as adversary objectives, techniques as the behaviors used to achieve them, and procedures as concrete implementations. A technique mapping is therefore context for an analytic—not proof that every observed event is malicious. [1]

## Scenario playbooks

Each catalog scenario now contains a `useCase` object with a learning objective, exactly three validation steps, and an expected outcome. The Evaluation workspace renders the same data so an analyst can move from a scenario result to a practical decision path without relying on unversioned training material.

| Scenario             | What it is intended to prove                                                       | Expected outcome                                                         |
| -------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `full-pipeline`      | A rule or parser change preserves the full credential-to-decoy-to-discovery story. | Three expected detections remain present with one source-bound timeline. |
| `credential-probe`   | A success after failures is inspected with source and timing context.              | Two detections appear; the analyst reviews the stated triage boundary.   |
| `benign-admin`       | Authorized administration remains outside the current correlation rules.           | No case is created, providing a documented negative control.             |
| `threshold-boundary` | The repeated-failure rule begins only at its declared threshold.                   | No case is created one event below the configured limit.                 |

## v1.2 strategy, analytic, and control contract

MIRAGE v1.2 separates a **strategy**—the defensive question—from an **analytic**—the deterministic implementation that answers it in controlled telemetry. Each rule now declares a stable strategy identifier, an analytic semantic version, a `new` or `revised` change class, and an evaluation contract that names the required positive, benign, and edge scenarios. This mirrors the distinction in ATT&CK between a high-level detection strategy and its platform-specific analytics. [1]

| Rule                              | Strategy                     | Analytic | Positive contract                   | Control contract                                    |
| --------------------------------- | ---------------------------- | -------- | ----------------------------------- | --------------------------------------------------- |
| `repeated-auth-failures`          | `STRAT-AUTH-PRESSURE`        | `1.2.0`  | Full pipeline and credential probe. | Benign admin and rapid threshold boundary.          |
| `success-after-failure`           | `STRAT-POST-AUTH-CONTEXT`    | `1.2.0`  | Full pipeline and credential probe. | Benign admin and rapid threshold boundary.          |
| `multi-stage-sequence`            | `STRAT-SEQUENCE-CORRELATION` | `1.2.0`  | Full pipeline.                      | Benign admin and rapid threshold boundary.          |
| `low-and-slow-auth-pressure`      | `STRAT-AUTH-PRESSURE`        | `1.0.0`  | Sustained pressure.                 | Scheduled retries and sustained threshold boundary. |
| `unapproved-access-policy-change` | `STRAT-CHANGE-CONTEXT`       | `1.0.0`  | Unapproved synthetic policy change. | Authorized change and change without login context. |

The low-and-slow and policy-change scenarios are fully synthetic. They neither generate traffic nor inspect a real access policy. A change to a rule must update its analytic version when behavior, telemetry, threshold, or triage boundary changes, revise its control scenarios when the boundary moves, and provide an evaluation result before release.

## How to add or revise a rule

Start by defining a narrow lab behavior and its allowed telemetry fields. Specify the ATT&CK rationale only after the behavior is clear. Then state the exact telemetry prerequisites, at least two investigation questions, a disposition boundary, and a benign explanation. Add or update the strategy, analytic version, change class, evaluation contract, deterministic scenario expectations, and practical `useCase` playbook, then run the catalog, engine, browser, showcase, migration, and quality gates.

| Review question                  | Evidence of completion                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| What behavior is being detected? | A specific catalog summary, threshold, and correlation window.                                    |
| What must be observable?         | `telemetryRequirements` naming normalized fields and their purposes.                              |
| How does an analyst inspect it?  | Triage questions, caveat, and disposition boundary displayed in the case context.                 |
| What prevents coverage theatre?  | A positive scenario, benign or edge scenario, and a deterministic test result.                    |
| What keeps the lab safe?         | No external collection, no raw TTY persistence, no credential testing, and no broader input path. |

## Practical interpretation

ATT&CK recommends that defenders prioritize behaviors relevant to their environment and avoid declaring coverage from one implementation of a technique. MIRAGE follows this by treating the matrix as a traceability aid and keeping current coverage intentionally small, explicit, and scenario-backed. [1] The legacy ATT&CK data-source inventory remains useful as a vocabulary for discussing sensor requirements, but MITRE notes that the taxonomy is no longer being extended; MIRAGE therefore records **lab telemetry prerequisites** instead of claiming exhaustive data-source coverage. [2]

## References

[1] [MITRE ATT&CK: Resources](https://attack.mitre.org/resources/)

[2] [MITRE ATT&CK: Data Sources](https://attack.mitre.org/datasources/)
