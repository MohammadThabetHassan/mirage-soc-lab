# MIRAGE Production-Excellence Plan

**Status:** Active implementation plan

**Scope:** Controlled SOC-lab application with a production-grade engineering baseline
**Security baseline:** OWASP ASVS 5.0.0-inspired control mapping, adapted to MIRAGE’s documented scope [1].

## Objective

MIRAGE already provides a controlled telemetry lab, authenticated analyst workflows, detection-as-code, evidence-lineage verification, CI, and browser smoke coverage. The remaining work focuses on **assurance depth** rather than adding unsafe operational capabilities: real database lifecycle testing, configuration validation, privacy-preserving observability, release governance, and auditable repository documentation.

> This plan does not claim that a training lab becomes a production SOC through documentation alone. Every completed item must have a test, CI control, runtime guard, or an explicit deployment prerequisite.

## Assurance target

| Domain                           | Current foundation                                            | Enhancement target                                                                              | Verification evidence                                    |
| -------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Secure development               | Typed procedures, role separation, bounded inputs, unit tests | ASVS-aligned control matrix and explicit residual-risk ownership                                | Versioned security-assurance matrix and review checklist |
| Database safety                  | Schema migrations, atomic writes, hash lineage                | Disposable MySQL migration test, persistence integration test, compensating-migration procedure | CI service container and integration suite               |
| Authentication and authorization | Authenticated procedures and administrator-only import        | Configuration fail-fast behavior, action-level access test matrix, safe production defaults     | Environment schema and route-level tests                 |
| Abuse resistance                 | Process-local sliding-window limits                           | Clear distributed-deployment adapter contract and privacy-safe request controls                 | Adapter interface, policy tests, deployment guidance     |
| Observability                    | Request IDs, health/readiness endpoints, metadata-only logs   | Structured error taxonomy, liveness/readiness semantics, operational SLO-style runbook          | Runtime tests and documented incident workflow           |
| Browser quality                  | Unauthenticated desktop/mobile smoke tests                    | Accessibility assertions, authenticated route contract tests, performance budget checks         | Browser test suite and CI evidence                       |
| Supply-chain governance          | Production audit and workflow CI                              | Dependency review, immutable action policy, contributor and ownership controls                  | Pull-request workflow and governance documents           |
| Release management               | Release-readiness report                                      | Versioned release checklist, changelog, support boundaries, reproducible deployment guide       | Repository documentation and CI release gate             |

## Implementation sequence

### Phase A — Repository and governance foundation

Create a clear repository landing page, architecture documentation, contribution guide, issue/PR templates, a code-of-conduct boundary, ownership policy, changelog, and a security-control matrix. GitHub recommends least-privilege workflow permissions, immutable action pinning, avoiding privileged untrusted-code patterns, and dependency monitoring [2].

### Phase B — Database assurance

Run migrations against a disposable MySQL service in CI, test core scenario persistence and disposition writes against a real database, verify indexes and uniqueness constraints, and document restoration and compensating-migration procedures. Migration validation must use a non-production database with explicit cleanup.

### Phase C — Runtime and security controls

Validate production configuration at startup, set safe request and security headers, enforce clear readiness semantics, formalize the rate-limit adapter boundary, and add structured fault responses that expose request IDs but not sensitive internals.

### Phase D — User-facing quality assurance

Add browser-level accessibility checks for the public sign-in boundary, test responsive behavior, define a JavaScript bundle budget, and create a test seam for an authenticated lab session without exposing real credentials.

### Phase E — Supply chain and release governance

Add dependency-review automation to pull requests, add repository ownership and security-policy metadata, enforce a review checklist, and publish a versioned changelog plus release procedure. GitHub documents dependency review as a pre-merge control for identifying vulnerable package changes [3].

## Definition of done

A phase is complete only after its changed code and documentation pass formatting, unit tests, strict type checks, production build, browser checks where applicable, and the dependency audit. A completed control is labeled **implemented**, **partially implemented**, or **deployment prerequisite**; no control is silently assumed.

## References

[1] [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)

[2] [GitHub Actions secure use reference](https://docs.github.com/en/actions/reference/security/secure-use)
[3] [GitHub dependency review guidance](https://docs.github.com/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review)
