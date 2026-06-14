import { listUnits } from '../../src/services/unitsStore.js';
import { applyCors } from '../_lib/cors.js';

// GET /api/units?estado=available
export default function handler(req, res) {
  if (applyCors(req, res)) return;
  try {
    const units = listUnits({ estado: req.query.estado });
    res.status(200).json({ count: units.length, units });
  } catch (err) {
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
}
