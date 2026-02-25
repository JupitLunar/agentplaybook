/**
 * Main server entry point
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { apiRoutes } from './api/routes.js';
import { registerMcpServer } from './mcp/server.js';
import { registerDefaultConnectors } from './connectors/index.js';

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
      description: 'Alberta Graph API for AI agents',
      version: '1.0.0'
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local' },
      { url: 'https://api.jupitlunar.com', description: 'Production' }
    ]
  }
});

await app.register(swaggerUi, {
  routePrefix: '/docs'
});

// Register MCP server
await registerMcpServer(app);

// Register API routes
await app.register(apiRoutes);

// Error handler
app.setErrorHandler((error: any, _request: any, reply: any) => {
  app.log.error(error);
  reply.status(error.statusCode || 500).send({
    error: error.name || 'Error',
    message: error.message || 'Internal server error'
  });
});

// Register default connectors on startup
registerDefaultConnectors();

// Start
try {
  await app.listen({ port: PORT, host: HOST });
  app.log.info(`🚀 Server running at http://${HOST}:${PORT}`);
  app.log.info(`📚 API docs at http://${HOST}:${PORT}/docs`);
  app.log.info(`🔌 MCP endpoint at http://${HOST}:${PORT}/mcp`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
