# MVP en Unreal Engine 5 — Guía paso a paso exacta
### Maqueta arquitectónica hiperrealista — sector representativo (proyecto "Atlántico")

> Objetivo: un ejecutable Windows navegable con 1 sector, recorrido primera persona,
> vista aérea, iluminación diurna realista, agua + vegetación básica, 5 hotspots,
> 1 ficha comercial y menú simple. Tiempo estimado: **3–4 semanas** (1–2 personas).

---

## Alcance del MVP (lo que SÍ y lo que NO)

**SÍ:** 1 sector, día (un solo preset de luz), agua + vegetación básica, 5 hotspots,
1 ficha de ejemplo (datos hardcode/DataTable), menú de 4 botones, build Windows.

**NO (queda para v1):** todo el predio, atardecer/noche, integración CRM en vivo,
recorrido guiado con Sequencer, VR, multilenguaje, optimización fina total.

---

## Herramientas y plugins

| Herramienta | Uso | Nota |
|---|---|---|
| **Unreal Engine 5.4+** | Motor | Instalar vía Epic Games Launcher |
| **Datasmith** | Importar la maqueta | Plugin (Quixel/Datasmith Importers) |
| **Quixel Bridge** | Materiales y vegetación (Megascans) | Integrado en UE5 |
| **Water plugin** | Agua del sector | Plugin nativo de UE5 |
| **Visual Studio 2022** | Compilar/empaquetar (Build Tools + "Game development with C++") | Requerido para packaging |
| Software origen | Exportar la maqueta a Datasmith/FBX | SketchUp Pro / Revit / 3ds Max / Blender |

**Plugins a habilitar** (`Edit > Plugins`, reiniciar): Datasmith Importers, Water,
(opcional) Sun Position Calculator.

---

## ORDEN DE TRABAJO (fases secuenciales)

### FASE 0 — Preparar datos (Día 1)
1. En el software origen: aislar **un sector representativo** (ej. acceso + amenity +
   1 edificio con unidades). Borrar geometría interna invisible, duplicados, líneas
   sueltas. Verificar **escala en metros** y **normales** correctas.
2. Nombrar objetos con prefijos: `SM_Edificio_`, `UNIT_101`…`UNIT_105`, `TERR_`, `VEG_`.
   Las 5 unidades que serán hotspots deben tener ID único claro.
3. Exportar a **Datasmith** (`.udatasmith`) o, si no se puede, FBX.
4. Preparar `units.csv` con 5 filas: `UnitID, Tipologia, AreaM2, Precio, Estado, FormaPago`.

---

### FASE 1 — Crear y configurar el proyecto (Día 1–2)
1. Epic Launcher → UE 5.4+ → **New Project** → categoría **Games** → plantilla
   **First Person** → Blueprint → calidad **Maximum** → **Raytracing/Starter Content off**.
   Nombre: `AtlanticoMVP`.
2. `Edit > Plugins`: habilitar **Datasmith Importers** y **Water**. Reiniciar.
3. `Edit > Project Settings`:
   - **Platforms > Windows > Default RHI = DirectX 12**.
   - **Engine > Rendering**: Dynamic Global Illumination = **Lumen**;
     Reflections = **Lumen**; Shadow Maps = **Virtual Shadow Maps**;
     Anti-Aliasing = **TSR**.
   - **Project > Maps & Modes**: dejar el GameMode de First Person por ahora.
4. Crear estructura de carpetas en Content Browser:
   ```
   /AtlanticoMVP /Maps /Meshes /Materials /Blueprints /UI /Data /Vegetation
   ```

---

### FASE 2 — Importar la maqueta (Día 2–3)
1. Content Browser → **Import** → seleccionar `.udatasmith` → opciones por defecto →
   colocar en `/Meshes`.
2. Arrastrar el actor Datasmith al nivel. **Validar escala**: soltar un personaje o
   un cubo de 1,8 m; el peatón debe verse a escala humana.
3. Activar **Nanite** en las mallas estáticas pesadas: seleccionarlas en el Content
   Browser → clic derecho → **Nanite > Enable**. (No en vidrio/agua/vegetación).
4. Revisar materiales importados; reasignar lo roto. Guardar.

---

