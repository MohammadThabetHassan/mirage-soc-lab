# MIRAGE Security Assurance Matrix

**Reference baseline:** OWASP Application Security Verification Standard (ASVS) 5.0.0 [1].
**Interpretation:** This is a scoped engineering matrix for a controlled SOC-lab application. It is not an assertion of ASVS certification or a substitute for independent testing.

## Control status legend

| Status                  | Meaning                                                                           |
| ----------------------- | --------------------------------------------------------------------------------- |
| Implemented             | The control is present in code and has automated evidence or direct verification. |
| Partial                 | A meaningful control exists but needs environment-specific or broader coverage.   |
| Deployment prerequisite | The control must be supplied by the hosting, identity, or operations environment. |
| Out of scope            | The control does not apply to MIRAGE’s controlled-lab boundary.                   |

## Security controls

| Assurance area              | Status      | MIRAGE implementation and evidence                                                                                                                     | Remaining action                                                                                       |
| --------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Authentication              | Partial     | Protected tRPC procedures require an OAuth-backed user context; browser smoke checks validate the unauthenticated sign-in gate.                        | Test a real disposable OAuth flow in CI before public deployment.                                      |
| Authorization               | Implemented | Administrator-only Cowrie import; protected analyst operations; integration tests cover ordinary-user denial and administrator access.                 | Add environment-specific role-administration workflow documentation.                                   |
| Input validation            | Implemented | Zod schemas, UUID and enum validation, bounded strings, 2 MB parser limits, controlled Cowrie allowlist, and source-range checks.                      | Maintain regression coverage whenever input contracts change.                                          |
| Session and secret handling | Partial     | Secrets are environment-supplied and excluded from source; request logs omit cookies and authorization headers.                                        | Use managed secret rotation, secure cookie settings, and OAuth provider assurance in deployment.       |
| Error handling              | Implemented | Safe request-correlated error responses, procedure-level validation errors, and request IDs support triage without exposing internals.                 | Connect a production error-reporting sink with retention and access controls.                          |
| Logging and monitoring      | Partial     | Metadata-only JSON request-completion logs and `/healthz`/`/readyz` endpoints exist.                                                                   | Connect health endpoints to monitored alerting and define availability objectives.                     |
| Abuse protection            | Partial     | Per-user process-local sliding-window policies protect imports, scenario replay, and dispositions.                                                     | Replace with a shared backend before multi-instance deployment.                                        |
| Data integrity              | Implemented | Atomic scenario/disposition writes, append-only histories, hash chains, unique lineage constraints, and protected verification endpoint.               | Add external hash anchoring or signatures if non-repudiation is required.                              |
| Data minimization           | Implemented | Cowrie normalization excludes raw records, passwords, TTY data, file-transfer paths/content, and supplied sensitive fields.                            | Periodically review normalizer allowlist and retention configuration.                                  |
| Retention and deletion      | Partial     | Policy and guarded retention procedure are documented.                                                                                                 | Implement administrator-reviewed retention execution with audit records in the deployment environment. |
| Dependency security         | Implemented | Production audit is required in CI; dependency review and remediation policy are documented.                                                           | Enable Dependabot alerts/security updates in repository settings.                                      |
| CI supply chain             | Implemented | Workflows use read-only content permissions, avoid privileged PR triggers, retain CodeQL SARIF evidence, and keep browser diagnostics only on failure. | Pin third-party actions to verified full SHAs when repository policy and maintenance cadence permit.   |
| Database migration safety   | Implemented | Disposable MySQL CI applies every migration and validates real scenario/disposition integrity persistence.                                             | Add upgrade-path fixtures and a tested compensating-migration procedure for live database evolution.   |
| Transport security          | Partial     | Application security headers include a restrictive production CSP, HSTS, no-referrer policy, and proxy-boundary configuration.                         | Enforce TLS and secure proxy configuration at the ingress.                                             |

## Review cadence

Review this matrix for every significant authentication, persistence, deployment, or dependency change. A release candidate must update the status and evidence for affected controls, and must explicitly record any newly introduced deployment prerequisite or residual risk.

## References

[1] [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)
