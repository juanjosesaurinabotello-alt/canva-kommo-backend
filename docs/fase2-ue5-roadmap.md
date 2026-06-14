# Fase 2 — Experiencia Interactiva Hiperrealista en Unreal Engine 5
### Resort / Parque turístico frontera Brasil–Uruguay (proyecto "Atlántico")

> Hoja de ruta técnica, ejecutiva y accionable para convertir la maqueta 3D existente
> en un recorrido interactivo tipo videojuego, con fines de venta inmobiliaria.

---

## 0. Contexto y nota sobre integración CRM

Este repositorio (`canva-kommo-backend`) ya es el backend que conecta con **Kommo CRM**.
Eso resuelve directamente el **punto 10** (conexión con CRM / base de disponibilidad):
la experiencia UE5 **no** debe hablar con Kommo directamente, sino contra una API
intermedia (este backend), que expone disponibilidad, precios y estados de unidad, y
que recibe leads generados desde la experiencia. Esto desacopla el motor 3D del CRM y
permite cambiar de CRM sin tocar el cliente Unreal. Ver sección 8 y 9.

---

## 1. Objetivo de la Fase 2

Entregar una **aplicación interactiva ejecutable (Windows .exe)** que permita a un
vendedor o a un cliente final recorrer el complejo en tiempo real con calidad
hiperrealista, consultar unidades disponibles con su ficha comercial (tipología, área,
precio, estado, forma de pago) y generar interés/lead, con base técnica preparada para
escalar a **VR** y **Pixel Streaming (web/showroom)** sin rehacer el proyecto.

**Entregables concretos de la fase:**
- Build Windows 64-bit empaquetado (instalador o carpeta portable).
- Recorrido primera persona + modo dron/aéreo.
- 3 condiciones lumínicas: día, atardecer, noche.
- Sistema de hotspots clickeables con fichas comerciales.
- Modo "recorrido guiado" para vendedores.
- Disponibilidad alimentada por API (estática en MVP, dinámica vía backend en v1).
- Documentación de operación + requisitos de hardware de presentación.

**Criterio de éxito (definición de "terminado"):**
- Corre estable a **≥ 60 FPS en 1080p** en el equipo de presentación definido.
- Carga inicial **< 30 s**.
- Un vendedor sin conocimientos técnicos puede dar una demo completa sin asistencia.

---

## 2. Requisitos mínimos de entrada (archivos 3D necesarios)

Antes de tocar Unreal, hay que tener consolidado:

| Elemento | Qué se necesita | Por qué |
|---|---|---|
| **Modelo maestro** | Maqueta del proyecto completo en su software origen (SketchUp / Revit / 3ds Max / Blender) | Fuente de verdad geométrica |
| **Escala real** | Modelo en **metros**, escala 1:1, con origen (0,0,0) coherente | Evita re-escalados y errores de colisión/cámara |
| **Organización por capas** | Geometría separada por capas/grupos: terreno, edificios, unidades vendibles, vegetación, agua, mobiliario, viales | Permite optimizar e interactuar por elemento |
| **Unidades identificadas** | Cada unidad vendible como objeto/grupo nombrado (ej. `UNIDAD_A_101`) | Base para los hotspots y el match con la disponibilidad del CRM |
| **Materiales base** | Asignación de materiales por superficie (aunque sea básica) | Acelera el re-materializado PBR en UE5 |
| **Topografía / terreno** | Curvas de nivel o malla de terreno real del predio | Realismo del emplazamiento y drenaje visual |
| **Plano maestro 2D** | Masterplan/planimetría con nomenclatura de unidades | Mapa de navegación y minimapa |
| **Datos comerciales** | Planilla (Excel/CSV) con: ID unidad, tipología, m², precio, estado, forma de pago | Alimenta fichas; debe usar el **mismo ID** que la geometría |
| **Referencias reales** | Fotos del sitio, paleta de materiales reales, render objetivo aprobado | Dirección de arte / "look target" |

> **Regla de oro:** el ID de cada unidad debe ser idéntico en (a) la geometría 3D,
> (b) la planilla comercial y (c) el CRM/backend. Esa clave única es lo que une todo.

