# ClawHub Install Safety Flow

## Goal
Install new skills quickly without accidentally enabling risky code.

## Standard flow
1. `clawhub search "<topic>"`
2. `clawhub inspect <slug>` (quick metadata sanity check)
3. `clawhub install <slug> --no-input`
4. Smoke test one real command path
5. Document: use case, constraints, fallback

## Suspicious-skill handling
When ClawHub flags a skill as suspicious:
- Default action: **do not force install**.
- Ask for explicit confirmation before `--force`.
- If not approved, choose safer alternatives with similar function.

## Force-confirm policy
Only use `--force` when all are true:
- User explicitly approved force install.
- Clear business value exists.
- Post-install smoke test runs in controlled scope.
- You can disable/remove quickly if behavior is abnormal.

## Minimal acceptance criteria
- Installs successfully
- Core command path works end-to-end
- Known failure modes documented
- Rollback path known
