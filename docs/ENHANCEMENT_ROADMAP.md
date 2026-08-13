# MIRAGE Enhancement Roadmap

## Purpose

MIRAGE has reached a strong public baseline: its controlled scope is explicit, its detection rules are versioned and scenario-backed, its `main` branch is governed, and its GitHub Pages site presents practical use cases rather than marketing claims. This roadmap describes how to evolve the project into a more complete defensive training platform **without** expanding it into a scanner, credential-testing tool, production SOC, or external-data collector.

> **Strategic principle:** every new capability must make a controlled analyst decision more inspectable, not merely add another ATT&CK label, dashboard widget, or synthetic event type.

## Current baseline and target state

| Dimension            | Current baseline                                                                                                   | Target state                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Detection content    | Three correlated SSH/decoy/discovery rules with positive, benign, and boundary scenarios.                          | A small, coherent curriculum of safe behavior families, each with telemetry, triage, negative controls, and regression evidence. |
| Analyst experience   | Explainable cases, notes, dispositions, ATT&CK context, integrity status, and scenario playbooks.                  | Guided exercise mode with evidence-first prompts, rubric-based feedback, and outcome traceability.                               |
| Evaluation           | Deterministic result matrix, coverage, precision, false-positive rate, time-to-detect, and ATT&CK traceability.    | Regression trend history, rule-version comparisons, contract coverage, and quality thresholds per release.                       |
| Repository assurance | Protected `main`, unit/browser/MySQL checks, CodeQL, audit, bundle budget, release evidence, and Pages deployment. | Accessibility/link/visual regression checks, catalog version enforcement, release compatibility notes, and health automation.    |
| Public presentation  | Restrained GitHub Pages use-case site that links to repository evidence.                                           | Evidence-led documentation portal with changelog, glossary, accessible social metadata, and zero unverified claims.              |

## Architecture guardrails

The roadmap preserves five non-negotiable boundaries. MIRAGE remains local-first; scenarios remain synthetic or sourced from the existing bounded private fixture; analyst training never becomes real-person scoring; no capability initiates external collection, scanning, credential testing, or exploitation; and every public claim remains traceable to versioned code, tests, or release evidence.

MITRE’s current model distinguishes high-level detection strategies from platform-specific analytics. MIRAGE should adopt that separation in its catalog: the **strategy** explains the defensive question and required observations, while the **analytic** holds the narrow deterministic logic. [1] NIST’s CSF framing supports treating this work as a risk-management and evidence-improvement program rather than a list of isolated technical features. [2]

## Product roadmap

### Release 1.2 — Detection curriculum and catalog maturity

The first expansion should deepen the existing SSH-decoy learning journey, not jump immediately to unrelated cloud, endpoint, or network domains. Add **two or three safe behavior families** that use the same bounded synthetic telemetry model and can be understood alongside the current rules.

| Candidate family                       | Learning value                                                                                        | Required control design                                                                                                         | Explicit boundary                                                     |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Low-and-slow authentication pressure   | Shows why aggregation windows and concentration logic matter, not only high-volume bursts.            | Positive, benign retry, and just-below-threshold scenarios; source/time/user telemetry contract; rule-version regression tests. | No password guessing, target enumeration, or real credential use.     |
| Post-auth discovery context            | Extends the existing decoy story by separating isolated inventory from correlated discovery behavior. | Allowlisted synthetic commands, sequence ordering, analyst questions, and a benign maintenance scenario.                        | No command execution guidance or raw terminal capture.                |
| Controlled access-policy change signal | Teaches why a sensitive configuration event may require corroborating context.                        | Synthetic change event, authorized-change negative control, source attribution, bounded time window, and disposition boundary.  | No management-plane access, API calls, or real configuration changes. |

The catalog should gain a stable `strategyId`, `analyticsVersion`, `changeClass`, `deprecationStatus`, and `evaluationContract` for each rule. The `evaluationContract` must name required positive controls, negative controls, threshold edges, expected case count, and permitted variance. This allows a later rule change to answer: _what changed, why, and which scenario proves it still works?_

**Exit criteria:** five or six total rules; every rule has a strategy/analytic separation, telemetry prerequisites, triage boundary, at least one positive control, one negative or edge control, and deterministic test assertions; the catalog rejects references to missing controls or unsupported event fields.

### Release 1.3 — Guided analyst exercise mode

Introduce an optional **exercise mode** over the existing analyst workflow. It should guide evidence interpretation rather than simulate a real production incident queue. A learner opens a selected scenario, reviews the evidence timeline, answers short rationale prompts, chooses a disposition, and sees controlled feedback tied to the rule’s documented boundary.

