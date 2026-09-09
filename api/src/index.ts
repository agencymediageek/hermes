import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { config } from './config.js';
import { migrate } from './db/migrate.js';
import { seed } from './db/seed.js';
import { closeDb } from './db/index.js';
import authPlugin from './auth/plugin.js';
import authRoutes from './auth/routes.js';
import workspaceRoutes from './workspaces/routes.js';
import secretRoutes from './secrets/routes.js';
import approvalRoutes from './approvals/routes.js';
import infrastructureRoutes from './infrastructure/routes.js';
import settingsRoutes from './settings/routes.js';
import { startCollector, stopCollector } from './infrastructure/collector.js';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: any, reply: any) => Promise<void>;
  }
}

async function main() {
  const fastify = Fastify({
    logger: {
      level: config.nodeEnv === 'production' ? 'info' : 'debug',
      transport: config.nodeEnv !== 'production' ? {
        target: 'pino-pretty',
        options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' },
      } : undefined,
    },
    trustProxy: true,
  });

  // CORS
  await fastify.register(cors, {
    origin: [config.panelUrl, 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Multipart for file uploads
  await fastify.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
  });

  // Auth plugin (JWT)
  await fastify.register(authPlugin);

  // Database setup
  migrate();
  seed();

  // Start background stats collector
  startCollector();

  // Register routes
  await fastify.register(authRoutes);
  await fastify.register(workspaceRoutes);
  await fastify.register(secretRoutes);
  await fastify.register(approvalRoutes);
  await fastify.register(infrastructureRoutes);
  await fastify.register(settingsRoutes);

  // Global error handler
  fastify.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    const statusCode = error.statusCode || 500;
    reply.status(statusCode).send({
      error: error.name || 'InternalServerError',
      message: statusCode === 500 ? 'Internal server error' : error.message,
      statusCode,
    });
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n[server] Shutting down...');
    stopCollector();
    closeDb();
    await fastify.close();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // Start
  try {
    await fastify.listen({ port: config.port, host: config.host });
    console.log(`[server] Hermes Admin API running on http://${config.host}:${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
