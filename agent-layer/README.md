# Agent Layer - Alberta Graph Gateway

Production-ready API gateway for Alberta directory data. Unified data layer for Jing's portfolio sites including wellness, clinics, playgrounds, and industrial services.

## Features

- 🔍 **Unified Search** - Search across all verticals with faceted results
- 🔄 **Site Connectors** - Sync data from multiple sources (CalgaryWellness, EdmontonPlayground, AlbertaClinics, ABControl)
- 🤖 **MCP Protocol** - Model Context Protocol support for AI agents
- 📨 **Notifications** - Slack webhooks and email confirmations
- 📊 **Monitoring** - Health checks, metrics, and logging
- 🔐 **API Key Auth** - Secure access with rate limiting

## Quick Start

```bash
# Install dependencies
npm install

# Setup database (SQLite for local dev)
npm run db:migrate

# Sync data from all connected sites
npm run sync

# Start server
npm run dev
```

## API Endpoints

### Public Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check with system status |
| `/ready` | GET | Readiness probe |
| `/live` | GET | Liveness probe |
| `/docs` | GET | Swagger UI documentation |

### API Routes (require API key)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/search` | GET | Search places with filters |
| `/v1/places/:id` | GET | Get place details |
| `/v1/actions/:action` | POST | Create lead/action |
| `/v1/sync` | POST | Trigger site sync |
| `/v1/admin/leads` | GET | List leads |
| `/v1/admin/connectors` | GET | List registered connectors |
| `/metrics` | GET | System metrics |

### MCP Protocol

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mcp` | POST | MCP JSON-RPC endpoint |
| `/mcp/sse` | GET | MCP SSE streaming |

## API Examples

### Search Places
```bash
curl "http://localhost:3000/v1/search?vertical=wellness&region[province]=AB&region[city]=calgary" \
  -H "X-API-Key: dev-key"
```

### Get Place Details
```bash
curl "http://localhost:3000/v1/places/place_calgary_example" \
  -H "X-API-Key: dev-key"
```

### Create Lead
```bash
curl -X POST "http://localhost:3000/v1/actions/lead_get_matched" \
  -H "X-API-Key: dev-key" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "lead_get_matched",
    "vertical": "wellness",
    "region": { "province": "AB", "city": "calgary" },
    "email": "user@example.com",
    "name": "John Doe",
    "requirements": "Looking for deep tissue massage"
  }'
```

### MCP Tools/List
```bash
curl -X POST "http://localhost:3000/mcp" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

### MCP Tools/Call
```bash
curl -X POST "http://localhost:3000/mcp" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "search_places",
      "arguments": {
        "vertical": "wellness",
        "province": "AB",
        "city": "calgary"
      }
    }
  }'
```

### Trigger Site Sync
```bash
curl -X POST "http://localhost:3000/v1/sync" \
  -H "X-API-Key: dev-key"
```

### Sync Specific Sites
```bash
curl -X POST "http://localhost:3000/v1/sync" \
  -H "X-API-Key: dev-key" \
  -H "Content-Type: application/json" \
  -d '{"sites": ["edmontonplayground", "albertaclinics"]}'
```

## Site Connectors

The following sites can be synced:

| Site ID | Vertical | Description |
|---------|----------|-------------|
| `edmontonplayground` | playground | Indoor playgrounds in Edmonton area |
| `albertaclinics` | clinic | Medical clinics and healthcare providers |
| `abcontrol` | industrial | Industrial and B2B services |
| `calgarywellness` | wellness | Wellness and spa services (file-based) |

## Deployment

### Fly.io (Recommended)

See [DEPLOY.md](DEPLOY.md) for detailed instructions.

```bash
# Quick deploy
npm run build
fly deploy
```

### Docker Compose
```bash
docker-compose up -d
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `HOST` | 0.0.0.0 | Server host |
| `DATABASE_URL` | ./agent_layer.db | Database URL (SQLite or PostgreSQL) |
| `API_KEY` | dev-key | API authentication |
| `RATE_LIMIT` | 100 | Requests per minute |
| `LOG_LEVEL` | info | Logging level |
| `NODE_ENV` | development | Environment mode |
| `SLACK_WEBHOOK_URL` | - | Slack notifications |
| `RESEND_API_KEY` | - | Email service API key |
| `FROM_EMAIL` | - | From email address |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Start production server |
| `npm run sync` | Sync data from connected sites |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run test` | Run tests |
| `npm run lint` | Run ESLint |

## Architecture

```
┌─────────────────┐
│   Client Apps   │
└────────┬────────┘
         │ HTTP/MCP
         ▼
┌─────────────────┐
│  Agent Layer    │
│  (Fastify API)  │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌─────────┐
│SQLite │ │Connectors│
│  /PG  │ └────┬────┘
└───────┘      │
          ┌────┼────┬─────────────┐
          ▼    ▼    ▼             ▼
     Edmonton Alberta ABControl Calgary
     Playground Clinics           Wellness
```

## License

MIT
