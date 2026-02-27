# Agent Layer v2.0 - Deployment Guide

## 🚀 Quick Start

### Local Development
```bash
cd ~/clawd/agent-layer
npm install
npm run build
PORT=3002 npm start
```

API will be available at: http://localhost:3002

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/metrics` | GET | Data statistics |
| `/v2/search` | POST | Search places |
| `/v2/discover` | POST | Intent detection |
| `/mcp` | POST | MCP Protocol |

### Example Queries

```bash
# Search clinics in Calgary
curl -X POST http://localhost:3002/v2/search \
  -H "Content-Type: application/json" \
  -d '{"vertical":"clinic","city":"calgary","limit":5}'

# Search playgrounds in Edmonton
curl -X POST http://localhost:3002/v2/search \
  -H "Content-Type: application/json" \
  -d '{"vertical":"playground","city":"edmonton","limit":5}'

# MCP Tools List
curl -X POST http://localhost:3002/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## 📊 Data Status

| Vertical | Source | Count | Cities |
|----------|--------|-------|--------|
| Clinics | Supabase | 851 | 14 cities across AB |
| Playgrounds | SQLite | 12 | Edmonton (7), Calgary (4), St-Albert (1) |
| Wellness | - | 0 | Not yet implemented |

## 🔧 Render Deployment

### Step 1: Connect GitHub Repository
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repo: `JupitLunar/agentplaybook`
4. Select branch: `main`

### Step 2: Configure Environment Variables
In Render Dashboard → Environment, add:

```
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHB4dG94eml5amliaWZpYnN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYyNTkyMywiZXhwIjoyMDY5MjAxOTIzfQ.RyLwb38dy5h1DM0jpR0KD_HHZhb6SshE3ZhMKdIWyyY
```

### Step 3: Deploy
Render will automatically deploy from `render.yaml` configuration.

## 🏗️ Architecture

### Hybrid Data Layer
```
┌─────────────────────────────────────────┐
│           Agent Layer API                │
│         (Fastify + MCP v2.0)            │
└─────────────────────────────────────────┘
                   │
      ┌────────────┴────────────┐
      ▼                         ▼
┌──────────────┐        ┌──────────────┐
│  Supabase    │        │   SQLite     │
│  (Clinics)   │        │ (Playgrounds)│
│   851条      │        │    12条      │
└──────────────┘        └──────────────┘
```

### MCP Tools Available
1. `agentlayer_search` - Search for places
2. `agentlayer_get_place` - Get place details
3. `agentlayer_compare` - Compare multiple places
4. `agentlayer_create_lead` - Create inquiry/lead
5. `agentlayer_get_lead` - Get lead status
6. `agentlayer_discover` - Detect intent from query

## 📁 Project Structure

```
agent-layer/
├── src/
│   ├── core/
│   │   ├── schema.ts          # Unified vertical schema
│   │   ├── data-service.ts    # Hybrid data layer
│   │   ├── intent-router.ts   # NL query parser
│   │   ├── tools.ts           # MCP tool handlers
│   │   └── lead-service.ts    # Lead management
│   ├── mcp/
│   │   └── server-v2.ts       # MCP protocol server
│   ├── server-v2.ts           # Main entry
│   └── scripts/               # Migration scripts
├── agent_layer.db             # SQLite database (playgrounds)
├── render.yaml                # Render deployment config
└── package.json
```

## 🔮 Future Improvements

1. **Supabase Playgrounds Table**
   - Create table in Supabase Dashboard
   - Migrate 12+ playgrounds to cloud
   - Enable real-time updates

2. **Wellness Vertical**
   - Create schema for wellness services
   - Add sample data
   - Integrate with AlbertaWellness.ca

3. **Enhanced Features**
   - Geolocation search (near me)
   - Real-time availability
   - Booking integration
   - User reviews

## 📞 Support

- GitHub: https://github.com/JupitLunar/agentplaybook
- Local API: http://localhost:3002/docs
- Supabase: https://supabase.com/dashboard/project/lalpxtoxziyjibifibsx
