// Fuente de disponibilidad de unidades.
//
// MVP: sirve el seed local (units.seed.json).
// v1/v2: este modulo es el unico lugar a cambiar para alimentar la
// disponibilidad desde Kommo u otra base; la API publica no cambia.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const VALID_STATES = new Set(['available', 'reserved', 'sold']);

let cache = null;

function load() {
  if (cache) return cache;
  const seedPath = join(__dirname, '..', 'data', 'units.seed.json');
  cache = JSON.parse(readFileSync(seedPath, 'utf8'));
  return cache;
}

// Lista de unidades; opcionalmente filtra por estado.
export function listUnits({ estado } = {}) {
  let units = load();
  if (estado) {
    if (!VALID_STATES.has(estado)) {
      const err = new Error(`Estado invalido: ${estado}`);
      err.status = 400;
      throw err;
    }
    units = units.filter((u) => u.estado === estado);
  }
  return units;
}

// Devuelve una unidad por su id, o null si no existe.
export function getUnit(unitId) {
  return load().find((u) => u.unitId === unitId) || null;
}

// Util para tests: limpia la cache.
export function _resetCache() {
  cache = null;
}

export { VALID_STATES };
