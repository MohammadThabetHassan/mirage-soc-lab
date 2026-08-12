# MIRAGE Release-Readiness Assessment

## Assessment result

MIRAGE meets the repository’s **release-candidate engineering gates** for a controlled SOC-lab application. The current main branch has passing formatting, unit and authenticated router tests, strict TypeScript, production build, desktop/mobile browser smoke checks, and a production dependency audit with no known high or critical findings.

This is a release-readiness assessment for the stated controlled-lab scope. It is not a claim that MIRAGE is an autonomous production SOC or a substitute for a third-party penetration test, operational monitoring program, or compliance audit.

## Verified evidence

| Control                  | Evidence                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Formatting               | `pnpm format:check` passes.                                                                                                                 |
| Unit and router coverage | `pnpm test` passes with 19 tests across 7 files.                                                                                            |
| Type safety              | `pnpm check` passes.                                                                                                                        |
| Production build         | `pnpm build` passes.                                                                                                                        |
| Browser smoke            | `pnpm test:browser` passes on desktop Chromium and a mobile Chromium viewport.                                                              |
| Dependency hygiene       | `pnpm security:audit` reports no known vulnerabilities at the configured high-severity threshold.                                           |
| Authorization            | Controlled Cowrie import is administrator-only; authenticated analyst flow and role denial are covered by tests.                            |
| Request safety           | Bounded 2 MB parser limits and per-analyst operation limits are enforced.                                                                   |
| Evidence integrity       | Atomic scenario/disposition writes, lineage uniqueness constraints, hash-chain verification, and documented retention controls are present. |
| Operations               | Liveness/readiness endpoints, correlation IDs, metadata-only request records, and an operator runbook are present.                          |

## Required CI gates

Main-branch and pull-request automation now requires the quality suite, production dependency audit, and browser smoke suite. Repository settings should additionally protect `main` by requiring all three checks before merge.

## Residual limitations and owner follow-up

| Limitation                                                                              | Risk treatment                                                              | Owner follow-up                                                                                 |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Browser automation validates the unauthenticated gate rather than a real OAuth session. | Authenticated route behavior is covered at the router level.                | Add a disposable test identity or dedicated CI OAuth test environment before public deployment. |
| The rate limiter is process-local.                                                      | Limits mitigate accidental loops and single-process abuse.                  | Replace with a shared store before horizontal scaling.                                          |
| Database migration execution needs a real disposable MySQL environment.                 | Schema, migration, and write-path checks are type-checked and unit-tested.  | Add migration-upgrade and rollback tests in an isolated MySQL CI service.                       |
| The main web bundle remains above 500 KB.                                               | Build completes and functional checks pass.                                 | Split optional dashboard modules after measuring route-level loading impact.                    |
| Hash chains are application-local.                                                      | Integrity checks expose unintentional modification within the stored chain. | Add external anchoring or signatures if evidentiary non-repudiation is required.                |

## Release decision

**Approved for controlled-lab release candidate use.** Deploy only with the documented access controls, required CI checks, backed-up database migrations, and continued dependency-audit review.
