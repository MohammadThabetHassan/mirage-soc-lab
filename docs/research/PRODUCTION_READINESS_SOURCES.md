# Production-Readiness Research Notes

Research gathered for the MIRAGE SOC Lab hardening program.

| Source                                                                                                                                                                            | Practical finding                                                                                                                                                                         | Planned repository application                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [GitHub secure use reference](https://docs.github.com/en/actions/reference/security/secure-use)                                                                                   | Workflows should use least-privilege tokens, immutable action references, avoid dangerous privileged pull-request triggers, and treat workflow dependencies as supply-chain dependencies. | Lock down workflow permissions, document required repository settings, pin third-party actions to immutable revisions, and avoid privileged untrusted-code paths.     |
| [GitHub dependency review guidance](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/manage-your-dependency-security/configure-dependency-review-action) | Dependency Review can block pull requests based on introduced vulnerability severity and dependency scope.                                                                                | Add a pull-request dependency-review workflow with an explicit severity policy and update repository governance instructions.                                         |
| [GitHub dependency review overview](https://docs.github.com/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review)                 | Reviewing dependency diffs before merge helps prevent newly introduced vulnerabilities rather than remediating them after release.                                                        | Treat dependency review as a required pre-merge control and keep production audit as a post-install validation control.                                               |
| [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)                                                                                           | ASVS provides a testable security-control baseline, a trust metric, and secure-development requirements.                                                                                  | Publish an ASVS-aligned security-control matrix, explicitly mark implemented, partial, and out-of-scope controls, and use it to prioritize residual-risk remediation. |

## Design principles adopted

1. The controlled-lab scope remains explicit: enhancements must not imply production SOC capability where evidence does not exist.
2. Controls should be verifiable through code, automated tests, CI, or a documented deployment prerequisite.
3. Sensitive behavior must default to least privilege, bounded input, transparent error handling, and non-sensitive telemetry.
4. Release readiness requires a reproducible evidence trail rather than an informal claim.

## Public-release configuration findings — 2026-08-13

GitHub recommends a social-preview image of 1280×640 pixels and supports PNG, JPG, or GIF uploads below 1 MB. Social previews are uploaded through repository **Settings → Social preview** rather than embedded in a README. The MIRAGE social-preview asset follows this guidance: `docs/assets/mirage-social-preview.jpg` is a 1280×640 JPEG at approximately 148 KB.

GitHub’s advanced CodeQL setup is eligible for publicly visible repositories with GitHub Actions enabled. After MIRAGE became public, the CodeQL workflow was changed from local SARIF-only analysis to GitHub Code Scanning upload with `security-events: write`.

GitHub branch protection can require reviews, successful status checks, signed commits, linear history, resolved conversations, and restrictions on force pushes or deletion. MIRAGE remains intentionally direct-main until maintainers choose a contribution model; the public-release checklist records branch protection as the next collaboration-governance action.

Dependabot alerts and automated security updates were enabled. Dependabot’s initial `tar` security update could not be generated because its resolver reported latest possible `tar` version `7.5.1`, while the earliest fixed version was `7.5.21`; this requires an upstream-resolution or package-manager remediation rather than blindly merging an unavailable update.

### Sources

- [GitHub: Customizing your repository's social media preview](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview)
- [GitHub: Configuring advanced setup for code scanning](https://docs.github.com/en/code-security/how-tos/find-and-fix-code-vulnerabilities/configure-code-scanning/configuring-advanced-setup-for-code-scanning)
- [GitHub: About protected branches](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [GitHub: Licensing a repository](https://docs.github.com/articles/licensing-a-repository)

## ATT&CK detection-engineering findings — 2026-08-13

ATT&CK describes tactics as the adversary's objective, techniques as the behavior used to achieve it, and procedures as concrete real-world implementations. MITRE cautions defenders not to claim coverage from a single observed technique implementation: each rule must state its observable behavior, telemetry prerequisites, analytic limitations, and validation evidence. ATT&CK also recommends prioritizing behaviors relevant to the defender's environment rather than attempting blanket matrix coverage.

ATT&CK's legacy data-source inventory remains useful for explaining sensor and log prerequisites, although MITRE deprecated additions to that taxonomy in ATT&CK v18. MIRAGE should therefore retain explicit telemetry requirements but frame them as lab-specific observability contracts, not claims of exhaustive ATT&CK data-source coverage.

### Sources

- [MITRE ATT&CK: Resources](https://attack.mitre.org/resources/)
- [MITRE ATT&CK: Data Sources](https://attack.mitre.org/datasources/)
- [MITRE Center for Threat-Informed Defense: Detection Engineering](https://ctid.mitre.org/categories/detection-engineering/)
