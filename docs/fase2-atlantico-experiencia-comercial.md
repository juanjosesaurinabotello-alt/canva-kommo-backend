# ATLANTICO Splash Park / Resort — Fase 2
## Experiencia interactiva hiperrealista en Unreal Engine 5 — Dossier de venta

> Documento de dirección creativa y técnica para presentar al equipo de desarrollo /
> estudio 3D. Objetivo: convertir la maqueta 3D en una herramienta de venta inmobiliaria
> y turística premium para comercializar unidades hoteleras / fracciones del **Resort 1**
> dentro del complejo **ATLANTICO Splash Park** (frontera Brasil–Uruguay, zona Chuy/Chuí).

---

## 1. Objetivos comerciales

La experiencia es una **herramienta de cierre de ventas**, no un demo arquitectónico.
Cada decisión técnica se subordina a estos objetivos:

1. **Vender unidades del Resort 1 hoy**, antes y durante la construcción: que el cliente
   "viva" el producto terminado y proyecte su inversión.
2. **Transmitir el valor del entorno**: el parque acuático y los amenities son el
   diferencial que revaloriza la unidad → mostrarlos en su mejor versión.
3. **Comunicar ubicación estratégica**: cercanía a Chuy/Chuí y a la frontera
   Brasil–Uruguay (free shops, doble mercado UY+BR, flujo turístico).
4. **Acortar el ciclo de venta**: que el vendedor responda "¿cómo es?", "¿dónde está?",
   "¿qué disponible hay?" y "¿cuánto cuesta?" en una sola sesión inmersiva.
5. **Capturar leads calificados** en feria/showroom (interés por unidad concreta).
6. **Posicionar la marca ATLANTICO como premium** frente a la competencia regional.

**KPIs sugeridos:** nº de sesiones en feria, leads capturados por unidad, tiempo medio
de demo, tasa de avance a reserva tras usar la experiencia.

---

## 2. Experiencia del usuario (UX)

Dos perfiles, un mismo producto:

- **Cliente final / inversor:** quiere emocionarse y entender qué compra y dónde. Busca
  belleza, ubicación, amenities, "cómo se vive ahí".
- **Vendedor:** quiere una herramienta confiable, guiada, que nunca falle en vivo y que
  lleve la conversación hacia la unidad y el cierre.

**Principios UX:**
- **Arranque "wow" en < 10 s**: vista aérea cinematográfica del complejo al abrir.
- **Cero fricción**: controles simples (clic/gamepad), nada de menús técnicos.
- **Siempre orientado**: minimapa/masterplan y "dónde estoy" permanentes.
- **Camino claro al producto**: todo recorrido desemboca en una unidad y su ficha.
- **A prueba de feria**: funciona offline, no se traba, se reinicia en 1 clic.
- **Modo atract**: en stand sin operador, loop cinematográfico automático que atrae.
- **Bilingüe** español/portugués (público UY + BR).

---

## 3. Escenas principales

| # | Escena | Rol comercial | Notas de producción |
|---|---|---|---|
| **S1** | **Llegada aérea / Masterplan** | Impacto inicial + ubicación general | Vuelo dron sobre el complejo, overlay de zonas y accesos |
| **S2** | **Parque acuático (Splash Park)** | El gran diferencial / estilo de vida | Toboganes, piscinas, río lento, solárium; agua hiperrealista, gente (crowd) opcional |
| **S3** | **Resort 1 (exterior)** | El producto que se vende | Fachada, lobby, circulaciones, amenities del resort |
| **S4** | **Unidad modelo (interior)** | Cierre emocional | Interiorismo full, luz cálida, terraza con vista |
| **S5** | **Amenities** | Valor agregado | Restó, spa, gym, áreas verdes, kids club |
| **S6** | **Accesos y contexto regional** | Ubicación / frontera | Ruta de acceso, estacionamientos, mapa conceptual Chuy/Chuí + frontera BR-UY |

> El **mapa conceptual de ubicación** (S6) no necesita modelar la ciudad: basta un panel
> 3D/2D estilizado mostrando ATLANTICO, Chuy/Chuí, la frontera, free shops y distancias
> ("X min a la playa", "frontera a X km"). Es un argumento de venta, no un GIS.

---

## 4. Recorridos recomendados

Tres modos conmutables, todos terminando en "ver una unidad":

1. **Recorrido guiado de venta (estrella):** secuencia cinematográfica con paradas
   S1→S2→S3→S5→S6→S4, narrada, con play/pausa/siguiente. El vendedor la conduce y puede
   desviarse a modo libre en cualquier momento. Duración objetivo: **3–5 min**.
2. **Recorrido libre primera persona:** el cliente camina el parque, el resort y entra a
   la unidad modelo a su ritmo. Para el "déjame ver yo".
