# Release Readiness

## Assessment result

MIRAGE meets its **controlled-lab release-candidate engineering gates**. This assessment reflects the repository’s deterministic telemetry scope, authenticated analyst workflow, and documented operational constraints. It is not a claim that MIRAGE is an autonomous production SOC, a substitute for a penetration test, or an authorization to interact with third-party infrastructure.

## Verified evidence

| Control            | Evidence                                                                                                                                                                                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code quality       | `pnpm quality` validates Prettier formatting, 27 local unit/router/configuration tests, strict TypeScript, a production build, and the JavaScript bundle budget. The disposable-MySQL persistence test is intentionally skipped only when no `DATABASE_URL` is configured locally. |
| Browser quality    | `pnpm test:browser` passes six checks across desktop Chromium and a mobile Chromium viewport. The suite covers protected-route gating, semantic main-region labeling, keyboard focus, control names, valid ARIA references, and horizontal-overflow regression.                    |
| Database assurance | CI applies all Drizzle migrations to a disposable MySQL 8.4 service, persists the full synthetic pipeline, associates every generated event, changes a case disposition, and verifies evidence/disposition hash chains.                                                            |
| Runtime safety     | Production startup rejects missing or unsafe authentication, ownership, OAuth, or MySQL configuration. The server validates ports, limits request bodies, returns request-correlated safe faults, and distinguishes liveness from database-backed readiness.                       |
| Browser boundary   | Response headers disable framing and plugin content, constrain resources, set a no-referrer policy, disable MIME sniffing, and add production HSTS. Development receives the minimum Vite refresh allowances; production does not allow inline scripts.                            |
| Supply chain       | The quality workflow audits production dependencies at the high-severity threshold. Pull requests receive a least-privilege dependency-review workflow, and a versioned changelog/release procedure establishes release evidence.                                                  |
| Analyst integrity  | Scenario and disposition persistence is transactional. Evidence lineage and disposition history are append-only, uniquely constrained, hash-chained, and exposed through an integrity verifier.                                                                                    |

## Required CI gates

| Workflow job                                | Trigger                            | Required result                                                                 |
| ------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------- |
| Quality gate                                | Pushes to `main` and pull requests | Formatting, test suite, strict TypeScript, build, and bundle budget pass.       |
| Production dependency audit                 | Pushes to `main` and pull requests | No production dependency advisory at or above the configured threshold.         |
| Desktop and mobile browser smoke tests      | Pushes to `main` and pull requests | All configured Chromium browser tests pass.                                     |
| MySQL migration and persistence integration | Pushes to `main` and pull requests | All migrations apply and real-MySQL scenario/disposition integrity test passes. |
| Dependency review                           | Pull requests                      | No prohibited high-severity dependency change is introduced.                    |

Repository administrators should protect `main` by requiring the applicable checks before merge and requiring review for the paths identified in [CODEOWNERS](../.github/CODEOWNERS).

## Residual limitations and owner follow-up

| Limitation                                                       | Current treatment                                                                        | Required before broader deployment                                                                              |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Browser automation does not use a dedicated real OAuth identity. | Router-level authenticated flows and public browser gate are covered separately.         | Operate a disposable CI identity and isolated OAuth environment for end-to-end identity testing.                |
| Action throttling is process-local.                              | The policy limits accidental loops and single-instance abuse without retaining payloads. | Use a shared, durable limiter before horizontal scaling.                                                        |
| Migration assurance starts with a disposable empty database.     | CI proves all migrations and real persistence behavior on MySQL 8.4.                     | Add upgrade-path fixtures and a tested rollback or forward-fix procedure for live database evolution.           |
| Evidence hash chains are application-local.                      | Integrity verification detects modification within stored chains.                        | Add external anchoring or signed attestations if non-repudiation is required.                                   |
| Data-at-rest protections are deployment-specific.                | The application minimizes and redacts controlled telemetry before persistence.           | Enforce managed database encryption, backups, access isolation, and retention policy in the target environment. |

## Release decision

**Approved for controlled-lab release-candidate use**, subject to the [Release Procedure](RELEASE_PROCEDURE.md), protected-branch enforcement, private deployment credentials, backed-up database migrations, and continued dependency/security review.
