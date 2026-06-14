# canva-kommo-backend

Backend **independiente** de **disponibilidad de unidades** y **captura de leads** para
la experiencia interactiva en Unreal Engine 5 del proyecto turistico-inmobiliario
"Atlántico" (frontera Brasil–Uruguay).

No depende de ningún CRM externo: la disponibilidad se sirve desde un dataset local y
los leads se persisten en el propio backend. La experiencia UE5 consume esta API.

> Documentación de la Fase 2 y del MVP UE5: ver `docs/`.

## Requisitos

- Node.js >= 20 (usa `fetch` nativo)

## Instalación

```bash
npm install
cp .env.example .env   # opcional
npm start              # o: npm run dev  (con --watch)
```

## API

### `GET /health`
Estado del servicio.
```json
{ "status": "ok" }
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
Crea y persiste un lead (botón "Me interesa" de la ficha). Requiere `name` y al menos
`email` o `phone`. `unitId` y `message` son opcionales (si va `unitId`, debe existir).
```json
// request
{ "name": "Juan Perez", "email": "juan@example.com", "phone": "+598 99 123 456",
  "unitId": "UNIT_101", "message": "Quiero info de financiacion" }
// response 201
{ "ok": true,
  "lead": { "id": "uuid", "name": "Juan Perez", "email": "juan@example.com",
            "phone": "+598 99 123 456", "unitId": "UNIT_101",
            "message": "Quiero info de financiacion", "createdAt": "2026-..." } }
```

### `GET /api/leads`
Lista de leads capturados (seguimiento comercial). Filtro opcional `?unitId=UNIT_101`.

## Fuentes de datos

- **Unidades:** `src/services/unitsStore.js` sirve `src/data/units.seed.json`.
  Es el único módulo a cambiar si en el futuro la disponibilidad viene de otra fuente;
  la API pública no cambia.
- **Leads:** `src/services/leadsStore.js` persiste en un archivo JSON
  (`src/data/leads.json` por defecto, configurable con `LEADS_FILE`). No se versiona.

## Despliegue en Vercel (frontend + API en un dominio)

El repo incluye dos formas de servir la misma API:

- **Servidor Express** (`src/`) para correr localmente con `npm start`.
- **Serverless functions** (`api/`) que Vercel despliega automáticamente, con la
  misma lógica (reusan `src/services/unitsStore.js` y `src/services/leadValidation.js`).

`vercel.json` compila el frontend de `web/` (estático) y Vercel sirve `api/*` como
funciones. Así un único deploy entrega la experiencia 3D **y** la API en vivo en el
mismo dominio (la web llama a `/api/...` relativo).

**Endpoints serverless:** `GET /api/health`, `GET /api/units`, `GET /api/units/:id`,
`POST /api/leads`, `GET /api/leads`.

**Persistencia de leads en serverless:**
- Si se configuran `KV_REST_API_URL` + `KV_REST_API_TOKEN` (Vercel KV / Upstash Redis),
  los leads se guardan ahí de forma durable.
- Si no, se usan `/tmp` (efímero, se pierde entre invocaciones). Para producción real,
  conectar Vercel KV en el dashboard del proyecto.

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
  routes/leads.js        POST /api/leads, GET /api/leads
  services/unitsStore.js fuente de disponibilidad (seed local)
  services/leadsStore.js persistencia de leads (archivo JSON)
  middleware/errorHandler.js
  data/units.seed.json   5 unidades de ejemplo
test/api.test.js
docs/                    roadmap Fase 2 y guia MVP UE5
```
