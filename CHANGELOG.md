# Changelog

All notable changes to MIRAGE are documented in this file. The project uses a lightweight interpretation of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and semantic versioning principles for release communication.

## Unreleased

### Added

- Production-excellence plan, architecture guide, ASVS-inspired assurance matrix, contributor guide, code of conduct, ownership rules, and issue templates.
- Professional release-governance, operational, data-governance, authorization, and dependency-security documentation.
- Required CI coverage for formatting, unit tests, strict type checking, production build, production dependency audit, and desktop/mobile browser smoke tests.

### Changed

- GitHub Actions package-manager setup now reads the repository-declared pnpm version and passes all required workflow jobs.

## 0.1.0 — Controlled SOC Lab Baseline

### Added

- Deterministic synthetic scenario replay and versioned detection-as-code catalog.
- Explainable cases with risk rationale, ATT&CK context, evaluation coverage, analyst notes, and dispositions.
- Controlled Cowrie JSON-lines normalizer with redaction and private-lab source boundary.
- Append-only evidence lineage and disposition history with hash-chain verification.
- Authenticated SOC workspace, role-restricted import operation, action limits, health endpoints, and privacy-conscious request metadata logs.

### Security

- Atomic persistence for scenario and disposition writes.
- Production dependency-audit gate and documented dependency remediation process.