---

## 3. Flujo de trabajo: del software origen a UE5

Pipeline recomendado según origen del modelo:

```
Revit / 3ds Max  ──► Datasmith ──► UE5      (mejor caso: conserva jerarquía y metadatos)
SketchUp         ──► Datasmith (plugin) ──► UE5   (bueno, requiere limpieza)
Blender          ──► FBX / glTF / Datasmith ──► UE5
3ds Max          ──► Datasmith (Direct Link en vivo) ──► UE5
```

**Recomendación fuerte:** usar **Datasmith** siempre que el software lo permita
(Revit, 3ds Max, SketchUp Pro). Conserva jerarquía, nombres de objetos, capas,
metadatos y pivotes — esencial para vincular unidades a hotspots. FBX es el plan B
y obliga a renombrar/reagrupar a mano.

**Pasos del traslado:**
1. **Limpieza en origen:** borrar geometría interna invisible, duplicados, líneas
   sueltas, bloques rotos. Purgar materiales no usados.
2. **Triangulación/normales:** corregir normales invertidas (causan agujeros y
   sombras erróneas en UE5).
3. **Nombrado consistente:** prefijos por categoría (`SM_Edificio_`, `UNIT_`, `VEG_`,
   `WATER_`, `TERR_`).
4. **Export Datasmith / FBX** por **lotes lógicos** (terreno, edificios, unidades,
   props), no todo en un solo archivo gigante.
5. **Import en UE5** con Datasmith → revisar jerarquía → reasignar materiales.
6. **Validación de escala** con un personaje de referencia (1,80 m) dentro del nivel.

---

## 4. Optimización de la maqueta para tiempo real

Una maqueta de render NO está lista para tiempo real. Plan de optimización:

- **Nanite** para geometría estática pesada (edificios, terreno, mobiliario fijo,
  rocas): permite alta densidad de polígonos sin LODs manuales. Activar por malla.
- **Excepciones Nanite:** materiales translúcidos (vidrio, agua), vegetación con
  WPO/viento, y mallas con máscaras de opacidad → usar mallas tradicionales + LODs.
- **Instancing** (HISM) para elementos repetidos: árboles, luminarias, reposeras,
  barandas, sombrillas. Reduce drásticamente draw calls.
- **Limpieza de geometría oculta:** eliminar caras internas, interiores no visitables,
  back-faces innecesarias.
- **Atlasing de texturas / fusión de materiales** donde haya cientos de materiales
  triviales.
- **World Partition** para el predio grande: streaming por celdas, sólo carga lo
  cercano. Imprescindible en un complejo extenso.
- **Hierarchical LOD / HLODs** para siluetas lejanas (skyline del resort visto desde
  el agua o desde el dron).
- **Presupuesto de polígonos por zona** y control con `stat unit` / `stat GPU`.
- **Colisiones simplificadas:** colisión "caminable" liviana, no usar la malla
  Nanite completa como collider.

---

## 5. Configuración recomendada de Unreal Engine 5

- **Versión:** UE 5.4 LTS o superior estable (no usar versiones preview en producción).
- **Renderer:** Deferred + **Lumen** (GI y reflejos) + **Nanite** activos.
- **Iluminación:** Lumen dinámico (permite cambiar día/atardecer/noche en runtime).
  Lightmaps horneados sólo si el equipo de presentación es débil (ver sección 11).
- **Anti-aliasing:** TSR (Temporal Super Resolution) para nitidez con buen rendimiento.
- **Color:** ACES / tonemapping cinematográfico, exposición manual controlada por
  Post Process Volumes (evita "bombeo" de exposición en el recorrido).
- **Project Settings clave:**
  - Default RHI: **DirectX 12** (requisito de Lumen/Nanite).
  - Virtual Shadow Maps activado.
  - Ray Tracing: opcional (Lumen Hardware) si la GPU de presentación es RTX alta.
  - Allow Static Lighting: según estrategia (off si todo es Lumen dinámico).
