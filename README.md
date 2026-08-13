# MIRAGE SOC Lab

<p align="center">
  <img src="docs/assets/mirage-signal-prism-logo.png" width="132" alt="MIRAGE signal prism mark" />
</p>

MIRAGE is a small, controlled SOC lab for practicing detection engineering. It replays deterministic telemetry, creates explainable analyst cases, and checks whether a rule still behaves as expected after code or catalog changes.

It is deliberately **not** a production SIEM, scanner, honeypot, credential-testing tool, or external collection service. The built-in scenarios are synthetic. The optional Cowrie import accepts only a bounded, redacted private-lab fixture.

**Live project overview:** [mohammadthabethassan.github.io/mirage-soc-lab](https://mohammadthabethassan.github.io/mirage-soc-lab/)

## What you can do with it

| Workflow             | What it shows                                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Replay a scenario    | Run a fixed story such as repeated logins, a later success, or a staged decoy/discovery sequence.                 |
| Read a case          | Inspect the evidence timeline, risk factors, ATT&CK context, telemetry requirements, and the rule’s stated limit. |
| Test a boundary      | Run benign and just-below-threshold controls to see what should **not** become a case.                            |
| Evaluate the catalog | Compare expected and observed detections for every current scenario.                                              |
| Practice triage      | Use the guided exercises to explain a decision from the evidence instead of relying on alert labels alone.        |

The current catalog has five deterministic rules: repeated authentication failures, success after repeated failures, a multi-stage decoy/discovery sequence, low-and-slow authentication pressure, and a synthetic policy-change context rule. See the [Detection Engineering Guide](docs/DETECTION_ENGINEERING_GUIDE.md) for the exact contract behind each one.

## Quick start

MIRAGE uses Node.js 22+, pnpm 10, a MySQL-compatible database for a full application run, and an OAuth configuration for sign-in. Tests that do not need a database run without one.

```bash
pnpm install
pnpm dev
```

For a database-backed local run, create an uncommitted `.env` file with your own `DATABASE_URL`, `OAUTH_SERVER_URL`, `VITE_APP_ID`, `JWT_SECRET`, and `OWNER_OPEN_ID` values. Production startup validates that these values are present and sensible.

## Demo walkthrough

1. Sign in and choose **Full pipeline story** on the home screen.
2. Run the scenario. It creates the documented repeated-failure, success-after-failure, and multi-stage cases.
3. Open a case and compare the evidence timeline with the rule’s ATT&CK mapping, telemetry requirements, triage questions, and caveat.
4. Add a disposition or note, then use the integrity view to check the stored evidence and analyst-history chains.
5. Open **Evaluation** to compare every scenario with its expected result. Benign and boundary scenarios should stay quiet.
6. Open **Exercises** for short, controlled evidence-reading practice. Exercise responses are evaluated in memory and are not stored as user scores or notes.

## Checks that ship with the project

| Command                 | What it checks                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm quality`          | Formatting, the static project-page contract, unit tests, strict TypeScript, production build, and the JavaScript bundle limit. |
| `pnpm test:browser`     | Desktop and mobile sign-in-gate, keyboard, semantic, and layout smoke tests.                                                    |
| `pnpm security:audit`   | High-severity production dependency advisories.                                                                                 |
| `pnpm test:persistence` | Scenario and audit-chain persistence when a MySQL database is available.                                                        |
| `pnpm check:showcase`   | The GitHub Pages source: required content, heading order, landmarks, links, contrast tokens, and responsive CSS.                |

GitHub Actions runs the quality gate, dependency audit, browser smoke tests, and a disposable-MySQL migration/persistence test on `main`. CodeQL scans the TypeScript and workflow code. The Pages workflow publishes the static project overview from `showcase/` after validating it.

## Project layout

```text
client/        React analyst workspace
server/soc/    catalog, scenarios, detection engine, exercises, and tests
drizzle/       MySQL schema and forward migrations
showcase/      static GitHub Pages project overview
docs/          architecture and detection-engineering notes
```

## Reading and changing the project

The project keeps its technical writing intentionally small. Start with the [Architecture](docs/ARCHITECTURE.md) for the application flow and storage model. Read the [Detection Engineering Guide](docs/DETECTION_ENGINEERING_GUIDE.md) before changing a rule or scenario. Use [Contributing](CONTRIBUTING.md) for setup, checks, and the repository’s direct-main workflow.

## Scope and safety

MIRAGE does not call out to targets, scan networks, test credentials, deploy a public honeypot, run exploits, or automate containment. Its detections are examples for a controlled lab. A rule match is a prompt to inspect evidence, not a claim that real-world activity is malicious.
