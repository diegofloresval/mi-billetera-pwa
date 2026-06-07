import { useState, useEffect, useRef, useCallback } from "react";
import { INITIAL_STATE } from "./constants";
import { saveData, loadData, today, currentMonth } from "./helpers";

// Migración: sueldo dejó de sumarse al balance directamente; ahora es tx determinística.
// Si el usuario tenía sueldo>0 antes de la migración, materializamos la tx del mes corriente
// para que su balance no caiga al actualizar.
function migrateSueldoToTx(s) {
  if (!s || !s.sueldo || s.sueldo <= 0) return s;
  const cm = currentMonth();
  const sueldoId = `sueldo-${cm}`;
  const txs = Array.isArray(s.txs) ? s.txs : [];
  if (txs.some((t) => t && t.id === sueldoId)) return s;
  const sueldoTx = { id: sueldoId, type: "ingreso", cat: "ingreso", desc: "Sueldo", monto: s.sueldo, currency: "ARS", fecha: today(), method: "transfer" };
  return { ...s, txs: [sueldoTx, ...txs] };
}

export function useWallet() {
  const loadedRef = useRef(null);
  const [state, setState] = useState(() => {
    const loaded = loadData();
    loadedRef.current = loaded;
    const base = loaded.state ? loaded.state : { ...INITIAL_STATE };
    return migrateSueldoToTx(base);
  });
  const quotaWarnedRef = useRef(false);
  const onQuotaErrorRef = useRef(null);
  const onLoadWarningRef = useRef(null);
  const loadWarningFiredRef = useRef(false);

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  useEffect(() => {
    const id = setTimeout(() => {
      const ok = saveData(state);
      if (!ok && !quotaWarnedRef.current) {
        quotaWarnedRef.current = true;
        onQuotaErrorRef.current?.("No se pudo guardar (almacenamiento lleno)");
      }
    }, 400);
    return () => clearTimeout(id);
  }, [state]);

  useEffect(() => {
    const flush = () => saveData(stateRef.current);
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, []);

  const upd = useCallback((patch) => setState((s) => ({ ...s, ...patch })), []);

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  const replace = useCallback((next) => setState(next), []);

  const onQuotaError = useCallback((cb) => { onQuotaErrorRef.current = cb; }, []);

  const onLoadWarning = useCallback((cb) => {
    onLoadWarningRef.current = cb;
    if (loadWarningFiredRef.current) return;
    const loaded = loadedRef.current;
    if (!loaded) return;
    if (loaded.error === "corrupt") {
      loadWarningFiredRef.current = true;
      cb("Datos guardados ilegibles, empezando vacío");
    } else if (loaded.dropped > 0) {
      loadWarningFiredRef.current = true;
      cb(`Se omitieron ${loaded.dropped} registro${loaded.dropped === 1 ? "" : "s"} inválido${loaded.dropped === 1 ? "" : "s"}`);
    }
  }, []);

  return { state, setState, upd, reset, replace, onQuotaError, onLoadWarning };
}