- **Estructura de carpetas** (Content):
  ```
  /Atlantico
    /Maps            (Persistent + sublevels por zona)
    /Meshes          (/Buildings /Units /Terrain /Props /Vegetation)
    /Materials       (/Master /Instances)
    /Blueprints      (/Player /Hotspots /UI /GameMode /Tour)
    /UI              (/Widgets /Textures /Fonts)
    /Data            (DataTables de unidades)
    /Audio
    /FX
  ```

---

## 6. Estructura de niveles

- **Persistent Level** liviano: sólo lógica global, GameMode, iluminación maestra,
  carga de sublevels.
- **World Partition** para el terreno/predio (streaming automático por distancia).
- **Sublevels lógicos:** Resort, Parque acuático, Áreas comerciales, Estacionamientos,
  Accesos, Amenities, Unidades. Permite trabajo paralelo del equipo y carga selectiva.
- **Data Layers** para alternar variantes: "día / atardecer / noche", "fase construida /
  fase futura", "amueblado / vacío".
- **Sublevel de UI/HUD** persistente.

---

## 7. Sistema de navegación del usuario

Tres modos, conmutables desde menú in-game (tecla o botón UI):

1. **Primera persona (peatón):**
   - `Character` con cápsula de colisión, gravedad, velocidad de caminar/correr.
   - Altura de cámara ~1,70 m, head-bob sutil opcional.
   - Colisión contra suelo y edificios; teleport/“snap a piso” para evitar caídas.
   - Controles: WASD + mouse (PC), o gamepad.

2. **Modo dron / aéreo libre (spectator/fly):**
   - `Pawn` volador sin gravedad, 6 grados de libertad, velocidad ajustable.
   - Límites de bounding box del predio (no salirse del mundo).
   - Transición suave (lerp de cámara) al pasar de peatón a dron.

3. **Puntos de teletransporte / vistas favoritas:**
   - Menú con miniaturas: "Acceso principal", "Parque acuático", "Playa", "Unidad
     modelo", etc. Cámara viaja con interpolación cinematográfica (no corte seco).

**Extras de navegación:**
- **Minimapa / masterplan** clickeable (clic en zona → teletransporte).
- Selector día/atardecer/noche siempre accesible.
- Botón "reset / volver al inicio".

---

## 8. Sistema de hotspots interactivos

Arquitectura basada en un **Blueprint reusable `BP_Hotspot`** + DataTable:

- **`BP_Hotspot`** colocado sobre cada unidad/punto de interés. Contiene:
  - Un `WidgetComponent` (ícono flotante 3D, billboard hacia cámara).
  - Un identificador `UnitID` (clave única, = ID geometría/CRM).
  - Resaltado al pasar el cursor (outline / cambio de material).
  - Evento `OnClicked` → abre ficha comercial poblada desde datos.
- **Interacción:**
  - PC: raycast desde cámara/cursor (line trace por canal "Interactable").
  - Estado visual por disponibilidad: **verde = disponible, amarillo = reservada,
    rojo = vendida** (color del ícono y del realce del volumen de la unidad).
- **Fuente de datos:** `DataTable` (`DT_Units`) con filas por `UnitID`. En MVP es
  estática (importada del Excel/CSV). En v1 se actualiza al inicio desde la API del
  backend (ver sección 9).
- **Tipos de hotspot:** Unidad vendible, Amenity (info descriptiva), Punto de vista
  (teletransporte), Media (galería/video).

---

## 9. Sistema de presentación comercial

### 9.1 Fichas de unidad (UI)
Widget `WBP_UnitCard` que muestra:
- Tipología (ej. "2 dormitorios + balcón"), área (m²), precio, estado, forma de pago.
- Render/foto de la unidad, plano de planta, galería.
- Botón **"Me interesa / Agendar"** → captura datos del lead.

Construir con **UMG** (HUD 2D) para legibilidad y rendimiento. Datos vía
`DT_Units` / API.

### 9.2 Modo recorrido guiado para vendedores
- **Secuencia de cámaras** (Level Sequencer / Sequencer) con paradas predefinidas:
  acceso → amenities → parque acuático → unidad modelo → cierre.
