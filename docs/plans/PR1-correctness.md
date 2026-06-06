# PR1 — Correctness & data integrity

**Branch:** `fix/correctness-pass`
**Base:** `main`
**Orden de ejecución:** 1 de 3 (este → PR3 → PR2)

## Objetivo
Arreglar bugs de cálculo que muestran números incorrectos al usuario, bugs de UI que rompen funcionalidad, y endurecer integridad de datos. Sin tocar estilos ni refactors.

## Contexto del repo
- React (CRA), JS puro. `npm run build` compila + lint via react-app config.
- Estado central en `src/App.js` con hook `useWallet` y reducer `upd()`.
- Convenciones (de memoria del usuario):
  - **Verificar antes de marcar done:** `npm run build` + chequeo de comportamiento. Lint y build deben pasar limpios.
  - **Estilos:** hoistear `S` estáticos; no agregar CSS modules ni Tailwind sin preguntar. (No aplica mucho en este PR, pero respetar al tocar JSX.)
- No agregar comentarios salvo que el WHY sea no-obvio.
- No introducir abstracciones nuevas si no las pide la tarea.

## Tareas

### 1. F-002 — Balance del mes no respeta toggle Unificado ARS
**Archivo:** `src/App.js:61` y `src/views/HomeView.js`
**Problema:** `balance = totalIngresos - totalGastos` está hardcodeado a ARS-only. El toggle "Unificado ARS" actualiza las cards de Ingresos/Gastos pero NO el balance grande.
**Repro:**
1. Seed: sueldo 500k ARS, ingreso 100k ARS, gasto 5k ARS, gasto 25 USD, fxRate USD_ARS=1200.
2. Home → tap "Unificado ARS".
3. Cards muestran 600k / 50k; balance grande sigue mostrando 580k en vez de 550k.

**Fix:** calcular el balance unificado paralelo al balance ARS y pasar ambos a `HomeView`. `HomeView` ya recibe el modo del toggle (verificar prop). Renderizar el balance correcto según modo, igual que ya hace con las cards.

**DoD:**
- Toggle "Por moneda" muestra balance ARS-only (comportamiento actual cuando hay USD).
- Toggle "Unificado ARS" muestra `ingresosUnif - gastosUnif`.
- Sin toggle visible (no hay USD), comportamiento idéntico al actual.

---

### 2. F-003 — `spentByCatMap` mezcla USD como ARS
**Archivo:** `src/App.js:95-100`
**Problema:** `spentByCatMap` suma `g.monto` ignorando `g.currency`. Consumido por Top gastos (Home) y Presupuesto. Una tx de 25 USD se cuenta como 25 ARS.
**Repro:** Una sola tx Restaurante de 25 USD, fxRate 1200 → Top gastos y Presupuesto muestran "$ 25" para Restaurante.

**Fix recomendado:** convertir vía `toARS()` (ya existe el helper) cuando `fxRate` válido; si no hay rate, excluir USD del map y dejar un nota visible (revisar si ya hay precedente en otras vistas). Decidir entre las dos opciones y dejar consistente con cómo `totalsUnifiedARS` ya maneja `toARS()` devolviendo null.

**DoD:**
- Tx USD con `fxRate` válido se convierten a ARS antes de agruparse por categoría.
- Tx USD sin `fxRate` no se suman como ARS (preferir excluirlas a romper el número).
- Top gastos y Presupuesto consistentes con el resto de totales unificados.

---

### 3. R-001 — `userPickedCat` no se resetea al reabrir modal nuevo-gasto
**Archivo:** `src/components/TxModal.js:21-22`
**Problema:** `useEffect(() => setUserPickedCat(!!editId), [editId])`. Al abrir un nuevo-gasto, picar cat, cerrar, y reabrir nuevo-gasto: `editId` ya era null, el effect no re-dispara, `userPickedCat` queda true → autodetect no funciona en la sesión siguiente.

