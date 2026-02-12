# Skill Productionization Checklist

Use this to move a skill from “installed” to “operational”.

## 1) Success criteria
- What concrete outcome should this skill produce?
- What metric proves it works (time saved, output quality, reliability)?

## 2) Smoke test
- Run one real command end-to-end.
- Capture expected output signature.
- Confirm failure behavior is understandable.

## 3) Operational fit
- Where does this skill fit in daily/weekly workflows?
- Is it cron-worthy or manual-only?
- Required auth/secrets available?

## 4) Fallback plan
- If skill fails, what is fallback route?
  - Alternate skill
  - Browser/manual route
  - GitHub/RSS/docs backup

## 5) Reusable artifact
Produce at least one:
- mini-runbook
- command snippet
- troubleshooting note

## 6) Truthful status rule
- Done = validated in real flow.
- Not done = state exactly what is missing.