- Controles **play / pausa / siguiente / anterior**; el vendedor puede salir del guion
  en cualquier momento a modo libre y retomar.
- Texto/locución opcional por parada (notas de venta).
- Variante "tour automático" en loop para pantalla en stand/feria (modo atract).

### 9.3 Conexión con CRM (este backend) — punto 10
- La experiencia UE5 consume una **API REST del backend** (`canva-kommo-backend`),
  no Kommo directo:
  - `GET /units` → lista de unidades con estado/precio/disponibilidad (alimenta los
    colores de hotspots y las fichas).
  - `POST /leads` → envía el lead capturado ("Me interesa") con `UnitID`, datos de
    contacto y contexto, y el backend lo crea en Kommo.
- **Estrategia por etapas:**
  - **MVP:** datos embebidos (DataTable). Sin red. Demo 100% offline.
  - **v1:** al iniciar, descarga `GET /units` y cachea; lead vía `POST /leads`.
  - **v2:** refresco periódico / websocket para disponibilidad en vivo en showroom.
- Plugin HTTP de UE5 (`HttpModule`) + parser JSON. Manejar modo offline con caché
  (la demo nunca debe romperse por falta de internet en una feria).

---

## 10. Iluminación, materiales, vegetación, agua y postproducción

**Iluminación (hiperrealista, 3 momentos):**
- Lumen (GI + reflejos) con **Directional Light + Sky Atmosphere + Volumetric Clouds**.
- Día/atardecer/noche como **presets** (rotación/intensidad/color de sol + skybox +
  post process). Conmutables en runtime vía Blueprint/Data Layers.
- Noche: iluminación artificial (luminarias, fachadas, piscina iluminada, carteles),
  con luces instanciadas y control de costo (sombras selectivas).
- Exponential Height Fog + niebla volumétrica para profundidad y atardeceres.

**Materiales PBR:**
- **Master materials** parametrizados + **Material Instances** (no materiales únicos).
- Megascans/Quixel Bridge (gratis con UE) para concreto, madera, piedra, asfalto,
  arena, césped, agua de fondo.
- Vidrio realista (reflejos Lumen), metales con rugosidad correcta, telas para amenities.

**Vegetación:**
- **Foliage tool** + instancing para palmeras, césped, arbustos, árboles regionales.
- Megascans Trees / library de coníferas-palmeras según clima costero.
- **Wind / WPO** sutil. Cuidar el costo: usar imposters/billboards a distancia.

**Agua (parque acuático, piscinas, costa):**
- **Water System** de UE5 (Water plugin) para superficies grandes / costa.
- Materiales de agua custom para piscinas (refracción, caustics, espuma, profundidad).
- Reflejos vía Lumen / Screen Space; planar reflections sólo si se necesita y la GPU
  aguanta.

**Postproducción:**
- Post Process Volume global: tonemapping ACES, bloom moderado, vignette sutil,
  color grading (LUT por momento del día), chromatic aberration leve, motion blur off
  o muy bajo (mejor para navegación), DOF cinematográfico sólo en recorrido guiado.
- TSR para nitidez. Evitar sobre-saturación; buscar fotorrealismo, no “videojuego”.

---

## 11. Hardware recomendado

**Para DESARROLLO (workstation):**
- GPU: **NVIDIA RTX 4080 / 4090** (o 3090) — Lumen + Nanite son hambrientos.
- CPU: Ryzen 9 / Intel i9 (muchos núcleos para compilar shaders y light/HLOD builds).
- RAM: **64 GB** (mínimo 32 GB).
- Almacenamiento: **SSD NVMe 2 TB+** (los proyectos arquitectónicos pesan mucho).
- Monitor: 27"+ calibrado, idealmente 1440p/4K.

**Para PRESENTACIÓN COMERCIAL (stand / oficina de ventas):**
- Opción A (premium local): PC con **RTX 4070/4080**, 32 GB RAM, salida a TV 4K /
  proyector. Build empaquetado a 1080p/1440p @60 FPS.
