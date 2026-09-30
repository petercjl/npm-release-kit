# Release modes

- Stable user-facing release: use `patch`, `minor`, `major`, or an exact stable semver with `latest`.
- Development or compatibility candidate: use `prerelease` with `next`.
- Direct Trusted Publishing: the GitHub workflow may publish immediately through OIDC without npm OTP on each run.
- Staged publishing: use only when the user values a separate proof-of-presence approval more than convenience; final approval still requires 2FA.
- Never move `latest` to an unverified prerelease. Verify registry version and dist-tag after the workflow.
