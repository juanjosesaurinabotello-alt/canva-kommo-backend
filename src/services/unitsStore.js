// Fuente de disponibilidad de unidades.
//
// Importa el seed como modulo JSON (serverless-safe: queda en el bundle).
// MVP: sirve el seed local. v1/v2: este modulo es el unico lugar a cambiar
// para alimentar la disponibilidad desde otra fuente; la API no cambia.
import seed from '../data/units.seed.json' with { type: 'json' };

const VALID_STATES = new Set(['available', 'reserved', 'sold']);

// Lista de unidades; opcionalmente filtra por estado.
export function listUnits({ estado } = {}) {
  if (estado) {
    if (!VALID_STATES.has(estado)) {
      const err = new Error(`Estado invalido: ${estado}`);
      err.status = 400;
      throw err;
    }
    return seed.filter((u) => u.estado === estado);
  }
  return seed;
}

// Devuelve una unidad por su id, o null si no existe.
export function getUnit(unitId) {
  return seed.find((u) => u.unitId === unitId) || null;
}

export { VALID_STATES };
