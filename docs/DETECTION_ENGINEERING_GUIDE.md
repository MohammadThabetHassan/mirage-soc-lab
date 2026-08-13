# Detection Engineering Guide

MIRAGE rules are small, versioned statements about **controlled lab observations**. A rule is useful only when a reader can see what telemetry it needs, why it fired, what should stay quiet, and where its conclusion stops.

> The catalog uses synthetic telemetry and an optional bounded Cowrie fixture. It is not production threat intelligence, a scanner, or a way to collect data from outside the lab.

## A rule is more than a match

Every rule lives in `server/soc/rules/catalog.json` and is checked by the catalog schema before use. A rule change is incomplete unless the catalog, scenario, engine expectation, analyst context, and regression tests agree.

| Catalog field                        | Why it is there                                                                          |
| ------------------------------------ | ---------------------------------------------------------------------------------------- |
| Summary and threshold                | States the exact behavior and boundary being modeled.                                    |
| ATT&CK context                       | Gives an analyst a shared vocabulary for the modeled behavior; it does not prove intent. |
| Telemetry requirements               | Names the normalized fields the analytic needs and why.                                  |
| Triage guidance and caveat           | Explains what to inspect and why a match is not a verdict.                               |
| Strategy and analytic version        | Separates the defensive question from the current implementation.                        |
| Positive, benign, and edge scenarios | Makes the expected result repeatable and gives the rule a real boundary.                 |

## Current rules

| Rule                              | Controlled evidence                                                                | What the control cases prove                                               |
| --------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `repeated-auth-failures`          | A source-bound failure burst in the configured window.                             | Benign admin activity and one fewer failure stay quiet.                    |
| `success-after-failure`           | Failures followed by a later success from the same source.                         | The alert asks for context; it does not label every success malicious.     |
| `multi-stage-sequence`            | Credential activity, decoy interaction, and allowlisted discovery from one source. | An isolated inventory action is not enough.                                |
| `low-and-slow-auth-pressure`      | Failures that meet the separate count, time-span, and correlation-window contract. | Scheduled retries and a just-below boundary stay quiet.                    |
| `unapproved-access-policy-change` | A source-bound login followed by an unapproved **synthetic** change marker.        | An approved change or a change without matching login context stays quiet. |

The policy-change rule does not inspect or alter real access policies. It exists only to practice a narrow context-correlation decision in the lab.

## Scenario catalog

The catalog contains a learning objective, three validation steps, and an expected outcome for every scenario. The Evaluation page reads that same source; there is no separate training spreadsheet to get out of date.

| Scenario group         | Positive examples                   | Control examples                                         |
| ---------------------- | ----------------------------------- | -------------------------------------------------------- |
| Authentication context | `full-pipeline`, `credential-probe` | `benign-admin`, `threshold-boundary`                     |
| Sustained pressure     | `low-and-slow-pressure`             | `scheduled-service-retries`, `low-and-slow-boundary`     |
| Change context         | `unapproved-policy-change`          | `authorized-policy-change`, `policy-change-without-auth` |

The release baseline in `server/soc/evaluation-baseline.json` records the catalog version and expected outcomes. Its test fails when a rule, scenario, or control changes without an intentional baseline update.

## How to change a rule

Start with one narrow lab behavior. State the needed normalized fields, the threshold or correlation window, a plausible benign explanation, and the point at which an analyst should stop short of a conclusion. Then add or update:

1. The catalog entry, including strategy, analytic version, change class, ATT&CK context, telemetry requirements, triage guidance, and evaluation contract.
2. A positive scenario and at least one benign or edge control.
3. Engine and catalog regression tests, plus the baseline when behavior is intentionally changed.
4. The analyst-facing wording and the public showcase when a user-visible claim changes.

Run `pnpm quality`, `pnpm test:browser`, `pnpm security:audit`, and the database migration check when relevant. A rule is ready only when the behavior and its controls are visible in both code and tests.

## Using ATT&CK here

ATT&CK helps describe the behavior an analytic is meant to model. MIRAGE uses the mapping as context for a lab exercise, not as a claim of broad coverage or a real-world attribution. Keep mappings specific, explain the rationale in the catalog, and avoid inflating the matrix with rules that lack scenarios and controls.