3. **Vista aérea / dron:** sobrevuelo libre para entender escala, ubicación y masterplan;
   clic en una zona → teletransporte.

**Atract mode (feria sin operador):** loop automático de S1→S2→S4 con música, hasta que
alguien toca la pantalla y entra en modo libre.

---

## 5. Interacciones

- **Hotspots de unidad** sobre el Resort 1: ícono flotante con color por disponibilidad
  (🟢 disponible / 🟡 reservada / 🔴 vendida). Clic → ficha comercial.
- **Hotspots de amenity/info:** clic en parque, spa, restó → tarjeta descriptiva +
  galería/foto/video.
- **Puntos de vista (teletransporte):** "Ir al parque", "Entrar a la unidad", "Vista
  desde la terraza".
- **Selector de momento del día** (si se incluye atardecer/noche): cambia ambiente.
- **Botón "Me interesa / Agendar"** en la ficha: captura el lead (nombre + contacto +
  unidad) → se guarda en el backend del proyecto para seguimiento comercial.
- **Comparador de tipologías** (opcional premium): ver 2 tipologías lado a lado.
- **Toggle de fase** (opcional): "hoy / proyecto terminado".

---

## 6. Sistema de unidades

El corazón comercial. Cada unidad vendible del Resort 1 es un objeto con identidad:

- **Clave única `UnitID`** compartida entre la geometría 3D, la planilla comercial y el
  backend de disponibilidad. Es lo que conecta el clic con el dato.
- **Ficha comercial (`WBP_UnitCard`)** muestra:
  - Tipología (ej. "Suite 1 amb / 2 amb / fracción hotelera").
  - Área (m²), orientación / vista.
  - Precio y **forma de pago / plan de financiación**.
  - **Estado / disponibilidad** (disponible, reservada, vendida).
  - Render/plano de la unidad + galería.
  - Botón **"Me interesa"** (captura de lead).
- **Disponibilidad** servida por el **backend del proyecto** (este repositorio):
  - `GET /api/units` → estados y precios (alimenta colores y fichas).
  - `POST /api/leads` → guarda el interesado.
  - **Modo offline:** la app cachea los datos; en feria sin internet la demo no se rompe.
- **Tipologías:** catálogo navegable (menú "Unidades") con filtro por tipo/estado y salto
  directo a la unidad en 3D.

---

## 7. Materiales visuales necesarios (input del cliente / estudio)

Para alcanzar calidad premium, el equipo necesita:

**Del proyecto (obligatorio):**
- Maqueta 3D del complejo en metros, por capas, con unidades nombradas (ver pipeline).
- Planimetría/masterplan y nomenclatura de unidades del Resort 1.
- Planilla comercial: `UnitID`, tipología, m², precio, estado, forma de pago.
- Paleta de materiales y terminaciones reales (pisos, fachada, carpinterías, mobiliario).
- Branding ATLANTICO: logo, colores, tipografías, tono.

**Para realismo (deseable):**
- Fotos del sitio y del entorno (Chuy/Chuí, playa, frontera) para referencia y paneles.
- Renders aprobados como "look target".
- Catálogo de amenities y equipamiento del parque acuático (toboganes, atracciones).
- Fotos/planos de la unidad modelo y su interiorismo.

**Producido por el estudio:**
- Materiales PBR (Megascans + custom), agua de parque/piscinas, vegetación regional
  (palmeras, costa), iluminación día (y atardecer/noche si se incluye), props,
  ambient/SFX, música para atract mode, UI premium bilingüe.

---

## 8. Flujo de producción

```
0. Datos        Maqueta limpia + escala + nombrado + planilla comercial
1. Pipeline     Datasmith/FBX -> UE5; validar escala; Nanite/World Partition
2. Greybox      Recorrido peaton + dron navegable (sin arte)  -> validar UX
3. Look dev     Materiales PBR + iluminacion dia -> aprobar "look target" en S2/S3
4. Ambientacion Agua, vegetacion, props, parque acuatico, interiores unidad modelo
5. Sistemas     Hotspots, fichas, menus, tipologias, recorrido guiado, atract mode
6. Datos/Backend Conexion a /api/units y /api/leads (con cache offline)
7. Pulido       Postproduccion, audio, performance, bilingue
8. Entrega      Build Windows + showroom + manual de uso + capacitacion a vendedores
```

Iteración por **hitos demostrables**: greybox → 1 escena look-dev aprobada → vertical
slice (S2+S4 con ficha) → experiencia completa.

---

## 9. Cronograma

> Para un estudio de 3–5 personas. La duración real depende del tamaño del complejo y
> del nivel de calidad elegido (ver sección 11).

