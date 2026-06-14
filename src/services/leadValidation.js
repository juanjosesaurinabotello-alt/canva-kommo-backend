// Validacion y normalizacion de leads, compartida entre el servidor Express
// (local) y las serverless functions (Vercel).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// `unitExists(unitId) => boolean` permite inyectar la comprobacion de unidad.
export function validateLead(payload, unitExists = () => true) {
  const errors = [];
  const body = payload && typeof payload === 'object' ? payload : {};

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) errors.push('name es obligatorio');

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  if (!email && !phone) errors.push('email o phone es obligatorio');
  if (email && !EMAIL_RE.test(email)) errors.push('email invalido');

  const unitId = typeof body.unitId === 'string' ? body.unitId.trim() : '';
  if (unitId && !unitExists(unitId)) errors.push(`unitId inexistente: ${unitId}`);

  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (errors.length) {
    const err = new Error('Datos del lead invalidos');
    err.status = 400;
    err.details = errors;
    throw err;
  }
  return { name, email, phone, unitId, message };
}
