import bcrypt from 'bcryptjs';
const { hashSync } = bcrypt;
import { config } from '../config.js';
import { getDb } from './index.js';

export function seed(): void {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(config.defaultAdmin.email);
  if (!existing) {
    const hash = hashSync(config.defaultAdmin.password, 12);
    db.prepare(
      'INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)'
    ).run(
      'admin-001',
      config.defaultAdmin.email,
      hash,
      config.defaultAdmin.name,
      config.defaultAdmin.role
    );
    console.log('[seed] Default admin user created');
  } else {
    console.log('[seed] Admin user already exists');
  }

  // Seed default settings
  const defaults: Record<string, string> = {
    'theme': 'dark',
    'default_model': 'claude-sonnet-4-20250514',
    'max_workspaces': '50',
    'auto_suspend_minutes': '30',
    'approval_required': 'true',
    'notification_email': config.defaultAdmin.email,
  };

  const upsert = db.prepare(
    'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)'
  );
  for (const [key, value] of Object.entries(defaults)) {
    upsert.run(key, value);
  }
  console.log('[seed] Default settings seeded');
}