| Etapa | Duración | Hito |
|---|---|---|
| Datos + pipeline | 1–2 sem | Complejo navegable en gris, escala OK |
| Look dev (parque + resort) | 3–4 sem | "Look target" aprobado de día |
| Ambientación completa | 3–4 sem | Parque acuático, resort, unidad modelo terminados |
| Sistemas comerciales | 2–3 sem | Hotspots, fichas, tipologías, recorrido guiado |
| Backend / disponibilidad | 1–2 sem | Datos en vivo + offline |
| Pulido + bilingüe + audio | 2 sem | Calidad premium, atract mode |
| QA + empaquetado + capacitación | 1–2 sem | Build de showroom + vendedores entrenados |
| **TOTAL** | **~3,5 a 5 meses** | Experiencia comercial completa |

**Vertical slice vendible** (parque + 1 unidad modelo + ficha + recorrido guiado corto):
**4–6 semanas** — recomendado para validar y empezar a vender antes del 100%.

---

## 10. Equipo necesario

| Rol | Responsabilidad |
|---|---|
| **Director técnico / creativo UE5** | Visión, calidad, arquitectura, performance |
| **Artista de entornos 3D** | Maqueta, materiales PBR, parque, exteriores |
| **Artista de interiores / look dev** | Unidad modelo, iluminación, atmósfera |
| **Artista de vegetación / agua / FX** | Costa, palmeras, agua del parque, partículas |
| **Programador Blueprints / UI** | Navegación, hotspots, fichas, recorrido, menús |
| **Desarrollador backend** | Disponibilidad + leads (este repo), cache offline |
| **Diseñador UI/UX bilingüe** | Fichas, menús, identidad ATLANTICO, ES/PT |
| **PM / enlace comercial** | Datos de unidades, prioridades, capacitación de ventas |

Equipo mínimo viable: **director UE5 + artista de entornos + programador BP/UI** con
apoyos parciales. Ideal: **4–6 personas**.

---

## 11. Costos relativos por nivel de calidad

> Escala relativa para decidir alcance/presupuesto (no precios cerrados).

| Nivel | Qué incluye | Costo relativo | Plazo | Uso ideal |
|---|---|---|---|---|
| **A — Esencial** | 1 sector (parque + 1 unidad modelo), día, recorrido libre + 5 hotspots, build Windows | **1x** | 4–6 sem | Empezar a vender ya / validar |
| **B — Comercial** | Complejo completo, parque + resort + amenities, día + atardecer, recorrido guiado, sistema de unidades + disponibilidad, bilingüe | **2,5–3x** | 3–4 meses | Showroom y feria estándar |
| **C — Premium** | Todo lo de B + interiores detallados, atardecer/noche, agua/FX de alta gama, crowd, audio, atract mode, comparador de tipologías, optimización fina | **4–5x** | 4–5 meses | Lanzamiento premium / diferenciación máxima |
| **Add-ons** | VR / showroom inmersivo, Pixel Streaming (web), disponibilidad en vivo, configurador de terminaciones | **+0,5–1,5x c/u** | variable | Escalado futuro |

> El driver de costo nº1 es el **nivel de detalle de interiores y agua/FX**, seguido por
> el **tamaño del complejo a ambientar**. Empezar por el **Nivel A como vertical slice**
> reduce riesgo y permite vender mientras se produce el resto.

---

## 12. Próximos pasos para iniciar

1. **Definir alcance/nivel** (A, B o C) y presupuesto asociado.
2. **Entregar la maqueta 3D** limpia, en metros, por capas y con unidades nombradas.
3. **Consolidar la planilla comercial** del Resort 1 (UnitID = ID de geometría).
4. **Definir hardware de showroom/feria** (condiciona el presupuesto de rendimiento).
5. **Aprobar el "look target"** (referencias/renders de calidad objetivo).
6. **Confirmar branding e idiomas** (ES/PT) y los textos de venta de cada unidad.
7. **Arrancar el vertical slice (Nivel A):** parque + unidad modelo + ficha + recorrido
   guiado corto, conectado al backend de disponibilidad de este repositorio.
8. **Plan de capacitación** a vendedores y logística de feria/showroom.

> Backend de disponibilidad y leads: **ya iniciado en este repositorio** (`/api/units`,
> `/api/leads`, con modo offline). Ver `README.md` y `docs/mvp-ue5-paso-a-paso.md`.

---

### Anexo — Encaje con los documentos existentes
- `docs/fase2-ue5-roadmap.md` — hoja de ruta técnica general de la Fase 2.
- `docs/mvp-ue5-paso-a-paso.md` — guía exacta para construir el MVP / vertical slice.
- Este documento — visión comercial y de producción específica de ATLANTICO.