### FASE 3 — Iluminación diurna realista (Día 3–4)
1. `Window > Env. Light Mixer` o agregar manualmente al nivel:
   - **Directional Light** (el sol) → marcar **Atmosphere Sun Light**.
   - **Sky Atmosphere**.
   - **SkyLight** → Mobility **Movable** (Lumen lo usa).
   - **Volumetric Clouds** (opcional, mejora el cielo).
   - **Exponential Height Fog** (sutil, da profundidad).
2. Orientar el sol a un ángulo de media tarde (sombras largas = más realista).
3. Agregar **Post Process Volume** → marcar **Infinite Extent (Unbound)**:
   - Exposure: **Metering Mode = Manual** (evita el “bombeo” de brillo al caminar).
   - Bloom moderado, leve vignette, color grading suave.
4. Verificar que Lumen ilumina interiores por rebote (GI).

---

### FASE 4 — Agua y vegetación básica (Día 4–6)
**Agua:**
1. `Window > Place Actors` → buscar **Water Body Lake** (o **Ocean** para costa) →
   arrastrar al nivel sobre la zona de agua/piscina.
2. Ajustar tamaño con los splines; ajustar altura del agua y material por defecto.

**Vegetación:**
1. Abrir **Quixel Bridge** (`Window > Quixel Bridge`), descargar 2–3 árboles/palmeras
   y 1 césped (Megascans, gratis con UE).
2. Modo **Foliage** (barra superior): crear Foliage Types con esas mallas y pintar
   césped/árboles en las áreas verdes. Mantener densidad baja (es MVP).

---

### FASE 5 — Navegación: primera persona + vista aérea (Día 6–8)
La plantilla First Person ya da el recorrido peatón. Falta la vista aérea y el cambio.

1. **Pawn dron:** crear `BP_DronePawn` (Blueprint de tipo *DefaultPawn* o *Pawn* con
   *FloatingPawnMovement* + *Camera*). Sin gravedad, movimiento libre WASD + mouse,
   velocidad alta. Limitar el rango al sector (clamp de posición).
2. **Conmutación de modo:** en el `BP_FirstPersonGameMode` o en un
   `BP_GameController`, lógica para `Possess` del pawn peatón o del dron según el botón
   del menú (Unidades/Vista aérea/Recorrido libre).
3. Probar: caminar, cambiar a dron, volar sobre el sector, volver.

---

### FASE 6 — Hotspots interactivos (5) (Día 8–11)
1. **DataTable de unidades:**
   - Crear un **Struct** `S_Unit` (`UnitID:Name`, `Tipologia:Text`, `AreaM2:Float`,
     `Precio:Text`, `Estado:Text`, `FormaPago:Text`, `Imagen:Texture2D`).
   - Content Browser → **Miscellaneous > Data Table** → basado en `S_Unit` →
     `DT_Units`. Importar `units.csv` o cargar 5 filas a mano.
2. **Blueprint `BP_Hotspot`** (Actor):
   - Componentes: `StaticMesh`/`Billboard` (ícono), **WidgetComponent** (ícono 3D
     flotante hacia cámara), `SphereCollision`.
   - Variable pública `UnitID` (Name) editable por instancia.
   - Highlight al hover (cambio de material / outline).
   - Evento **OnClicked** (o trace de interacción): buscar `UnitID` en `DT_Units` →
     abrir la ficha (Fase 7) con esos datos.
3. **Habilitar clics:** en el PlayerController, `Enable Click Events = true` y
   `Enable Mouse Over Events = true`; o usar **Line Trace by Channel** desde la cámara.
4. Colocar **5 instancias** de `BP_Hotspot` sobre las 5 unidades, asignando su `UnitID`.
5. Color por estado: 🟢 disponible / 🟡 reservada / 🔴 vendida (material del ícono).

---

### FASE 7 — Ficha comercial de ejemplo (Día 11–13)
1. Crear **Widget Blueprint** `WBP_UnitCard` (UMG):
   - Layout: imagen de la unidad, y campos de texto para Tipología, Área (m²), Precio,
     Estado, Forma de pago. Botón **"Me interesa"** y botón **Cerrar (X)**.
   - Función `SetUnitData(S_Unit)` que rellena los textos.
2. En `BP_Hotspot > OnClicked`: **Create Widget** `WBP_UnitCard` → `SetUnitData` con la
   fila del DataTable → **Add to Viewport** → `SetInputModeUIOnly` + cursor visible.
