# Agent Layer v0 — What any bot/agent can plug into

## Goal
Provide a single, stable interface that any agent (cloud bot, internal automation, third-party developer) can call to:
- search Alberta-specific data (directories/content)
- fetch canonical details
- perform basic actions (B0: lead capture / shortlist request)

This is intentionally **not** MCP-first. MCP is a wrapper that can be added later.

## What v0 must be
- HTTP + JSON
- OpenAPI spec
- predictable auth (API keys)
- strict schemas
- clear rate limits + error codes

## Minimal endpoints
1) `GET /v1/search`
2) `GET /v1/places/{place_id}`
3) `POST /v1/actions/{action}`

## Scoping model
Every call scopes by:
- `vertical`: wellness | travel | clinic | playground | ...
- `region`: AB → city → neighborhood (optional)

## Adoption hooks (why agents will choose this)
Even without merchant integrations:
- Removes scraping and HTML parsing
- Standardizes results + trust signals (sources + last_verified)
- Provides "next action" and lead capture endpoints

## B0/B1/B2 action ladder
- B0: lead capture + shortlist request (already usable)
- B1: concierge actions (assist outreach)
- B2: full integrations (booking/payments/claim)

## Next deliverables
- Publish OpenAPI (draft exists in `agent-layer-v0-openapi-draft.yaml`)
- Decide base domain (api.jupitlunar.com)
- Implement one vertical (albertawellness) end-to-end
- Add llms.txt + lightweight feeds for discovery
