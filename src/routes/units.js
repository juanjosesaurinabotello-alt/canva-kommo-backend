// Rutas de disponibilidad de unidades (consumidas por la experiencia UE5
// para colorear hotspots y poblar las fichas comerciales).
import { Router } from 'express';
import { listUnits, getUnit } from '../services/unitsStore.js';

export const unitsRouter = Router();

// GET /api/units?estado=available
unitsRouter.get('/', (req, res, next) => {
  try {
    const units = listUnits({ estado: req.query.estado });
    res.json({ count: units.length, units });
  } catch (err) {
    next(err);
  }
});

// GET /api/units/:id
unitsRouter.get('/:id', (req, res, next) => {
  try {
    const unit = getUnit(req.params.id);
    if (!unit) {
      const err = new Error(`Unidad no encontrada: ${req.params.id}`);
      err.status = 404;
      throw err;
    }
    res.json(unit);
  } catch (err) {
    next(err);
  }
});
