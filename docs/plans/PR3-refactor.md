# PR3 — Refactor: ModalSheet compartido + memoización

**Branch:** `refactor/modal-shell-and-memos`
**Base:** rama post-PR1 mergeada en `main`, o `main` si PR1 todavía no se mergeó (en ese caso pedir confirmación al usuario antes de arrancar).
**Orden de ejecución:** 2 de 3 (PR1 → este → PR2)

## Por qué este orden
Va antes que el PR de visual/paleta para que los cambios de tokens/colores se apliquen una sola vez sobre el `ModalSheet` extraído, en vez de tres veces sobre cada modal duplicado.

## Objetivo
- Extraer un componente `<ModalSheet>` compartido que elimine ~75 líneas de boilerplate duplicado entre `TxModal`, `FijoModal`, `AhorroModal` y el modal de aportar.
- Hoistear estilos estáticos según convención del repo (memoria del usuario: "hoist static styles; no CSS modules/Tailwind sin preguntar").
- Cerrar gaps de memoización inconsistentes en `App.js` y `AhorrosView`.

## Convenciones del repo
- **Verificar antes de marcar done:** `npm run build` + chequeo de comportamiento.
- **Estilos hoisted:** `S` objects a module scope, no literales inline en cada render.
- **No abstracciones especulativas:** el `ModalSheet` debe nacer del patrón real de los 3-4 modales, no diseñarse para futuros modales que no existen.
- **No comentarios salvo WHY no-obvio.**

## Tareas

### 1. R-014 — Extraer `<ModalSheet>` compartido
**Archivos involucrados:**
- Nuevo: `src/components/ModalSheet.js`
- Refactor: `src/components/TxModal.js`, `src/components/FijoModal.js`, `src/components/AhorroModal.js`, modal de aportar en `src/views/AhorrosView.js`

**Patrón común actual** (presente en los 3 modales con variaciones mínimas):
- Overlay full-screen tinte verde oscuro `rgba(45,36,56,.45)` o `rgba(26,61,42,.55)` (PR2 unificará el tinte; en este PR usar el actual de cada uno tal cual y dejar que PR2 lo normalice).
- Sheet container con `borderRadius: '28px 28px 0 0'`, `background: C.card`, padding consistente.
- Grab handle (barrita gris arriba).
- Header row: título + botón ✕ close.
- Children = contenido específico del modal.

**API propuesta:**
```jsx
<ModalSheet title="🐷 Editar meta" onClose={() => setShow(false)}>
  {/* contenido */}
</ModalSheet>
```

**Decisiones a tomar:**
- ¿`title` acepta string o también nodes (para emojis JSX, futuro ManekiNeko)? **Recomendación:** aceptar `ReactNode` para flexibilidad sin overhead. Documentar el contrato en el componente.
- ¿El click en overlay cierra? Sí — replicar comportamiento actual (verificar que todos los 3 lo hacen igual; si difieren, dejar como está y abrir issue separado).
- ¿Tecla Escape cierra? **No agregar** — la suspicious #5 del QA dice que no es regresión y este PR es solo refactor. Si se agrega, hacerlo en commit separado y mencionarlo en el PR body.

**Atención:**
- TxModal tiene lógica de toggle Gasto/Ingreso + reset de cat que **NO** va al ModalSheet. Solo el chrome.
- FijoModal tiene minHeight wrapper para evitar jump entre Mensual/Cuotas — eso es interno del modal, no del shell.
- AhorroModal tiene el `currentColor` (renombrado a `selectedColor` en PR1) — interno del modal.
- El modal de aportar en AhorrosView es inline, no es un componente exportado. Decidir: ¿extraerlo a archivo propio (`AportarModal.js`) o solo aplicar `<ModalSheet>` inline? **Recomendación:** extraerlo a archivo propio — limpia `AhorrosView` y queda consistente con los otros 3.

**DoD:**
- `<ModalSheet>` exportado y usado por los 4 modales.
- ~75 líneas netas removidas (medir y reportar en PR body).
- Comportamiento idéntico: visual, animación de apertura, cierre por ✕ y overlay tap.

---

### 2. R-013 — Hoistear estilos estáticos en los modales
**Archivos:** `src/components/TxModal.js`, `FijoModal.js`, `AhorroModal.js`, `AportarModal.js` (nuevo)

**Problema:** estos archivos crean objetos de estilo literales en cada render para estructuras estáticas. La convención del repo (memoria del usuario) es hoistear `S` objects al module scope. `AjustesView` y `TopBar` ya lo hacen.

**Fix:** después de que `<ModalSheet>` absorba el chrome común, mover los estilos restantes específicos de cada modal a un objeto `const S = { ... }` a nivel de módulo. Solo los que no dependen de props/state.

**DoD:** cero literales `style={{...}}` inline para estilos estáticos. Estilos dinámicos (basados en color seleccionado, estado activo, etc.) pueden seguir inline o usar spread `{...S.base, color: dynamicColor}`.

---

### 3. R-003 — Memoizar `txsMes`, `ingMovMes*`, `gstMovMes*`
**Archivo:** `src/App.js:276-280`
**Problema:** Estos arrays/sums se recomputan en cada render de `App`. Otros agregados similares (`gastosMes`, `ingresosMes`, `totalsByCurrency`) sí están memoizados. Inconsistente.

**Fix:** `useMemo(..., [txs, movMes])` para los 4 valores. Patrón idéntico al de los memos vecinos.

**DoD:** los 4 valores envueltos en `useMemo`. Build limpio, comportamiento idéntico.

---

### 4. R-004 — Memoizar `inactivosFijos`
**Archivo:** `src/App.js:237-238`
**Problema:** `activosFijos` usa `useMemo`, `inactivosFijos` no. Trivial inconsistencia.

**Fix:** `useMemo(..., [fijos, cm])` igual que `activosFijos`.

---

### 5. R-006 — Memoizar `byCurrency` en AhorrosView
**Archivo:** `src/views/AhorrosView.js:9-15`
**Problema:** Recomputa en cada render incluido cuando solo cambia `aportarMonto` (input local).

**Fix:** `useMemo(..., [ahorros])`.

## Criterios de Done globales

1. `npm run build` pasa limpio.
2. Comportamiento de los 4 modales idéntico al actual (abrir, cerrar por ✕, cerrar por overlay tap, contenido interno).
3. Cero regresiones visuales — si hay cualquier diferencia mínima de padding/borde, dejarla anotada y mencionarla en el PR body para que PR2 la considere.
4. Diff neto: líneas removidas > líneas agregadas (medir y reportar).
5. Commits separados:
   - `refactor(modals): extract ModalSheet shared component`
   - `refactor(modals): hoist static styles per convention`
   - `perf(app): memoize monthly tx aggregates`
   - `perf(app): memoize inactivosFijos`
   - `perf(ahorros): memoize byCurrency`

## Pasos finales

1. Verificar que PR1 está mergeado (o coordinar con usuario si arrancamos antes).
2. Crear branch `refactor/modal-shell-and-memos`.
3. Implementar tarea 1 (ModalSheet) primero — es el cambio grande.
4. Implementar tarea 2 (hoist styles) inmediatamente después, en el mismo contexto mental.
5. Tareas 3-5 (memos) son independientes — orden libre.
6. `npm run build` final.
7. Push y `gh pr create` con título: `refactor: ModalSheet compartido y memoización de agregados`
8. PR body: listar reducción de LOC, archivos tocados, criterios de done marcados.
