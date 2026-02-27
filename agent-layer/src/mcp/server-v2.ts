/**
 * MCP Server - Native structured data protocol
 * Returns structured JSON for AI agents, not human-readable text
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  searchPlacesTool,
  getPlaceTool,
  comparePlacesTool,
  createLeadTool,
  getLeadTool,
  discoverVerticalTool
} from '../core/tools.js';
import type { VerticalType } from '../core/schema.js';

// Zod schemas for validation
const SearchSchema = z.object({
  query: z.string().optional().describe('Natural language search query'),
  vertical: z.enum(['clinic', 'playground', 'wellness', 'travel', 'food', 'industrial']).optional().describe('Business vertical'),
  city: z.string().optional().describe('City name'),
  province: z.string().default('AB').describe('Province code'),
  filters: z.record(z.any()).optional().describe('Additional filters'),
  limit: z.number().default(10).describe('Maximum results')
});

const GetPlaceSchema = z.object({
  placeId: z.string().describe('Unique place ID'),
  vertical: z.enum(['clinic', 'playground', 'wellness', 'travel', 'food', 'industrial']).optional()
});

const CompareSchema = z.object({
  placeIds: z.array(z.string()).min(2).max(5).describe('IDs of places to compare')
});

const CreateLeadSchema = z.object({
  type: z.enum(['match', 'shortlist', 'contact', 'book']).describe('Type of lead'),
  vertical: z.enum(['clinic', 'playground', 'wellness', 'travel', 'food', 'industrial']).describe('Business vertical'),
  placeIds: z.array(z.string()).optional().describe('Related place IDs'),
  email: z.string().email().describe('Contact email'),
  phone: z.string().optional().describe('Contact phone'),
  name: z.string().optional().describe('Contact name'),
  requirements: z.string().optional().describe('Specific requirements'),
  timing: z.enum(['asap', 'this_week', 'this_month', 'flexible']).optional().describe('When service needed')
});

const GetLeadSchema = z.object({
  leadId: z.string().describe('Lead ID')
});

const DiscoverSchema = z.object({
  query: z.string().describe('Natural language query to analyze')
});

// MCP Tool definitions
const MCP_TOOLS = [
  {
    name: 'agentlayer_search',
    description: 'Search for places (clinics, playgrounds, wellness centers) in Alberta. Returns structured data with actionable next steps.',
    inputSchema: zodToJsonSchema(SearchSchema) as any
  },
  {
    name: 'agentlayer_get_place',
    description: 'Get detailed information about a specific place by ID',
    inputSchema: zodToJsonSchema(GetPlaceSchema) as any
  },
  {
    name: 'agentlayer_compare',
    description: 'Compare multiple places side by side',
    inputSchema: zodToJsonSchema(CompareSchema) as any
  },
  {
    name: 'agentlayer_create_lead',
    description: 'Create a lead (inquiry, booking request, or match request)',
    inputSchema: zodToJsonSchema(CreateLeadSchema) as any
  },
  {
    name: 'agentlayer_get_lead',
    description: 'Get status of an existing lead',
    inputSchema: zodToJsonSchema(GetLeadSchema) as any
  },
  {
    name: 'agentlayer_discover',
    description: 'Analyze a natural language query to determine the business vertical and intent',
    inputSchema: zodToJsonSchema(DiscoverSchema) as any
  }
];

// Tool handler mapping
const TOOL_HANDLERS: Record<string, (params: any) => Promise<any>> = {
  agentlayer_search: searchPlacesTool,
  agentlayer_get_place: getPlaceTool,
  agentlayer_compare: comparePlacesTool,
  agentlayer_create_lead: createLeadTool,
  agentlayer_get_lead: getLeadTool,
  agentlayer_discover: discoverVerticalTool
};

export async function registerMcpServer(fastify: FastifyInstance) {
  
  // Health check
  fastify.get('/mcp/health', async () => ({
    status: 'ok',
    version: '2.0.0',
    protocol: 'mcp',
    tools: MCP_TOOLS.length
  }));
  
  // MCP JSON-RPC endpoint
  fastify.post('/mcp', {
    schema: {
      description: 'MCP Protocol Endpoint v2.0',
      body: {
        type: 'object',
        properties: {
          jsonrpc: { type: 'string', const: '2.0' },
          id: { type: ['string', 'number', 'null'] },
          method: { type: 'string' },
          params: { type: 'object' }
        },
        required: ['jsonrpc', 'method']
      }
    }
  }, async (request, reply) => {
    const body = request.body as any;
    const { jsonrpc, id, method, params = {} } = body;

    if (jsonrpc !== '2.0') {
      return reply.code(400).send({
        jsonrpc: '2.0',
        id,
        error: { code: -32600, message: 'Invalid Request: jsonrpc must be "2.0"' }
      });
    }

    try {
      let result: any;

      switch (method) {
        case 'initialize':
          result = {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: { listChanged: true },
              prompts: {},
              resources: {}
            },
            serverInfo: {
              name: 'agent-layer-mcp',
              version: '2.0.0',
              description: 'Alberta business directory for AI agents'
            }
          };
          break;

        case 'tools/list':
          result = { tools: MCP_TOOLS };
          break;

        case 'tools/call':
          result = await handleToolCall(params);
          break;

        case 'resources/list':
          result = { resources: [] };
          break;

        case 'prompts/list':
          result = { prompts: [] };
          break;

        default:
          return reply.code(400).send({
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Method not found: ${method}` }
          });
      }

      return {
        jsonrpc: '2.0',
        id,
        result
      };
    } catch (err: any) {
      console.error('[MCP] Error:', err);
      return reply.code(500).send({
        jsonrpc: '2.0',
        id,
        error: { 
          code: -32603, 
          message: err.message || 'Internal error',
          data: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }
      });
    }
  });

  // RESTful API endpoints for easier testing
  fastify.post('/v2/search', async (request) => {
    const params = SearchSchema.parse(request.body);
    return searchPlacesTool(params);
  });

  fastify.get('/v2/place/:id', async (request) => {
    const { id } = request.params as { id: string };
    const { vertical } = request.query as { vertical?: VerticalType };
    return getPlaceTool({ placeId: id, vertical });
  });

  fastify.post('/v2/compare', async (request) => {
    const params = CompareSchema.parse(request.body);
    return comparePlacesTool(params);
  });

  fastify.post('/v2/leads', async (request) => {
    const params = CreateLeadSchema.parse(request.body);
    return createLeadTool(params);
  });

  fastify.get('/v2/leads/:id', async (request) => {
    const { id } = request.params as { id: string };
    return getLeadTool({ leadId: id });
  });

  fastify.post('/v2/discover', async (request) => {
    const params = DiscoverSchema.parse(request.body);
    return discoverVerticalTool(params);
  });

  console.log('[MCP] Server registered with tools:', MCP_TOOLS.map(t => t.name));
}

async function handleToolCall(params: { name: string; arguments?: Record<string, any> }) {
  const { name, arguments: args = {} } = params;
  
  const handler = TOOL_HANDLERS[name];
  if (!handler) {
    throw new Error(`Unknown tool: ${name}`);
  }
  
  const result = await handler(args);
  
  // Return in MCP format
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result)
      }
    ],
    isError: false
  };
}
