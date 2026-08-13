# GitHub Pages Showcase

MIRAGE publishes a small, static project showcase from `showcase/`. It deliberately avoids an application runtime, client analytics, externally hosted images, or unversioned claims. The site focuses on controlled use cases, the detection contract, and links to the repository evidence that supports each statement.

## Source and validation

| Location                      | Responsibility                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `showcase/index.html`         | Public copy, accessible information structure, repository evidence links, and controlled-scope statement.      |
| `showcase/styles.css`         | Responsive, restrained visual presentation with no external asset dependency.                                  |
| `scripts/check-showcase.mjs`  | Static contract: required content, safe repository links, absence of retired preview URLs, and responsive CSS. |
| `.github/workflows/pages.yml` | Validates the static contract, packages `showcase/`, and deploys the artifact to GitHub Pages.                 |

Run `pnpm check:showcase` before changing public copy or styles. The command is also included in `pnpm quality`, so a showcase regression blocks the standard quality gate.

## Deployment model

The workflow runs for eligible `main` changes and can be started manually. The build job has read-only repository access, validates the site, configures Pages metadata, and uploads the `showcase/` directory as the Pages artifact. The deployment job is separate, targets the `github-pages` environment, and receives only `pages: write` and `id-token: write` permissions. GitHub documents this artifact-to-deployment pattern and those minimum deployment permissions. [1]

The public URL is `https://mohammadthabethassan.github.io/mirage-soc-lab/`. GitHub Pages must be configured to use **GitHub Actions** as its publishing source; GitHub recommends a custom workflow when a repository needs control over its build and does not want compiled output committed to a separate branch. [2]

## Change procedure

1. Update the catalog, README, and this guide whenever a public use case or detection contract changes.
2. Run `pnpm format`, `pnpm check:showcase`, and `pnpm quality` locally.
3. Push the verified change to `main`; the protected-branch checks and Pages workflow run independently.
4. Confirm that the Pages deployment reports the expected URL and that the live site shows the intended versioned copy.

## References

[1] [GitHub Docs: Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

[2] [GitHub Docs: Configuring a publishing source for your GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
