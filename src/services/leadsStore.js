// Almacen de leads independiente (sin CRM externo).
// Persiste en un archivo JSON para sobrevivir reinicios. Pensado para un
// volumen bajo (herramienta comercial), por eso usa lectura/escritura
// sincrona simple. La ruta del archivo se resuelve en cada llamada para
// facilitar los tests (via LEADS_FILE).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function leadsFile() {
  return process.env.LEADS_FILE || join(__dirname, '..', 'data', 'leads.json');
}

function readAll() {
  const file = leadsFile();
  if (!existsSync(file)) return [];
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

function writeAll(leads) {
  const file = leadsFile();
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(leads, null, 2));
}

// Guarda un lead normalizado y devuelve el registro creado (con id y fecha).
export function saveLead(lead) {
  const leads = readAll();
  const record = {
    id: randomUUID(),
    ...lead,
    createdAt: new Date().toISOString(),
  };
  leads.push(record);
  writeAll(leads);
  return record;
}

// Lista leads; opcionalmente filtra por unitId.
export function listLeads({ unitId } = {}) {
  let leads = readAll();
  if (unitId) leads = leads.filter((l) => l.unitId === unitId);
  return leads;
}
