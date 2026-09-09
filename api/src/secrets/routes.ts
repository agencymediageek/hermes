import { FastifyInstance } from 'fastify';
import { getDb } from '../db/index.js';
import { encrypt, decrypt, maskValue } from './crypto.js';
import { randomBytes } from 'node:crypto';

interface SecretBody {
  name: string;
  value: string;
}

export default async function secretRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  // GET /api/workspaces/:id/secrets
  fastify.get<{ Params: { id: string } }>('/api/workspaces/:id/secrets', async (request, reply) => {
    const db = getDb();
    const secrets = db.prepare(
      'SELECT id, name, scope, created_at, updated_at FROM secrets WHERE workspace_id = ? AND scope = ?'
    ).all(request.params.id, 'workspace') as any[];

    // Add masked values
    const full = db.prepare(
      'SELECT id, encrypted_value, iv, auth_tag FROM secrets WHERE workspace_id = ? AND scope = ?'
    ).all(request.params.id, 'workspace') as any[];

    const masked = secrets.map(s => {
      const raw = full.find((f: any) => f.id === s.id);
      let maskedValue = '****';
      if (raw) {
        try {
          const val = decrypt({ encrypted: raw.encrypted_value, iv: raw.iv, authTag: raw.auth_tag });
          maskedValue = maskValue(val);
        } catch { /* keep default mask */ }
      }
      return { ...s, maskedValue };
    });

    return { secrets: masked };
  });

  // POST /api/workspaces/:id/secrets
  fastify.post<{ Params: { id: string }; Body: SecretBody }>('/api/workspaces/:id/secrets', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'value'],
        properties: {
          name: { type: 'string', minLength: 1 },
          value: { type: 'string', minLength: 1 },
        },
      },
    },
  }, async (request, reply) => {
    const { name, value } = request.body;
    const { encrypted, iv, authTag } = encrypt(value);
    const id = randomBytes(16).toString('hex');
    const db = getDb();

    db.prepare(
      'INSERT INTO secrets (id, workspace_id, name, encrypted_value, iv, auth_tag, scope) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, request.params.id, name, encrypted, iv, authTag, 'workspace');

    db.prepare(
      'INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?)'
    ).run(request.user.id, 'create', 'secret', id, JSON.stringify({ name, workspace_id: request.params.id }));

    reply.status(201);
    return { id, name, scope: 'workspace', maskedValue: maskValue(value) };
  });

  // DELETE /api/workspaces/:id/secrets/:secretId
  fastify.delete<{ Params: { id: string; secretId: string } }>('/api/workspaces/:id/secrets/:secretId', async (request, reply) => {
    const db = getDb();
    const result = db.prepare('DELETE FROM secrets WHERE id = ? AND workspace_id = ?').run(request.params.secretId, request.params.id);
    if (result.changes === 0) return reply.status(404).send({ error: 'Secret not found' });
    return { success: true };
  });

  // GET /api/settings/secrets (global)
  fastify.get('/api/settings/secrets', async (request, reply) => {
    const db = getDb();
    const secrets = db.prepare(
      'SELECT id, name, scope, created_at, updated_at FROM secrets WHERE scope = ?'
    ).all('global') as any[];

    const full = db.prepare(
      'SELECT id, encrypted_value, iv, auth_tag FROM secrets WHERE scope = ?'
    ).all('global') as any[];

    const masked = secrets.map(s => {
      const raw = full.find((f: any) => f.id === s.id);
      let maskedValue = '****';
      if (raw) {
        try {
          const val = decrypt({ encrypted: raw.encrypted_value, iv: raw.iv, authTag: raw.auth_tag });
          maskedValue = maskValue(val);
        } catch { /* keep default mask */ }
      }
      return { ...s, maskedValue };
    });

    return { secrets: masked };
  });

  // POST /api/settings/secrets (global)
  fastify.post<{ Body: SecretBody }>('/api/settings/secrets', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'value'],
        properties: {
          name: { type: 'string', minLength: 1 },
          value: { type: 'string', minLength: 1 },
        },
      },
    },
  }, async (request, reply) => {
    const { name, value } = request.body;
    const { encrypted, iv, authTag } = encrypt(value);
    const id = randomBytes(16).toString('hex');
    const db = getDb();

    db.prepare(
      'INSERT INTO secrets (id, workspace_id, name, encrypted_value, iv, auth_tag, scope) VALUES (?, NULL, ?, ?, ?, ?, ?)'
    ).run(id, name, encrypted, iv, authTag, 'global');

    reply.status(201);
    return { id, name, scope: 'global', maskedValue: maskValue(value) };
  });

  // DELETE /api/settings/secrets/:id (global)
  fastify.delete<{ Params: { id: string } }>('/api/settings/secrets/:id', async (request, reply) => {
    const db = getDb();
    const result = db.prepare('DELETE FROM secrets WHERE id = ? AND scope = ?').run(request.params.id, 'global');
    if (result.changes === 0) return reply.status(404).send({ error: 'Secret not found' });
    return { success: true };
  });
}
