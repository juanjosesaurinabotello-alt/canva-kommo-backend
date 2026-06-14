// Rutas de captura de leads. El boton "Me interesa" de la ficha comercial
// en UE5 hace POST aqui; el backend persiste el lead localmente.
import { Router } from 'express';
import { saveLead, listLeads } from '../services/leadsStore.js';
import { getUnit } from '../services/unitsStore.js';

export const leadsRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valida y normaliza el payload del lead.
function parseLead(payload) {
  const errors = [];
  const body = payload && typeof payload === 'object' ? payload : {};

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) errors.push('name es obligatorio');

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  if (!email && !phone) errors.push('email o phone es obligatorio');
  if (email && !EMAIL_RE.test(email)) errors.push('email invalido');

  const unitId = typeof body.unitId === 'string' ? body.unitId.trim() : '';
  if (unitId && !getUnit(unitId)) errors.push(`unitId inexistente: ${unitId}`);

  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (errors.length) {
    const err = new Error('Datos del lead invalidos');
    err.status = 400;
    err.details = errors;
    throw err;
  }
  return { name, email, phone, unitId, message };
}

// POST /api/leads
leadsRouter.post('/', (req, res, next) => {
  try {
    const lead = parseLead(req.body);
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
