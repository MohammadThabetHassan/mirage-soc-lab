# Maintainer Operations

MIRAGE is a controlled defensive training project. These operations keep the public repository usable without turning automated activity into a substitute for security judgment or release review.

## Weekly maintenance workflow

The `Stale issue and pull request maintenance` workflow runs every Monday at 08:18 UTC and can also be dispatched manually. Issues become stale after 90 inactive days and close after a further 21 days. Pull requests become stale after 60 inactive days and close after a further 21 days.

| Item                             | Maintainer responsibility                                                                           | Automation boundary                                                           |
| -------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `security` issue or pull request | Review privately through the security policy; remove public detail if needed.                       | Exempt from stale and automatic close actions.                                |
| `needs-maintainer` item          | Resolve ownership, scope, or release decision before it ages out.                                   | Exempt from stale and automatic close actions.                                |
| Ordinary issue                   | Confirm it is reproducible, safe for the controlled-lab scope, and has an expected outcome.         | The workflow may label and close only after the published inactivity windows. |
| Pull request                     | Check scoped intent, relevant evidence, quality checks, migration impact, and public documentation. | The workflow never merges, edits code, or overrides branch protection.        |

## Release evidence

Before a release tag is created, a maintainer must verify the clean working tree, `pnpm quality`, browser smoke tests, production dependency audit, and Drizzle check. The protected-branch workflow then supplies the disposable-MySQL migration/persistence evidence, CodeQL analyses, and required status checks. If the public showcase changed, confirm the GitHub Pages deployment and live URL as a separate artifact.

## Pages recovery

If a Pages deployment fails, inspect the `Deploy GitHub Pages` workflow before changing repository settings. Confirm the publishing source remains GitHub Actions, run `pnpm check:showcase`, and correct source or contract failures in a new verified commit. Do not use an unreviewed external preview, a separate deploy branch, or an unaudited external asset as a workaround.

## Exercise and baseline changes

Guided-exercise prompts must remain controlled, deterministic, and non-persistent. Do not add personal scoring, behavioral profiling, or production performance claims. Any catalog or engine change requires an intentional review of `evaluation-baseline.json`; the baseline test should fail until its evidence is updated in the same release.
