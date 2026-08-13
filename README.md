# MIRAGE SOC Lab

[![Quality and Security](https://github.com/MohammadThabetHassan/mirage-soc-lab/actions/workflows/quality.yml/badge.svg)](https://github.com/MohammadThabetHassan/mirage-soc-lab/actions/workflows/quality.yml)
[![CodeQL](https://github.com/MohammadThabetHassan/mirage-soc-lab/actions/workflows/codeql.yml/badge.svg)](https://github.com/MohammadThabetHassan/mirage-soc-lab/actions/workflows/codeql.yml)
[![Node.js 22](https://img.shields.io/badge/node-%3E%3D22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Package manager](https://img.shields.io/badge/pnpm-10.4.1-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Scope](https://img.shields.io/badge/scope-controlled%20SOC%20lab-0EA5E9)](#defensive-scope)

**MIRAGE** is a local-first Security Operations Center simulation and evaluation platform. It generates safe synthetic telemetry, applies deterministic detection-as-code rules, stores explainable analyst cases, and presents a traceable SOC workflow for training, evaluation, and security-engineering demonstrations.

> **MIRAGE is a controlled-lab application.** It does not scan external systems, test credentials, collect public telemetry, or interact with third-party infrastructure. It is not an autonomous production SOC.

![MIRAGE signal prism: an amber incident ray resolved into a graphite plane and cyan evidence traces](docs/assets/mirage-signal-prism-logo.png)

_The signal prism is MIRAGE’s compact project mark. The social-preview artwork remains configured separately in GitHub repository settings and does not appear in this README. The public showcase site uses richer visual storytelling without treating illustrative material as telemetry._

> **Public showcase:** explore the [MIRAGE Signal Foundry evidence dossier](https://3000-iaeafv0nq30ay189bp7mb-858e92c5.sg1.manus.computer) for the project’s controlled scope, ATT&CK-aware detection method, assurance model, and release evidence.

## Why MIRAGE

| Capability                   | What it provides                                                                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled telemetry         | Deterministic scenario replay and bounded, redacted imports from a private Cowrie lab fixture.                                                                    |
| Detection-as-code            | Versioned rules, thresholds, scoring rationale, ATT&CK context, and regression scenarios.                                                                         |
| Explainable analyst workflow | Evidence timelines, risk-factor breakdowns, analyst notes, dispositions, and case histories.                                                                      |
| Integrity assurance          | Atomic persistence, append-only disposition history, hash-chained evidence lineage, and verification status.                                                      |
| Repeatable quality           | Formatting, unit tests, strict TypeScript, production build, bundle budget, MySQL integration, CodeQL, dependency audit, and desktop/mobile browser smoke checks. |

## System overview

```mermaid
flowchart LR
  A[Controlled synthetic scenarios] --> B[Normalization and redaction]
  C[Private Cowrie lab fixture] --> B
  B --> D[Detection-as-code engine]
  D --> E[Explainable cases]
  E --> F[Evidence lineage and analyst history]
  F --> G[Authenticated SOC workspace]
  D --> H[Evaluation corpus and ATT&CK coverage]
```

The detailed design is available in [Architecture](docs/ARCHITECTURE.md), while [Security Assurance](docs/SECURITY_ASSURANCE_MATRIX.md) records the control baseline, evidence, and remaining deployment prerequisites.

## Defensive scope

MIRAGE intentionally accepts only the following safe inputs and operations.

| Boundary              | Enforced behavior                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Scenario generation   | Uses deterministic, built-in synthetic scenarios only.                                                                                           |
| Cowrie import         | Requires an administrator, accepts a bounded JSON-lines payload, allowlists supported event types, and rejects non-private or malformed records. |
| Data handling         | Does not persist passwords, TTY logs, raw Cowrie records, file-transfer content, or supplied sensitive fields.                                   |
| Analyst workflow      | Requires authentication; notes and dispositions retain the authenticated analyst attribution.                                                    |
| Demonstration profile | The optional Cowrie Compose profile uses an internal network and exposes no Cowrie port.                                                         |

## Quick start

### Prerequisites

Install **Node.js 22+**, **pnpm 10.4.1**, and a **MySQL-compatible database**. For self-hosting, provide a compatible OAuth deployment and use a private `.env` file that is never committed.

| Variable                | Purpose                                                              |
| ----------------------- | -------------------------------------------------------------------- |
| `DATABASE_URL`          | MySQL-compatible database connection string.                         |
| `JWT_SECRET`            | Session-signing secret. Use a unique, high-entropy production value. |
| `VITE_APP_ID`           | Application identifier used by the OAuth integration.                |
| `OAUTH_SERVER_URL`      | Compatible OAuth service base URL.                                   |
| `VITE_OAUTH_PORTAL_URL` | OAuth portal URL used by the client sign-in flow.                    |
| `OWNER_OPEN_ID`         | Required production administrator identity.                          |

```bash
cp .env.example .env
# Edit .env with local development values. Do not commit it.
pnpm install
pnpm db:push
pnpm dev
```

Open the local URL, choose **Sign in to continue**, and complete the configured OAuth flow. The dashboard remains authenticated because it records analyst dispositions and notes.

> Never reuse production credentials in development and never copy platform-provided values into an external deployment.

## Demonstration walkthrough

1. Select **Full pipeline story** and choose **Run demo scenario**.
2. Review the three generated cases: repeated authentication failures, success after failure, and multi-stage decoy/discovery activity.
3. Open a case to inspect its evidence timeline, deterministic risk factors, and ATT&CK mapping.
4. Record an analyst note and disposition, then review the immutable history and integrity-verification status.
5. Open **Evaluation** to review deterministic scenario metrics. The benign-admin scenario should produce no cases.

## Verification and quality gates

| Command                 | Purpose                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------- |
| `pnpm format:check`     | Enforces repository formatting.                                                     |
| `pnpm test`             | Runs server, detection, integrity, authorization, and authenticated workflow tests. |
| `pnpm check`            | Runs strict TypeScript validation.                                                  |
| `pnpm build`            | Produces the browser and server production bundles.                                 |
| `pnpm test:persistence` | Runs the real-MySQL persistence test when `DATABASE_URL` is configured.             |
| `pnpm test:browser`     | Runs desktop and mobile browser, semantic, and keyboard smoke tests.                |
| `pnpm security:audit`   | Audits production dependencies at the configured severity threshold.                |
| `pnpm check:bundle`     | Enforces the production JavaScript bundle budget after a build.                     |
| `pnpm quality`          | Runs formatting, unit tests, type checks, production build, and bundle budget.      |

The GitHub workflow requires quality, dependency-audit, browser-smoke, and disposable-MySQL migration/persistence jobs for changes pushed to `main` and pull requests targeting `main`. Pull requests also receive a least-privilege dependency review. CodeQL scans TypeScript and GitHub Actions on changes to `main`, pull requests, and a weekly schedule; results are published to GitHub Code Scanning and retained as SARIF evidence for fourteen days. Browser reports are retained for seven days only when a smoke-test job fails.

## Documentation

| Document                                                                          | Purpose                                                                         |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [Architecture](docs/ARCHITECTURE.md)                                              | Component boundaries, data flow, trust boundaries, and persistence model.       |
| [Production Excellence Plan](docs/PRODUCTION_EXCELLENCE_PLAN.md)                  | Researched hardening roadmap and assurance target.                              |
| [Security Assurance Matrix](docs/SECURITY_ASSURANCE_MATRIX.md)                    | ASVS-inspired control coverage, evidence, and residual risks.                   |
| [Authorization and Abuse Controls](docs/AUTHORIZATION_AND_ABUSE_CONTROLS.md)      | Role policy, rate limits, and distributed-scaling boundary.                     |
| [Data Governance](docs/DATA_GOVERNANCE.md)                                        | Integrity, migration, and retention procedures.                                 |
| [Operations Runbook](docs/OPERATIONS_RUNBOOK.md)                                  | Health checks, request IDs, incident triage, and release operations.            |
| [Release Readiness](docs/RELEASE_READINESS.md)                                    | Verified release evidence and documented limitations.                           |
| [Release Procedure](docs/RELEASE_PROCEDURE.md)                                    | Versioning, migration, deployment, and post-release verification steps.         |
| [Public Release Checklist](docs/PUBLIC_RELEASE_CHECKLIST.md)                      | Safe visibility-change, social-preview, security, and governance actions.       |
| [Dependency Security](docs/DEPENDENCY_SECURITY.md)                                | Dependency audit policy and remediation history.                                |
| [Detection Engineering Guide](docs/DETECTION_ENGINEERING_GUIDE.md)                | Rule contract, ATT&CK context, telemetry prerequisites, and safe triage.        |
| [Contributing](CONTRIBUTING.md)                                                   | Local development, test, review, and pull-request expectations.                 |
| [Security Policy](SECURITY.md)                                                    | Vulnerability-reporting route and security expectations.                        |
| [Citation Metadata](CITATION.cff)                                                 | Standard software citation for training, research, and demonstrations.          |
| [Visual Assets](docs/assets)                                                      | Compact README brand mark and the separate GitHub social-preview upload file.   |
| [Public Showcase](https://3000-iaeafv0nq30ay189bp7mb-858e92c5.sg1.manus.computer) | Signal Foundry presentation of MIRAGE’s scope, method, assurance, and evidence. |

## Detection and ATT&CK context

The included deterministic rules model repeated authentication failures, success after failure, and a multi-stage decoy/discovery sequence. The evaluation corpus labels known positives, a known benign case, and an edge case. Each rule records technique, tactic, rationale, caveat, and reference links.

- [T1110 — Brute Force](https://attack.mitre.org/techniques/T1110/)
- [T1078 — Valid Accounts](https://attack.mitre.org/techniques/T1078/)
- [T1087 — Account Discovery](https://attack.mitre.org/techniques/T1087/)

## Contributing and support

Constructive contributions that preserve MIRAGE’s controlled defensive scope are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md), follow the project’s [Code of Conduct](CODE_OF_CONDUCT.md), and review the security boundary in [SECURITY.md](SECURITY.md). For feature requests, support questions, and roadmap proposals, use the repository issue templates. MIRAGE is available under the [MIT License](LICENSE).
