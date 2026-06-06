import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { C, CATS, METHODS } from "./constants";
import {
  uid, today, currentMonth, monthOf,
  isInMonth, fijoActivoEsteMes, sanitizeState,
} from "./helpers";
import { useWallet } from "./useWallet";
import { TxModal } from "./components/TxModal";
import { FijoModal } from "./components/FijoModal";
import { Toast } from "./components/Toast";
import { BottomNav, Fab } from "./components/BottomNav";
import { TopBar } from "./views/TopBar";
import { InstallBanner } from "./views/InstallBanner";
import { HomeView } from "./views/HomeView";
import { MovimientosView } from "./views/MovimientosView";
import { FijosView } from "./views/FijosView";
import { PresupuestoView } from "./views/PresupuestoView";
import { AjustesView } from "./views/AjustesView";

export default function App() {
  const { state, setState, upd, reset, replace, onQuotaError, onLoadWarning } = useWallet();
  const [tab, setTab] = useState("Home");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("gasto");
  const [showFijoModal, setShowFijoModal] = useState(false);
  const [editFijoId, setEditFijoId] = useState(null);
  const [form, setForm] = useState({ desc: "", monto: "", cat: "supermercado", fecha: today(), method: "debito" });
  const [fijoForm, setFijoForm] = useState({ desc: "", monto: "", cat: "gym", method: "debito", tipo: "mensual", hastaFecha: "", cuotasTotales: 6, desde: currentMonth() });
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const [budgetEdit, setBudgetEdit] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [movMes, setMovMes] = useState(currentMonth());
  const fileInputRef = useRef(null);

  const { txs, fijos, budgets, sueldo, nombre } = state;

  useEffect(() => { onQuotaError((msg) => showToast(msg)); }, [onQuotaError]);
  useEffect(() => { onLoadWarning((msg) => showToast(msg)); }, [onLoadWarning]);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); setShowInstall(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const cm = currentMonth();
  const gastosMes = useMemo(() => txs.filter((t) => t.type === "gasto" && isInMonth(t.fecha, cm)), [txs, cm]);
  const ingresosMes = useMemo(() => txs.filter((t) => t.type === "ingreso" && isInMonth(t.fecha, cm)), [txs, cm]);
  const totalFijos = useMemo(() => fijos.filter((f) => fijoActivoEsteMes(f, cm)).reduce((a, f) => a + f.monto, 0), [fijos, cm]);
  const totalGastos = gastosMes.reduce((a, t) => a + t.monto, 0) + totalFijos;
  const totalIngresos = ingresosMes.reduce((a, t) => a + t.monto, 0) + sueldo;
  const balance = totalIngresos - totalGastos;

  const spentByCatMap = useMemo(() => {
    const m = {};
    for (const g of gastosMes) m[g.cat] = (m[g.cat] || 0) + g.monto;
    for (const f of fijos) if (fijoActivoEsteMes(f, cm)) m[f.cat] = (m[f.cat] || 0) + f.monto;
    return m;
  }, [gastosMes, fijos, cm]);

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
    setForm({ desc: "", monto: "", cat: "supermercado", fecha: today(), method: "debito" });
    setShowModal(true);
  };

  const submit = () => {
    if (!form.monto || Number(form.monto) <= 0) return;
    if (modalType === "sueldo") { upd({ sueldo: Number(form.monto) }); showToast("Sueldo actualizado ✓"); setShowModal(false); return; }
    const base = { ...form, monto: Number(form.monto), id: editId || uid(), type: modalType === "ingreso" ? "ingreso" : "gasto" };
    if (modalType === "ingreso") { base.cat = "ingreso"; base.desc = base.desc || "Ingreso"; }
    if (editId) { upd({ txs: txs.map((x) => (x.id === editId ? base : x)) }); showToast("Actualizado ✓"); }
    else { upd({ txs: [base, ...txs] }); showToast(modalType === "ingreso" ? "Ingreso agregado ✓" : "Gasto agregado ✓"); }
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
  const del = (id) => removeWithUndo("txs", id, "Movimiento eliminado");

  const startEdit = (tx) => {
    setEditId(tx.id); setModalType(tx.type === "ingreso" ? "ingreso" : "gasto");
    setForm({ desc: tx.desc, monto: String(tx.monto), cat: tx.cat, fecha: tx.fecha, method: tx.method || "debito" });
    setShowModal(true);
  };

  const openFijoModal = (f = null) => {
    setEditFijoId(f ? f.id : null);
    setFijoForm(f ? { desc: f.desc, monto: String(f.monto), cat: f.cat, method: f.method, tipo: f.tipo, hastaFecha: f.hastaFecha || "", cuotasTotales: f.cuotasTotales || 6, desde: f.desde || currentMonth() }
      : { desc: "", monto: "", cat: "gym", method: "debito", tipo: "mensual", hastaFecha: "", cuotasTotales: 6, desde: currentMonth() });
    setShowFijoModal(true);
  };

  const submitFijo = () => {
    if (!fijoForm.monto || !fijoForm.desc || Number(fijoForm.monto) <= 0) return;
    const base = { desc: fijoForm.desc, monto: Number(fijoForm.monto), cat: fijoForm.cat, method: fijoForm.method, tipo: fijoForm.tipo, activo: true,
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
    upd({ fijos: fijos.map((x) => x.id === id ? { ...x, cuotasPagadas: Math.min(x.cuotasPagadas + 1, x.cuotasTotales) } : x) });
    showToast(completa ? "Última cuota ✓ Plan completado" : "Cuota registrada ✓");
  };

  const mthInfo = (id) => METHODS.find((m) => m.id === id) || METHODS[0];
  const activosFijos = useMemo(() => fijos.filter((f) => fijoActivoEsteMes(f, cm)), [fijos, cm]);
  const inactivosFijos = fijos.filter((f) => !fijoActivoEsteMes(f, cm));

  const exportar = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `mi-billetera-${today()}.json`; a.click();
    URL.revokeObjectURL(url);
    showToast("Datos exportados ✓");
  };
  const importar = (file) => {
    if (!window.confirm("¿Reemplazar tus datos actuales con los del archivo? Esta acción no se puede deshacer.")) return;
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
  const borrarTodo = () => {
    if (!window.confirm("¿Borrar todos los datos? Esta acción no se puede deshacer.")) return;
    reset();
    showToast("Todo borrado");
  };

  const installApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") { setShowInstall(false); showToast("¡App instalada! 🎉"); }
    setInstallPrompt(null);
  };

  const txsMes = txs.filter((t) => isInMonth(t.fecha, movMes));
  const ingMovMes = txsMes.filter((t) => t.type === "ingreso").reduce((a, t) => a + t.monto, 0);
  const gstMovMes = txsMes.filter((t) => t.type === "gasto").reduce((a, t) => a + t.monto, 0);

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
        .material-symbols-outlined{font-family:'Material Symbols Outlined';font-weight:normal;font-style:normal;display:inline-block;line-height:1;text-transform:none;letter-spacing:normal;word-wrap:normal;white-space:nowrap;direction:ltr;-webkit-font-feature-settings:'liga';-webkit-font-smoothing:antialiased;}
        .slide-up{animation:slideUp 0.4s cubic-bezier(.34,1.5,.64,1) both;}
        .fade-in{animation:fadeIn 0.32s ease both;}
        @keyframes slideUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes toast{0%{opacity:0;transform:translateY(10px) scale(.9)}10%{opacity:1;transform:none}90%{opacity:1}100%{opacity:0;transform:translateY(-6px)}}
        .tx-row:active{background:${C.lavandaSoft} !important;}
        .btn-pill{transition:all .18s;cursor:pointer;}
        .btn-pill:active{transform:scale(.95);}
      `}</style>

      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100dvh", background: C.bg, position: "relative", touchAction: "pan-y" }}>

        <TopBar
          tab={tab}
          nombre={nombre}
          cm={cm}
          onAddIngreso={() => openModal("ingreso")}
          onAddSueldo={() => openModal("sueldo")}
          onAddFijo={() => openFijoModal()}
        />

        {showInstall && <InstallBanner onInstall={installApp} onDismiss={() => setShowInstall(false)} />}

        <div style={{ padding: "0 16px calc(env(safe-area-inset-bottom) + 120px)" }}>
          {tab === "Home" && (
            <HomeView
              balance={balance}
              sueldo={sueldo}
              totalFijos={totalFijos}
              totalIngresos={totalIngresos}
              totalGastos={totalGastos}
              activosFijos={activosFijos}
              top5={top5}
              txs={txs}
              mthInfo={mthInfo}
              onGoMovimientos={() => setTab("Movimientos")}
              onGoFijos={() => setTab("Fijos")}
              onEditTx={startEdit}
            />
          )}

          {tab === "Movimientos" && (
            <MovimientosView
              mesesDisponibles={mesesDisponibles}
              movMes={movMes}
              setMovMes={setMovMes}
              ingMovMes={ingMovMes}
              gstMovMes={gstMovMes}
              txsMes={txsMes}
              mthInfo={mthInfo}
              onEditTx={startEdit}
              onDelTx={del}
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
            />
          )}
        </div>

        <BottomNav tab={tab} onChange={setTab} />
        <Fab onClick={() => tab === "Fijos" ? openFijoModal() : openModal("gasto")} />

        {showModal && (
          <TxModal
            modalType={modalType}
            form={form}
            setForm={setForm}
            editId={editId}
            sueldo={sueldo}
            onSubmit={submit}
            onClose={() => setShowModal(false)}
          />
        )}

        {showFijoModal && (
          <FijoModal
            fijoForm={fijoForm}
            setFijoForm={setFijoForm}
            editFijoId={editFijoId}
            onSubmit={submitFijo}
            onClose={() => setShowFijoModal(false)}
          />
        )}

        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </div>
    </>
  );
}