3. Botón Cerrar → **Remove from Parent** + volver a `SetInputModeGameOnly`.
4. (MVP) El botón "Me interesa" sólo muestra un mensaje "¡Gracias!" — la integración
   CRM real es de v1.

---

### FASE 8 — Menú simple (4 botones) (Día 13–15)
1. Crear `WBP_MainMenu` (UMG) con 4 botones:
   - **Recorrido libre** → posee `BP_FirstPersonCharacter`, cierra menú, input al juego.
   - **Vista aérea** → posee `BP_DronePawn`.
   - **Unidades** → modo dron + resalta/centra los 5 hotspots (o lista clickeable).
   - **Salir** → nodo **Quit Game**.
2. Mostrar el menú al iniciar (en `BeginPlay` del PlayerController o GameMode →
   Create Widget + Add to Viewport, input UI).
3. Botón/tecla (ej. **ESC** o **M**) para reabrir el menú durante el recorrido.

---

### FASE 9 — Optimización rápida y pruebas (Día 15–17)
1. Consola en PIE: `stat unit`, `stat FPS`, `stat GPU` → apuntar a **≥60 FPS @1080p**.
2. Si baja: reducir densidad de foliage, bajar resolución de sombras, revisar mallas
   sin Nanite, simplificar colisiones.
3. Recorrer todo el sector buscando: agujeros de colisión, caídas al vacío, materiales
   rotos, hotspots inaccesibles. Corregir.

---

### FASE 10 — Empaquetar como ejecutable Windows (Día 17–18)
1. Confirmar **Visual Studio 2022** instalado con *Game development with C++*.
2. `Edit > Project Settings > Packaging`:
   - **Build Configuration = Shipping** (o Development para depurar).
   - **Full Rebuild** primera vez.
   - Verificar **Maps to include**: el nivel del MVP como **Game Default Map** y como
     mapa de inicio (`Project Settings > Maps & Modes`).
3. `Platforms > Windows > Package Project`:
   - `Platforms (ventana superior) > Windows > Package Project` → elegir carpeta destino.
4. Esperar la compilación de shaders + build. Resultado: carpeta `Windows/` con el
   `AtlanticoMVP.exe` + datos.
5. **Probar el .exe en el equipo de presentación real** (no sólo en la workstation).
   Medir FPS y tiempo de carga.
6. (Opcional) Crear instalador con Inno Setup, o comprimir la carpeta como portable.

---

## ENTREGABLES DEL MVP

1. **`AtlanticoMVP.exe`** + carpeta de build Windows funcionando (portable o instalador).
2. Proyecto UE5 fuente versionado (sin binarios pesados; usar `.gitignore` de UE).
3. `DT_Units` + `units.csv` con las 5 unidades de ejemplo.
4. Documento corto de operación: cómo abrir, controles (WASD/mouse, ESC menú), botones.
5. Reporte de rendimiento: FPS y tiempo de carga en el hardware de demo.
6. Lista de issues/limitaciones conocidas y qué pasa a v1.

---

## Checklist de aceptación (Definition of Done)

- [ ] El sector se recorre a pie en primera persona, sin caer al vacío.
- [ ] Se puede pasar a vista aérea (dron) y volver.
- [ ] Iluminación diurna realista (Lumen + Sky Atmosphere), sin parpadeos de exposición.
- [ ] Hay agua visible y vegetación básica.
- [ ] Los 5 hotspots son clickeables y abren su ficha con datos correctos.
- [ ] La ficha comercial muestra tipología, área, precio, estado y forma de pago.
- [ ] El menú con 4 botones funciona (incluido Salir = cierra la app).
- [ ] El `.exe` corre a ≥60 FPS @1080p en el equipo de presentación.

---

## Cronograma resumido (18 días hábiles ≈ 3–4 semanas)

| Días | Fase |
|---|---|
| 1 | Preparar datos |
| 1–2 | Crear/configurar proyecto |
| 2–3 | Importar maqueta |
| 3–4 | Iluminación diurna |
| 4–6 | Agua + vegetación |
| 6–8 | Navegación (FPS + dron) |
| 8–11 | 5 hotspots |
| 11–13 | Ficha comercial |
| 13–15 | Menú 4 botones |
| 15–17 | Optimización + pruebas |
| 17–18 | Empaquetado Windows + test en hardware de demo |