**Fix:** resetear `userPickedCat` cuando se monta el modal, no sólo cuando cambia `editId`. Dos opciones:
- (a) En `App.js`, pasar `key={showModal}` a TxModal para forzar remount al abrir.
- (b) En TxModal, agregar un effect en mount que resetee. Más localizado, no toca App.

Preferir (b) si no rompe otras invariantes — verificar que el resto del estado del modal también necesita reset coherente al abrir.

**DoD:**
- Abrir nuevo-gasto, picar cat, cerrar, reabrir nuevo-gasto, tipear "pizza" → cat cambia a Restaurante automáticamente.

---

### 4. R-008 — Editar aporte desde Movimientos desincroniza `ahorros.actual`
**Archivos:** `src/App.js:151-155`, `src/views/MovimientosView.js:72`
**Problema:** Las tx con `cat:"ahorro"` (auto-generadas por aportar) son editables/borrables desde Movimientos. Cambiar el monto o borrar no actualiza `ahorros[i].actual` ni `state.aportes`. El progreso de la meta queda fantasma.

**Fix recomendado (más simple):** hacer las tx de aporte **read-only desde Movimientos**. En `MovimientosView.js:72`, si `tx.cat === "ahorro"` no abrir el modal de edit; mostrar un toast/hint del estilo "Editá este aporte desde la meta en Ahorros" o simplemente no responder al tap.

Alternativa (más invasiva): cascadear edits/deletes al `ahorros`+`aportes` por id-linking. Requiere agregar `aporteId` al record de tx. **No** hacerla salvo que la opción simple no cierre el caso — confirmar con un commit separado si se elige.

**DoD:**
- Tap sobre tx de aporte en Movimientos no abre modal de edición.
- Affordance visual mínima de que es no-editable (cursor default, sin hover, o nota pequeña).
- Los demás tx siguen editándose normal.

---

### 5. F-001 — Tab Ahorros muestra "⚙️ Ajustes" como título
**Archivo:** `src/views/TopBar.js:31`
**Problema:** El `else` fallback captura cualquier tab que no sea {Home, Movimientos, Fijos, Presupuesto} → "Ahorros" cae ahí y hereda "⚙️ Ajustes".

**Fix:** agregar branch explícito para `tab === "ahorros"` con título apropiado (sugerencia: "🐷 Ahorros" — pero ojo, en PR2 esto se reemplaza por maneki-neko. Para no rehacer, usar el emoji actual aquí y que PR2 lo cambie junto con el resto).

**DoD:** Tab Ahorros muestra título propio, no "⚙️ Ajustes".

---

### 6. F-004 — FAB `aria-label="Agregar gasto"` incorrecto en Fijos/Ahorros
**Archivo:** `src/components/BottomNav.js:30`
**Problema:** `aria-label` hardcodeado a "Agregar gasto" aunque el handler abre FijoModal/AhorroModal según el tab.

**Fix:** computar `aria-label` según `activeTab`:
- `fijos` → "Agregar gasto fijo"
- `ahorros` → "Crear meta de ahorro"
- resto → "Agregar gasto"

**DoD:** screen reader anuncia label correcto según tab.

---

### 7. A4 / R-002 — Botón "Buscar" en TopBar de Movimientos sin handler
**Archivo:** `src/views/TopBar.js:57-59`
**Problema:** `<button aria-label="Buscar">` sin `onClick`. El search real vive inline en `MovimientosView`.

**Fix recomendado:** **eliminar el botón completo** de TopBar. El input de búsqueda en MovimientosView ya es discoverable. Quitar también el style `S.searchBtn` si queda muerto.

**DoD:** ya no hay botón decorativo. UI más limpia.

---

### 8. F-006 — Modal aportar acepta monto=0 silenciosamente
**Archivo:** `src/views/AhorrosView.js` (modal de aportar)
**Problema:** Tipear "0" + Confirmar = no-op silencioso. Modal queda abierto sin feedback.

