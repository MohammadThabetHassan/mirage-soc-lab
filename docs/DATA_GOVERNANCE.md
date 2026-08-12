# SOC Data Governance

## Integrity controls

Scenario persistence now writes the scenario run, cases, correlated events, and evidence-lineage rows in one database transaction. Case disposition writes similarly append the analyst note, append the tamper-evident history entry, and update the current-state projection atomically. A failed write therefore rolls back the associated batch rather than leaving a partially persisted chain.

The database schema includes query indexes for active case queues, scenario/event timelines, case notes, disposition history, and evidence lineage. It also enforces uniqueness of disposition hashes per case and of the case/event/rule-version evidence relationship, preventing accidental duplicate lineage links.

## Migration procedure

| Step             | Required action                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| Before migration | Take a database backup and review the generated or reviewed SQL against the target MySQL version.                   |
| Apply            | Run the project migration command in a controlled environment with a valid `DATABASE_URL`.                          |
| Verify           | Confirm the expected indexes exist and run `pnpm quality` plus the authenticated scenario workflow.                 |
| Rollback         | Use a reviewed compensating migration; do not delete append-only evidence or history records as an ad hoc rollback. |

## Retention policy

MIRAGE is a controlled-lab product and should retain only the data needed for training and evaluation. The recommended default is 30 days for normalized lab events and 180 days for completed scenario, case, and evidence records, unless a course, demo, or incident-review requirement needs a shorter policy.

Retention execution must be an administrator-reviewed scheduled database task in the deployment environment. It must produce an audit record with the policy version, time range, affected-row counts, and operator identity. It must never silently delete data while an active case or integrity investigation references it.

> The repository documents the retention contract but does not run automatic deletion from the application process. This avoids accidental loss in a local development or demonstration database.
