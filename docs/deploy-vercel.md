# Publicar la experiencia ATLANTICO en Vercel (paso a paso)

Resultado: una URL pública `https://….vercel.app` con la experiencia 3D **y** la API
en vivo (unidades + leads) en el mismo dominio. Cada push redepliega solo.

> Todo el código y la configuración (`vercel.json`, functions en `api/`) ya están en el
> repo. Estos pasos son de cuenta/clics; no hay que tocar código.

---

## 1. Crear el proyecto en Vercel

1. Entrá a **https://vercel.com** e iniciá sesión (recomendado: **Continue with GitHub**).
2. **Add New… → Project**.
3. **Import Git Repository** → buscá y elegí `juanjosesaurinabotello-alt/canva-kommo-backend`.
   - Si no aparece: **Adjust GitHub App Permissions** → dale acceso a ese repositorio.

## 2. Configuración (no tocar nada)

- Framework Preset: **Other** (lo define `vercel.json`).
- Build & Output: ya viene de `vercel.json` (build de `web/`, output `web/dist`).
- **Deploy**.

## 3. ⚠️ Apuntar a la branch correcta

Todo el trabajo está en la branch **`claude/ue5-resort-interactive-lezplp`** (no en `main`).
Vercel por defecto despliega `main`, así que:

- **Settings → Git → Production Branch** → escribir `claude/ue5-resort-interactive-lezplp`.
- Volver a **Deployments → Redeploy** (o hacer un push a esa branch).

> Alternativa más limpia: fusionar la branch a `main` (pedímelo y abro el PR). Entonces
> no hace falta tocar la Production Branch.

## 4. (Opcional) Leads durables con Vercel KV

Sin esto, los leads se guardan en `/tmp` (se pierden). Para guardarlos de verdad:

1. En el proyecto → pestaña **Storage → Create Database → KV** (Upstash Redis).
2. **Connect** al proyecto. Vercel inyecta solo `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
3. **Redeploy**. A partir de ahí, `POST /api/leads` guarda en KV y `GET /api/leads` los lista.

## 5. Verificar que quedó OK

Abrí en el navegador (reemplazá por tu dominio):

- `https://TU-APP.vercel.app/` → la experiencia 3D.
- `https://TU-APP.vercel.app/api/health` → `{"status":"ok","runtime":"serverless"}`.
- `https://TU-APP.vercel.app/api/units` → las 5 unidades.

Si `/api/health` responde, la API en vivo funciona y la web NO está en modo offline.

---

## Notas

- **Dominio propio:** Settings → Domains → agregar `experiencia.atlantico.com` (o el que sea).
- **Acceso privado para ventas:** Settings → Deployment Protection → Vercel Authentication
  (solo gente con acceso). Útil mientras no sea público.
- **Actualizar contenido:** cualquier push a la branch de producción redepliega solo.
- **Datos reales de unidades:** editar `src/data/units.seed.json` (mismo `unitId` que la
  maqueta) y el seed offline del front `web/src/units.fallback.js`.