**Fix:** disable del botón Confirmar cuando `Number(aportarMonto) <= 0`. Es la opción más simple y consistente con el patrón de otros modales (verificar si TxModal hace lo mismo y replicar).

**DoD:** botón disabled visualmente cuando monto inválido o 0.

---

### 9. R-005 — `AhorrosView` recibe prop `aportes` sin usar
**Archivo:** `src/views/AhorrosView.js:5`, `src/App.js` (donde se pasa)
**Decisión:** dead prop. Eliminar de destructuring y del pass-through en App. (La feature "historial por meta" no está planeada en este PR.)

**DoD:** prop eliminada de ambos lados, sin warnings.

---

### 10. R-007 — Aportes huérfanos al borrar ahorro
**Archivo:** `src/App.js:215` (`delAhorro`)
**Problema:** Borrar un ahorro deja sus `aportes` en localStorage para siempre. No se muestran pero acumulan.

**Fix:** al borrar ahorro, también filtrar `aportes` que referencian ese `ahorroId`. **Importante:** las tx con `cat:"ahorro"` y `desc:"Aporte <nombre>"` se preservan (es el comportamiento documentado de "preservar historial financiero"). Solo se limpian los `aportes`.

**Atención al undo:** `removeWithUndo` actualmente solo restaura el ahorro. Si se borran aportes en cascada, el undo debe restaurarlos también — extender el snapshot. Si es muy invasivo, dejar comentado y abrir issue para más adelante.

**DoD:**
- Borrar ahorro → `state.aportes` no contiene records con ese `ahorroId`.
- Undo restaura tanto el ahorro como sus aportes.
- Las tx de aporte previas siguen apareciendo en Movimientos.

---

### 11. R-009 — `aportar()` hardcodeado a `today()`
**Archivo:** `src/App.js:225`
**Problema:** El mini-modal de aportar solo toma `monto`. La fecha del aporte y la tx generada siempre son hoy.

**Fix:** agregar input de fecha (date picker) en el modal de aportar, default a today(). Usar el mismo patrón que TxModal usa para fecha.

**DoD:** usuario puede elegir fecha del aporte; default sigue siendo hoy.

---

### 12. R-015 — `fxRate` negativo en App.js sin guardia
**Archivo:** `src/App.js:402`
**Problema:** El callback `onUpdateFxRate` no valida que `rate > 0`. AjustesView ya valida en UI pero defense-in-depth.

**Fix:** envolver con `if (Number(rate) > 0) upd(...)`. Trivial.

**DoD:** llamar `onUpdateFxRate(-5)` o `(0)` no muta state.

---

### 13. R-016 — Renombrar `currentColor` en AhorroModal
**Archivo:** `src/components/AhorroModal.js:9`
**Fix:** `currentColor` → `selectedColor` (no es keyword CSS, evita confusión al leer).

**DoD:** rename clean, sin referencias rotas.

---

### 14. F-005 — Wontfix
**Decisión del usuario:** no restaurar el color picker en categorías custom. La decisión documentada en `constants.js:87-90` es intencional.

**Acción:** ninguna en código. Si hay un test/spec que lo menciona, actualizar.

## Criterios de Done globales

1. `npm run build` pasa limpio (sin warnings ESLint nuevos).
2. Smoke test manual de los repros listados arriba.
3. Cero console errors nuevos en runtime.
4. Commits separados y limpios — uno por tarea numerada o grupo lógico (ej: F-001+F-004 juntos por ser UI bugs cortos).
5. Mensajes de commit en el estilo del repo (revisar `git log` reciente: `feat(scope): ...`, `fix(scope): ...`).

## Pasos finales

1. Crear branch `fix/correctness-pass` desde `main`.
2. Implementar tareas 1-13 en orden.
3. `npm run build` final.
4. Push y `gh pr create` con título: `fix: pasada de correctness y data integrity`
5. PR body: listar todos los ítems con su tag (F-002, R-001, etc.) en formato checklist.
