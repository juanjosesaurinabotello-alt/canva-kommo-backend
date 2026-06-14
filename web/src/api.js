// Capa de acceso al backend (disponibilidad de unidades + leads).
// Tolerante a fallos: si el backend no responde, cae al dataset offline.
import { FALLBACK_UNITS } from './units.fallback.js';

// Base configurable. En produccion setear VITE_API_BASE al backend.
// En dev, vite proxea /api -> localhost:3000 (ver vite.config.js).
const API_BASE = import.meta.env.VITE_API_BASE ?? '';

let offline = false;
export const isOffline = () => offline;

export async function getUnits() {
  try {
    const res = await fetch(`${API_BASE}/api/units`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    offline = false;
    return data.units;
  } catch (err) {
    console.warn('[api] backend no disponible, usando datos offline:', err.message);
    offline = true;
    return FALLBACK_UNITS;
  }
}

export async function postLead(lead) {
  if (offline) {
    // Sin backend: simular exito y guardar localmente para no perder el lead.
    const pending = JSON.parse(localStorage.getItem('atlantico_pending_leads') || '[]');
    pending.push({ ...lead, createdAt: new Date().toISOString() });
    localStorage.setItem('atlantico_pending_leads', JSON.stringify(pending));
    return { ok: true, offline: true };
  }
  const res = await fetch(`${API_BASE}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data?.error?.details?.join(', ') || data?.error?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return res.json();
}