- Opción B (notebook gamer RTX 4070/4080) para movilidad del vendedor.
- Opción C (sin GPU local): **Pixel Streaming** desde servidor cloud con GPU → corre
  en cualquier laptop/tablet vía navegador (ver Fase futura).
- Periféricos: gamepad para navegación cómoda en demo; touch screen si es kiosko.

**Para VR (fase futura):** Meta Quest 3 (standalone/Link) o PCVR con RTX alta.

---

## 12. Equipo humano necesario

| Rol | Responsabilidad | Dedicación |
|---|---|---|
| **Líder técnico UE5 / Tech Artist** | Arquitectura, pipeline, optimización, rendimiento | Full, toda la fase |
| **Artista 3D / Environment** | Limpieza de modelo, materiales PBR, vegetación, ambientación | Full, grueso del medio |
| **Especialista en iluminación / lookdev** | Día/atardecer/noche, postproducción, "look target" | Parcial, picos |
| **Programador Blueprints / Gameplay** | Navegación, hotspots, UI, recorrido guiado, integración API | Full |
| **Desarrollador backend (CRM/API)** | Endpoints `/units` y `/leads` en este repo, mapeo a Kommo | Parcial |
| **Diseñador UI/UX** | Fichas, menús, masterplan, identidad visual | Parcial |
| **PM / coordinador comercial** | Datos de unidades, validación de fichas, prioridades | Parcial |

> Equipo mínimo viable: **1 generalista UE5 senior** (técnico + arte) **+ 1 Blueprints/UI**
> + apoyo backend a tiempo parcial. Equipo ideal: 4–5 personas.

---

## 13. Cronograma estimado por etapas

> Estimación para equipo de 3–4 personas. Ajustar según tamaño real del predio.

| Etapa | Duración | Hito |
|---|---|---|
| **0. Preparación de datos** | 1 semana | Modelo limpio, escala y nombrado OK, planilla comercial |
| **1. Prototipo gris (greybox)** | 1–2 semanas | Recorrido peatón + dron en geometría sin materiales, FPS OK |
| **2. Optimización + Nanite/WorldPartition** | 2 semanas | Predio completo navegable estable a 60 FPS |
| **3. Materiales PBR + ambientación** | 3–4 semanas | Look hiperrealista de día |
| **4. Iluminación día/atardecer/noche** | 1–2 semanas | 3 presets conmutables |
| **5. Vegetación + agua** | 2 semanas | Parque acuático, costa, áreas verdes |
| **6. Hotspots + fichas + UI** | 2–3 semanas | Unidades clickeables, fichas comerciales |
| **7. Recorrido guiado + menús** | 1–2 semanas | Modo vendedor + navegación pulida |
| **8. Integración API/CRM** | 1–2 semanas | Disponibilidad y leads vía backend |
| **9. Optimización final + empaquetado** | 1–2 semanas | Build Windows estable, testing en hardware de demo |
| **TOTAL** | **~3,5 a 5 meses** | Versión comercial v1 |

Un **prototipo demostrable** (greybox navegable + 1 zona ambientada + 1 ficha) sale en
**3–4 semanas**.

---

## 14. Riesgos técnicos

- **Modelo de origen "sucio":** geometría de render no optimizada → el mayor consumo de
  tiempo. *Mitigación:* exigir entrega limpia y nombrada (sección 2).
- **Rendimiento en GPU de presentación:** Lumen+Nanite exigen RTX; si el equipo de demo
  es débil, baja FPS. *Mitigación:* definir hardware de demo ANTES de empezar; tener
  perfil "calidad media" / lightmaps horneados de respaldo.
- **Escala del predio enorme:** sin World Partition/HLOD se cae el frame. *Mitigación:*
  streaming desde el día 1.
- **Inconsistencia de IDs** entre geometría, planilla y CRM → fichas erróneas.
  *Mitigación:* clave única validada en etapa 0.
- **Agua y vegetación costosas** en GPU. *Mitigación:* presupuesto de costo, LODs,
  imposters.
- **Dependencia de internet en feria** para datos en vivo. *Mitigación:* caché offline,
  MVP con datos embebidos.
