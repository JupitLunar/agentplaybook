# Contributing

This repo is a shared playbook library for running agents (Clawdbot/OpenClaw-style). Keep it practical and safe.

## What to contribute
- Reproducible playbooks (copy/paste steps)
- Checklists (verify + rollback + safety)
- Recipes (end-to-end scenarios)
- Workflow docs (cron/heartbeat patterns)
- Skill notes (how-to + pitfalls)

## Safety rules
- **No secrets**: tokens, API keys, cookies, credentials, private URLs.
- Prefer `*.example` for configs. Redact IDs.
- Avoid machine-specific paths unless unavoidable; if used, mark as *example*.

## Quality bar
- State goal + prerequisites
- Provide minimal happy-path steps
- Include failure modes + fallback/rollback
- Cite sources when relevant (docs/GitHub links)

## PR process
- Use PRs for non-trivial changes
- Add 1 entry to `CHANGELOG.md` per PR
