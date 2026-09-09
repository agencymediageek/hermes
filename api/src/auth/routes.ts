import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
const { compareSync } = bcrypt;
import { getDb } from '../db/index.js';

interface LoginBody {
  email: string;
  password: string;
}

export default async function authRoutes(fastify: FastifyInstance) {
  // POST /api/auth/login
  fastify.post<{ Body: LoginBody }>('/api/auth/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 1 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: { type: 'string' },
                avatar: { type: ['string', 'null'] },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { email, password } = request.body;
    const db = getDb();

    const user = db.prepare(
      'SELECT id, email, password_hash, name, role, avatar FROM users WHERE email = ?'
    ).get(email) as any;

    if (!user || !compareSync(password, user.password_hash)) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const token = fastify.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Log the login
    db.prepare(
      'INSERT INTO audit_logs (user_id, action, resource_type, ip_address) VALUES (?, ?, ?, ?)'
    ).run(user.id, 'login', 'auth', request.ip);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    };
  });

  // GET /api/auth/me
  fastify.get('/api/auth/me', {
    onRequest: [fastify.authenticate],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string' },
            avatar: { type: ['string', 'null'] },
          },
        },
      },
    },
  }, async (request, reply) => {
    const db = getDb();
    const user = db.prepare(
      'SELECT id, email, name, role, avatar FROM users WHERE id = ?'
    ).get(request.user.id) as any;

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return user;
  });
}
