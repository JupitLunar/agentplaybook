# Agent Layer / Gateway Plan (Jing)

## Why this exists (meaning)
We want Jing’s portfolio of sites to evolve from “many SEO pages” into a single *agent-usable* platform:
- Sites remain **SEO/UI skins** (human-facing).
- A centralized **Agent Layer / Gateway** becomes the machine-facing interface for AI agents and developers.

Core thesis: agents will route through us if we reduce friction vs scraping/DIY and provide stable, structured, explainable results + optional actions.

## Current portfolio (grouped)
### Local directories (AB)
- calgaryplayground.ca
- edmontonplayground.ca
- albertawellness.ca
- albertatravel.net
- albertaclinic.ca (planned)

### Independent brands
- momaiagent.com
- 1personcompany.ai

### AB industrial
- abtransform.ca
- abcontrol.ca

### Hub
- jupitlunar.com (hub/dev portal)

## Key clarification (realistic stage)
Today these are primarily directory/content sites with limited/no merchant integrations.
We should treat “actions” as staged:
- B0: structured results + next-step guidance + lead capture
- B1: concierge-style actions (email templates / assisted outreach)
- B2: real integrations (claim/listing, booking, payments)

## The Alberta Graph / Index (single source of truth)
Unify data across verticals (travel/wellness/clinic/playground) and regions.
### Facets
- region: province (AB) → city → neighborhood (optional)
- vertical: travel | wellness | clinic | playground | …
- resource types: place/listing | guide/article | collection | lead/action

### Global IDs
- place_id: stable global ID (not per-site)
- cross-vertical tagging: same place can belong to multiple verticals

### Trust + freshness
- sources[] (google/osm/official site/manual)
- last_verified
- confidence_score (optional)

## The Agent Layer is a Gateway
### Recommended canonical base
- https://api.jupitlunar.com (or agent.jupitlunar.com)

### Minimal endpoints (v0)
1) GET /v1/search
   - params: vertical, region (province/city/neighborhood), query, filters, pagination
   - returns: normalized results[] + meta

2) GET /v1/places/{place_id}
   - returns: canonical structured entity + sources + last_verified

3) POST /v1/actions/{action}
   - actions start at B0 (lead capture / shortlist request)
   - later: booking/quote/claim

### Interface packaging (later)
- OpenAPI spec (primary)
- llms.txt + feeds for LLM-friendly discovery
- CLI wrapper for developers/agents
- MCP server wrapper (optional; not first priority)

## Adoption: why agents route through us
Even at B0 we can win by offering:
- standardized schema (no HTML parsing)
- low-friction endpoints
- stable trust signals (sources + verified timestamps)
- high coverage in Alberta-specific verticals
- “next action” suggestions + lead capture

## Roadmap (high-level)
### Phase 1 (1–4 weeks): Gateway v0
- publish OpenAPI + docs
- implement search/get across 1–2 verticals (start with albertawellness)
- unify lead capture endpoint for “get matched”

### Phase 2 (1–3 months): Alberta Graph
- global place_id + dedupe
- add travel/playground verticals
- collections generator + programmatic pages

### Phase 3 (3–12 months): Platformization
- API keys + quotas + billing
- partner/claim flows
- concierge → integration

## Next concrete deliverables
- OpenAPI draft for v0 endpoints
- data model definitions: Place, SearchResult, LeadRequest, ActionResult
- repo skeleton for gateway service
- initial connectors for existing site datasets
