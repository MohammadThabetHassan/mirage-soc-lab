# Release Procedure

This procedure applies to controlled MIRAGE SOC-lab releases from the protected `main` branch. It turns the repository’s quality gates into a repeatable decision record; it does not authorize public exposure of honeypots, collection of third-party telemetry, or use against systems without written authorization.

## Release preparation

Select the next semantic version and add a dated entry to [CHANGELOG.md](../../CHANGELOG.md). The entry should describe analyst-visible changes, database or security impact, upgrade requirements, and known residual limitations. Confirm that all documentation links, the architecture guide, the security assurance matrix, and this procedure still reflect the release behavior.

| Evidence area                     | Required command or review                                                                    | Release condition                                                                                                 |
| --------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Formatting, test, type, and build | `pnpm quality`                                                                                | Passes without skipped required tests.                                                                            |
| Disposable database               | `DATABASE_URL=… pnpm exec drizzle-kit migrate` and `pnpm test:persistence`                    | Every migration applies to an empty disposable MySQL database and the scenario/disposition integrity path passes. |
| Browser experience                | `pnpm test:browser`                                                                           | Desktop and mobile Chromium smoke tests pass.                                                                     |
| Dependency exposure               | `pnpm security:audit` and dependency-review workflow evidence, where dependency changes exist | No production high or critical advisory is introduced without a documented, time-bounded exception.               |
| Migration safety                  | Review generated SQL and a restoration plan                                                   | Backup, compatibility, and rollback/forward-fix actions are documented before deployment.                         |

## Release execution

A maintainer should verify that the required GitHub Actions checks are green for the exact `main` commit being released. Create an annotated signed tag according to the project’s maintainer signing policy and publish a GitHub release whose notes reproduce the corresponding changelog section. Do not release from an unverified working tree or a commit that differs from the verified CI revision.

Apply database migrations once per deployment using an account limited to the schema changes required by the release. Preserve a database backup and record the migration revision in the deployment record. Restart the service only after the migration completes successfully, and confirm that production configuration validation accepts the deployed environment.

## Post-release verification

After deployment, check `/healthz` and `/readyz` through the intended ingress. Confirm that readiness reports the database as `ready`, that the response carries a request ID, and that the request log contains only metadata. Run the documented authenticated analyst smoke path in the approved environment, then review error telemetry and dependency alerts during the agreed stabilization window.

If verification fails, stop promotion and use the documented forward-fix or rollback plan. Record the affected version, request IDs, database migration state, mitigation, and follow-up issue without placing secrets or raw telemetry in the public record.
