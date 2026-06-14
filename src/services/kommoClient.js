// Cliente minimo de Kommo CRM para crear leads entrantes.
// Usa fetch nativo (Node 20+). Si Kommo no esta configurado, opera en
// modo mock: no hace llamadas de red y devuelve un id simulado, para que
// las demos del MVP funcionen sin credenciales ni internet.
import { config, isKommoConfigured } from '../config.js';

// Crea un lead en Kommo a partir de un lead normalizado del dominio.
// Devuelve { id, mock } donde mock=true indica que no se envio a Kommo.
export async function createLead(lead) {
  if (!isKommoConfigured) {
    return { id: `mock-${Date.now()}`, mock: true };
  }

  const url = `${config.kommo.baseUrl.replace(/\/$/, '')}/api/v4/leads/complex`;

  // Formato "complex": crea lead + contacto en una sola llamada.
  const customFields = [];
  if (lead.unitId) {
    customFields.push({ field_name: 'Unidad', values: [{ value: lead.unitId }] });
  }
  if (lead.message) {
    customFields.push({ field_name: 'Mensaje', values: [{ value: lead.message }] });
  }

  const body = [
    {
      name: lead.unitId ? `Interes ${lead.unitId}` : 'Lead experiencia 3D',
      ...(config.kommo.pipelineId ? { pipeline_id: Number(config.kommo.pipelineId) } : {}),
      ...(config.kommo.statusId ? { status_id: Number(config.kommo.statusId) } : {}),
      ...(customFields.length ? { custom_fields_values: customFields } : {}),
      _embedded: {
        contacts: [
          {
            name: lead.name,
            custom_fields_values: [
              ...(lead.email
                ? [{ field_code: 'EMAIL', values: [{ value: lead.email, enum_code: 'WORK' }] }]
                : []),
              ...(lead.phone
                ? [{ field_code: 'PHONE', values: [{ value: lead.phone, enum_code: 'WORK' }] }]
                : []),
            ],
          },
        ],
      },
    },
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.kommo.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`Kommo respondio ${res.status}: ${text.slice(0, 300)}`);
    err.status = 502;
    throw err;
  }

  const data = await res.json().catch(() => null);
  const id = Array.isArray(data) && data[0] ? data[0].id : undefined;
  return { id, mock: false };
}
