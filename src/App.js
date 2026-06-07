import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { C, CATS, METHODS, AHORRO_COLORS } from "./constants";
import {
  uid, today, currentMonth, monthOf,
  isInMonth, fijoActivoEsteMes, sanitizeState, toARS, fetchFxRate,
} from "./helpers";
import { useWallet } from "./useWallet";
import { TxModal } from "./components/TxModal";
import { FijoModal } from "./components/FijoModal";
import { AhorroModal } from "./components/AhorroModal";
import { ConfirmSheet } from "./components/ConfirmSheet";
import { Toast } from "./components/Toast";
import { BottomNav, Fab } from "./components/BottomNav";
import { FabMenu } from "./components/FabMenu";
import { TopBar } from "./views/TopBar";
import { InstallBanner } from "./views/InstallBanner";
import { HomeView } from "./views/HomeView";
import { MovimientosView } from "./views/MovimientosView";
import { FijosView } from "./views/FijosView";
import { AhorrosView } from "./views/AhorrosView";
import { PresupuestoView } from "./views/PresupuestoView";
import { AjustesView } from "./views/AjustesView";

export default function App() {
  const { state, setState, upd, reset, replace, onQuotaError, onLoadWarning } = useWallet();
  const [tab, setTab] = useState("Home");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("gasto");
  const [showFijoModal, setShowFijoModal] = useState(false);
  const [editFijoId, setEditFijoId] = useState(null);
  const [showAhorroModal, setShowAhorroModal] = useState(false);
  const [editAhorroId, setEditAhorroId] = useState(null);
  const [ahorroForm, setAhorroForm] = useState({ nombre: "", meta: "", color: AHORRO_COLORS[0], emoji: "🐱", currency: "ARS" });
  const [form, setForm] = useState({ desc: "", monto: "", cat: "supermercado", fecha: today(), method: "debito", currency: "ARS", cuotas: 1 });
  const [fijoForm, setFijoForm] = useState({ desc: "", monto: "", cat: "gym", method: "debito", tipo: "mensual", hastaFecha: "", cuotasTotales: 6, desde: currentMonth(), currency: "ARS" });
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const [budgetEdit, setBudgetEdit] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [movMes, setMovMes] = useState(currentMonth());
  const [confirmState, setConfirmState] = useState(null);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const fileInputRef = useRef(null);
  const pendingImportRef = useRef(null);

  const { txs, fijos, budgets, sueldo, nombre, customCats = [], fxRate = { USD_ARS: 0, updatedAt: null, source: "blue", auto: false }, fxSource = "blue", ahorros = [], aportes = [] } = state;

  useEffect(() => { onQuotaError((msg) => showToast(msg)); }, [onQuotaError]);
  useEffect(() => { onLoadWarning((msg) => showToast(msg)); }, [onLoadWarning]);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); setShowInstall(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const refreshFx = useCallback(async (source, opts = {}) => {
    const src = source || fxSource || "blue";
    try {
      const rate = await fetchFxRate(src);
      upd({ fxRate: { USD_ARS: rate, updatedAt: today(), source: src, auto: true }, fxSource: src });
      if (opts.toast) showToast(`Cotización ${src} actualizada ✓`);
    } catch {
      if (opts.toast) showToast("No se pudo actualizar la cotización");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fxSource, upd]);

  const autoFxTriedRef = useRef(false);
  useEffect(() => {
    if (autoFxTriedRef.current) return;
    autoFxTriedRef.current = true;
    const stale = !fxRate.updatedAt || fxRate.updatedAt !== today();
    if (!stale) return;
    refreshFx(fxRate.source || fxSource, { toast: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manifest shortcuts: ?action=gasto|ingreso o ?tab=ahorros|fijos|movimientos
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    const tabParam = params.get("tab");
    if (action === "gasto" || action === "ingreso") {
      setModalType(action);
      setEditId(null);
      setForm({ desc: "", monto: "", cat: "supermercado", fecha: today(), method: "debito", currency: "ARS", cuotas: 1 });
      setShowModal(true);
    }
    if (tabParam) {
      const map = { ahorros: "Ahorros", fijos: "Fijos", movimientos: "Movimientos", presupuesto: "Presupuesto", home: "Home", ajustes: "Ajustes" };
      const t = map[tabParam.toLowerCase()];
      if (t) setTab(t);
    }
    if (action || tabParam) {
      // limpiar query para no re-disparar al navegar
      try { window.history.replaceState({}, "", window.location.pathname); } catch {}
    }
  }, []);

  const cm = currentMonth();
  const gastosMes = useMemo(() => txs.filter((t) => t.type === "gasto" && isInMonth(t.fecha, cm)), [txs, cm]);
  const ingresosMes = useMemo(() => txs.filter((t) => t.type === "ingreso" && isInMonth(t.fecha, cm)), [txs, cm]);
  const fijosMes = useMemo(() => fijos.filter((f) => fijoActivoEsteMes(f, cm)), [fijos, cm]);
  // Backward-compat: balance/totales en ARS (excluye USD)
  const totalFijos = useMemo(() => fijosMes.filter((f) => (f.currency || "ARS") === "ARS").reduce((a, f) => a + f.monto, 0), [fijosMes]);
  const totalGastos = gastosMes.filter((t) => (t.currency || "ARS") === "ARS").reduce((a, t) => a + t.monto, 0) + totalFijos;
  // Sueldo se representa como tx determinística (id `sueldo-${ym}`), por eso NO se suma aparte.
  const totalIngresos = ingresosMes.filter((t) => (t.currency || "ARS") === "ARS").reduce((a, t) => a + t.monto, 0);
  const balance = totalIngresos - totalGastos;

  // Totales separados por moneda
  const totalsByCurrency = useMemo(() => {
    const sumBy = (arr, cur) => arr.filter((x) => (x.currency || "ARS") === cur).reduce((a, x) => a + x.monto, 0);
    return {
      ARS: {
        ingresos: sumBy(ingresosMes, "ARS"),
        gastos: sumBy(gastosMes, "ARS") + sumBy(fijosMes, "ARS"),
        fijos: sumBy(fijosMes, "ARS"),
      },
      USD: {
        ingresos: sumBy(ingresosMes, "USD"),
        gastos: sumBy(gastosMes, "USD") + sumBy(fijosMes, "USD"),
        fijos: sumBy(fijosMes, "USD"),
      },
    };
  }, [ingresosMes, gastosMes, fijosMes]);

  // Totales unificados en ARS (null si hay USD y falta fxRate)
  const totalsUnifiedARS = useMemo(() => {
    const hasUSD = totalsByCurrency.USD.ingresos > 0 || totalsByCurrency.USD.gastos > 0;
    if (hasUSD && !fxRate.USD_ARS) return null;
    const conv = (n) => {
      const v = toARS(n, "USD", fxRate);
      return v == null ? 0 : v;
    };
    return {
      ingresos: totalsByCurrency.ARS.ingresos + conv(totalsByCurrency.USD.ingresos),
      gastos: totalsByCurrency.ARS.gastos + conv(totalsByCurrency.USD.gastos),
      fijos: totalsByCurrency.ARS.fijos + conv(totalsByCurrency.USD.fijos),
    };
  }, [totalsByCurrency, fxRate]);

  const safeToSpend = useMemo(() => {
    const unified = totalsUnifiedARS || { ingresos: totalsByCurrency.ARS.ingresos, gastos: totalsByCurrency.ARS.gastos, fijos: totalsByCurrency.ARS.fijos };
    const ingresosBase = unified.ingresos;
    if (ingresosBase <= 0) return null;
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const today = now.getDate();
    const daysLeft = Math.max(1, lastDay - today + 1);
    const fijosPendientes = unified.fijos * (daysLeft / lastDay);
    const disponible = ingresosBase - (unified.gastos - unified.fijos) - fijosPendientes;
    const perDay = disponible / daysLeft;
    return { perDay, daysLeft, disponible };
  }, [totalsUnifiedARS, totalsByCurrency]);

  const spentByCatMap = useMemo(() => {
    const m = {};
    const add = (cat, monto, currency) => {
      const cur = currency || "ARS";
      if (cur === "ARS") { m[cat] = (m[cat] || 0) + monto; return; }
      const v = toARS(monto, cur, fxRate);
      if (v == null) return;
      m[cat] = (m[cat] || 0) + v;
    };
    for (const g of gastosMes) add(g.cat, g.monto, g.currency);
    for (const f of fijos) if (fijoActivoEsteMes(f, cm)) add(f.cat, f.monto, f.currency);
    return m;
  }, [gastosMes, fijos, cm, fxRate]);

  const spentByCat = useCallback((cat) => spentByCatMap[cat] || 0, [spentByCatMap]);

  const top5 = useMemo(
    () => CATS.map((c) => ({ ...c, total: spentByCatMap[c.id] || 0 }))
              .filter((c) => c.total > 0)
              .sort((a, b) => b.total - a.total)
              .slice(0, 5),
    [spentByCatMap]
  );

  const toastTimer = useRef(null);
  const showToast = (msg, undoFn = null) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, undoFn });
    toastTimer.current = setTimeout(() => setToast(null), undoFn ? 4500 : 2200);
  };

  const mesesDisponibles = useMemo(() => {
    const set = new Set(txs.map((t) => monthOf(t.fecha)).filter(Boolean));
    set.add(cm);
    return [...set].sort().reverse();
  }, [txs, cm]);

  const openModal = (type) => {
    setModalType(type); setEditId(null);
    setForm({ desc: "", monto: "", cat: "supermercado", fecha: today(), method: "debito", currency: "ARS", cuotas: 1 });
    setShowModal(true);
  };

  const submit = () => {
    if (!form.monto || Number(form.monto) <= 0) return;
    if (modalType === "sueldo") {
      const monto = Number(form.monto);
      const sueldoId = `sueldo-${cm}`;
      const sueldoTx = { id: sueldoId, type: "ingreso", cat: "ingreso", desc: "Sueldo", monto, currency: "ARS", fecha: today(), method: "transfer" };
      const others = txs.filter((t) => t.id !== sueldoId);
      upd({ sueldo: monto, txs: [sueldoTx, ...others] });
      showToast("Sueldo actualizado ✓");
      setShowModal(false);
      return;
    }
    const cuotas = Number(form.cuotas) || 1;
    if (!editId && modalType === "gasto" && cuotas > 1) {
      const total = Number(form.monto);
      const montoCuota = Math.round((total / cuotas) * 100) / 100;
      const nuevoFijo = {
        id: uid(),
        desc: form.desc || "Compra en cuotas",
        monto: montoCuota,
        cat: form.cat,
        method: form.method || "credito",
        tipo: "cuotas",
        activo: true,
        hastaFecha: null,
        cuotasTotales: cuotas,
        cuotasPagadas: 0,
        desde: monthOf(form.fecha) || currentMonth(),
        currency: form.currency || "ARS",
      };
      upd({ fijos: [nuevoFijo, ...fijos] });
      showToast(`${cuotas} cuotas creadas en Fijos ✓`);
      setShowModal(false);
      return;
    }
    const base = { ...form, monto: Number(form.monto), id: editId || uid(), type: modalType === "ingreso" ? "ingreso" : "gasto", currency: form.currency || "ARS" };
    delete base.cuotas;
    if (modalType === "ingreso") { base.cat = "ingreso"; base.desc = base.desc || "Ingreso"; }
    if (editId) {
      const prev = txs.find((x) => x.id === editId);
      base.fxAtTx = prev?.fxAtTx ?? (fxRate.USD_ARS > 0 ? fxRate.USD_ARS : null);
      upd({ txs: txs.map((x) => (x.id === editId ? base : x)) }); showToast("Actualizado ✓");
    }
    else {
      base.fxAtTx = fxRate.USD_ARS > 0 ? fxRate.USD_ARS : null;
      upd({ txs: [base, ...txs] }); showToast(modalType === "ingreso" ? "Ingreso agregado ✓" : "Gasto agregado ✓");
    }
    setShowModal(false);
  };

  const removeWithUndo = (key, id, label) => {
    const removed = state[key].find((x) => x.id === id);
    if (!removed) return;
    setState((s) => ({ ...s, [key]: s[key].filter((x) => x.id !== id) }));
    showToast(label, () =>
      setState((s) => s[key].some((x) => x.id === id) ? s : { ...s, [key]: [removed, ...s[key]] })
    );
  };
  const del = (id) => {
    const tx = state.txs.find((x) => x.id === id);
    if (!tx) return;
    if (tx.cat !== "ahorro") return removeWithUndo("txs", id, "Movimiento eliminado");
    // Cascade: find related aporte (by txId, or legacy heuristic by monto+fecha+currency)
    let aporte = state.aportes.find((p) => p.txId === id);
    if (!aporte) {
      aporte = state.aportes.find(
        (p) => !p.txId && p.monto === tx.monto && p.fecha === tx.fecha && (p.currency || "ARS") === (tx.currency || "ARS")
      );
    }
    if (!aporte) return removeWithUndo("txs", id, "Movimiento eliminado");
    const ahorro = state.ahorros.find((a) => a.id === aporte.ahorroId);
    const prevActual = ahorro ? (ahorro.actual || 0) : 0;
    const nextActual = Math.max(0, prevActual - aporte.monto);
    setState((s) => ({
      ...s,
      txs: s.txs.filter((x) => x.id !== id),
      aportes: s.aportes.filter((p) => p.id !== aporte.id),
      ahorros: ahorro ? s.ahorros.map((a) => a.id === ahorro.id ? { ...a, actual: nextActual } : a) : s.ahorros,
    }));
    showToast("Aporte eliminado", () =>
      setState((s) => {
        if (s.txs.some((x) => x.id === id)) return s;
        return {
          ...s,
          txs: [tx, ...s.txs],
          aportes: [aporte, ...s.aportes],
          ahorros: ahorro ? s.ahorros.map((a) => a.id === ahorro.id ? { ...a, actual: prevActual } : a) : s.ahorros,
        };
      })
    );
  };

  const startEdit = (tx) => {
    setEditId(tx.id); setModalType(tx.type === "ingreso" ? "ingreso" : "gasto");
    setForm({ desc: tx.desc, monto: String(tx.monto), cat: tx.cat, fecha: tx.fecha, method: tx.method || "debito", currency: tx.currency || "ARS", cuotas: 1 });
    setShowModal(true);
  };

  const openFijoModal = (f = null) => {
    setEditFijoId(f ? f.id : null);
    setFijoForm(f ? { desc: f.desc, monto: String(f.monto), cat: f.cat, method: f.method, tipo: f.tipo, hastaFecha: f.hastaFecha || "", cuotasTotales: f.cuotasTotales || 6, desde: f.desde || currentMonth(), currency: f.currency || "ARS" }
      : { desc: "", monto: "", cat: "gym", method: "debito", tipo: "mensual", hastaFecha: "", cuotasTotales: 6, desde: currentMonth(), currency: "ARS" });
    setShowFijoModal(true);
  };

  const submitFijo = () => {
    if (!fijoForm.monto || !fijoForm.desc || Number(fijoForm.monto) <= 0) return;
    const base = { desc: fijoForm.desc, monto: Number(fijoForm.monto), cat: fijoForm.cat, method: fijoForm.method, tipo: fijoForm.tipo, activo: true, currency: fijoForm.currency || "ARS",
      hastaFecha: fijoForm.tipo === "mensual" ? (fijoForm.hastaFecha || null) : null,
      cuotasTotales: fijoForm.tipo === "cuotas" ? Number(fijoForm.cuotasTotales) : null,
      cuotasPagadas: editFijoId ? (fijos.find(f => f.id === editFijoId)?.cuotasPagadas || 0) : 0,
      desde: fijoForm.tipo === "cuotas" ? fijoForm.desde : null };
    if (editFijoId) { upd({ fijos: fijos.map((x) => x.id === editFijoId ? { ...x, ...base, id: editFijoId } : x) }); showToast("Actualizado ✓"); }
    else { upd({ fijos: [{ ...base, id: uid() }, ...fijos] }); showToast("Gasto fijo agregado ✓"); }
    setShowFijoModal(false);
  };

  const delFijo = (id) => removeWithUndo("fijos", id, "Gasto fijo eliminado");
  const toggleFijo = (id) => upd({ fijos: fijos.map((x) => x.id === id ? { ...x, activo: !x.activo } : x) });
  const pagarCuota = (id) => {
    const f = fijos.find((x) => x.id === id);
    if (!f) return;
    const completa = f.cuotasPagadas + 1 >= f.cuotasTotales;
    const prevPagadas = f.cuotasPagadas;
    setState((s) => ({ ...s, fijos: s.fijos.map((x) => x.id === id ? { ...x, cuotasPagadas: Math.min(x.cuotasPagadas + 1, x.cuotasTotales) } : x) }));
    showToast(
      completa ? "Última cuota ✓ Plan completado" : "Cuota registrada ✓",
      () => setState((s) => ({ ...s, fijos: s.fijos.map((x) => x.id === id ? { ...x, cuotasPagadas: prevPagadas } : x) }))
    );
  };

  const openAhorroModal = (a = null) => {
    setEditAhorroId(a ? a.id : null);
    setAhorroForm(a
      ? { nombre: a.nombre, meta: a.meta != null ? String(a.meta) : "", color: a.color || AHORRO_COLORS[0], emoji: a.emoji || "🐱", currency: a.currency || "ARS" }
      : { nombre: "", meta: "", color: AHORRO_COLORS[0], emoji: "🐱", currency: "ARS" });
    setShowAhorroModal(true);
  };

  const submitAhorro = () => {
    if (!ahorroForm.nombre.trim()) return;
    const metaNum = Number(ahorroForm.meta);
    if (!Number.isFinite(metaNum) || metaNum <= 0) return;
    const base = {
      nombre: ahorroForm.nombre.trim(),
      meta: metaNum,
      color: ahorroForm.color || AHORRO_COLORS[0],
      emoji: ahorroForm.emoji || "🐱",
      currency: ahorroForm.currency || "ARS",
    };
    if (editAhorroId) {
      upd({ ahorros: ahorros.map((x) => x.id === editAhorroId ? { ...x, ...base } : x) });
      showToast("Ahorro actualizado ✓");
    } else {
      upd({ ahorros: [{ ...base, id: uid(), actual: 0, createdAt: today() }, ...ahorros] });
      showToast("Ahorro creado ✓");
    }
    setShowAhorroModal(false);
  };

  const delAhorro = (id) => {
    const removed = state.ahorros.find((x) => x.id === id);
    if (!removed) return;
    const removedAportes = state.aportes.filter((p) => p.ahorroId === id);
    setState((s) => ({
      ...s,
      ahorros: s.ahorros.filter((x) => x.id !== id),
      aportes: s.aportes.filter((p) => p.ahorroId !== id),
    }));
    showToast("Ahorro eliminado", () =>
      setState((s) => s.ahorros.some((x) => x.id === id) ? s : {
        ...s,
        ahorros: [removed, ...s.ahorros],
        aportes: [...removedAportes, ...s.aportes],
      })
    );
  };

  const aportar = (ahorroId, monto, currency, fechaArg) => {
    const a = ahorros.find((x) => x.id === ahorroId);
    if (!a) return;
    const n = Number(monto);
    if (!Number.isFinite(n) || n <= 0) return;
    const cur = currency || a.currency || "ARS";
    const aporteId = uid();
    const txId = uid();
    const fecha = fechaArg || today();
    const newAporte = { id: aporteId, ahorroId, monto: n, currency: cur, fecha, txId };
    const newTx = { id: txId, type: "gasto", cat: "ahorro", desc: `Aporte ${a.nombre}`, monto: n, currency: cur, fecha, method: "transfer" };
    upd({
      ahorros: ahorros.map((x) => x.id === ahorroId ? { ...x, actual: (x.actual || 0) + n } : x),
      aportes: [newAporte, ...aportes],
      txs: [newTx, ...txs],
    });
    showToast("Aporte registrado ✓");
  };

  const mthInfo = (id) => METHODS.find((m) => m.id === id) || METHODS[0];
  const activosFijos = useMemo(() => fijos.filter((f) => fijoActivoEsteMes(f, cm)), [fijos, cm]);
  const inactivosFijos = useMemo(() => fijos.filter((f) => !fijoActivoEsteMes(f, cm)), [fijos, cm]);

  const exportar = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `mi-billetera-${today()}.json`; a.click();
    URL.revokeObjectURL(url);
    showToast("Datos exportados ✓");
  };
  const doImport = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data || typeof data !== "object") throw new Error("invalid");
        const { state: clean, dropped } = sanitizeState(data);
        replace(clean);
        showToast(dropped > 0 ? `Importado ✓ (${dropped} registro${dropped === 1 ? "" : "s"} inválido${dropped === 1 ? "" : "s"} omitido${dropped === 1 ? "" : "s"})` : "Datos importados ✓");
      } catch { showToast("Archivo inválido"); }
    };
    reader.readAsText(file);
  };
  const importar = (file) => {
    pendingImportRef.current = file;
    setConfirmState({
      title: "Importar datos",
      message: "Esto reemplaza tus datos actuales con los del archivo. No se puede deshacer.",
      confirmLabel: "Reemplazar",
      danger: true,
      onConfirm: () => {
        const f = pendingImportRef.current;
        pendingImportRef.current = null;
        if (f) doImport(f);
      },
    });
  };
  const borrarTodo = () => {
    setConfirmState({
      title: "Borrar todo",
      message: "¿Borrar todos los datos? Esta acción no se puede deshacer.",
      confirmLabel: "Borrar",
      danger: true,
      onConfirm: () => { reset(); showToast("Todo borrado"); },
    });
  };

  const installApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") { setShowInstall(false); showToast("¡App instalada! 🎉"); }
    setInstallPrompt(null);
  };

  const txsMes = useMemo(() => txs.filter((t) => isInMonth(t.fecha, movMes)), [txs, movMes]);
  const ingMovMesARS = useMemo(() => txsMes.filter((t) => t.type === "ingreso" && (t.currency || "ARS") === "ARS").reduce((a, t) => a + t.monto, 0), [txsMes]);
  const gstMovMesARS = useMemo(() => txsMes.filter((t) => t.type === "gasto" && (t.currency || "ARS") === "ARS").reduce((a, t) => a + t.monto, 0), [txsMes]);
  const ingMovMesUSD = useMemo(() => txsMes.filter((t) => t.type === "ingreso" && t.currency === "USD").reduce((a, t) => a + t.monto, 0), [txsMes]);
  const gstMovMesUSD = useMemo(() => txsMes.filter((t) => t.type === "gasto" && t.currency === "USD").reduce((a, t) => a + t.monto, 0), [txsMes]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
        html,body{background:${C.bg};font-family:'Plus Jakarta Sans',sans-serif;color:${C.ink};overscroll-behavior:none;touch-action:pan-y;-webkit-text-size-adjust:100%;}
        html{height:100%;}
        body{min-height:100%;}
        ::-webkit-scrollbar{display:none;}
        input,select,button{font-family:'Plus Jakarta Sans',sans-serif;outline:none;}
        *:focus{outline:none;}
        *:focus-visible{outline:2px solid ${C.hoja};outline-offset:2px;border-radius:4px;}
        .material-symbols-outlined{font-family:'Material Symbols Outlined';font-weight:normal;font-style:normal;display:inline-block;line-height:1;text-transform:none;letter-spacing:normal;word-wrap:normal;white-space:nowrap;direction:ltr;-webkit-font-feature-settings:'liga';-webkit-font-smoothing:antialiased;}
        .slide-up{animation:slideUp 0.4s cubic-bezier(.34,1.5,.64,1) both;}
        .fade-in{animation:fadeIn 0.32s ease both;}
        @keyframes slideUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes toast{0%{opacity:0;transform:translateY(10px) scale(.9)}10%{opacity:1;transform:none}90%{opacity:1}100%{opacity:0;transform:translateY(-6px)}}
        .tx-row:active{background:${C.hojaSoft} !important;}
        .btn-pill{transition:all .18s;cursor:pointer;}
        .btn-pill:active{transform:scale(.95);}
        @media (prefers-reduced-motion: reduce){
          *,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;scroll-behavior:auto !important;}
        }
      `}</style>

      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100dvh", background: C.bg, position: "relative", touchAction: "pan-y" }}>

        <TopBar
          tab={tab}
          nombre={nombre}
          cm={cm}
          onAddIngreso={() => openModal("ingreso")}
          onAddSueldo={() => openModal("sueldo")}
          onAddFijo={() => openFijoModal()}
          onOpenAjustes={() => setTab("Ajustes")}
        />

        {showInstall && <InstallBanner onInstall={installApp} onDismiss={() => setShowInstall(false)} />}

        <div style={{ padding: "0 16px calc(env(safe-area-inset-bottom) + 120px)" }}>
          {tab === "Home" && (
            <HomeView
              balance={balance}
              balanceUnified={totalsUnifiedARS ? totalsUnifiedARS.ingresos - totalsUnifiedARS.gastos : null}
              sueldo={sueldo}
              totalFijos={totalFijos}
              totalIngresos={totalIngresos}
              totalGastos={totalGastos}
              totalsByCurrency={totalsByCurrency}
              totalsUnifiedARS={totalsUnifiedARS}
              fxRate={fxRate}
              activosFijos={activosFijos}
              top5={top5}
              txs={txs}
              mthInfo={mthInfo}
              onGoMovimientos={() => setTab("Movimientos")}
              onGoFijos={() => setTab("Fijos")}
              onGoAhorros={() => setTab("Ahorros")}
              ahorros={ahorros}
              onEditTx={startEdit}
              safeToSpend={safeToSpend}
            />
          )}

          {tab === "Movimientos" && (
            <MovimientosView
              mesesDisponibles={mesesDisponibles}
              movMes={movMes}
              setMovMes={setMovMes}
              ingMovMesARS={ingMovMesARS}
              gstMovMesARS={gstMovMesARS}
              ingMovMesUSD={ingMovMesUSD}
              gstMovMesUSD={gstMovMesUSD}
              txsMes={txsMes}
              mthInfo={mthInfo}
              onEditTx={startEdit}
              onDelTx={del}
              fxRate={fxRate}
            />
          )}

          {tab === "Fijos" && (
            <FijosView
              totalFijos={totalFijos}
              activosFijos={activosFijos}
              inactivosFijos={inactivosFijos}
              fijos={fijos}
              onEditFijo={openFijoModal}
              onDelFijo={delFijo}
              onToggleFijo={toggleFijo}
              onPagarFijo={pagarCuota}
            />
          )}

          {tab === "Ahorros" && (
            <AhorrosView
              ahorros={ahorros}
              onOpenModal={openAhorroModal}
              onAportar={aportar}
              onDelAhorro={delAhorro}
            />
          )}

          {tab === "Presupuesto" && (
            <PresupuestoView
              budgets={budgets}
              spentByCat={spentByCat}
              budgetEdit={budgetEdit}
              setBudgetEdit={setBudgetEdit}
              onSaveBudget={(catId, n) => { upd({ budgets: { ...budgets, [catId]: n } }); setBudgetEdit(null); }}
            />
          )}

          {tab === "Ajustes" && (
            <AjustesView
              nombre={nombre}
              onChangeNombre={(v) => upd({ nombre: v })}
              onExport={exportar}
              onImportClick={() => fileInputRef.current?.click()}
              onBorrarTodo={borrarTodo}
              fileInputRef={fileInputRef}
              onFileChange={(e) => { const f = e.target.files?.[0]; if (f) importar(f); e.target.value = ""; }}
              customCats={customCats}
              onAddCustomCat={(cat) => upd({ customCats: [...customCats, cat] })}
              onDelCustomCat={(id) => upd({ customCats: customCats.filter((c) => c.id !== id) })}
              fxRate={fxRate}
              fxSource={fxSource}
              onUpdateFxRate={(rate) => { if (Number(rate) > 0) upd({ fxRate: { USD_ARS: Number(rate), updatedAt: today(), source: fxSource, auto: false } }); }}
              onChangeFxSource={(src) => { upd({ fxSource: src }); refreshFx(src, { toast: true }); }}
              onRefreshFx={() => refreshFx(fxSource, { toast: true })}
            />
          )}
        </div>

        <BottomNav tab={tab} onChange={setTab} />
        <Fab activeTab={tab} onClick={() => {
          if (tab === "Home") { setShowFabMenu(true); return; }
          if (tab === "Ahorros") return openAhorroModal();
          if (tab === "Fijos") return openFijoModal();
          openModal("gasto");
        }} />

        {showFabMenu && (
          <FabMenu
            onClose={() => setShowFabMenu(false)}
            onPick={(id) => {
              setShowFabMenu(false);
              if (id === "fijo") openFijoModal();
              else openModal(id);
            }}
          />
        )}

        {showModal && (
          <TxModal
            modalType={modalType}
            setModalType={setModalType}
            form={form}
            setForm={setForm}
            editId={editId}
            sueldo={sueldo}
            customCats={customCats}
            onSubmit={submit}
            onClose={() => setShowModal(false)}
          />
        )}

        {showFijoModal && (
          <FijoModal
            fijoForm={fijoForm}
            setFijoForm={setFijoForm}
            editFijoId={editFijoId}
            customCats={customCats}
            onSubmit={submitFijo}
            onClose={() => setShowFijoModal(false)}
          />
        )}

        {showAhorroModal && (
          <AhorroModal
            ahorroForm={ahorroForm}
            setAhorroForm={setAhorroForm}
            editAhorroId={editAhorroId}
            onSubmit={submitAhorro}
            onClose={() => setShowAhorroModal(false)}
          />
        )}

        <ConfirmSheet
          open={!!confirmState}
          title={confirmState?.title}
          message={confirmState?.message}
          confirmLabel={confirmState?.confirmLabel}
          danger={!!confirmState?.danger}
          onConfirm={confirmState?.onConfirm}
          onClose={() => setConfirmState(null)}
        />

        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </div>
    </>
  );
}
