import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { config } from '../config.js';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; email: string; role: string };
    user: { id: string; email: string; role: string; name: string };
  }
}

async function authPlugin(fastify: FastifyInstance) {
  await fastify.register(import('@fastify/jwt'), {
    secret: config.jwtSecret,
    sign: { expiresIn: '24h' },
  });

  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' });
    }
  });
}

export default fp(authPlugin, { name: 'auth' });
