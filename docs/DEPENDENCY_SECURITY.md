# Dependency Security Policy

## Current baseline

The production dependency audit and the full dependency audit were rerun after the public-release remediation and reported **no known vulnerabilities**. The validated commands are:

```bash
pnpm security:audit
pnpm audit
```

This result is a point-in-time assessment, not a permanent guarantee. Dependency advisories change over time and must be reviewed continuously.

## Required controls

| Control                   | Requirement                                                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Pull request quality gate | Formatting, tests, strict type checking, and production build must pass.                                                               |
| Dependency visibility     | The CI workflow runs a production dependency audit on every pull request and main-branch push.                                         |
| Release decision          | Critical or high findings must be patched before release or documented in a time-bound exception record approved by the project owner. |
| Upgrade practice          | Direct dependencies should be updated in coherent batches with compatibility validation through `pnpm quality`.                        |
| Exception record          | An exception must identify the vulnerable package/path, exposure analysis, compensating control, owner, expiry date, and removal plan. |

## Remediation batch

The current public-release batch resolves the advisory-sensitive build chain by updating Vite, Vitest, Tailwind Vite tooling, Drizzle Kit, esbuild, and PostCSS. It removes an unmaintained JSX-location plugin that declared no Vite 7 compatibility, moves pnpm overrides and the Wouter patch into `pnpm-workspace.yaml`, removes pnpm from application dependencies, and pins affected transitive packages to security-fixed versions. The final full audit reports zero low, moderate, high, and critical findings; all changes were verified through the full quality and browser suites.
