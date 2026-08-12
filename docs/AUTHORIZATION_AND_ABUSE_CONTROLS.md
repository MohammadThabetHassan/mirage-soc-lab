# Authorization and Abuse Controls

## Role policy

MIRAGE distinguishes ordinary authenticated analysts from administrators. Analysts can inspect the SOC dashboard, replay deterministic lab scenarios, review cases, verify case-integrity chains, and submit documented dispositions. Only administrators can import controlled Cowrie telemetry because import writes normalized event records to the lab database.

| Operation                                               | Required access       | Rationale                                                                                 |
| ------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------- |
| Read SOC snapshot, catalog, evaluation, and case detail | Authenticated analyst | The data is controlled lab telemetry but should not be public.                            |
| Replay deterministic scenario                           | Authenticated analyst | Supports supervised lab work while remaining bounded to predefined scenario keys.         |
| Record a disposition                                    | Authenticated analyst | Enables case-management practice and preserves analyst attribution.                       |
| Import controlled Cowrie JSON lines                     | Administrator         | Limits persistence of externally supplied input to an explicit higher-privilege workflow. |

## Rate limits

The server applies process-local sliding-window limits keyed by authenticated user identifier and action. Request bodies are not retained by the limiter.

| Action                        |       Limit |     Window |
| ----------------------------- | ----------: | ---------: |
| Controlled Cowrie import      |  6 requests | 60 seconds |
| Deterministic scenario replay | 12 requests | 60 seconds |
| Case disposition              | 20 requests | 60 seconds |

When a caller exceeds a limit, the API returns a `TOO_MANY_REQUESTS` response with a retry delay. These limits mitigate accidental loops and low-effort abuse in a single process.

> The current limiter is intentionally process-local. A horizontally scaled deployment must replace it with a shared rate-limit store and should add an edge-level request-size limit, identity-aware session controls, and central audit-log retention.

## Test evidence

The regression suite verifies sliding-window behavior, caller isolation, expiry, authenticated access, and rejection of administrator-only import attempts by a standard analyst.
