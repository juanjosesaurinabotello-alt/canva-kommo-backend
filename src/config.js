// Configuracion centralizada leida desde variables de entorno.
// Sin dependencias externas: parsea un .env basico si existe.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Carga manual de .env (evita dependencia de dotenv).
function loadDotEnv() {
  try {
    const envPath = join(__dirname, '..', '.env');
    const raw = readFileSync(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // No hay .env: se usan defaults / variables del sistema.
  }
}

loadDotEnv();

export const config = {
  port: Number(process.env.PORT) || 3000,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  kommo: {
    baseUrl: process.env.KOMMO_BASE_URL || '',
    accessToken: process.env.KOMMO_ACCESS_TOKEN || '',
    pipelineId: process.env.KOMMO_PIPELINE_ID || '',
    statusId: process.env.KOMMO_STATUS_ID || '',
  },
};

// El backend opera en modo mock cuando faltan credenciales de Kommo.
export const isKommoConfigured = Boolean(
  config.kommo.baseUrl && config.kommo.accessToken,
);
