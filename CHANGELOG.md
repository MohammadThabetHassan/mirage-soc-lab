# Changelog

All notable changes to MIRAGE are documented in this file. The project uses a lightweight interpretation of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and semantic versioning principles for release communication.

## Unreleased

No unreleased changes are currently recorded.

## [1.0.1] — 2026-08-13

### Added

- A dedicated 1280×640 GitHub social-preview image, maintained separately from the single interior README illustration.
- Public-release checklist, visual-asset usage notes, a safe `.env.example`, and issue-template routing.
- Public package metadata for repository discovery, runtime compatibility, and accidental npm-publication prevention.

### Changed

- The public CodeQL workflow now uploads results to GitHub Code Scanning and retains SARIF evidence.
- Dependabot alerts and automated security updates are enabled for the public repository.

## [1.0.0] — 2026-08-13

### Added

- Production-excellence plan, architecture guide, ASVS-inspired assurance matrix, contributor guide, code of conduct, ownership rules, issue templates, explicit MIT license, editor conventions, and Node runtime declaration.
- Professional release-governance, operational, data-governance, authorization, and dependency-security documentation.
- Curated exterior and interior concept artwork for the repository landing page, clearly identified as illustrative controlled-lab visuals.
- Required CI coverage for formatting, unit tests, strict type checking, production build, bundle budget, production dependency audit, CodeQL, disposable MySQL migrations/persistence, and desktop/mobile browser smoke tests.
- Failure-only Playwright artifact retention to support safe CI diagnosis.

### Changed

- GitHub Actions package-manager setup now reads the repository-declared pnpm version and passes all required workflow jobs.
- The README now provides a complete visual, operational, quality, and release-governance entry point for repository visitors.

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
