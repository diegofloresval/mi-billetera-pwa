# PR2 — Visual, paleta y mascota maneki-neko

**Branch:** `feat/visual-pass-maneki`
**Base:** rama post-PR3 mergeada en `main`.
**Orden de ejecución:** 3 de 3 (PR1 → PR3 → este)

## Por qué este orden
Va último porque PR3 extrae `<ModalSheet>` compartido — los cambios de tokens de color y la nueva mascota se aplican una sola vez en el shell común en vez de tres veces. Si por algún motivo este PR arranca antes que PR3, **detener y confirmar con el usuario**.

## Objetivo
Tres frentes en un solo PR (decisión del usuario para evitar fragmentación visual):
1. **Accesibilidad de contraste** — arreglar 4 violaciones WCAG críticas que afectan toda la marca primaria.
2. **Limpieza de paleta legacy** — eliminar aliases retrocompatibles muertos (`C.lavanda`, `C.celeste`, `C.creme`, etc.) y hex hardcoded fuera de la paleta verde.
3. **Identidad de marca** — mascota maneki-neko verde unifica logo con módulo Ahorros (reemplaza 🐷) + FAB contextual + pulido visual general.

## Convenciones del repo
- **Verificar antes de marcar done:** `npm run build` + revisión visual mobile (al menos 360px y 430px viewport).
- **Estilos hoisted:** mantener `S` objects a module scope. Si se agregan estilos a archivos nuevos, hoistear desde el principio.
- **Paleta:** usar exclusivamente tokens `C.*` de `src/constants.js`. Cero hex hardcoded en src/ después de este PR (verificar con grep al final).
- **No comentarios salvo WHY no-obvio.**

---

## Bloque A — Accesibilidad de contraste (CRÍTICO)

