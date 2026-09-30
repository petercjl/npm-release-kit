---
name: npm-release-kit
description: Initialize, diagnose, configure, and operate token-free npm releases through GitHub Actions Trusted Publishing. Use when a user wants to publish an npm package, stop repeated npm OTP prompts, add OIDC publishing, release latest/next versions, or maintain this release setup. Do not use for non-npm registries.
---

# npm Release Kit

Use the stable `npm-release-kit` CLI as the execution surface. The npm package is the single source of truth; Agent Skill directories are managed installation targets.

## I → S → O

- **Input:** an npm package repository with a GitHub `origin`, requested release type/tag, and explicit authorization for setup or publication.
- **Strategy:** diagnose first, initialize an absent workflow without overwriting user files, configure npm Trusted Publisher once, then dispatch releases to GitHub Actions. Keep authentication in npm/GitHub; never request, print, or store npm tokens.
- **Output:** structured CLI results, a committed workflow when setup is requested, and a registry/GitHub release after an authorized publish.

## Main line

1. Run `npm-release-kit doctor --root <repo> --json`.
2. If the workflow is absent, preview with `npm-release-kit init --root <repo> --dry-run`; after authorization, run it with `--yes`, inspect the file, commit, and push it.
3. If Trusted Publisher is not configured, explain that this is a one-time npm account change and run `npm-release-kit trust setup --root <repo> --yes`. Complete any npm proof-of-presence in Google Chrome.
4. Before publishing, confirm the release type and dist-tag. Use `latest` for stable versions and `next` for prereleases.
5. Dispatch with `npm-release-kit publish --root <repo> --release <type> --tag <tag> --yes`.
6. Observe the GitHub Actions run, then verify the exact npm version and dist-tag. Return the package, version, tag, workflow run, and any failure code.

At a release-policy decision, load knowledge only at that current knowledge-dependent node: read `references/SCHEMA.md`, `references/index.md`, the recent entry in `references/log.md`, and `references/queries/choose-release-mode.md`, then return to step 4. Keep all later-node and maintenance pages deferred. Do not load the knowledge layer during ordinary diagnosis or installation.

## Branches

- `TARGET_EXISTS`: stop. Inspect and reconcile the existing workflow; never overwrite it automatically. Return to step 2 after an authorized edit.
- `AUTH_REQUIRED` or npm proof-of-presence: pause for the user to authenticate. Never use a redacted npm authorization URL. Return to step 3.
- `OIDC_ENVIRONMENT_REQUIRED`: the internal CI command was run locally. Return to step 5 and dispatch the workflow.
- Failed tests or packing: do not publish. Report the failing command and return to repository repair.
- Existing version or dist-tag conflict: verify registry state before retrying; never bump repeatedly without confirming what was published.

## Safety and QA

- `init`, `trust setup`, and `publish` are state-changing. Respect the CLI confirmation gate.
- Do not add `NODE_AUTH_TOKEN` or a write token when OIDC is available.
- The workflow must grant write access to the `id-token` permission, run on a GitHub-hosted runner, and use a compatible Node/npm version.
- Do not claim success until the registry shows the exact version and intended dist-tag.
- For CLI installation and updates, use `npm-release-kit skill source|status|install|update` and `npm-release-kit update check|install`.
