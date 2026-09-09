import Database from 'better-sqlite3';
import { config } from '../config.js';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    mkdirSync(dirname(config.databasePath), { recursive: true });
    db = new Database(config.databasePath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 5000');
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
  }
}
