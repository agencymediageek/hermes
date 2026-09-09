import { FastifyInstance } from 'fastify';
import { getDb } from '../db/index.js';

interface UpdateSettingsBody {
  [key: string]: string;
}

export default async function settingsRoutes(fastify: FastifyInstance) {
  // GET /api/system/health (unauthenticated)
  fastify.get('/api/system/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
  }));

  // GET /api/settings
  fastify.get('/api/settings', {
    onRequest: [fastify.authenticate],
  }, async () => {
    const db = getDb();
    const rows = db.prepare('SELECT key, value, updated_at FROM settings').all() as any[];
    const settings: Record<string, any> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return { settings };
  });

  // PUT /api/settings
  fastify.put<{ Body: UpdateSettingsBody }>('/api/settings', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    const db = getDb();
    const body = request.body as Record<string, string>;

    const upsert = db.prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    );

    const tx = db.transaction(() => {
      for (const [key, value] of Object.entries(body)) {
        upsert.run(key, String(value));
      }
    });
    tx();

    db.prepare(
      'INSERT INTO audit_logs (user_id, action, resource_type, details) VALUES (?, ?, ?, ?)'
    ).run(request.user.id, 'update', 'settings', JSON.stringify(Object.keys(body)));

    const rows = db.prepare('SELECT key, value FROM settings').all() as any[];
    const settings: Record<string, any> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return { settings };
  });
}
