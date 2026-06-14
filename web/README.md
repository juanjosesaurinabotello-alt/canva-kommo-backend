# ATLANTICO · Experiencia interactiva (web / WebGL)

Prototipo **jugable** de la experiencia comercial de ATLANTICO Splash Park / Resort,
hecho con **Three.js**. Corre en cualquier navegador (laptop, tablet) sin GPU dedicada,
ideal para reuniones, ferias y showroom. Es la versión web/tiempo-real de la experiencia;
la versión **hiperrealista en Unreal Engine 5** se produce aparte (ver `../docs/`).

Comparte la lógica comercial con el backend de este repo: consume `GET /api/units`
(disponibilidad) y envía `POST /api/leads` (interesados), con **fallback offline** si no
hay backend.

## Funcionalidad

- 🚶 **Recorrido libre** en primera persona (WASD + mouse).
- 🚁 **Vista aérea** orbital del complejo.
- 🎬 **Recorrido guiado** para vendedores (paradas narradas: parque, resort, accesos, frontera).
- 🏠 **Hotspots de unidad** con color por disponibilidad (verde/amarillo/rojo).
- **Ficha comercial** con tipología, área, precio, forma de pago y estado.
- **Panel de unidades** con filtro por estado.
- **Captura de leads** ("Me interesa") → backend (o `localStorage` si offline).
- Menú: Recorrido libre · Vista aérea · Recorrido guiado · Unidades · Salir.

## Uso

```bash
npm install
npm run dev        # http://localhost:5173  (proxea /api -> localhost:3000)
```

Levantar también el backend (en la raíz del repo): `npm start`.

### Producción

```bash
npm run build      # genera dist/
npm run preview    # sirve dist/ localmente
```

Configurar el backend con la variable `VITE_API_BASE` al compilar, p. ej.:
```bash
VITE_API_BASE=https://api.atlantico.example npm run build
```
Si no se setea, en producción usa rutas relativas `/api/...` (mismo origen).

## Estructura

```
src/
  main.js              orquestacion (loop, eventos, modos)
  scene.js             mundo 3D (parque, resort, vegetacion, agua, luz dia)
  controls.js          camara primera persona + vista aerea
  hotspots.js          marcadores de unidad + raycast + color por estado
  tour.js              recorrido guiado (waypoints de camara)
  ui.js                ficha comercial, panel de unidades, form de lead
  api.js               fetch a /api/units y /api/leads (con fallback offline)
  units.fallback.js    datos offline (espejo del seed)
  style.css
index.html
```

> Nota: la geometría es **representativa** (volúmenes, no fotorrealismo). El objetivo es
> validar navegación, hotspots y flujo comercial. El fotorrealismo es trabajo del
> pipeline UE5 descrito en `../docs/`.
