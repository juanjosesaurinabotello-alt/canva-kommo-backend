import { getUnit } from '../../src/services/unitsStore.js';
import { applyCors } from '../_lib/cors.js';

// GET /api/units/:id
export default function handler(req, res) {
  if (applyCors(req, res)) return;
  const unit = getUnit(req.query.id);
  if (!unit) {
    res.status(404).json({ error: { message: `Unidad no encontrada: ${req.query.id}` } });
    return;
  }
  res.status(200).json(unit);
}
