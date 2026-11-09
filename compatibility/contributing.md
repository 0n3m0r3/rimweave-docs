---
title: Maintain this site
description: Build the documentation, refresh its API reference, verify examples and prepare publication.
---

# Maintain this site

This page is for people editing the documentation website. To use RimWeave in a mod, start with [What RimWeave does](../getting-started/index.md).

## Write for someone new to RimWeave

Start with a situation a mod author recognizes. Explain what happens in the game, what goes wrong, and what the framework contributes. Introduce names such as “contribution” and “scope” only after describing the thing they refer to. Explain RimWorld types before using them in a code example.

Keep the README to the project's purpose, prerequisites and startup instructions. Detailed API behavior, test procedures, save formats and publication tooling belong in this site. Public content is written in English.

## Review one increment

Work directly on `main` for now, one coherent increment at a time. Review the local diffs and executed checks before starting another increment. The maintainer reviews, commits and pushes; staging may be delegated. Feature branches and pull requests are not used at this stage.

Keep API comments, guides and examples aligned within that increment. For a public-contract change, commit the framework first, export from that clean revision, then review and commit the matching documentation. Local previews may describe uncommitted changes only when explicitly identified as such.

## Build and preview

Install .NET SDK 10.0.114 and Python 3, then run from the documentation repository:

```bash
dotnet tool restore
python3 tools/build.py
python3 tools/serve.py
```

Open <http://127.0.0.1:8087/rimweave-docs/>. The preview uses the subdirectory expected for a GitHub Pages project site. The static build reads the exported API files, so it needs no game installation or framework checkout.

The build treats DocFX warnings as errors, checks links and anchors, and verifies the API and example fingerprints. It checks public output for private references and binaries. Generated output goes to ignored `_site/`; the diagnostic manifest stays in `.local/` because it contains machine-specific paths.

## Refresh the generated API

Public signatures and precise method contracts come from the framework source and its XML comments. Fix those comments at the source rather than editing generated API files. This project owns the explanatory guides and navigation.

API export needs a local framework checkout configured against RimWorld 1.7. Install the pinned export dependency:

```bash
python3 -m venv .local/venv
.local/venv/bin/python -m pip install -r tools/requirements.txt
```

With the framework checkout in the adjacent `rimweave` directory:

```bash
.local/venv/bin/python tools/export_api.py ../rimweave
python3 tools/build.py
```

Use another path if the framework is elsewhere. Add `--allow-worktree` only for an unpublished preview of local changes. Export compiles the framework and documentation examples, runs the shared-data checks, and records which source revision and files were used.

Guides include snippets directly from the example files. Changing an example requires a new export. Review and commit the generated files under `api/` and `includes/version.md` together with the guide changes. The export pins source links to the selected commit; it omits them for uncommitted previews.

## Check examples and presentation

Run the shared-data examples from the documentation repository:

```bash
dotnet run --project examples/DocumentationExamples.csproj --configuration Release
```

If needed, add `-p:FrameworkDir=/absolute/path/to/rimweave`. Recipes that modify native health effects are compiled but are not invoked by this standalone program. Game scenarios remain separate.

For browser checks, install Node.js and the pinned browser tooling:

```bash
npm install --prefix .local/browser playwright@1.65.0 --no-fund
.local/browser/node_modules/.bin/playwright install chromium
```

With the preview server running in another terminal:

```bash
node tools/browser-check.mjs
```

This checks navigation, search, API pages, themes and mobile layout. Screenshots go to `.local/review/`. Inspect them as well: a successful link check cannot tell whether an explanation makes sense.

## Publish a reviewed version

The validation workflow builds the site on push, pull request or manual dispatch. It checks the locally exported example fingerprints; it does not use proprietary game assemblies in CI.

Publication requires separate approval and uses a manual workflow on `main`. Before the first run, publish the reviewed repository, configure GitHub Pages to use GitHub Actions and export the API from a clean framework revision. Check readiness with:

```bash
python3 tools/check.py --publish-ready
```

The check rejects an API snapshot made from uncommitted framework changes and a built site whose snapshot differs from the current export. The publication workflow deploys only `_site/` through the `github-pages` environment. Keep private planning links, personal paths, credentials and game binaries out of both repositories and the output.
