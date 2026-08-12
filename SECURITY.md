# Security Policy

## Supported scope

MIRAGE is a controlled, defensive SOC-lab application. Supported security reports concern the repository code, build pipeline, documented local deployment model, deterministic telemetry normalizer, persistence logic, and authenticated analyst workflow.

The following are outside scope: attacks against third-party services, social engineering, denial-of-service testing, public scanning, credential testing, and reports that require exposing sensitive customer, OAuth-provider, or database data.

## Intended use

Use MIRAGE only with synthetic telemetry, owned lab systems, or systems for which you have explicit written authorization. Do not use the project to scan, exploit, test credentials, collect data from systems you do not own or administer, or deploy public-facing deception services without an independently reviewed operational plan.

## Reporting a vulnerability

Do **not** publish suspected vulnerabilities in public issues. Contact the repository owner privately through the GitHub profile associated with this repository. Include a concise description, affected component and revision, safe reproduction steps, security impact, and a recommended mitigation if available.

Do not include secrets, session tokens, raw sensitive telemetry, personally identifiable data, or active exploit payloads. Use a minimal sanitized proof of concept that demonstrates the issue without affecting systems or data.

## Triage expectations

| Severity        | Target acknowledgement |                              Target assessment |
| --------------- | ---------------------: | ---------------------------------------------: |
| Critical        |        3 business days |                                7 business days |
| High            |        5 business days |                               14 business days |
| Moderate or low |       10 business days | Best effort, prioritized with maintenance work |

These targets are good-faith goals for a repository-maintained project, not a service-level agreement. Reporters will receive status updates during investigation when a reliable contact method is available.

## Coordinated disclosure

Maintainers will validate reports, identify affected revisions, prepare a fix or documented mitigation, add regression coverage where feasible, and publish a concise advisory after users have a reasonable opportunity to update. The project will credit reporters who request recognition unless doing so would increase risk or conflict with privacy requirements.

## Security assurance

The project tracks its control baseline in [Security Assurance Matrix](docs/SECURITY_ASSURANCE_MATRIX.md), its operational response procedures in [Operations Runbook](docs/OPERATIONS_RUNBOOK.md), and its release evidence in [Release Readiness](docs/RELEASE_READINESS.md).
