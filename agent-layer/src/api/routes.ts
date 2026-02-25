/**
 * API Routes
 */

import type { FastifyInstance } from 'fastify';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { placeService } from '../services/placeService.js';
import { leadService } from '../services/leadService.js';
import { SearchQuerySchema, LeadCreateSchema } from '../models/validation.js';
import type { SearchQuery, LeadCreate } from '../models/validation.js';
import { connectors } from '../connectors/index.js';
import { db } from '../utils/db.js';
import { places, leads } from '../models/schema-sqlite.js';
import { count } from 'drizzle-orm';

// Simple API key auth
const API_KEY = process.env.API_KEY || 'dev-key';

async function requireApiKey(request: any, reply: any) {
  const key = request.headers['x-api-key'];
  if (key !== API_KEY) {
    return reply.code(401).send({ error: 'Unauthorized', message: 'Invalid or missing API key' });
  }
}

// System stats cache
let statsCache: { data: any; timestamp: number } | null = null;
const STATS_CACHE_TTL = 60000; // 1 minute

export async function apiRoutes(fastify: FastifyInstance) {
  
  // Health check - comprehensive
  fastify.get('/health', async (_request, reply) => {
    const checks: Record<string, { status: string; responseTime?: number; error?: string }> = {};
    let overallStatus = 'ok';

    // Database check
    try {
      const start = Date.now();
      await db.query.places.findFirst();
      checks.database = { status: 'ok', responseTime: Date.now() - start };
    } catch (err: any) {
      checks.database = { status: 'error', error: err.message };
      overallStatus = 'error';
    }

    // Memory check
    const memUsage = process.memoryUsage();
    const memMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    checks.memory = { 
      status: memMB < 400 ? 'ok' : memMB < 480 ? 'warning' : 'error',
      responseTime: memMB 
    };

    if (checks.memory.status === 'error') overallStatus = 'error';

    // Response time check
    checks.responseTime = { status: 'ok', responseTime: 0 };

    const response: any = {
      status: overallStatus,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks
    };

    const statusCode = overallStatus === 'ok' ? 200 : overallStatus === 'warning' ? 200 : 503;
    return reply.code(statusCode).send(response);
  });

  // Readiness check
  fastify.get('/ready', async (_request, reply) => {
    try {
      await db.query.places.findFirst();
      return { status: 'ready', timestamp: new Date().toISOString() };
    } catch (err) {
      return reply.code(503).send({ status: 'not ready', error: 'Database unavailable' });
    }
  });

  // Liveness check
  fastify.get('/live', async () => ({
    status: 'alive',
    timestamp: new Date().toISOString()
  }));

  // Metrics endpoint
  fastify.get('/metrics', async (_request, reply) => {
    // Check cache
    if (statsCache && Date.now() - statsCache.timestamp < STATS_CACHE_TTL) {
      return statsCache.data;
    }

    try {
      // Get counts
      const placesCount = await db.select({ count: count() }).from(places);
      const leadsCount = await db.select({ count: count() }).from(leads);
      
      // Get recent leads
      const recentLeads = await db.query.leads.findMany({
        limit: 5,
        orderBy: (leads, { desc }) => [desc(leads.createdAt)]
      });

      // Get place distribution by vertical
      const allPlaces = await db.query.places.findMany();
      const byVertical: Record<string, number> = {};
      allPlaces.forEach(p => {
        byVertical[p.vertical] = (byVertical[p.vertical] || 0) + 1;
      });

      const metrics = {
        timestamp: new Date().toISOString(),
        places: {
          total: placesCount[0]?.count || 0,
          byVertical
        },
        leads: {
          total: leadsCount[0]?.count || 0,
          recent: recentLeads.map(l => ({
            id: l.id,
            action: l.actionType,
            status: l.status,
            createdAt: l.createdAt
          }))
        },
        connectors: {
          registered: connectors.length,
          list: connectors.map(c => c.siteId)
        },
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: process.version
        }
      };

      statsCache = { data: metrics, timestamp: Date.now() };
      return metrics;
    } catch (err: any) {
      return reply.code(500).send({ error: 'Failed to fetch metrics', message: err.message });
    }
  });

  // ==================== Search ====================
  
  fastify.get('/v1/search', {
    preHandler: requireApiKey,
    schema: {
      querystring: zodToJsonSchema(SearchQuerySchema, 'SearchQuery'),
      response: {
        200: {
          type: 'object',
          properties: {
            results: { type: 'array' },
            total: { type: 'number' },
            nextCursor: { type: 'string', nullable: true },
            facets: { type: 'object' }
          }
        }
      }
    }
  }, async (request) => {
    const query = request.query as Record<string, any>;
    
    // Parse nested params (Fastify flattens them)
    const searchQuery: SearchQuery = {
      vertical: query.vertical,
      q: query.q,
      region: {
        province: query['region[province]'] || query.region?.province,
        city: query['region[city]'] || query.region?.city,
        neighborhood: query['region[neighborhood]'] || query.region?.neighborhood
      },
      tags: query.tags?.split(','),
      minRating: query.minRating ? parseFloat(query.minRating) : undefined,
      limit: parseInt(query.limit) || 20,
      cursor: query.cursor
    };

    const result = await placeService.search(searchQuery);
    return result;
  });

  // ==================== Places ====================
  
  fastify.get('/v1/places/:place_id', {
    preHandler: requireApiKey,
    schema: {
      params: {
        type: 'object',
        properties: { place_id: { type: 'string' } },
        required: ['place_id']
      }
    }
  }, async (request, reply) => {
    const { place_id } = request.params as { place_id: string };
    const place = await placeService.getById(place_id);
    
    if (!place) {
      return reply.code(404).send({ error: 'Not Found', message: 'Place not found' });
    }
    
    return place;
  });

  // ==================== Actions ====================
  
  fastify.post('/v1/actions/:action', {
    preHandler: requireApiKey,
    schema: {
      params: {
        type: 'object',
        properties: { action: { type: 'string' } },
        required: ['action']
      },
      body: zodToJsonSchema(LeadCreateSchema, 'LeadCreate')
    }
  }, async (request, reply) => {
    const { action } = request.params as { action: string };
    const body = request.body as LeadCreate;
    
    // Validate action matches
    if (body.action !== action) {
      return reply.code(400).send({ error: 'Bad Request', message: 'Action mismatch' });
    }
    
    const result = await leadService.createLead(body);
    return result;
  });

  // ==================== Sync ====================
  
  fastify.post('/v1/sync', {
    preHandler: requireApiKey,
    schema: {
      body: {
        type: 'object',
        properties: {
          sites: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  }, async (request, reply) => {
    const { sites } = request.body as { sites?: string[] };
    
    // Filter connectors if sites specified
    const toSync = sites 
      ? connectors.filter(c => sites.includes(c.siteId))
      : connectors;

    if (toSync.length === 0) {
      return reply.code(400).send({ error: 'Bad Request', message: 'No matching connectors found' });
    }

    // Run sync for each connector
    const results = [];
    for (const connector of toSync) {
      console.log(`[Sync] Starting ${connector.siteId}...`);
      const result = await connector.sync();
      results.push(result);
      console.log(`[Sync] ${connector.siteId}: +${result.created} new, ~${result.updated} updated, ${result.errors.length} errors (${result.duration}ms)`);
    }

    return {
      synced: results.length,
      results
    };
  });

  // ==================== Admin (Basic) ====================
  
  fastify.get('/v1/admin/leads', {
    preHandler: requireApiKey,
  }, async (request) => {
    const { status, limit = '50', offset = '0' } = request.query as Record<string, string>;
    return leadService.list({
      status: status as any,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  });

  // Get all connectors
  fastify.get('/v1/admin/connectors', {
    preHandler: requireApiKey,
  }, async () => {
    return {
      count: connectors.length,
      connectors: connectors.map(c => ({
        siteId: c.siteId,
        vertical: c.vertical
      }))
    };
  });
}