### A1. Texto blanco sobre `C.hoja` (1.97:1) → falla AA
**Decisión:** usar `C.inkOnHoja` (#0F5C2C, ratio ~5.7:1) como color de texto en TODOS los botones con fondo `C.hoja`.

**Archivos afectados:**
- `src/views/TopBar.js:14,16,18` (botones ingreso, search, addFijo)
- `src/components/BottomNav.js:18` chip activo nav (verificar si ya usa inkOnHoja sobre hojaSoft — distinto caso)
- `src/views/MovimientosView.js:40` botón mes activo
- `src/views/HomeView.js:7-11` toggle "Por moneda / Unificado ARS"
- `src/views/AjustesView.js:21,38,46`
- `src/components/TxModal.js:49,67,74,83`
- `src/components/FijoModal.js:25,32,51,57`
- `src/components/AhorrosView.js:103`
- `src/components/Toast.js:9` botón Deshacer
- `src/components/AhorroModal.js:25,40`

**Acción:** buscar todos los `color: '#fff'` / `color: 'white'` cuyo fondo sea `C.hoja` y reemplazar por `C.inkOnHoja`. **NO** cambiar los blancos sobre `C.esmeralda` (ratio 5.46:1, OK) ni sobre `C.ink` (toast, ratio 13.9:1, OK).

**DoD:** ratio ≥ 4.5:1 en todos los CTAs primarios. Verificar visualmente en mobile que el verde oscuro sobre verde claro tiene presencia (no se ve "apagado").

---

### A2. Texto blanco sobre `C.coral` (2.01:1) → falla AA
**Decisión:** usar `C.inkDanger` (#A8324E, ratio ~4.8:1) en texto sobre `C.coral`.

**Archivos:**
- `src/components/BottomNav.js:30` FAB + (el `+` icono blanco — verificar si es texto o SVG; si es icono Material, cambiar a inkDanger)
- `src/components/TxModal.js:48` toggle "Gasto"
- `src/components/TxModal.js:74` botón método "Crédito" activo
- `src/components/FijoModal.js:51,43` botón método "Crédito" activo
- `src/views/AjustesView.js:23` botón "Borrar"

**Nota especial sobre FAB:** ver C4 abajo — el FAB cambia de color según tab. Cuando es coral, usar inkDanger; cuando es hoja, usar inkOnHoja.

**DoD:** ratio ≥ 4.5:1 en texto sobre coral.

---

### A3. `C.ink2` (#6B8A77, 3.27:1) → falla AA normal
**Archivo:** `src/constants.js:8`
**Fix:** cambiar valor a `#4F7359` (ratio ~4.7:1 sobre bg).

**Verificación:** este token se usa en ~10 lugares (subtítulos, metadata, labels uppercase pequeños). Cambiar el token afecta a todos en cascada — exactamente lo que queremos. NO cambiar los call sites uno por uno.

**DoD:** grep de `C.ink2` muestra el cambio en cascada. Ratio sobre bg = 4.5+ verificado.

---

### A4 (visual). D7 — Botón "Confirmar aporte" ilegible
**Archivo:** `src/views/AhorrosView.js:121` (o `AportarModal.js` si PR3 lo extrajo)
**Problema:** `color: "#fff"` con fondo = color de la meta. Las metas con colores claros de `AHORRO_COLORS` (#E3F4D6, #D6F5BD, #BEF8AD, #9BD980) dan ratio ~1.5:1.

**Fix:** cambiar `color: "#fff"` por `C.inkOnHoja`. Ratio holgado sobre cualquier verde de la paleta.

---

## Bloque B — Limpieza de paleta legacy

### B1. `Bar.js:6` usa `C.lavandaSoft` (último alias retrocompat vivo)
**Archivo:** `src/components/Bar.js:6`
**Fix:** `C.lavandaSoft` → `C.hojaSoft`.

---

### B2. Eliminar aliases muertos en `constants.js`
**Archivo:** `src/constants.js:29-34`
**Acción:** después de B1 (y verificar que ningún otro archivo usa los aliases — grep `C.lavanda`, `C.lavandaSoft`, `C.celeste`, `C.celesteSoft`, `C.creme`, `C.cremeSoft`), eliminar las 6 líneas de aliases.

**Atención:** si grep encuentra usos restantes, NO eliminar el alias todavía — migrarlos primero (forma parte de R-012).

---

### B3. R-012 — Aliases legacy en AhorrosView/FijoModal/AhorroModal
**Archivos:** `src/views/AhorrosView.js:31-55`, `src/components/FijoModal.js`, `src/components/AhorroModal.js`
**Problema:** estos archivos nuevos heredaron uso de `C.lavanda`, `C.lavandaSoft`, `C.celeste`, `C.creme`. Funcionan vía alias pero contaminan código nuevo.

**Fix:** mapear a tokens canónicos:
- `C.lavanda` → `C.hoja`
- `C.lavandaSoft` → `C.hojaSoft`
- `C.celeste` → ver contexto, probablemente `C.esmeraldaSoft` o `C.menta`
- `C.creme` → ver contexto, probablemente `C.bg` o `C.card`

Verificar visualmente que cada reemplazo no rompe la card afectada.

---

### B4. R-011 — Hex hardcoded fuera de paleta
**Archivos:**
- `src/views/AhorrosView.js:84` `#6B46C1` (púrpura) → `C.esmeralda` o `C.inkOnHoja`
- `src/views/AhorrosView.js:87` `#057857` (teal) → `C.esmeralda` o `C.inkSuccess`
- `src/views/AhorrosView.js:90` `#D4587E` (rosa) → `C.inkDanger`
- `src/components/FijoModal.js:43,51` mismos hex residuales

**Fix:** reemplazar por tokens semánticos correctos. El púrpura no tiene lugar en paleta verde.

---

### B5. C1 — `#EBE9E0` en FijoCard inactivo
**Archivo:** `src/components/FijoCard.js:14`
**Problema:** único hex no-paleta vivo en src/ (beige cálido para el círculo inactivo).
**Fix:** `C.hojaSoft` (mantiene la idea de "apagado" dentro del lenguaje verde).

---

### B6. Verificación final
**Comando:** `grep -rE "#[0-9A-Fa-f]{6}" src/` (excluyendo `constants.js`).
**Esperado:** cero matches. Si hay alguno, decidir caso por caso si es legítimo (ej: tinte de overlay tipo `rgba(...)` está OK) o falta migrar.

---

## Bloque C — Identidad de marca

### C1. D1 — Componente `<ManekiNeko>` SVG verde
**Archivo nuevo:** `src/components/ManekiNeko.js`

**Especificación:**
- SVG inline estilizado de gato maneki-neko (pose clásica, pata derecha levantada, con monedita).
- Paleta:
  - Cuerpo: `C.hoja`
  - Panza: `C.mentaSoft`
  - Collar: `C.coral`
  - Campanita: `C.esmeralda`
  - Detalles (ojos, bigotes): `C.ink`
- Prop: `size` (number, default 24). Escala todo proporcionalmente.
- Sin animación (mantener simple).
- Componente puro, sin estado.

**Implementación sugerida:** SVG de ~24x24 viewBox, simple — el gatito reconocible pero estilizado (no necesita ser fotorrealista). Si el diseño SVG resulta muy laborioso, alternativa: usar un emoji 🐱 con una clase CSS que aplique tinte verde via filter (menos crisp pero más rápido).

**Decisión del usuario:** queremos el SVG inline. Hacerlo bien aunque tome el tiempo.

---

### C2. Reemplazar 🐷 en módulo Ahorros (6 puntos)
- `src/views/HomeView.js:140` icono circular de card "Ahorros" (size 24)
- `src/views/AhorrosView.js:32` header "Mis ahorros" (size 22, junto al texto)
- `src/views/AhorrosView.js:100` empty state grande (size 56)
- `src/views/AhorrosView.js:116` modal aportar header (size 22)
- `src/components/AhorroModal.js:15` header "Editar/Nueva meta" (size 22)
- `src/views/TopBar.js` título tab Ahorros (size 18-20) — el que se agregó en PR1

**Atención migración:**
- `constants.js:52` `AHORRO_CAT.emoji = "🐷"` → **mantener como está** o cambiar a 🐱 genérico. NO usar el componente ManekiNeko aquí porque `emoji` es string usado en muchos lados (chips, modal tx). **Recomendación:** cambiar a "🐱" como string default; usar `<ManekiNeko />` solo en los 6 puntos de UI listados.
- `App.js:31,190,202` default `emoji: "🐷"` en form de ahorro — cambiar default a `"🐱"` (afecta solo metas nuevas; metas existentes en localStorage conservan su 🐷 por compat).

**DoD:** los 6 puntos renderizan `<ManekiNeko>`; metas existentes con 🐷 siguen funcionando.

---

### C3. D2 — Avatar TopBar con gatito/inicial
**Archivo:** `src/views/TopBar.js`
**Problema:** existe `S.avatar` style pero el `<div>` no se renderiza en ningún branch.

**Fix:** renderizar avatar circular hojaSoft con borde hoja cuando estamos en Home:
- Si hay `name`: mostrar inicial (primera letra mayúscula).
- Si no hay `name`: mostrar `<ManekiNeko size={20} />`.

**Position:** donde el style original lo preveía (probablemente esquina izquierda o junto al saludo).

---

### C4. FAB cambia a `C.hoja` en tabs Ahorros/Fijos
**Archivo:** `src/components/BottomNav.js`
**Problema:** FAB siempre coral, pero abre flows distintos:
- Home/Movimientos/Presupuesto → registra gasto (coral OK, semántica "danger/gasto")
- Fijos → crea fijo (debería ser hoja, semántica "compromiso/recurrencia")
- Ahorros → crea meta (debería ser hoja, semántica "ahorro")

**Fix:** computar color del FAB según `activeTab`:
- `fijos` o `ahorros` → `C.hoja` con icono `C.inkOnHoja`
- resto → `C.coral` con icono `C.inkDanger` (consistente con A2)

**Sombra:** también tintada acorde — `${C.hoja}88` cuando hoja, `${C.coral}88` cuando coral.

**Atención:** combina con A2 (cambio de color del icono del FAB). Hacer ambos cambios juntos para no duplicar.

---

## Bloque D — Pulido visual (nice-to-have)

### D1. C2 — Reordenar paleta Top gastos a monotónica decreciente
**Archivo:** `src/views/HomeView.js:162`
**Cambio:** `[C.coralSoft, C.menta, C.hojaSoft, C.mentaSoft, C.esmeraldaSoft]` → `[C.coralSoft, C.menta, C.hojaSoft, C.esmeraldaSoft, C.mentaSoft]`
**Por qué:** mantiene #1 coral + gradación verde de más saturado a más pálido. Lectura visual como ranking más clara.

---

### D2. C6 — Unificar botones editar/borrar de Ahorros a Material Symbols
**Archivo:** `src/views/AhorrosView.js:85,91`
**Cambio:** `"✏️ Editar"` → `<Icon name="edit" />` + label; `"🗑️"` → `<Icon name="delete" />`. Consistente con FijoCard.

---

### D3. Círculo blanco de cards Ingresos/Gastos más visible
**Archivo:** `src/views/HomeView.js:85,97`
**Cambio:** opacidad de `rgba(255,255,255,.35)` → `rgba(255,255,255,.6)`. El icono north_east debe leerse claro.

---

### D4. Sombra del balance card más fuerte
**Archivo:** `src/views/HomeView.js:43`
**Cambio:** `0 10px 32px ${C.hoja}33` → `0 10px 32px ${C.hoja}55`. Card "flota" más.

---

### D5. Icono decorativo eco en balance card más visible
**Archivo:** `src/views/HomeView.js:75-76`
**Cambio:** opacidad `0.22` → `0.28`. Sigue siendo marca de agua pero más legible.

---

### D6. Subtítulo InstallBanner
**Archivo:** `src/components/InstallBanner.js:9`
**Cambio:** `rgba(255,255,255,.85)` → `rgba(255,255,255,.95)`. Mejora contraste sobre la zona hoja del gradient.

---

### D7. Jerarquía visual "Pagar cuota" en FijoCard
**Archivo:** `src/components/FijoCard.js:56`
**Cambio:** agregar `boxShadow: \`0 4px 12px ${C.menta}88\`` para que se distinga como acción primaria sobre Editar/Pausar.

---

### D8. D9 — Reemplazar emojis de chrome por Material Symbols
**Archivos:**
- `src/views/MovimientosView.js:27` 🔍 → `<Icon name="search" />`
- `src/views/FijosView.js:23` 🪴 → `<Icon name="eco" />` o `pets`
- `src/views/HomeView.js:113` 📌 → `<Icon name="push_pin" />` filled
- `src/views/HomeView.js:179` ⏳ "Movimientos recientes" → `<Icon name="history" />`

**NO tocar:** emojis dentro de categorías (🍕 🚗 etc), emoji 🐱/maneki-neko (es identidad de marca, no chrome), emojis de labels semánticos como ⏳ 🔄 en chips de método (información, no decoración).

---

## Criterios de Done globales

1. `npm run build` pasa limpio.
2. Grep `#[0-9A-Fa-f]{6}` en src/ (excluyendo constants.js) devuelve cero matches.
3. Grep `C.lavanda`, `C.celeste`, `C.creme` en src/ devuelve cero matches (y los aliases eliminados de constants.js).
4. Smoke test en mobile (360px y 430px) recorriendo las 5 vistas:
   - Home: balance toggle, cards, top gastos, FAB color contextual.
   - Movimientos: badges, totales, search.
   - Fijos: cards activos/inactivos, FAB color verde.
   - Ahorros: maneki-neko en empty state, en cards, en modal aportar; FAB color verde.
   - Ajustes: botones, color picker (si aplica).
5. Verificación visual: ningún CTA primario se ve "lavado". El verde oscuro sobre verde claro tiene presencia.
6. Verificación contraste manual con extensión devtools o cálculo en 3-4 combinaciones clave (al menos `C.inkOnHoja` sobre `C.hoja` y `C.inkDanger` sobre `C.coral`).
7. Commits separados por bloque:
   - `fix(a11y): contrast tokens for primary CTAs (A1-A4)`
   - `refactor(palette): drop legacy color aliases (B1-B5)`
   - `feat(brand): ManekiNeko mascot + contextual FAB (C1-C4)`
   - `style: visual polish pass (D1-D8)`

## Pasos finales

1. Verificar PR3 mergeado (especialmente que `<ModalSheet>` ya existe). Si no, **detener y coordinar**.
2. Crear branch `feat/visual-pass-maneki`.
3. Ejecutar bloques en orden: A → B → C → D. Cada bloque su commit.
4. `npm run build` final.
5. Push y `gh pr create` con título: `feat: pasada visual — contraste, paleta verde y maneki-neko`
6. PR body: separado en 4 secciones (Accesibilidad, Limpieza paleta, Marca, Pulido) con checklist de ítems completados.
7. Adjuntar al PR body: nota recordatorio al usuario de revisar en mobile real con OLED brillante — si el verde oscuro inkOnHoja se siente apagado, plan B es bajar C.hoja a `#5FB23E` y mantener texto blanco (cambio en `constants.js` único).
