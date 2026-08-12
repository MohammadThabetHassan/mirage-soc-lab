# MIRAGE Production-Quality Hardening Roadmap

## Purpose and standard of evidence

MIRAGE is already a credible **controlled SOC-lab and portfolio project**. This roadmap raises it toward a production-quality engineering standard without changing its defensive, local-lab scope. A literal “10/10” cannot be guaranteed by code changes alone: it also depends on a security review, real deployment validation, ongoing patching, and operational ownership. The target is therefore a **release candidate with measured quality gates, documented residual risk, and repeatable evidence**.

## Baseline findings

| Area               | Current strengths                                                                  | Baseline gap to close                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Detection design   | Versioned JSON catalog, schema validation, scenario corpus, ATT&CK coverage matrix | Rule tests are primarily deterministic unit scenarios; no continuous regression workflow exists.           |
| Evidence integrity | Append-only disposition rows, rule-version binding, and hash-chained lineage       | Chains are application-local rather than independently anchored or signed.                                 |
| Safe ingestion     | Cowrie allowlist, local-lab source boundary, deterministic redacted fixture        | Need operational quotas, audit events, and clearer import provenance controls.                             |
| Validation         | 16 passing tests, type check, production build                                     | No CI, browser E2E, migration integration test, accessibility suite, or coverage threshold.                |
| Operations         | README, security policy, verification notes, Docker Compose lab profile            | No structured audit log, alerting/health readiness, runbooks, release checklist, or dependency governance. |
| Dependency hygiene | Lockfile and package scripts exist                                                 | Production dependency audit currently requires remediation and documented exceptions.                      |
| Maintainability    | TypeScript, Zod contracts, SOC domain modules                                      | Formatting currently fails and large JSX modules need decomposition.                                       |

## Quality gates for release candidacy

The release candidate is not considered complete until all required controls below have an observable result.

| Gate                            | Required evidence                                                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Functional correctness          | Unit, integration, and authenticated browser journeys pass in CI.                                                                    |
| Type and formatting quality     | Strict TypeScript and Prettier checks pass with no ignored application files.                                                        |
| Dependency security             | Critical and high production audit findings are remediated or documented in a time-bound exception register.                         |
| Authorization and abuse safety  | Protected procedures, role policy, request limits, and audit events are tested.                                                      |
| Data durability                 | Forward migration and rollback expectations are documented and verified against a disposable MySQL database.                         |
| Accessibility and responsive UX | Keyboard, semantic, contrast, desktop, and mobile smoke checks pass.                                                                 |
| Operability                     | Health/readiness endpoint, structured logs, runbooks, release checklist, and recovery guidance exist.                                |
| Scope integrity                 | The app remains a controlled-lab system and cannot become a public honeypot or remote telemetry collector by configuration accident. |

## Implementation phases

| Phase | Deliverable                                             | Acceptance criteria                                                                                                                                                   | Commit attribution   |
| ----: | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
|     1 | CI quality gate and project formatting baseline         | Automated test, type, build, formatting, and dependency-audit workflows run on pull requests and main; formatting passes.                                             | MohammadThabetHassan |
|     2 | Dependency remediation register and build-hygiene fixes | Production audit is triaged; vulnerable direct paths are updated, removed, or entered into a time-bound exception register; build warnings are reduced or documented. | AbdulrahmanRezki     |
|     3 | Authorization and request-safety layer                  | Explicit SOC roles, least-privilege procedure policy, import quotas, per-user request limits, and auditable security events are implemented and tested.               | MohammadThabetHassan |
|     4 | Data governance and migration safety                    | Database constraints/indexes, retention configuration, provenance metadata, backup/restore guidance, and disposable-database migration tests are delivered.           | AbdulrahmanRezki     |
|     5 | Browser and accessibility validation                    | Authenticated analyst-flow browser tests, keyboard and semantic checks, responsive smoke coverage, and test-fixture isolation are added.                              | MohammadThabetHassan |
|     6 | UI and domain refactoring                               | Case-view and evaluation components are decomposed, typed view models are introduced, and long JSX lines are eliminated.                                              | AbdulrahmanRezki     |
|     7 | Observability and operational health                    | Structured request/audit logs, health/readiness checks, correlation IDs, bounded error reporting, and operator dashboards/runbooks are added.                         | MohammadThabetHassan |
|     8 | Release governance and security review package          | Threat model, incident handling, dependency exception policy, release checklist, changelog, and final quality report are completed.                                   | AbdulrahmanRezki     |
|     9 | Final assurance pass                                    | Full CI-quality replay, performance smoke tests, manual authenticated verification, and residual-risk signoff evidence are captured.                                  | MohammadThabetHassan |
|    10 | Final release documentation                             | Publish a release-candidate assessment describing passed gates, unresolved risks, and owner follow-up dates.                                                          | AbdulrahmanRezki     |

The planned implementation sequence produces **five substantive commits attributed to `MohammadThabetHassan` and five substantive commits attributed to `AbdulrahmanRezki`**. Attribution will use account-specific GitHub no-reply addresses so the commit links are accurate. Each commit must represent a coherent, independently testable batch; no artificial attribution-only commits will be created.

## Non-negotiable safety boundaries

MIRAGE must continue to accept only controlled, recorded lab telemetry. The roadmap will not add scanning, credential testing, public honeypot exposure, threat-actor attribution, or unrestricted remote collection. Any production-facing deployment work must keep authentication, access controls, encrypted transport, and data minimization enabled by default.

## Definition of done

The program is complete only when CI is required on main, production dependencies are remediated or explicitly accepted with expiry dates, tests cover the essential authenticated and database-backed flows, code formatting passes, operational documentation exists, and a final report records both achieved controls and remaining limitations.
