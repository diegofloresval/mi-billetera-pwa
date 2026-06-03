import { useState, useEffect, useRef, useCallback } from "react";
import { INITIAL_STATE } from "./constants";
import { saveData, loadData } from "./helpers";

export function useWallet() {
  const loadedRef = useRef(null);
  const [state, setState] = useState(() => {
    const loaded = loadData();
    loadedRef.current = loaded;
    return loaded.state ? loaded.state : { ...INITIAL_STATE };
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
