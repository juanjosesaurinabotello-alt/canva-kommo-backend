# canva-kommo-backend

Backend de **disponibilidad de unidades** y **captura de leads** para la experiencia
interactiva en Unreal Engine 5 del proyecto turistico-inmobiliario "Atlántico"
(frontera Brasil–Uruguay), integrado con **Kommo CRM**.

La experiencia UE5 **no** habla con Kommo directamente: consume esta API. Asi se
desacopla el motor 3D del CRM y se puede cambiar de CRM sin tocar el cliente Unreal.

> Documentación de la Fase 2 y del MVP UE5: ver `docs/`.

## Requisitos

- Node.js >= 20 (usa `fetch` nativo)

## Instalación

```bash
npm install
cp .env.example .env   # editar credenciales de Kommo (opcional)
npm start              # o: npm run dev  (con --watch)
```

### Modo MOCK (offline)

Si `KOMMO_BASE_URL` o `KOMMO_ACCESS_TOKEN` no están seteados, el backend funciona en
**modo mock**: `/api/units` sirve el seed local y `/api/leads` devuelve un id simulado
sin llamar a Kommo. Ideal para demos del MVP sin internet ni credenciales.

## API

### `GET /health`
Estado del servicio. `kommo` = `configured` | `mock`.
```json
{ "status": "ok", "kommo": "mock" }
```

### `GET /api/units`
Lista de unidades. Filtro opcional `?estado=available|reserved|sold`.
```json
{
  "count": 1,
  "units": [
    {
      "unitId": "UNIT_101",
      "tipologia": "1 dormitorio + balcon",
      "areaM2": 48.5,
      "precio": "USD 119.000",
      "estado": "available",
      "formaPago": "30% entrega + 24 cuotas",
      "imagen": "https://cdn.atlantico.example/units/UNIT_101.jpg"
    }
  ]
}
```
> En UE5: `estado` controla el color del hotspot (available=verde, reserved=amarillo,
> sold=rojo) y los campos pueblan la ficha `WBP_UnitCard`.

### `GET /api/units/:id`
Una unidad por su `unitId`. `404` si no existe.

### `POST /api/leads`
Crea un lead (botón "Me interesa" de la ficha). Requiere `name` y al menos `email`
o `phone`. `unitId` y `message` son opcionales (si va `unitId`, debe existir).
```json
// request
{ "name": "Juan Perez", "email": "juan@example.com", "phone": "+598 99 123 456",
  "unitId": "UNIT_101", "message": "Quiero info de financiacion" }
// response 201
{ "ok": true, "leadId": 123456, "mock": false }
```

## Fuente de datos

`src/services/unitsStore.js` sirve el seed `src/data/units.seed.json` (MVP).
Para v1/v2 (disponibilidad en vivo desde Kommo) es el **único** módulo a cambiar:
la API pública se mantiene igual.

## Tests

```bash
npm test
```

## Estructura

```
src/
  app.js                 app Express (exportada)
  server.js              arranque del servidor
  config.js              carga de .env y config
  routes/units.js        GET /api/units, /api/units/:id
  routes/leads.js        POST /api/leads
  services/unitsStore.js fuente de disponibilidad (seed -> Kommo a futuro)
  services/kommoClient.js cliente Kommo (con modo mock)
  middleware/errorHandler.js
  data/units.seed.json   5 unidades de ejemplo
test/api.test.js
docs/                    roadmap Fase 2 y guia MVP UE5
```
