import { readFileSync } from 'node:fs';
import { config } from '../config.js';
import { getDb } from './index.js';

export function migrate(): void {
  const db = getDb();
  const schema = readFileSync(config.schemaPath, 'utf-8');
  db.exec(schema);
  console.log('[migrate] Schema applied successfully');
}
