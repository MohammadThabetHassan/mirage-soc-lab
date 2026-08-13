# Public-Release Checklist

This checklist prepares **MIRAGE SOC Lab** for public source-code visibility. It does not authorize deployment of a live honeypot, collection of third-party data, credential testing, or removal of the project’s controlled defensive scope.

## Current repository baseline

The repository already has a detected MIT license, a contribution guide, code of conduct, security policy, issue and pull-request templates, citation metadata, a versioned release, quality gates, MySQL-backed persistence validation, and CodeQL SARIF artifacts. The committed social-preview JPEG is intentionally separate from the README; GitHub requires the repository owner to upload it in repository settings.[1]

| Item                     | Current state                                                                                         | Public-release action                                                                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| License and attribution  | Present                                                                                               | Confirm that all contributors accept the MIT licensing decision before changing visibility.                                                                     |
| Source credential review | Focused tracked-file review found no common cloud, GitHub, OpenAI, or private-key patterns.           | Independently review Git history and any past releases for accidentally committed secrets. Rotate any value that may have been exposed.                         |
| Social preview           | The dedicated `docs/assets/mirage-social-preview.jpg` was applied through repository settings.        | Retain the source asset for future updates; do not embed it in the README.                                                                                      |
| Repository profile       | Topics, citation metadata, README, release notes, and issue routing are present.                      | Add a concise repository description and homepage only if they are accurate and maintained.                                                                     |
| Dependency alerts        | Dependabot alerts and automated security updates are enabled.                                         | Review alerts promptly and confirm that automated update pull requests remain within the controlled scope.                                                      |
| CodeQL publication       | CodeQL scans are published to GitHub Code Scanning and retain SARIF artifacts.                        | Review code-scanning alerts, triage findings with a documented rationale, and keep the workflow enabled.                                                        |
| Collaboration governance | `main` is not branch-protected because this repository currently uses direct main-branch maintenance. | Before accepting external contributions, add a `main` protection/ruleset that requires the quality and CodeQL checks, review, no force pushes, and no deletion. |

## Activation sequence

First, review all tracked history and current release assets for sensitive information. GitHub notes that changing a repository’s visibility cannot recover copies or forks already made after public disclosure.[2] Confirm the release notes, license, ownership rules, and security-reporting address are correct before making the repository public.

Second, retain the source social-preview JPEG in repository assets so future updates remain reproducible. GitHub recommends a 1280×640 image and limits social preview uploads to PNG, JPG, or GIF files below 1 MB.[1] The applied MIRAGE image matches that guidance.

Third, confirm that Dependabot alerts, automated security updates, and GitHub Code Scanning remain enabled. CodeQL now uploads results to GitHub’s security interface and retains the SARIF artifact as additional workflow evidence.

Finally, if outside contributors will be accepted, configure branch protection or a ruleset for `main`. GitHub branch protection can require reviews, successful status checks, signed commits, linear history, resolved conversations, and restrictions on force pushes or deletions.[3] Select only controls that match the project’s actual maintainer workflow; avoid claiming enforcement before it is enabled.

## Final go/no-go check

| Check        | Pass condition                                                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Public scope | README and release notes still say that MIRAGE is a controlled lab and not an autonomous SOC.                                                   |
| Security     | No secrets are present in tracked code or retained release assets; dependency alerts and code-scanning settings are intentionally configured.   |
| Community    | The README, license, contributing guide, code of conduct, security policy, issue routing, and citation metadata are current.                    |
| Quality      | The exact public-release commit has a successful Quality and Security run and a successful CodeQL run.                                          |
| Governance   | The maintainer has consciously chosen direct-main maintenance or enabled appropriate branch protection before accepting external pull requests. |

## References

[1] [GitHub: Customizing your repository’s social media preview](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview)

[2] [GitHub: Licensing a repository and public visibility considerations](https://docs.github.com/articles/licensing-a-repository)

[3] [GitHub: About protected branches](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
