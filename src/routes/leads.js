// Rutas de captura de leads. El boton "Me interesa" de la ficha comercial
// en UE5 / web hace POST aqui; el backend persiste el lead localmente.
import { Router } from 'express';
import { saveLead, listLeads } from '../services/leadsStore.js';
import { getUnit } from '../services/unitsStore.js';
import { validateLead } from '../services/leadValidation.js';

export const leadsRouter = Router();

// POST /api/leads
leadsRouter.post('/', (req, res, next) => {
  try {
    const lead = validateLead(req.body, (id) => Boolean(getUnit(id)));
    const record = saveLead(lead);
    res.status(201).json({ ok: true, lead: record });
  } catch (err) {
    next(err);
  }
});

// GET /api/leads?unitId=UNIT_101  (seguimiento comercial)
leadsRouter.get('/', (req, res, next) => {
  try {
    const unitId = typeof req.query.unitId === 'string' ? req.query.unitId : undefined;
    const leads = listLeads({ unitId });
    res.json({ count: leads.length, leads });
  } catch (err) {
    next(err);
  }
});
