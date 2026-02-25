/**
 * MCP (Model Context Protocol) Server Implementation
 * Supports tools/list and tools/call
 */

import type { FastifyInstance } from 'fastify';
import { placeService } from '../services/placeService.js';
import { leadService } from '../services/leadService.js';
import { z } from 'zod';

// MCP Protocol Types
interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

interface McpCallRequest {
  name: string;
  arguments?: Record<string, any>;
}

interface McpCallResponse {
  content: Array<{ type: 'text'; text: string } | { type: 'image' } | { type: 'resource' }>;
  isError?: boolean;
}

// Tool schemas
const SearchPlacesSchema = z.object({
  vertical: z.enum(['wellness', 'travel', 'clinic', 'playground', 'industrial']),
  province: z.string().default('AB'),
  city: z.string().optional(),
  q: z.string().optional(),
  tags: z.array(z.string()).optional(),
  minRating: z.number().optional(),
  limit: z.number().default(10)
});

const GetPlaceSchema = z.object({
  placeId: z.string()
});

const CreateLeadSchema = z.object({
  action: z.enum(['lead_get_matched', 'lead_request_shortlist', 'lead_contact_business']),
  vertical: z.enum(['wellness', 'travel', 'clinic', 'playground', 'industrial']),
  province: z.string().default('AB'),
  city: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  name: z.string().optional(),
  placeIds: z.array(z.string()).optional(),
  message: z.string().optional(),
  requirements: z.string().optional()
});

const GetLeadSchema = z.object({
  leadId: z.string()
});

const tools: McpTool[] = [
  {
    name: 'search_places',
    description: 'Search for places (businesses, services, attractions) in Alberta',
    inputSchema: {
      type: 'object',
      properties: {
        vertical: {
          type: 'string',
          enum: ['wellness', 'travel', 'clinic', 'playground', 'industrial'],
          description: 'Business vertical/category'
        },
        province: {
          type: 'string',
          description: 'Province code (AB for Alberta)'
        },
        city: {
          type: 'string',
          description: 'City name (e.g., calgary, edmonton)'
        },
        q: {
          type: 'string',
          description: 'Search query'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by tags'
        },
        minRating: {
          type: 'number',
          description: 'Minimum rating (0-5)'
        },
        limit: {
          type: 'number',
          description: 'Max results to return'
        }
      },
      required: ['vertical']
    }
  },
  {
    name: 'get_place',
    description: 'Get detailed information about a specific place',
    inputSchema: {
      type: 'object',
      properties: {
        placeId: {
          type: 'string',
          description: 'Unique place ID'
        }
      },
      required: ['placeId']
    }
  },
  {
    name: 'create_lead',
    description: 'Create a new lead (inquiry, booking request)',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['lead_get_matched', 'lead_request_shortlist', 'lead_contact_business'],
          description: 'Type of lead action'
        },
        vertical: {
          type: 'string',
          enum: ['wellness', 'travel', 'clinic', 'playground', 'industrial'],
          description: 'Business vertical'
        },
        province: {
          type: 'string',
          description: 'Province code'
        },
        city: {
          type: 'string',
          description: 'City name'
        },
        email: {
          type: 'string',
          format: 'email',
          description: 'Contact email'
        },
        phone: {
          type: 'string',
          description: 'Contact phone'
        },
        name: {
          type: 'string',
          description: 'Contact name'
        },
        placeIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Related place IDs'
        },
        message: {
          type: 'string',
          description: 'Message or inquiry details'
        },
        requirements: {
          type: 'string',
          description: 'Specific requirements'
        }
      },
      required: ['action', 'vertical', 'email']
    }
  },
  {
    name: 'get_lead',
    description: 'Get lead details by ID',
    inputSchema: {
      type: 'object',
      properties: {
        leadId: {
          type: 'string',
          description: 'Lead ID'
        }
      },
      required: ['leadId']
    }
  }
];

export async function registerMcpServer(fastify: FastifyInstance) {
  
  // MCP Server endpoint - JSON-RPC style
  fastify.post('/mcp', {
    schema: {
      description: 'MCP Protocol Endpoint',
      body: {
        type: 'object',
        properties: {
          jsonrpc: { type: 'string' },
          id: { type: ['string', 'number'] },
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
        error: { code: -32600, message: 'Invalid Request' }
      });
    }

    try {
      let result: any;

      switch (method) {
        case 'tools/list':
          result = { tools };
          break;

        case 'tools/call':
          result = await handleToolCall(params as McpCallRequest);
          break;

        case 'initialize':
          result = {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: { listChanged: true }
            },
            serverInfo: {
              name: 'agent-layer-mcp',
              version: '1.0.0'
            }
          };
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
      return reply.code(500).send({
        jsonrpc: '2.0',
        id,
        error: { code: -32603, message: err.message }
      });
    }
  });

  // SSE endpoint for streaming (optional - for future use)
  fastify.get('/mcp/sse', async (request, reply) => {
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    reply.raw.write('event: endpoint\n');
    reply.raw.write(`data: ${request.protocol}://${request.hostname}/mcp\n\n`);
  });
}

async function handleToolCall(request: McpCallRequest): Promise<McpCallResponse> {
  const { name, arguments: args = {} } = request;

  switch (name) {
    case 'search_places': {
      const params = SearchPlacesSchema.parse(args);
      const result = await placeService.search({
        vertical: params.vertical,
        region: { province: params.province, city: params.city },
        q: params.q,
        tags: params.tags,
        minRating: params.minRating,
        limit: params.limit
      });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            total: result.total,
            places: result.results.map(p => ({
              id: p.id,
              name: p.name,
              city: p.city,
              rating: p.rating,
              reviewCount: p.reviewCount,
              phone: p.phone,
              website: p.website,
              tags: p.tags
            })),
            facets: result.facets
          }, null, 2)
        }]
      };
    }

    case 'get_place': {
      const params = GetPlaceSchema.parse(args);
      const place = await placeService.getById(params.placeId);

      if (!place) {
        return {
          content: [{ type: 'text', text: 'Place not found' }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(place, null, 2)
        }]
      };
    }

    case 'create_lead': {
      const params = CreateLeadSchema.parse(args);
      const result = await leadService.createLead({
        action: params.action,
        vertical: params.vertical,
        region: { province: params.province, city: params.city },
        email: params.email,
        phone: params.phone,
        name: params.name,
        placeIds: params.placeIds,
        message: params.message,
        requirements: params.requirements
      });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            leadId: result.actionId,
            status: result.status,
            message: result.message,
            estimatedResponse: result.estimatedResponse,
            nextSteps: result.nextSteps
          }, null, 2)
        }]
      };
    }

    case 'get_lead': {
      const params = GetLeadSchema.parse(args);
      const lead = await leadService.getById(params.leadId);

      if (!lead) {
        return {
          content: [{ type: 'text', text: 'Lead not found' }],
          isError: true
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(lead, null, 2)
        }]
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
