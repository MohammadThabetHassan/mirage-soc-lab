# MIRAGE Operations Runbook

## Service checks

| Endpoint       | Expected response             | Use                                                        |
| -------------- | ----------------------------- | ---------------------------------------------------------- |
| `GET /healthz` | HTTP 200 with `status: ok`    | Liveness: the HTTP process can answer requests.            |
| `GET /readyz`  | HTTP 200 with `status: ready` | Readiness: the application has completed its startup path. |

The health endpoints intentionally do not expose database URLs, user information, runtime configuration, or telemetry data.

## Structured request records

Every completed HTTP request emits one JSON record with the following metadata: event name, request identifier, method, path, response status, and duration. Cookies, authorization headers, query values, request bodies, and telemetry content are excluded.

Use the `x-request-id` response header to correlate a user-visible error with a server log line. The service accepts a syntactically safe inbound identifier and generates a new value for malformed or missing identifiers.

## Incident triage

1. Check `/healthz` and `/readyz`.
2. Record the request identifier, UTC time window, route, and visible error without copying sensitive request content into tickets.
3. Review the corresponding structured request record and application error log.
4. If controlled telemetry import or scenario persistence failed, verify database connectivity and migration state before retrying.
5. Preserve append-only evidence and disposition records. Do not repair history by editing hash-chain rows.
6. Apply a reviewed compensating migration or restore procedure only after a backup is confirmed.

## Release checklist

Before publishing a release candidate, run the following commands and attach their output to the release record:

```bash
pnpm quality
pnpm test:browser
pnpm security:audit
```

Confirm that the production dependency audit has no unresolved high or critical findings, migrations are reviewed, browser smoke checks pass for desktop and mobile, and the release notes describe any residual limitations.
