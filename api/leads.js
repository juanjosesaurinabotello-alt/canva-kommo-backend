import { randomUUID } from 'node:crypto';
import { getUnit } from '../src/services/unitsStore.js';
import { validateLead } from '../src/services/leadValidation.js';
import { saveLead, listLeads } from './_lib/leadsStore.js';
import { applyCors } from './_lib/cors.js';

// POST /api/leads  -> crea lead | GET /api/leads -> lista
export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method === 'POST') {
    try {
      const lead = validateLead(req.body, (id) => Boolean(getUnit(id)));
      const record = { id: randomUUID(), ...lead, createdAt: new Date().toISOString() };
      const persisted = await saveLead(record);
      res.status(201).json({ ok: true, lead: record, persisted });
    } catch (err) {
      res.status(err.status || 500).json({ error: { message: err.message, details: err.details } });
    }
    return;
  }

  if (req.method === 'GET') {
    const unitId = req.query.unitId;
    let leads = await listLeads();
    if (unitId) leads = leads.filter((l) => l.unitId === unitId);
    res.status(200).json({ count: leads.length, leads });
    return;
  }

  res.status(405).json({ error: { message: 'Metodo no permitido' } });
}
