# Dependency Security Policy

## Current baseline

The production dependency audit was rerun after the direct dependency updates in this hardening batch and reported **no known vulnerabilities** at the configured high-severity threshold. The validated command is:

```bash
pnpm security:audit
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

The current batch upgrades the S3 SDK clients, tRPC packages, Axios, Streamdown, Express, Drizzle ORM, Nano ID, and Recharts. The chart adapter was updated for the Recharts v3 payload contracts and verified through the full quality command.