| Component              | Behavior                                                                                                             | Success measure                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Exercise manifest      | Defines permitted scenario, target decision, evidence focus, expected reasoning themes, and feedback text.           | Every exercise is versioned, safety-reviewed, and linked to a catalog scenario.  |
| Evidence-first prompts | Asks about source continuity, time window, missing telemetry, caveats, and benign explanations before a disposition. | A decision cannot be graded from the ATT&CK label alone.                         |
| Rubric engine          | Scores only scenario-specific reasoning signals and stores no public leaderboard.                                    | Feedback is deterministic, explainable, and removable by the user or instructor. |
| Instructor view        | Displays cohort-free completion statistics locally or in a single lab instance.                                      | No personal profiling, remote tracking, or collection by default.                |

The first rubric should be deliberately small: acknowledge the telemetry prerequisites, identify a supporting fact, name a caveat, and select an allowable disposition. Do not claim that a learner is qualified for production SOC work; the feedback validates reasoning against a controlled scenario only.

**Exit criteria:** three guided exercises, rubric unit tests, keyboard-accessible completion flow, explicit data-retention behavior, and a contributor guide for authoring safe exercise manifests.

### Release 1.4 — Evaluation history and detection-change intelligence

Turn one-off validation into release-over-release evidence. Store a compact evaluation snapshot that contains catalog version, rule versions, scenario results, quality-gate status, and generated-at timestamp. A new comparison view can answer whether a proposed catalog change improved coverage, changed alert volume, or invalidated an expected negative control.

| Enhancement         | Implementation approach                                                                | Acceptance condition                                                  |
| ------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Snapshot schema     | Persist a normalized evaluation run record with a deterministic catalog hash.          | Snapshot is immutable and its hash is verified in tests.              |
| Baseline comparison | Compare the current run against a tagged baseline or committed fixture.                | New, removed, and changed observations are explicit.                  |
| Release threshold   | Define allowed deltas for expected detections, false positives, and scenario coverage. | CI fails with an actionable explanation when a threshold is exceeded. |
| Evidence export     | Generate a compact JSON and Markdown evaluation summary as a workflow artifact.        | The release notes can link to a reproducible evaluation artifact.     |

**Exit criteria:** one baseline fixture per supported catalog version, CI comparison on catalog changes, and a documented rule for intentional baseline updates.

### Release 2.0 — Modular telemetry domains

Only after the SSH/decoy curriculum is complete should MIRAGE support additional **synthetic** telemetry domains. Add domains as modules with isolated schemas, event generators, fixture contracts, and feature flags. The first domain should be selected based on educational value and maintainable observability, not ATT&CK popularity.

Possible future modules are a synthetic Linux audit trail, a synthetic identity-provider audit trail, or a configuration-change stream. Each module must deliver at least two rules and a coherent benign/edge scenario pair before it is considered supported. No module may require real cloud accounts, public endpoints, or third-party credentials.

**Exit criteria:** a domain-module interface; one optional second domain; per-domain data minimization statement; and documentation that distinguishes supported lab telemetry from production integrations.

## Assurance and engineering roadmap

### Test strategy

Expand from the existing strong unit and browser baseline into a layered quality model.

| Layer            | Planned check                                                                                                                    | Why it matters                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Catalog contract | Schema mutation tests and property-oriented tests for uniqueness, control references, version consistency, and supported fields. | Stops incomplete detection metadata before it reaches runtime.                           |
| Engine behavior  | Positive, benign, threshold-edge, ordering, and missing-telemetry cases for every rule.                                          | Keeps deterministic behavior meaningful under refactoring.                               |
| API/persistence  | Migration-forward, transaction-rollback, integrity-chain, authorization, and retention tests.                                    | Protects the analyst record and evaluation evidence.                                     |
| Browser          | Authenticated analyst flow, guided exercise, evaluation comparison, and mobile keyboard flows.                                   | Verifies the product users actually operate.                                             |
| Public site      | HTML semantics, internal/external link checks, accessibility scan, responsive screenshot regression, and metadata assertions.    | Keeps the Pages site trustworthy and usable without turning it into a marketing surface. |
| Supply chain     | SBOM generation, dependency review, CodeQL, production audit, pinned action revisions, and release artifact provenance.          | Improves maintenance visibility and makes releases easier to verify.                     |

The GitHub Pages workflow should add an accessibility and link-validation job before packaging. It should run only against the static site, require no analytics or third-party runtime, and fail on missing page titles, missing main landmarks, broken relative links, missing safety copy, or inaccessible color contrast. The existing Pages deployment pattern already uses a separate artifact build and a restricted deploy job, which GitHub documents as the recommended custom-workflow model. [3]

### Performance and resilience

