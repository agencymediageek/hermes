import { FastifyInstance, FastifyRequest } from 'fastify';
import { getDb } from '../db/index.js';
import { config } from '../config.js';
import { dockerPs, dockerStats, startContainer, stopContainer, restartContainer, removeContainer } from './docker.js';
import { randomBytes } from 'node:crypto';

interface CreateWorkspaceBody {
  name: string;
  repoUrl?: string;
  branch?: string;
  agentModel?: string;
}

interface ActionParams {
  id: string;
  action: string;
}

interface DeleteBody {
  ids: string[];
}

interface CommitsParams {
  id: string;
}

interface ChatBody {
  message: string;
  conversationId?: string;
  attachments?: string[];
}

export default async function workspaceRoutes(fastify: FastifyInstance) {
  // All routes require auth
  fastify.addHook('onRequest', fastify.authenticate);

  // GET /api/workspaces/status
  fastify.get('/api/workspaces/status', async (request, reply) => {
    const db = getDb();
    const workspaces = db.prepare('SELECT * FROM workspaces ORDER BY created_at DESC').all() as any[];
    
    // Get docker info
    const containers = dockerPs();
    const stats = dockerStats();
    const statsMap = new Map(stats.map(s => [s.containerId.substring(0, 12), s]));

    const enriched = workspaces.map(ws => {
      const container = containers.find(c => c.id === ws.container_id || c.name === ws.container_name);
      const stat = container ? statsMap.get(container.id.substring(0, 12)) : null;
      return {
        ...ws,
        container: container ? {
          id: container.id,
          state: container.state,
          status: container.status,
          ports: container.ports,
          stats: stat ? {
            cpu: stat.cpuPercent,
            memory: stat.memUsage,
            memPercent: stat.memPercent,
            network: stat.netIO,
          } : null,
        } : null,
      };
    });

    return { workspaces: enriched, total: enriched.length };
  });

  // POST /api/workspaces
  fastify.post<{ Body: CreateWorkspaceBody }>('/api/workspaces', {
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          repoUrl: { type: 'string' },
          branch: { type: 'string' },
          agentModel: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { name, repoUrl, branch, agentModel } = request.body;
    const db = getDb();
    const id = randomBytes(16).toString('hex');
    const containerName = `hermes-ws-${id.substring(0, 8)}`;

    db.prepare(
      `INSERT INTO workspaces (id, name, repo_url, branch, container_name, status, agent_model, owner_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, name, repoUrl || null, branch || 'main', containerName, 'creating', agentModel || 'claude-sonnet-4-20250514', request.user.id);

    // Log
    db.prepare(
      'INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?)'
    ).run(request.user.id, 'create', 'workspace', id, JSON.stringify({ name, repoUrl }));

    const workspace = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(id);
    reply.status(201);
    return workspace;
  });

  // POST /api/workspaces/:id/suspend
  fastify.post<{ Params: { id: string } }>('/api/workspaces/:id/suspend', async (request, reply) => {
    const { id } = request.params;
    const db = getDb();
    const ws = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(id) as any;
    if (!ws) return reply.status(404).send({ error: 'Workspace not found' });

    if (ws.container_id) {
      try { stopContainer(ws.container_id); } catch (e) { /* may not be running */ }
    }

    db.prepare('UPDATE workspaces SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run('suspended', id);
    return { success: true, status: 'suspended' };
  });

  // POST /api/workspaces/:id/resume
  fastify.post<{ Params: { id: string } }>('/api/workspaces/:id/resume', async (request, reply) => {
    const { id } = request.params;
    const db = getDb();
    const ws = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(id) as any;
    if (!ws) return reply.status(404).send({ error: 'Workspace not found' });

    if (ws.container_id) {
      try { startContainer(ws.container_id); } catch (e) { /* ignore */ }
    }

    db.prepare('UPDATE workspaces SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run('running', id);
    return { success: true, status: 'running' };
  });

  // DELETE /api/workspaces
  fastify.delete<{ Body: DeleteBody }>('/api/workspaces', {
    schema: {
      body: {
        type: 'object',
        required: ['ids'],
        properties: {
          ids: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  }, async (request, reply) => {
    const { ids } = request.body;
    const db = getDb();

    for (const id of ids) {
      const ws = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(id) as any;
      if (ws?.container_id) {
        try { removeContainer(ws.container_id); } catch (e) { /* ignore */ }
      }
      db.prepare('DELETE FROM workspaces WHERE id = ?').run(id);
    }

    db.prepare(
      'INSERT INTO audit_logs (user_id, action, resource_type, details) VALUES (?, ?, ?, ?)'
    ).run(request.user.id, 'delete_batch', 'workspace', JSON.stringify({ ids }));

    return { success: true, deleted: ids.length };
  });

  // POST /api/workspaces/:id/:action (start/stop/restart/destroy)
  fastify.post<{ Params: ActionParams }>('/api/workspaces/:id/:action', async (request, reply) => {
    const { id, action } = request.params;
    if (!['start', 'stop', 'restart', 'destroy'].includes(action)) {
      return reply.status(400).send({ error: `Invalid action: ${action}` });
    }

    const db = getDb();
    const ws = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(id) as any;
    if (!ws) return reply.status(404).send({ error: 'Workspace not found' });

    try {
      if (ws.container_id) {
        switch (action) {
          case 'start': startContainer(ws.container_id); break;
          case 'stop': stopContainer(ws.container_id); break;
          case 'restart': restartContainer(ws.container_id); break;
          case 'destroy': removeContainer(ws.container_id); break;
        }
      }

      const statusMap: Record<string, string> = {
        start: 'running', stop: 'stopped', restart: 'running', destroy: 'stopped',
      };
      const newStatus = statusMap[action] || ws.status;

      if (action === 'destroy') {
        db.prepare('UPDATE workspaces SET status = ?, container_id = NULL, updated_at = datetime(\'now\') WHERE id = ?').run(newStatus, id);
      } else {
        db.prepare('UPDATE workspaces SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run(newStatus, id);
      }

      db.prepare(
        'INSERT INTO audit_logs (user_id, action, resource_type, resource_id) VALUES (?, ?, ?, ?)'
      ).run(request.user.id, action, 'workspace', id);

      return { success: true, status: newStatus };
    } catch (e) {
      return reply.status(500).send({ error: (e as Error).message });
    }
  });

  // GET /api/workspaces/:id/commits
  fastify.get<{ Params: CommitsParams; Querystring: { page?: number; per_page?: number } }>('/api/workspaces/:id/commits', async (request, reply) => {
    const { id } = request.params;
    const db = getDb();
    const ws = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(id) as any;
    if (!ws) return reply.status(404).send({ error: 'Workspace not found' });

    if (!ws.repo_url) {
      return { commits: [], total: 0 };
    }

    // Parse GitHub URL to owner/repo
    const match = ws.repo_url.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
    if (!match) {
      return { commits: [], total: 0, error: 'Not a GitHub URL' };
    }

    const [, owner, repo] = match;
    const page = request.query.page || 1;
    const perPage = request.query.per_page || 20;

    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?sha=${ws.branch || 'main'}&page=${page}&per_page=${perPage}`,
        { headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'hermes-admin' } }
      );
      if (!res.ok) throw new Error(`GitHub API ${res.status}`);
      const commits = await res.json();
      return { commits, total: commits.length };
    } catch (e) {
      return reply.status(502).send({ error: `GitHub API error: ${(e as Error).message}` });
    }
  });

  // POST /api/workspaces/:id/agent/chat - SSE proxy
  fastify.post<{ Params: { id: string }; Body: ChatBody }>('/api/workspaces/:id/agent/chat', async (request, reply) => {
    const { id } = request.params;
    const { message, conversationId, attachments } = request.body;

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    try {
      const res = await fetch(`${config.hermesAgentUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, conversationId, attachments }),
      });

      if (!res.ok) {
        reply.raw.write(`data: ${JSON.stringify({ error: `Agent API ${res.status}` })}\n\n`);
        reply.raw.end();
        return;
      }

      if (res.body) {
        const reader = (res.body as any).getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          reply.raw.write(chunk);
        }
      }
    } catch (e) {
      reply.raw.write(`data: ${JSON.stringify({ error: (e as Error).message })}\n\n`);
    }

    reply.raw.end();
    return reply;
  });

  // POST /api/workspaces/:id/agent/attachments
  fastify.post<{ Params: { id: string } }>('/api/workspaces/:id/agent/attachments', async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    const buffer = await data.toBuffer();
    // In production, store to disk or object storage
    const fileId = randomBytes(8).toString('hex');

    return {
      id: fileId,
      filename: data.filename,
      mimetype: data.mimetype,
      size: buffer.length,
    };
  });
}
