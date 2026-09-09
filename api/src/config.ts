import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',
  jwtSecret: process.env.JWT_SECRET || 'hermes-admin-jwt-secret-change-me',
  secretsKey: process.env.SECRETS_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  panelUrl: process.env.PANEL_URL || 'https://hermes.waas.host',
  hermesAgentUrl: process.env.HERMES_AGENT_URL || 'http://127.0.0.1:8642',
  databasePath: process.env.DATABASE_PATH || resolve(__dirname, '..', 'data', 'hermes-admin.db'),
  nodeEnv: process.env.NODE_ENV || 'development',
  defaultAdmin: {
    email: 'rafael@hermesdev.io',
    password: 'Herm3s#Eng!ne',
    name: 'Rafael',
    role: 'admin' as const,
  },
  schemaPath: resolve(__dirname, 'db', 'schema.sql'),
};
