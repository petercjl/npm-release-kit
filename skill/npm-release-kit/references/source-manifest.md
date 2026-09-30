# Source manifest

Coverage: partial. The layer covers channel and approval selection; npm and GitHub behavior must still be checked against current official documentation when platform behavior changes.

Source classes: `W` means shareable Wiki knowledge, `U` means user-confirmed requirements, `E` means verified external documentation, and `A` means an Agent-derived provisional method.

- E: npm Trusted Publishing documentation, consulted 2026-09-30.
- E: npm Staged Publishing documentation, consulted 2026-09-30.
- W: general Agent CLI and package lifecycle principles compiled from the user's shareable CLI design playbooks.
- U: prefer a reusable npm-distributed CLI with one canonical portable Skill and no bundled credentials.

Recompile when npm OIDC providers, runner requirements, staged-publishing behavior, or the package distribution convention changes.
