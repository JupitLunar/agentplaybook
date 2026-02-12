# X Intelligence Reliability Playbook (Browser-first)

## Goal
Get reliable daily X/Twitter intelligence with low failure rate and low token burn.

## Why this exists
`web_fetch https://x.com/...` is often unreliable (anti-bot/privacy-extension error pages). Logged-in browser scraping is the stable path.

## Pipeline (in order)
1. **Primary:** Browser scrape on logged-in X tab (`browser` tool, `profile="chrome"`).
2. **Secondary:** `web_fetch` / `web_search` for lightweight confirmation.
3. **Fallback:** GitHub releases/commits + RSS/blog sources (never return empty digest).

## Scope control (important)
- Track fixed watchlist (accounts + keywords), avoid broad crawling.
- Two-pass extraction:
  - Pass 1: headline + link
  - Pass 2: verify details for only high-signal items

## Daily output format (recommended)
- 5–10 bullets max
- Each bullet: what changed + link
- End with one line: **Why this matters**

## Failure handling
- If X fetch fails, explicitly mark X as unavailable and continue with fallback sources.
- Keep digest useful even without X data.
