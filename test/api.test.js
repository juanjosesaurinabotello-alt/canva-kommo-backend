// Tests de integracion de la API usando el test runner nativo de Node.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(() => {
  server.close();
});

test('GET /health responde ok', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'ok');
});

test('GET /api/units devuelve las 5 unidades', async () => {
  const res = await fetch(`${baseUrl}/api/units`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.count, 5);
  assert.equal(body.units.length, 5);
});

test('GET /api/units?estado=available filtra por estado', async () => {
  const res = await fetch(`${baseUrl}/api/units?estado=available`);
  const body = await res.json();
  assert.ok(body.units.every((u) => u.estado === 'available'));
  assert.equal(body.count, 3);
});

test('GET /api/units?estado=invalido devuelve 400', async () => {
  const res = await fetch(`${baseUrl}/api/units?estado=foo`);
  assert.equal(res.status, 400);
});

test('GET /api/units/:id existente devuelve la unidad', async () => {
  const res = await fetch(`${baseUrl}/api/units/UNIT_101`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.unitId, 'UNIT_101');
});

test('GET /api/units/:id inexistente devuelve 404', async () => {
  const res = await fetch(`${baseUrl}/api/units/NOPE`);
  assert.equal(res.status, 404);
});

test('POST /api/leads valido crea lead (mock)', async () => {
  const res = await fetch(`${baseUrl}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Juan Perez',
      email: 'juan@example.com',
      unitId: 'UNIT_101',
      message: 'Quiero info',
    }),
  });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.mock, true);
  assert.ok(body.leadId);
});

test('POST /api/leads sin contacto devuelve 400', async () => {
  const res = await fetch(`${baseUrl}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Sin contacto' }),
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.ok(body.error.details.some((d) => d.includes('email o phone')));
});

test('POST /api/leads con unitId inexistente devuelve 400', async () => {
  const res = await fetch(`${baseUrl}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'X', phone: '+598 99 123 456', unitId: 'NOPE' }),
  });
  assert.equal(res.status, 400);
});
