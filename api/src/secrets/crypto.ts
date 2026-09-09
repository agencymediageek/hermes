import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { config } from '../config.js';

const ALGORITHM = 'aes-256-gcm';

function getKey(): Buffer {
  const hex = config.secretsKey;
  return Buffer.from(hex, 'hex');
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

export function encrypt(plaintext: string): EncryptedData {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag,
  };
}

export function decrypt(data: EncryptedData): string {
  const decipher = createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(data.iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));
  let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function maskValue(value: string): string {
  if (value.length <= 4) return '****';
  return '*'.repeat(value.length - 4) + value.slice(-4);
}
