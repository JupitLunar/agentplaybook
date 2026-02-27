/**
 * Main server entry point - v2 MCP-native Agent Layer
 */

import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { registerMcpServer } from './mcp/server-v2.js';

const PORT = parseInt(process.env.PORT || '3000');
const HOST = process.env.HOST || '0.0.0.0';

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' }
    } : undefined
  }
});

// Register plugins
await app.register(cors, {
  origin: process.env.CORS_ORIGIN || '*'
});

await app.register(rateLimit, {
  max: parseInt(process.env.RATE_LIMIT || '100'),
  timeWindow: '1 minute',
  keyGenerator: (req) => req.headers['x-api-key'] as string || req.ip
});

await app.register(swagger, {
  openapi: {
    info: {
      title: 'Agent Layer Gateway',
      description: 'MCP-native Alberta business directory for AI agents',
      version: '2.0.0'
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local' },
      { url: 'https://api.jupitlunar.com', description: 'Production' }
    ],
    tags: [
      { name: 'MCP', description: 'Model Context Protocol endpoints' },
      { name: 'Search', description: 'Search and discovery' },
      { name: 'Places', description: 'Place details' },
      { name: 'Leads', description: 'Lead management' }
    ]
  }
});

await app.register(swaggerUi, {
  routePrefix: '/docs'
});

// Health check
app.get('/health', async () => ({
  status: 'ok',
  version: '2.0.0',
  mode: 'mcp-native',
  dataSource: 'supabase',
  verticals: ['clinic', 'playground', 'wellness']
}));

// Metrics endpoint
app.get('/metrics', async () => {
  const { dataService } = await import('./core/data-service.js');
  
  const [clinicCities, playgroundCities] = await Promise.all([
    dataService.getCityCounts('clinic').catch(() => ({})),
    dataService.getCityCounts('playground').catch(() => ({}))
  ]);
  
  return {
    verticals: {
      clinic: {
        total: Object.values(clinicCities).reduce((a, b) => a + b, 0),
        cities: clinicCities
      },
      playground: {
        total: Object.values(playgroundCities).reduce((a, b) => a + b, 0),
        cities: playgroundCities
      }
    },
    uptime: process.uptime()
  };
});

// Register MCP server (includes v2 REST API)
await registerMcpServer(app);

// Error handler
app.setErrorHandler((error: any, _request: any, reply: any) => {
  app.log.error(error);
  reply.status(error.statusCode || 500).send({
    error: error.name || 'Error',
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Start
console.log(`
╔════════════════════════════════════════════════════════╗
║           AGENT LAYER v2.0 - MCP Native                ║
╠════════════════════════════════════════════════════════╣
║  Mode:     Structured data for AI agents               ║
║  Data:     Supabase (real-time)                        ║
║  Protocol: MCP (Model Context Protocol)                ║
╚════════════════════════════════════════════════════════╝
`);

try {
  await app.listen({ port: PORT, host: HOST });
  console.log(`🚀 Server: http://${HOST}:${PORT}`);
  console.log(`📚 Docs:   http://${HOST}:${PORT}/docs`);
  console.log(`🔌 MCP:    http://${HOST}:${PORT}/mcp`);
  console.log(`💓 Health: http://${HOST}:${PORT}/health`);
  console.log(`📊 Stats:  http://${HOST}:${PORT}/metrics\n`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