- **Scope creep comercial** (cada vez más unidades/zonas/efectos). *Mitigación:* fijar
  alcance de v1 por escrito; lo demás a backlog.
- **Tiempos de compilación de shaders / builds** largos. *Mitigación:* DDC compartida,
  hardware de desarrollo potente.

---

## 15. Cómo hacer un primer prototipo rápido (1–2 semanas)

Objetivo: algo navegable y "vendible" para mostrar a decisión, sin pulir.

1. Importar SÓLO una zona representativa (ej. acceso + parque acuático) vía Datasmith.
2. Activar Nanite en lo estático; sin optimización fina todavía.
3. Plantilla **First Person** de UE5 + un **Pawn volador** para modo dron.
4. Iluminación con Lumen + Sky Atmosphere; un solo preset (día) con buen cielo.
5. Materiales rápidos con Megascans en las superficies principales.
6. **1 hotspot** sobre una unidad modelo + **1 ficha** `WBP_UnitCard` con datos hardcode.
7. Empaquetar build Windows y probarlo en el equipo de presentación real.

Con eso validás look, rendimiento y la mecánica comercial antes de invertir en todo el
predio.

---

## 16. Decisiones a tomar ANTES de empezar

1. **Hardware de presentación definitivo** (esto condiciona TODO el presupuesto de
   rendimiento): ¿PC local potente, notebook, kiosko, o Pixel Streaming en cloud?
2. **Alcance de v1:** ¿todo el complejo o fases? ¿qué zonas son obligatorias para vender?
3. **Plataforma objetivo prioritaria:** Windows .exe (sí seguro) — ¿y además VR o web
   desde el inicio, o como fase 3?
4. **Origen del modelo y estado de limpieza:** ¿en qué software está y quién lo deja
   listo (interno o proveedor)?
5. **Fuente de datos comerciales:** ¿estática (Excel) en v1 o ya conectada a Kommo vía
   este backend? Definir endpoints y propietario del dato.
6. **Identidad visual / branding** de la UI (logo, colores, tipografías, idioma:
   español + portugués por el público brasileño).
7. **Nivel de fidelidad objetivo:** "render-quality" total vs. equilibrio
   realismo/rendimiento (impacta plazos y costo).
8. **Equipo:** interno, proveedor externo, o mixto. Quién es el dueño técnico.
9. **Presupuesto y plazo comprometido** con comercial (feria/lanzamiento con fecha).
10. **Idiomas de la experiencia:** español/portugués/inglés y localización de fichas.

---

## Apéndice A — Versiones futuras (post v1)

- **VR / Showroom inmersivo:** mismo proyecto, plugin OpenXR; revisar locomoción
  (teleport) y rendimiento (VR exige doble render → bajar costo Lumen).
- **Pixel Streaming:** servir la experiencia desde GPU cloud → acceso por navegador en
  cualquier dispositivo; ideal para web comercial y vendedores remotos.
- **Disponibilidad en vivo:** websocket/refresco desde el backend Kommo para reflejar
  ventas en tiempo real durante un evento.
- **Configurador:** elegir terminaciones/amueblado de la unidad modelo en vivo.

---

## Apéndice B — Lista de tareas para arrancar el prototipo (checklist)

- [ ] Recibir modelo 3D limpio, en metros, con capas y unidades nombradas.
- [ ] Consolidar planilla comercial (CSV) con IDs = IDs de geometría.
- [ ] Definir y conseguir el hardware de presentación.
- [ ] Instalar UE 5.4+ y Quixel Bridge; crear proyecto con la estructura de carpetas.
- [ ] Importar zona piloto vía Datasmith; validar escala con personaje 1,80 m.
- [ ] Activar Nanite/Lumen; primer preset de día con Sky Atmosphere.
- [ ] Implementar First Person + Pawn dron + conmutador de modo.
- [ ] Crear `BP_Hotspot` + `DT_Units` + `WBP_UnitCard` (datos hardcode).
- [ ] Materializar superficies principales con Megascans.
- [ ] Empaquetar build Windows y testear en equipo de demo (medir FPS y carga).
- [ ] Definir contrato de API con el backend (`/units`, `/leads`) para v1.