Set explicit performance budgets instead of treating a successful build as sufficient. Keep the production application’s JavaScript budget, add a CSS budget, measure initial route render time in browser tests, and keep the static Pages artifact small enough to deploy quickly. Add data-volume tests that exercise a bounded but realistic number of cases and evidence items, measuring API latency and UI responsiveness without using real customer data.

### Security and governance

Maintain a small, auditable governance model. Add `CODEOWNERS` for detection catalog, security-sensitive server code, workflow files, and public documentation. Keep direct owner pushes possible according to the repository’s established model, while retaining the protected status checks. Document how to triage a CodeQL alert, a dependency alert, a failed Pages deployment, a rule regression, and a data-governance concern.

Request GitHub integration permissions for code-scanning and Dependabot-alert visibility only if the maintainers want automated alert inventory in future release evidence. The project should not claim that its alert queue is empty when the integration cannot query it.

## Documentation and public-project roadmap

| Deliverable                   | Purpose                                                                                              | Definition of done                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `CHANGELOG.md`                | Human-readable release history using Keep a Changelog-style categories.                              | Every release explains catalog, schema, behavior, and compatibility changes.                  |
| Detection catalog changelog   | Per-rule and per-scenario evolution history.                                                         | Each entry links a catalog version to a rationale and evaluation delta.                       |
| Architecture decision records | Preserve decisions on scope, persistence, catalog semantics, Pages deployment, and exercise privacy. | A contributor can understand a non-obvious design choice without reverse-engineering commits. |
| Threat model update           | State assets, trust boundaries, abuse cases, mitigations, and accepted limitations.                  | It is reviewed when new telemetry domains or persistence features are added.                  |
| Maintainer guide              | Covers releases, dependencies, alerts, Pages recovery, versioning, and contribution triage.          | A second maintainer can perform a routine release end to end.                                 |
| Public roadmap                | Shows selected upcoming themes and explains why items are deferred.                                  | It distinguishes committed work from ideas and preserves the controlled-scope boundary.       |

The GitHub Pages site should remain compact. Its next improvements should be a short catalog summary generated from versioned data, a release/evidence page, a glossary, an accessible social-preview metadata block, and link checking—not animation, dashboards, counters, testimonials, or simulated live operations.

## Delivery sequence and ownership

| Milestone | Primary work                                                                  | Suggested release | Ownership split                                                                                                      | Verification gate                                                    |
| --------- | ----------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| M1        | Catalog strategy/version schema, two safe rule families, controls, and tests. | `v1.2.0`          | AbdulrahmanRezki: engine/catalog/UI; Mohammad Thabet: guides, release notes, public copy.                            | Full quality, browser, MySQL, CodeQL, evaluation contract checks.    |
| M2        | Guided exercise mode and privacy-preserving rubric.                           | `v1.3.0`          | AbdulrahmanRezki: product flow and tests; Mohammad Thabet: exercise authoring guide, threat model, release evidence. | Authenticated browser suite, accessibility checks, retention review. |
| M3        | Evaluation snapshots, baseline comparison, and release artifact.              | `v1.4.0`          | AbdulrahmanRezki: persistence/comparison engine; Mohammad Thabet: changelog, upgrade guide, public roadmap.          | Migration/persistence tests, CI baseline-delta gate.                 |
| M4        | Modular synthetic telemetry domain and maintainer automation.                 | `v2.0.0`          | Joint design review; alternate implementation/documentation commits to keep attribution balanced.                    | Domain-module contract tests, security review, Pages/README sync.    |

Every milestone should use a short design record before code, a single versioned catalog migration, alternate author attribution for implementation and documentation commits, direct pushes to protected `main` only under the established workflow, and a release tag only after the required checks pass.

## Prioritization model

1. **Do now:** catalog versioning, two safe detection families, control coverage, changelog, accessibility/link checks, and screenshot regression.
2. **Do next:** guided exercise mode, rubric privacy boundaries, evaluation snapshots, and baseline comparisons.
3. **Do later:** a second synthetic telemetry domain, local instructor view, SBOM/provenance expansion, and community-health automation.
4. **Do not pursue:** production data ingestion, live scanning, attack execution, public learner ranking, unbounded command capture, or claims of production detection efficacy.

## Success metrics

The roadmap is successful when quality becomes more measurable without inflating scope. Track catalog-contract completeness, scenario-control completeness, deterministic evaluation coverage, false positives in known-benign controls, escaped browser/a11y defects, bundle budget adherence, release reproducibility, documentation-link health, and mean time to resolve a failed workflow or alert. Avoid vanity metrics such as raw ATT&CK technique count, page views, synthetic alert volume, or number of dashboard components.

## References

[1] [MITRE ATT&CK: Detection Strategies](https://attack.mitre.org/detectionstrategies/)

[2] [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

[3] [GitHub Docs: Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
