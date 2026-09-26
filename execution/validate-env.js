/**
 * Layer 3: Execution - Validador de Variáveis de Ambiente
 * BurguerSync Ourinhos
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error(`Arquivo .env não encontrado em: ${envPath}`);
  }

  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};

  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([A-Za-z0-9_]+)\s*=\s*["']?([^"',]+)["']?/);
    if (match) {
      env[match[1]] = match[2].trim();
    }
  });

  return env;
}

export function validateEnv() {
  const env = loadEnv();
  const requiredKeys = [
    'FIREBASE_apiKey',
    'FIREBASE_authDomain',
    'FIREBASE_projectId',
    'FIREBASE_storageBucket',
    'FIREBASE_messagingSenderId',
    'FIREBASE_appId',
    'GITHUB_PERSONA_KEY'
  ];

  const missing = [];
  requiredKeys.forEach(key => {
    if (!env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    throw new Error(`Variáveis obrigatórias ausentes no .env: ${missing.join(', ')}`);
  }

  console.log('✅ Validação do .env concluída com sucesso!');
  console.log(`   - Firebase Project: ${env.FIREBASE_projectId}`);
  console.log(`   - GitHub Token configurado: ${env.GITHUB_PERSONA_KEY.substring(0, 8)}...`);

  return env;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    validateEnv();
  } catch (err) {
    console.error('❌ Erro na validação:', err.message);
    process.exit(1);
  }
}
