# Contributing

Thanks for your interest in improving this k6 performance testing suite!

## Getting started

1. Fork the repo and clone your fork
2. Install [k6](https://k6.io/docs/get-started/installation/)
3. Create a branch: `git checkout -b feature/my-improvement`

## Guidelines

- Keep each script focused on a single testing pattern (HTTP verb, auth flow, data-driven, etc.)
- Guard every `res.json()` call with a status/content-type check — never let a bad upstream response crash a VU (see `tests/http-methods/http-post_token_assignment.js` for the pattern)
- Add new reusable datasets to `data/` and reference them with a relative path from the script's own folder
- Validate scripts parse cleanly before opening a PR:

  ```bash
  k6 inspect tests/**/*.js
  ```

- Update `README.md` if you add a new script, folder, or reporting feature

## Submitting changes

1. Commit with a clear message (e.g. `fix: guard json parsing in http-put.js`)
2. Push to your fork and open a Pull Request against `main`
3. Describe what changed and why in the PR description

## Reporting issues

Please use the [issue templates](.github/ISSUE_TEMPLATE) to report bugs or request features.
