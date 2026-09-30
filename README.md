# npm Release Kit

Publish npm packages from GitHub Actions with npm Trusted Publishing (OIDC), without storing a write token or completing npm OTP for every release.

## Install

```bash
npm install --global @petercjl/npm-release-kit
npm-release-kit skill install
```

## Set up a repository

```bash
npm-release-kit doctor --json
npm-release-kit init --dry-run
npm-release-kit init --yes
git add .github/workflows/publish-npm.yml
git commit -m "ci: add trusted npm publishing"
git push
npm-release-kit trust setup --yes
```

Trusted Publisher setup is a one-time npm account change. Publication then happens on a GitHub-hosted runner using short-lived OIDC credentials.

## Publish

```bash
npm-release-kit publish --release patch --tag latest --yes
npm-release-kit publish --release prerelease --tag next --yes
```

The workflow runs checks before `release-it` creates the version commit, Git tag, GitHub Release, and npm publication.

## Safety

- Existing workflow files are never overwritten.
- Repository and external mutations require `--yes`.
- npm credentials are not stored in this package or generated workflow.
- GitHub-hosted runners are required for npm Trusted Publishing.
