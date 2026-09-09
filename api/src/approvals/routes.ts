import { FastifyInstance } from 'fastify';
import { getDb } from '../db/index.js';
import { randomBytes } from 'node:crypto';

interface CreateApprovalBody {
  workspaceId?: string;
  workspaceName?: string;
  type: string;
  title: string;
  description?: string;
  context?: string;
  requestedBy?: string;
  expiresAt?: string;
}

export default async function approvalRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  // GET /api/approvals
  fastify.get<{ Querystring: { status?: string; workspaceId?: string; limit?: number; offset?: number } }>('/api/approvals', async (request, reply) => {
    const db = getDb();
    const { status, workspaceId, limit = 50, offset = 0 } = request.query;

    let query = 'SELECT * FROM approvals WHERE 1=1';
    const params: any[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (workspaceId) {
      query += ' AND workspace_id = ?';
      params.push(workspaceId);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const approvals = db.prepare(query).all(...params);
    const total = db.prepare('SELECT COUNT(*) as count FROM approvals' + (status ? ' WHERE status = ?' : '')).get(...(status ? [status] : [])) as any;

    return { approvals, total: total.count };
  });

  // POST /api/approvals
  fastify.post<{ Body: CreateApprovalBody }>('/api/approvals', {
    schema: {
      body: {
        type: 'object',
        required: ['type', 'title'],
        properties: {
          workspaceId: { type: 'string' },
          workspaceName: { type: 'string' },
          type: { type: 'string', enum: ['tool_call', 'file_edit', 'command', 'deployment', 'secret_access'] },
          title: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          context: { type: 'string' },
          requestedBy: { type: 'string' },
          expiresAt: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { workspaceId, workspaceName, type, title, description, context, requestedBy, expiresAt } = request.body;
    const id = randomBytes(16).toString('hex');
    const db = getDb();

    db.prepare(
      `INSERT INTO approvals (id, workspace_id, workspace_name, type, title, description, context, requested_by, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, workspaceId || null, workspaceName || null, type, title, description || null, context || null, requestedBy || null, expiresAt || null);

    const approval = db.prepare('SELECT * FROM approvals WHERE id = ?').get(id);
    reply.status(201);
    return approval;
  });

  // POST /api/approvals/:id/approve
  fastify.post<{ Params: { id: string } }>('/api/approvals/:id/approve', async (request, reply) => {
    const db = getDb();
    const result = db.prepare(
      `UPDATE approvals SET status = 'approved', reviewed_by = ?, reviewed_at = datetime('now') WHERE id = ? AND status = 'pending'`
    ).run(request.user.id, request.params.id);

    if (result.changes === 0) {
      return reply.status(404).send({ error: 'Approval not found or already resolved' });
    }

    db.prepare(
      'INSERT INTO audit_logs (user_id, action, resource_type, resource_id) VALUES (?, ?, ?, ?)'
    ).run(request.user.id, 'approve', 'approval', request.params.id);

    const approval = db.prepare('SELECT * FROM approvals WHERE id = ?').get(request.params.id);
    return approval;
  });

  // POST /api/approvals/:id/reject
  fastify.post<{ Params: { id: string } }>('/api/approvals/:id/reject', async (request, reply) => {
    const db = getDb();
    const result = db.prepare(
      `UPDATE approvals SET status = 'rejected', reviewed_by = ?, reviewed_at = datetime('now') WHERE id = ? AND status = 'pending'`
    ).run(request.user.id, request.params.id);

    if (result.changes === 0) {
      return reply.status(404).send({ error: 'Approval not found or already resolved' });
    }

    db.prepare(
      'INSERT INTO audit_logs (user_id, action, resource_type, resource_id) VALUES (?, ?, ?, ?)'
    ).run(request.user.id, 'reject', 'approval', request.params.id);

    const approval = db.prepare('SELECT * FROM approvals WHERE id = ?').get(request.params.id);
    return approval;
  });
}
