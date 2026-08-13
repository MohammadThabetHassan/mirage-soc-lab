# Contributing to MIRAGE

MIRAGE is a controlled detection-engineering lab. A good contribution makes a small behavior easier to test, understand, or practice. It does not turn the project into a scanner, credential-testing tool, exploit framework, public honeypot, or production SOC.

## Local setup

Use Node.js 22+ and pnpm 10. For a full application run, configure a MySQL-compatible database and OAuth values in your own uncommitted `.env` file.

```bash
pnpm install
pnpm dev
```

For schema work, inspect the generated migration before applying it:

```bash
pnpm db:push
```

## Before changing code

Read [Architecture](docs/ARCHITECTURE.md) for the application flow. Read the [Detection Engineering Guide](docs/DETECTION_ENGINEERING_GUIDE.md) before touching the catalog, scenarios, engine expectations, evaluation baseline, or exercises.

Keep server input validated, use the existing protected or admin procedures, and keep controlled telemetry redacted and bounded. If a change affects a rule, update its positive and control scenarios at the same time. If it affects stored data, include a forward migration and test it against MySQL.

## Checks

Run these before committing:

```bash
pnpm format:check
pnpm test
pnpm check
pnpm build
pnpm check:bundle
pnpm check:showcase
pnpm test:browser
pnpm security:audit
```

`pnpm quality` runs the first six checks that make up the normal source-quality gate. The MySQL persistence test runs in CI with a disposable database and can be run locally when `DATABASE_URL` is available.

## Commit and review model

This repository currently uses direct, verified commits on `main`. Keep each commit focused: source and tests together, then documentation or release notes when they describe separate work. Do not push a change that has not passed the checks it affects.

Use clear subjects such as `feat:`, `fix:`, `test:`, `docs:`, or `refactor:`. Do not add unrelated formatting, generated artifacts, secrets, raw lab captures, or fake user feedback.

When working with another authorized maintainer identity, use only the name and email the repository owner has provided. Split real implementation and documentation work naturally; do not manufacture empty commits for attribution.

## What to update with a feature

| Change              | Update with it                                                                         |
| ------------------- | -------------------------------------------------------------------------------------- |
| Rule or scenario    | Catalog, deterministic test, control case, evaluation baseline, and analyst text.      |
| Database schema     | Forward migration, persistence test, and any affected types.                           |
| Public project page | `showcase/`, its static check, and any README claim that changed.                      |
| Exercise            | Deterministic server test, protected route behavior, and the non-persistence boundary. |

Before a release, confirm the working tree is clean, hosted checks are green for the pushed commit, GitHub Pages is live if it changed, and the release tag points to that verified commit.
