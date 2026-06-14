// Persistencia de leads para entorno serverless (Vercel).
//
// Orden de preferencia:
//   1) Vercel KV / Upstash Redis (REST) si KV_REST_API_URL + KV_REST_API_TOKEN.
//   2) /tmp (efimero, solo dentro de una instancia "caliente").
// Devuelve la estrategia usada ('kv' | 'tmp' | 'memory') para transparencia.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const TMP = '/tmp/atlantico-leads.json';
const KEY = 'atlantico:leads';
const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

const kvEnabled = () => Boolean(KV_URL && KV_TOKEN);

async function kvCmd(cmd) {
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  if (!res.ok) throw new Error(`KV ${res.status}`);
  return res.json();
}

function readTmp() {
  try {
    return existsSync(TMP) ? JSON.parse(readFileSync(TMP, 'utf8')) : [];
  } catch {
    return [];
  }
}

export async function saveLead(record) {
  if (kvEnabled()) {
    await kvCmd(['RPUSH', KEY, JSON.stringify(record)]);
    return 'kv';
  }
  try {
    const all = readTmp();
    all.push(record);
    writeFileSync(TMP, JSON.stringify(all));
    return 'tmp';
  } catch {
    return 'memory';
  }
}

export async function listLeads() {
  if (kvEnabled()) {
    const data = await kvCmd(['LRANGE', KEY, '0', '-1']);
    return (data.result || []).map((s) => {
      try { return JSON.parse(s); } catch { return null; }
    }).filter(Boolean);
  }
  return readTmp();
}
