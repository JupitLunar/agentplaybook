# agentplaybook

Playbooks for running Clawdbot/OpenClaw-style agents: browser automation templates, ClawdHub skill install/update checklists, and (soon) self-improving weekly workflows.

## What's inside
- `playbooks/`
  - `browser-agent-browser-template.md`
  - `clawdhub-cli-install-update-checklist.md`

## Conventions
- Prefer reproducible, copy/paste-able steps.
- Record constraints + fallbacks (e.g., X.com requires login → use GitHub/Docs instead).
- Install skills via `clawhub` with `inspect → install → minimal verify`.

## Roadmap
- Add a weekly "update skills + summarize changes + propose improvements" workflow (cron/heartbeat).
