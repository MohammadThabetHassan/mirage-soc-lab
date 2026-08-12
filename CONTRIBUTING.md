# Contributing to MIRAGE

Thank you for helping improve MIRAGE. Contributions must preserve the project’s controlled, defensive SOC-lab scope and keep every behavior explainable, testable, and safe for authorized environments.

## Before you begin

Please read the [Architecture](docs/ARCHITECTURE.md), [Security Policy](SECURITY.md), [Code of Conduct](CODE_OF_CONDUCT.md), and [Production Excellence Plan](docs/PRODUCTION_EXCELLENCE_PLAN.md). Security vulnerabilities should be reported privately through the process in `SECURITY.md`, not opened as public issues.

## Local setup

Install Node.js 22+, pnpm 10.4.1, a MySQL-compatible database, and a compatible OAuth configuration. Copy only your own private development values into an uncommitted `.env` file.

```bash
pnpm install
pnpm db:push
pnpm dev
```

## Engineering expectations

| Area                | Requirement                                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Scope               | Do not add scanning, credential attacks, exploit execution, public honeypot exposure, or third-party targeting.   |
| Input handling      | Validate all server inputs, bound payload sizes, and avoid persisting raw sensitive telemetry.                    |
| Authorization       | Use the least-privileged procedure appropriate to the action and test both allowed and denied behavior.           |
| Detection changes   | Update the versioned catalog, scenario corpus, ATT&CK context, and regression tests together.                     |
| Persistence changes | Add a reviewed migration, preserve atomic writes, and update the data-governance documentation.                   |
| User experience     | Preserve semantic controls, accessible labels, responsive behavior, and clear analyst-facing error messages.      |
| Documentation       | Update the README, architecture, operational notes, and release documentation when behavior or boundaries change. |

## Verification

Run the appropriate checks before opening a pull request.

```bash
pnpm format:check
pnpm test
pnpm check
pnpm build
pnpm test:browser
pnpm security:audit
```

`pnpm quality` runs formatting, unit tests, type checking, and production build together. The repository CI repeats the required checks on `main` and pull requests.

## Pull-request checklist

- [ ] The change is consistent with MIRAGE’s controlled defensive scope.
- [ ] Inputs, authorization, and errors are validated and covered by tests.
- [ ] New detection behavior has deterministic scenarios and explainable evidence.
- [ ] Database changes include reviewed migration and rollback or compensating-migration notes.
- [ ] Documentation and changelog entries are updated when user-visible behavior changes.
- [ ] Formatting, tests, type checks, build, browser checks, and dependency audit pass locally.
- [ ] No secrets, raw sensitive telemetry, generated artifacts, or unrelated formatting changes are included.

## Commit and review guidance

Use concise conventional-style commit subjects such as `feat(soc):`, `fix(ci):`, `test(engine):`, `docs:`, or `refactor(ui):`. Keep commits focused and explain the operational or security impact in the message body. Reviewers should favor testable controls and documented tradeoffs over broad, unverifiable claims.
