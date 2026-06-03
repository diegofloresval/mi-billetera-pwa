import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ── storage ────────────────────────────────────────────────────────────────────
const STORE_KEY = "billetera_data_v1";
const saveData = (data) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); return true; } catch(e){ return false; } };
const loadData = () => { try { const d = localStorage.getItem(STORE_KEY); return d ? JSON.parse(d) : null; } catch(e){ return null; } };

// ── helpers ────────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n || 0);
const today = () => new Date().toISOString().slice(0, 10);
const currentMonth = () => new Date().toISOString().slice(0, 7);
const monthOf = (fecha) => typeof fecha === "string" ? fecha.slice(0, 7) : null;
const saludo = () => {
  const h = new Date().getHours();
  if (h < 6) return "Buenas noches";
  if (h < 13) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
};
const monthLabel = (ym) => {
  const [y, m] = ym.split("-").map(Number);
  const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  return `${meses[m-1]} ${y}`;
};
const addMonth = (ym, delta) => {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
};

// ── tokens ─────────────────────────────────────────────────────────────────────
const C = {
  bg: "#FFF8F0",
  card: "#FFFFFF",
  ink: "#2D2438",
  ink2: "#8B8299",
  lavanda: "#A78BFA",
  lavandaSoft: "#EDE5FE",
  coral: "#FBA1B7",
  coralSoft: "#FEE5EC",
  menta: "#9EE6CF",
  mentaSoft: "#E0F7EE",
  creme: "#FFE4A1",
  cremeSoft: "#FFF3D1",
  celeste: "#BFE3FF",
  celesteSoft: "#E5F2FF",
};

// ── constants ──────────────────────────────────────────────────────────────────
const CATS = [
  { id: "supermercado", label: "Supermercado", emoji: "🛒", color: "#E8854A" },
  { id: "transporte",   label: "Transporte",   emoji: "🚌", color: "#4A90D9" },
  { id: "ocio",         label: "Ocio",         emoji: "🎮", color: "#9B59B6" },
  { id: "salud",        label: "Salud",        emoji: "💊", color: "#2ECC71" },
  { id: "ropa",         label: "Ropa",         emoji: "👟", color: "#E91E8C" },
  { id: "casa",         label: "Casa",         emoji: "🏠", color: "#F39C12" },
  { id: "educacion",    label: "Educación",    emoji: "📚", color: "#1ABC9C" },
  { id: "restaurante",  label: "Restaurante",  emoji: "🍕", color: "#E74C3C" },
  { id: "servicios",    label: "Servicios",    emoji: "💡", color: "#3498DB" },
  { id: "suscripcion",  label: "Suscripción",  emoji: "📱", color: "#8E44AD" },
  { id: "gym",          label: "Gym",          emoji: "🏋️", color: "#27AE60" },
  { id: "otro",         label: "Otro",         emoji: "📦", color: "#95A5A6" },
];
const CAT = Object.fromEntries(CATS.map((c) => [c.id, c]));

const METHODS = [
  { id: "debito",   label: "Débito",        icon: "💳" },
  { id: "credito",  label: "Crédito",       icon: "💳" },
  { id: "efectivo", label: "Efectivo",      icon: "💵" },
  { id: "transfer", label: "Transferencia", icon: "🏦" },
];

const DEFAULT_BUDGETS = {
  supermercado: 80000, transporte: 25000, ocio: 40000, salud: 20000,
  ropa: 30000, casa: 50000, educacion: 15000, restaurante: 35000,
  servicios: 25000, suscripcion: 15000, gym: 25000, otro: 20000,
};

const INITIAL_STATE = {
  txs: [],
  fijos: [],
  budgets: DEFAULT_BUDGETS,
  sueldo: 0,
  nombre: "",
};

// ── logic ──────────────────────────────────────────────────────────────────────
const fijoActivoEsteMes = (f, ym = currentMonth()) => {
  if (!f.activo) return false;
  if (f.tipo === "cuotas") {
    if ((f.cuotasTotales - f.cuotasPagadas) <= 0) return false;
    if (f.desde) {
      if (ym < f.desde) return false;
      const hasta = addMonth(f.desde, f.cuotasTotales - 1);
      if (ym > hasta) return false;
    }
    return true;
  }
  if (!f.hastaFecha) return true;
  return ym <= f.hastaFecha;
};

const isInMonth = (fecha, ym) => monthOf(fecha) === ym;

const cuotaLabel = (f) => {
  const rest = f.cuotasTotales - f.cuotasPagadas;
  return `Cuota ${f.cuotasPagadas + 1}/${f.cuotasTotales} · quedan ${rest}`;
};

// ── components ─────────────────────────────────────────────────────────────────
function Icon({ name, size = 22, filled = false, weight = 500, color, style }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: size,
        lineHeight: 1,
        color,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
        userSelect: "none",
        ...style,
      }}
    >
      {name}
    </span>
  );
}

function AnimNumber({ value, style }) {
  const [disp, setDisp] = useState(value);
  const dispRef = useRef(value);
  const rafRef = useRef(null);
  useEffect(() => {
    const s = dispRef.current, e = value, dur = 700, t0 = performance.now();
    const step = (now) => {
      const t = Math.min((now - t0) / dur, 1);
      const next = Math.round(s + (e - s) * (1 - Math.pow(1 - t, 4)));
      dispRef.current = next;
      setDisp(next);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else rafRef.current = null;
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };
  }, [value]);
  return <span style={style}>{fmt(disp)}</span>;
}

function BudgetInput({ initial, color, onSave, onCancel }) {
  const [val, setVal] = useState(String(initial ?? ""));
  const save = () => onSave(Number(val) || 0);
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <input
        type="number"
        inputMode="numeric"
        value={val}
        autoFocus
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") save(); else if (e.key === "Escape") onCancel(); }}
        style={{ flex: 1, minWidth: 0, border: `1.5px solid ${color}`, borderRadius: 12, padding: "8px 12px", fontSize: 13, fontWeight: 700, color: C.ink, background: C.bg, fontFamily: "inherit" }}
      />
      <button
        onClick={save}
        style={{ border: "none", background: color, color: "#fff", borderRadius: 12, padding: "8px 12px", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
      >✓</button>
    </div>
  );
}

function Bar({ spent, budget, color }) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  return (
    <div style={{ height: 6, borderRadius: 99, background: C.lavandaSoft, overflow: "hidden", marginTop: 8 }}>
      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: pct >= 100 ? C.coral : color, transition: "width 0.6s cubic-bezier(.34,1.56,.64,1)" }} />
    </div>
  );
}

function FijoCard({ f, onEdit, onDel, onToggle, onPagar }) {
  const cat = CAT[f.cat] || CAT["otro"];
  const mth = METHODS.find((m) => m.id === f.method) || METHODS[0];
  const rest = f.tipo === "cuotas" ? f.cuotasTotales - f.cuotasPagadas : null;
  const pctCuota = f.tipo === "cuotas" ? Math.round((f.cuotasPagadas / f.cuotasTotales) * 100) : null;
  const dim = !fijoActivoEsteMes(f);
  if (dim) {
    return (
      <div style={{ borderRadius: 24, padding: "16px 18px", border: `1.5px dashed ${C.lavanda}66`, marginBottom: 12, background: "transparent" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#EEE9F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, filter: "grayscale(0.6)", opacity: 0.7 }}>{cat.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 800, fontSize: 15, color: C.ink2 }}>{f.desc}</p>
            <p style={{ fontSize: 10, color: C.ink2, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>
              {f.tipo === "cuotas" && rest <= 0 ? "Plan completado" : !f.activo ? "Pausado" : "Inactivo este mes"}
            </p>
          </div>
          <p style={{ fontWeight: 900, fontSize: 15, color: C.ink2, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>-{fmt(f.monto)}</p>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {!f.activo && (
            <button onClick={onToggle} style={{ flex: 1, padding: "10px 0", borderRadius: 99, border: "none", background: `${C.lavanda}1F`, color: "#6B46C1", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>▶ Reactivar gasto</button>
          )}
          <button aria-label="Eliminar" onClick={onDel} style={{ width: 42, height: 38, borderRadius: 99, border: "none", background: `${C.coral}33`, color: "#D4587E", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
          </button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ background: C.card, borderRadius: 26, padding: "18px 18px", marginBottom: 14, boxShadow: `0 6px 22px ${C.lavanda}14` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${cat.color}26`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{cat.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 800, fontSize: 16, color: C.ink }}>{f.desc}</p>
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, background: f.tipo === "cuotas" ? `${C.coral}33` : `${C.celeste}66`, color: f.tipo === "cuotas" ? "#D4587E" : "#1A6BA0", borderRadius: 99, padding: "3px 9px", fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.3 }}>
              {f.tipo === "cuotas" ? `⏳ ${cuotaLabel(f)}` : f.hastaFecha ? `🔄 hasta ${f.hastaFecha}` : "🔄 Mensual"}
            </span>
            <span style={{ fontSize: 10, background: `${C.creme}99`, color: C.ink, borderRadius: 99, padding: "3px 9px", fontWeight: 800 }}>{mth.icon} {mth.label}</span>
          </div>
          {f.tipo === "cuotas" && (
            <div style={{ marginTop: 10, height: 6, borderRadius: 99, background: `${C.coral}26`, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pctCuota}%`, background: C.coral, borderRadius: 99, transition: "width .5s" }} />
            </div>
          )}
        </div>
        <p style={{ fontWeight: 900, fontSize: 17, color: "#D4587E", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>-{fmt(f.monto)}</p>
      </div>
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.lavanda}1A`, display: "flex", flexDirection: "column", gap: 8 }}>
        {f.tipo === "cuotas" && rest > 0 && (
          <button onClick={onPagar} style={{ width: "100%", padding: "11px 0", borderRadius: 99, border: "none", background: `${C.menta}40`, color: "#057857", fontWeight: 900, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span> Pagar cuota
          </button>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onEdit} style={{ flex: 1, padding: "10px 0", borderRadius: 99, border: "none", background: `${C.lavanda}1A`, color: "#6B46C1", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span> Editar
          </button>
          <button onClick={onToggle} style={{ flex: 1, padding: "10px 0", borderRadius: 99, border: "none", background: `${C.creme}99`, color: "#B8860B", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>pause</span> Pausar
          </button>
          <button aria-label="Eliminar" onClick={onDel} style={{ width: 44, padding: "10px 0", borderRadius: 99, border: "none", background: `${C.coral}33`, color: "#D4587E", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── main app ───────────────────────────────────────────────────────────────────
export default function App() {
  const [state, setState] = useState(() => ({ ...INITIAL_STATE, ...(loadData() || {}) }));
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
  const quotaWarnedRef = useRef(false);

  const { txs, fijos, budgets, sueldo, nombre } = state;

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  useEffect(() => {
    const id = setTimeout(() => {
      const ok = saveData(state);
      if (!ok && !quotaWarnedRef.current) {
        quotaWarnedRef.current = true;
        showToast("No se pudo guardar (almacenamiento lleno)");
      }
    }, 400);
    return () => clearTimeout(id);
  }, [state]);

  useEffect(() => {
    const flush = () => saveData(stateRef.current);
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, []);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); setShowInstall(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const upd = useCallback((patch) => setState((s) => ({ ...s, ...patch })), []);

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

  // export/import
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
        setState({
          ...INITIAL_STATE,
          ...data,
          txs: Array.isArray(data.txs) ? data.txs : [],
          fijos: Array.isArray(data.fijos) ? data.fijos : [],
          budgets: data.budgets && typeof data.budgets === "object" ? data.budgets : INITIAL_STATE.budgets,
          sueldo: Number.isFinite(data.sueldo) ? data.sueldo : 0,
          nombre: typeof data.nombre === "string" ? data.nombre : INITIAL_STATE.nombre,
        });
        showToast("Datos importados ✓");
      } catch { showToast("Archivo inválido"); }
    };
    reader.readAsText(file);
  };
  const borrarTodo = () => {
    if (!window.confirm("¿Borrar todos los datos? Esta acción no se puede deshacer.")) return;
    setState(INITIAL_STATE);
    showToast("Todo borrado");
  };

  const installApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") { setShowInstall(false); showToast("¡App instalada! 🎉"); }
    setInstallPrompt(null);
  };

  // styles helpers
  const inp = (extra = {}) => ({
    style: { width: "100%", border: `1.5px solid ${C.lavandaSoft}`, borderRadius: 16, padding: "14px 16px", fontSize: 15, color: C.ink, fontFamily: "inherit", background: C.card, marginBottom: 10, ...extra.style },
    ...extra,
  });

  const txsMes = txs.filter((t) => isInMonth(t.fecha, movMes));
  const ingMovMes = txsMes.filter((t) => t.type === "ingreso").reduce((a, t) => a + t.monto, 0);
  const gstMovMes = txsMes.filter((t) => t.type === "gasto").reduce((a, t) => a + t.monto, 0);

  // ── render ─────────────────────────────────────────────────────────────────
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

        {/* TOP BAR */}
        <div style={{ background: C.bg, padding: "calc(env(safe-area-inset-top) + 18px) 22px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: -0.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {tab === "Home" ? (nombre ? `¡Hola, ${nombre}! 👋` : "¡Hola! 👋")
                : tab === "Movimientos" ? "Movimientos"
                : tab === "Fijos" ? "📌 Gastos fijos"
                : tab === "Presupuesto" ? "Presupuesto"
                : "⚙️ Ajustes"}
            </p>
            {tab === "Home" && (
              <p style={{ fontSize: 13, color: C.ink2, fontWeight: 500, marginTop: 2 }}>
                {saludo()} · {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            )}
            {tab === "Presupuesto" && <p style={{ fontSize: 13, color: C.ink2, marginTop: 2, fontWeight: 600 }}>{monthLabel(cm)}</p>}
          </div>
          {tab === "Home" && (
            <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
              <button aria-label="Agregar ingreso" className="btn-pill" onClick={() => openModal("ingreso")} style={{ width: 42, height: 42, borderRadius: "50%", border: "none", background: C.lavanda, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px ${C.lavanda}55` }}>
                <Icon name="add" size={22} weight={700} />
              </button>
              <button aria-label="Mi sueldo" className="btn-pill" onClick={() => openModal("sueldo")} style={{ width: 42, height: 42, borderRadius: "50%", border: "none", background: C.creme, color: C.ink, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px ${C.creme}88` }}>
                <Icon name="work" size={20} weight={600} />
              </button>
            </div>
          )}
          {tab === "Movimientos" && (
            <div style={{ display: "flex", gap: 10, flexShrink: 0, alignItems: "center" }}>
              <button aria-label="Buscar" className="btn-pill" style={{ width: 42, height: 42, borderRadius: "50%", border: "none", background: C.lavanda, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px ${C.lavanda}55` }}>
                <Icon name="search" size={22} weight={600} />
              </button>
              <div aria-hidden="true" style={{ width: 42, height: 42, borderRadius: "50%", background: C.lavandaSoft, border: `2px solid ${C.lavanda}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#6B46C1", fontWeight: 900, fontSize: 16 }}>
                {(nombre || "D").trim().charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          {tab === "Fijos" && (
            <button className="btn-pill" onClick={() => openFijoModal()} style={{ flexShrink: 0, padding: "11px 18px", borderRadius: 99, border: "none", background: C.lavanda, color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, boxShadow: `0 6px 18px ${C.lavanda}55` }}>
              <Icon name="add" size={18} weight={700} /> Agregar
            </button>
          )}
        </div>

        {/* INSTALL BANNER */}
        {showInstall && (
          <div style={{ background: `linear-gradient(135deg,${C.lavanda},#7C5CFF)`, margin: "14px 16px 0", borderRadius: 20, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: `0 8px 24px ${C.lavanda}44` }}>
            <span style={{ fontSize: 26 }}>📲</span>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>Instalá la app</p>
              <p style={{ color: "rgba(255,255,255,.8)", fontSize: 11 }}>Acceso rápido desde el inicio</p>
            </div>
            <button onClick={installApp} style={{ padding: "8px 16px", borderRadius: 99, border: "none", background: "#fff", color: C.lavanda, fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>Instalar</button>
            <button onClick={() => setShowInstall(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,.7)", fontSize: 18, cursor: "pointer", lineHeight: 1, padding: 0 }}>×</button>
          </div>
        )}

        <div style={{ padding: "0 16px calc(env(safe-area-inset-bottom) + 120px)" }}>

          {/* ─── HOME ─── */}
          {tab === "Home" && (
            <div className="fade-in">
              {/* Balance card */}
              <div style={{ background: C.card, borderRadius: 28, padding: "22px 22px", marginTop: 16, position: "relative", overflow: "hidden", boxShadow: `0 10px 32px ${C.lavanda}26` }}>
                <div style={{ position: "relative", zIndex: 2 }}>
                  <p style={{ color: C.ink2, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 800 }}>Balance del mes</p>
                  <AnimNumber value={balance} style={{ display: "block", fontSize: 40, fontWeight: 900, color: C.ink, marginTop: 6, letterSpacing: -1, fontVariantNumeric: "tabular-nums" }} />
                  <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${C.menta}33`, color: C.ink, borderRadius: 99, padding: "5px 12px", fontSize: 11, fontWeight: 800, border: `1px solid ${C.menta}55` }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34D399" }} /> Sueldo {fmt(sueldo)}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${C.coral}33`, color: C.ink, borderRadius: 99, padding: "5px 12px", fontSize: 11, fontWeight: 800, border: `1px solid ${C.coral}55` }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#F87171" }} /> Fijos {fmt(totalFijos)}
                    </span>
                  </div>
                </div>
                <div style={{ position: "absolute", right: -8, bottom: -16, opacity: 0.18, pointerEvents: "none", zIndex: 1 }}>
                  <Icon name="eco" size={120} filled weight={400} color={C.lavanda} />
                </div>
                <div style={{ position: "absolute", right: 28, top: 22, opacity: 0.25, pointerEvents: "none", transform: "rotate(12deg)", zIndex: 1 }}>
                  <Icon name="star" size={32} filled color={C.creme} />
                </div>
              </div>

              {/* Income/Expenses */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
                <div style={{ background: C.menta, borderRadius: 24, padding: "18px 18px", display: "flex", flexDirection: "column", gap: 12, boxShadow: `0 8px 22px ${C.menta}55` }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                    <Icon name="north_east" size={20} weight={700} />
                  </div>
                  <div>
                    <p style={{ color: "rgba(45,36,56,.6)", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>Ingresos</p>
                    <p style={{ color: C.ink, fontWeight: 900, fontSize: 17, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>{fmt(totalIngresos)}</p>
                  </div>
                </div>
                <div style={{ background: C.coral, borderRadius: 24, padding: "18px 18px", display: "flex", flexDirection: "column", gap: 12, boxShadow: `0 8px 22px ${C.coral}55` }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                    <Icon name="south_west" size={20} weight={700} />
                  </div>
                  <div>
                    <p style={{ color: "rgba(45,36,56,.6)", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>Gastos</p>
                    <p style={{ color: C.ink, fontWeight: 900, fontSize: 17, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>{fmt(totalGastos)}</p>
                  </div>
                </div>
              </div>

              {/* Fijos este mes */}
              {activosFijos.length > 0 && (
                <div style={{ marginTop: 22 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <p style={{ fontWeight: 800, fontSize: 18, color: C.ink }}>📌 Fijos del mes</p>
                    <button onClick={() => setTab("Fijos")} style={{ background: "none", border: "none", color: C.lavanda, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Ver todo →</button>
                  </div>
                  {activosFijos.slice(0, 3).map((f) => {
                    const cat = CAT[f.cat] || CAT["otro"];
                    return (
                      <div key={f.id} style={{ background: C.card, borderRadius: 20, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, marginBottom: 10, boxShadow: `0 4px 16px ${C.lavanda}12` }}>
                        <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${cat.color}26`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{cat.emoji}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 800, fontSize: 14, color: C.ink }}>{f.desc}</p>
                          <span style={{ fontSize: 10, background: `${C.lavanda}1A`, color: "#6B46C1", borderRadius: 99, padding: "3px 9px", fontWeight: 900, marginTop: 4, display: "inline-block", textTransform: "uppercase", letterSpacing: 0.4 }}>
                            {f.tipo === "cuotas" ? `⏳ ${cuotaLabel(f)}` : "🔄 Mensual"}
                          </span>
                        </div>
                        <p style={{ fontWeight: 900, fontSize: 15, color: "#D4587E", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>-{fmt(f.monto)}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Top 5 */}
              {top5.length > 0 && (
                <div style={{ marginTop: 22 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <p style={{ fontWeight: 800, fontSize: 20, color: C.ink }}>Top gastos 🏆</p>
                  </div>
                  <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6, margin: "0 -16px", padding: "2px 16px 8px" }}>
                    {top5.map((c, i) => {
                      const palette = [C.celeste, C.creme, `${C.lavanda}55`, C.menta, `${C.coral}55`];
                      const bg = palette[i % palette.length];
                      return (
                        <div key={c.id} style={{ flexShrink: 0, width: 128, height: 132, borderRadius: 20, padding: "14px 12px", background: bg, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", boxShadow: `0 4px 14px rgba(45,36,56,.06)` }}>
                          <div style={{ position: "absolute", top: 8, left: 8, width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,.7)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: C.ink, fontSize: 11 }}>{i + 1}</div>
                          <span style={{ fontSize: 30, marginBottom: 6 }}>{c.emoji}</span>
                          <p style={{ color: "rgba(45,36,56,.6)", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{c.label}</p>
                          <p style={{ color: C.ink, fontWeight: 900, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>{fmt(c.total)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recientes */}
              <div style={{ marginTop: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <p style={{ fontWeight: 800, fontSize: 20, color: C.ink }}>Movimientos recientes ⏳</p>
                  <button onClick={() => setTab("Movimientos")} style={{ background: "none", border: "none", color: C.lavanda, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Ver todo →</button>
                </div>
                {txs.length === 0 ? (
                  <p style={{ color: C.ink2, textAlign: "center", padding: 30 }}>Todavía no hay movimientos 🪴<br /><small>Usá el botón + para agregar</small></p>
                ) : (
                  <div style={{ background: C.card, borderRadius: 26, overflow: "hidden", boxShadow: `0 4px 18px ${C.lavanda}12` }}>
                    {txs.slice(0, 5).map((tx, idx, arr) => {
                      const cat = CAT[tx.cat] || { emoji: "💰", color: C.menta };
                      const mth = mthInfo(tx.method);
                      return (
                        <div key={tx.id} className="tx-row" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", borderBottom: idx < arr.length - 1 ? `1px solid ${C.bg}` : "none" }} onClick={() => startEdit(tx)}>
                          <div style={{ width: 42, height: 42, borderRadius: "50%", background: `${cat.color}26`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{cat.emoji}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 800, fontSize: 14, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.desc}</p>
                            <p style={{ fontSize: 11, color: C.ink2, marginTop: 2, fontWeight: 500 }}>{tx.fecha} · {mth.icon} {mth.label}</p>
                          </div>
                          <p style={{ fontWeight: 900, fontSize: 15, color: tx.type === "ingreso" ? "#059669" : C.ink, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{tx.type === "ingreso" ? "+" : "-"}{fmt(tx.monto)}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── MOVIMIENTOS ─── */}
          {tab === "Movimientos" && (
            <div className="fade-in" style={{ paddingTop: 8 }}>
              {/* Selector de mes */}
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 12 }}>
                {mesesDisponibles.map((ym) => (
                  <button key={ym} className="btn-pill" onClick={() => setMovMes(ym)} style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 99, border: "none", background: movMes === ym ? C.lavanda : C.card, color: movMes === ym ? "#fff" : C.ink, fontWeight: 800, fontSize: 13, cursor: "pointer", boxShadow: movMes === ym ? `0 4px 14px ${C.lavanda}55` : `0 2px 8px ${C.lavanda}10` }}>
                    {monthLabel(ym).split(" ")[0]}
                  </button>
                ))}
              </div>

              {/* Resumen del mes */}
              <div style={{ background: C.card, borderRadius: 20, padding: "14px 16px", marginBottom: 14, display: "flex", boxShadow: `0 4px 16px ${C.lavanda}10` }}>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <p style={{ fontSize: 10, color: C.ink2, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Ingresos</p>
                  <p style={{ fontWeight: 900, fontSize: 17, color: "#1F8C5B", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{fmt(ingMovMes)}</p>
                </div>
                <div style={{ width: 1, background: C.lavandaSoft, margin: "0 8px" }} />
                <div style={{ flex: 1, textAlign: "center" }}>
                  <p style={{ fontSize: 10, color: C.ink2, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Gastos</p>
                  <p style={{ fontWeight: 900, fontSize: 17, color: "#D4587E", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{fmt(gstMovMes)}</p>
                </div>
              </div>

              <p style={{ fontSize: 12, color: C.ink2, marginBottom: 12, fontWeight: 600 }}>{monthLabel(movMes)} · {txsMes.length} {txsMes.length === 1 ? "movimiento" : "movimientos"}</p>

              {txsMes.length === 0 && <p style={{ textAlign: "center", color: C.ink2, marginTop: 40 }}>Sin movimientos este mes 🪴</p>}
              {txsMes.map((tx) => {
                const cat = CAT[tx.cat] || { emoji: "💰", color: C.menta, label: "Ingreso" };
                const mth = mthInfo(tx.method);
                const isCred = tx.method === "credito";
                return (
                  <div key={tx.id} className="tx-row" style={{ background: C.card, borderRadius: 22, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", marginBottom: 10, boxShadow: `0 3px 14px ${C.lavanda}10` }} onClick={() => startEdit(tx)}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${cat.color}26`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{cat.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 800, fontSize: 15, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.desc}</p>
                      <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: C.ink2 }}>{cat.label} · {tx.fecha}</span>
                        <span style={{ fontSize: 10, background: isCred ? `${C.coral}40` : `${C.creme}80`, color: C.ink, borderRadius: 99, padding: "2px 8px", fontWeight: 800 }}>{mth.icon} {mth.label}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <p style={{ fontWeight: 900, fontSize: 16, color: tx.type === "ingreso" ? "#059669" : C.ink, fontVariantNumeric: "tabular-nums" }}>{tx.type === "ingreso" ? "+" : "-"}{fmt(tx.monto)}</p>
                      <button aria-label="Eliminar" onClick={(e) => { e.stopPropagation(); del(tx.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: `${C.ink2}88`, padding: 2, display: "flex" }}>
                        <Icon name="delete" size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── FIJOS ─── */}
          {tab === "Fijos" && (
            <div className="fade-in" style={{ paddingTop: 8 }}>
              <div style={{ background: `${C.lavanda}1F`, borderRadius: 26, padding: "20px 20px", marginBottom: 22, textAlign: "center" }}>
                <p style={{ fontSize: 12, color: C.ink2, fontWeight: 700, marginBottom: 4 }}>Total activos este mes</p>
                <p style={{ fontWeight: 900, fontSize: 40, color: C.coral, fontVariantNumeric: "tabular-nums", letterSpacing: -1 }}>{fmt(totalFijos)}</p>
              </div>
              {activosFijos.length > 0 && <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, letterSpacing: 1.5, textTransform: "uppercase" }}>Activos este mes</p>
                  <p style={{ fontSize: 12, fontWeight: 800, color: C.lavanda }}>{activosFijos.length} {activosFijos.length === 1 ? "servicio" : "servicios"}</p>
                </div>
                {activosFijos.map((f) => <FijoCard key={f.id} f={f} onEdit={() => openFijoModal(f)} onDel={() => delFijo(f.id)} onToggle={() => toggleFijo(f.id)} onPagar={() => pagarCuota(f.id)} />)}
              </>}
              {inactivosFijos.length > 0 && <>
                <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, marginTop: 26 }}>Inactivos / Terminados</p>
                {inactivosFijos.map((f) => <FijoCard key={f.id} f={f} onEdit={() => openFijoModal(f)} onDel={() => delFijo(f.id)} onToggle={() => toggleFijo(f.id)} onPagar={() => pagarCuota(f.id)} />)}
              </>}
              {fijos.length === 0 && <p style={{ textAlign: "center", color: C.ink2, marginTop: 60 }}>Sin gastos fijos 🪴<br /><small>Agregá gym, celular, cuotas...</small></p>}
            </div>
          )}

          {/* ─── PRESUPUESTO ─── */}
          {tab === "Presupuesto" && (
            <div className="fade-in" style={{ paddingTop: 8 }}>
              {/* Resumen total */}
              {(() => {
                const totalBudget = Object.values(budgets).reduce((a, b) => a + (b || 0), 0);
                const totalSpent = CATS.reduce((a, c) => a + spentByCat(c.id), 0);
                const pct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
                const queda = Math.max(totalBudget - totalSpent, 0);
                return (
                  <div style={{ background: C.lavanda, borderRadius: 24, padding: "18px 20px", marginBottom: 18, color: "#fff", boxShadow: `0 10px 28px ${C.lavanda}55` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, opacity: 0.85, textTransform: "uppercase", letterSpacing: 1 }}>Total gastado</p>
                        <p style={{ fontSize: 26, fontWeight: 900, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{fmt(totalSpent)}</p>
                      </div>
                      <span style={{ background: C.mentaSoft, color: "#1F8C5B", borderRadius: 99, padding: "5px 12px", fontSize: 11, fontWeight: 800 }}>queda {fmt(queda)}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,.25)", overflow: "hidden", marginTop: 12 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#fff", borderRadius: 99 }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, opacity: 0.85 }}>
                      <span>$0</span><span>Meta: {fmt(totalBudget)}</span>
                    </div>
                  </div>
                );
              })()}

              <p style={{ fontSize: 13, color: C.ink2, marginBottom: 12, fontWeight: 600 }}>Tocá una categoría para editar el límite</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {CATS.map((c) => {
                  const spent = spentByCat(c.id);
                  const budget = budgets[c.id] || 0;
                  const over = budget > 0 && spent > budget;
                  const editing = budgetEdit === c.id;
                  return (
                    <div key={c.id} style={{ background: C.card, borderRadius: 20, padding: "14px 14px 12px", cursor: "pointer", border: editing ? `2px solid ${C.lavanda}` : "2px solid transparent", boxShadow: `0 4px 14px ${C.lavanda}0E` }} onClick={() => setBudgetEdit(editing ? null : c.id)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${c.color}26`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{c.emoji}</div>
                        <span style={{ fontSize: 9, fontWeight: 800, background: over ? C.coralSoft : budget > 0 ? C.mentaSoft : "#F0F0F8", color: over ? "#D4587E" : budget > 0 ? "#1F8C5B" : C.ink2, borderRadius: 99, padding: "3px 8px" }}>{over ? "⚠️ Excedido" : budget > 0 ? `queda ${fmt(budget - spent)}` : "sin límite"}</span>
                      </div>
                      <p style={{ fontWeight: 800, fontSize: 13, color: C.ink, marginTop: 10 }}>{c.label}</p>
                      <p style={{ fontWeight: 900, fontSize: 15, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{fmt(spent)}</p>
                      <Bar spent={spent} budget={budget} color={c.color} />
                      {editing && (
                        <div style={{ marginTop: 10 }} onClick={(e) => e.stopPropagation()}>
                          <BudgetInput
                            initial={budget}
                            color={c.color}
                            onSave={(n) => { upd({ budgets: { ...budgets, [c.id]: n } }); setBudgetEdit(null); }}
                            onCancel={() => setBudgetEdit(null)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── AJUSTES ─── */}
          {tab === "Ajustes" && (
            <div className="fade-in" style={{ paddingTop: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Perfil</p>
              <div style={{ background: C.card, borderRadius: 20, padding: "16px 18px", marginBottom: 22, boxShadow: `0 4px 14px ${C.lavanda}10` }}>
                <p style={{ fontSize: 12, color: C.ink2, marginBottom: 6, fontWeight: 600 }}>Tu nombre</p>
                <input value={nombre} onChange={(e) => upd({ nombre: e.target.value })} placeholder="¿Cómo te llamás?" style={{ width: "100%", border: "none", background: "transparent", fontSize: 18, fontWeight: 800, color: C.ink, fontFamily: "inherit", padding: 0 }} />
              </div>

              <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Datos</p>
              <div style={{ background: C.card, borderRadius: 20, padding: "16px 18px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12, boxShadow: `0 4px 14px ${C.lavanda}10` }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: C.lavandaSoft, display: "flex", alignItems: "center", justifyContent: "center", color: "#6B46C1" }}><Icon name="upload" size={20} /></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 800, fontSize: 14, color: C.ink }}>Exportar datos</p>
                  <p style={{ fontSize: 11, color: C.ink2, marginTop: 2 }}>Descargá un JSON con toda tu info</p>
                </div>
                <button className="btn-pill" onClick={exportar} style={{ padding: "8px 16px", borderRadius: 99, border: "none", background: C.lavanda, color: "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>Exportar</button>
              </div>

              <div style={{ background: C.card, borderRadius: 20, padding: "16px 18px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12, boxShadow: `0 4px 14px ${C.lavanda}10` }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: C.celesteSoft, display: "flex", alignItems: "center", justifyContent: "center", color: "#1A6BA0" }}><Icon name="download" size={20} /></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 800, fontSize: 14, color: C.ink }}>Importar datos</p>
                  <p style={{ fontSize: 11, color: C.ink2, marginTop: 2 }}>Reemplazá tu info actual con un backup</p>
                </div>
                <button className="btn-pill" onClick={() => fileInputRef.current?.click()} style={{ padding: "8px 16px", borderRadius: 99, border: "none", background: C.celeste, color: "#1A6BA0", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>Importar</button>
                <input ref={fileInputRef} type="file" accept="application/json" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) importar(f); e.target.value = ""; }} />
              </div>

              <div style={{ background: C.card, borderRadius: 20, padding: "16px 18px", marginBottom: 22, display: "flex", alignItems: "center", gap: 12, boxShadow: `0 4px 14px ${C.coral}1A` }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: C.coralSoft, display: "flex", alignItems: "center", justifyContent: "center", color: "#D4587E" }}><Icon name="delete" size={20} /></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 800, fontSize: 14, color: "#D4587E" }}>Borrar todo</p>
                  <p style={{ fontSize: 11, color: C.ink2, marginTop: 2 }}>Esta acción no se puede deshacer</p>
                </div>
                <button className="btn-pill" onClick={borrarTodo} style={{ padding: "8px 16px", borderRadius: 99, border: "none", background: C.coral, color: "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>Borrar</button>
              </div>

              <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Acerca de</p>
              <div style={{ background: C.lavandaSoft, borderRadius: 20, padding: "20px 18px", textAlign: "center" }}>
                <p style={{ fontSize: 32 }}>💜</p>
                <p style={{ fontWeight: 900, fontSize: 16, color: "#6B46C1", marginTop: 4 }}>Mi Billetera v0.2</p>
                <p style={{ fontSize: 12, color: "#6B46C1", marginTop: 2, opacity: 0.85 }}>Hecha para llevar tus gastos de forma simple</p>
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM NAV */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: C.card, borderRadius: "28px 28px 0 0", display: "flex", justifyContent: "space-around", alignItems: "center", paddingTop: 10, paddingBottom: "calc(env(safe-area-inset-bottom) + 10px)", paddingLeft: 8, paddingRight: 8, boxShadow: `0 -8px 30px ${C.lavanda}1A`, zIndex: 100 }}>
          {[
            { id: "Home", icon: "home", label: "Inicio" },
            { id: "Movimientos", icon: "receipt_long", label: "Movim." },
            { id: "Fijos", icon: "calendar_today", label: "Fijos" },
            { id: "Presupuesto", icon: "account_balance_wallet", label: "Presup." },
            { id: "Ajustes", icon: "settings", label: "Ajustes" },
          ].map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className="btn-pill" style={{ background: active ? `${C.lavanda}1A` : "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 10px", borderRadius: 16, color: active ? C.lavanda : C.ink2 }}>
                <Icon name={t.icon} size={22} filled={active} weight={active ? 600 : 400} />
                <span style={{ fontSize: 10, fontWeight: active ? 800 : 600, fontFamily: "inherit" }}>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* FAB */}
        <button aria-label="Agregar gasto" className="btn-pill" onClick={() => openModal("gasto")} style={{ position: "fixed", bottom: "calc(env(safe-area-inset-bottom) + 96px)", right: "max(20px, calc(50% - 215px + 20px))", width: 60, height: 60, borderRadius: "50%", border: "none", background: C.coral, color: "#fff", cursor: "pointer", boxShadow: `0 12px 28px ${C.coral}99`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 101 }}>
          <Icon name="add" size={30} weight={700} />
        </button>

        {/* MODAL GASTO/INGRESO/SUELDO */}
        {showModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(45,36,56,.45)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowModal(false)}>
            <div className="slide-up" style={{ width: "100%", maxWidth: 430, background: C.card, borderRadius: "28px 28px 0 0", padding: "24px 20px calc(env(safe-area-inset-bottom) + 32px)", maxHeight: "92dvh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ width: 44, height: 5, borderRadius: 99, background: C.lavandaSoft, margin: "0 auto 22px" }} />
              <p style={{ fontWeight: 800, fontSize: 19, color: C.ink, marginBottom: 22 }}>{modalType === "ingreso" ? "💰 Agregar ingreso" : modalType === "sueldo" ? "💼 Mi sueldo" : `${editId ? "✏️ Editar" : "➕ Nuevo"} gasto`}</p>
              {modalType === "sueldo" ? (
                <><p style={{ fontSize: 13, color: C.ink2, marginBottom: 10 }}>Actual: <strong style={{ color: C.ink }}>{fmt(sueldo)}</strong></p>
                  <input placeholder="Nuevo sueldo" type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} {...inp()} /></>
              ) : (
                <>
                  <input placeholder="Descripción" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} {...inp()} />
                  <div style={{ display: "flex", gap: 10 }}>
                    <input placeholder="Monto $" type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} {...inp({ style: { flex: 1, marginBottom: 10 } })} />
                    <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} {...inp({ style: { flex: 1, marginBottom: 10, fontSize: 13 } })} />
                  </div>
                  {modalType !== "ingreso" && <>
                    <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Método de pago</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                      {METHODS.map((m) => <button key={m.id} className="btn-pill" onClick={() => setForm({ ...form, method: m.id })} style={{ padding: "9px 14px", borderRadius: 99, border: "none", background: form.method === m.id ? (m.id === "credito" ? C.coral : C.celeste) : C.lavandaSoft, color: form.method === m.id ? (m.id === "credito" ? "#fff" : "#1A6BA0") : C.ink, fontSize: 13, fontWeight: 800 }}>{m.icon} {m.label}</button>)}
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Categoría</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
                      {CATS.map((c) => <button key={c.id} className="btn-pill" onClick={() => setForm({ ...form, cat: c.id })} style={{ padding: "8px 14px", borderRadius: 99, border: "none", background: form.cat === c.id ? `${c.color}22` : C.lavandaSoft, color: form.cat === c.id ? c.color : C.ink, fontSize: 13, fontWeight: 800 }}>{c.emoji} {c.label}</button>)}
                    </div>
                  </>}
                </>
              )}
              <button onClick={submit} style={{ width: "100%", padding: 16, borderRadius: 18, border: "none", background: modalType === "ingreso" ? C.menta : modalType === "sueldo" ? C.creme : C.lavanda, color: modalType === "ingreso" ? "#1F8C5B" : modalType === "sueldo" ? "#B8860B" : "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 8px 20px ${(modalType === "ingreso" ? C.menta : modalType === "sueldo" ? C.creme : C.lavanda)}55` }}>
                {editId ? "Guardar" : modalType === "sueldo" ? "Actualizar sueldo" : modalType === "ingreso" ? "Agregar ingreso" : "Agregar gasto"}
              </button>
            </div>
          </div>
        )}

        {/* MODAL FIJOS */}
        {showFijoModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(45,36,56,.45)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowFijoModal(false)}>
            <div className="slide-up" style={{ width: "100%", maxWidth: 430, background: C.card, borderRadius: "28px 28px 0 0", padding: "24px 20px calc(env(safe-area-inset-bottom) + 32px)", maxHeight: "92dvh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ width: 44, height: 5, borderRadius: 99, background: C.lavandaSoft, margin: "0 auto 22px" }} />
              <p style={{ fontWeight: 800, fontSize: 19, color: C.ink, marginBottom: 22 }}>📌 {editFijoId ? "Editar gasto fijo" : "Nuevo gasto fijo"}</p>
              <input placeholder="Nombre (ej: Gym, Celular, Spotify…)" value={fijoForm.desc} onChange={(e) => setFijoForm({ ...fijoForm, desc: e.target.value })} {...inp()} />
              <input placeholder="Monto mensual / por cuota $" type="number" value={fijoForm.monto} onChange={(e) => setFijoForm({ ...fijoForm, monto: e.target.value })} {...inp()} />
              <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Tipo</p>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                {[{ id: "mensual", label: "🔄 Mensual" }, { id: "cuotas", label: "⏳ Cuotas" }].map((t) => (
                  <button key={t.id} className="btn-pill" onClick={() => setFijoForm({ ...fijoForm, tipo: t.id })} style={{ flex: 1, padding: "12px 8px", borderRadius: 16, border: "none", background: fijoForm.tipo === t.id ? C.lavanda : C.lavandaSoft, color: fijoForm.tipo === t.id ? "#fff" : C.ink, fontSize: 13, fontWeight: 800 }}>{t.label}</button>
                ))}
              </div>
              {fijoForm.tipo === "mensual" && <>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.ink2, marginBottom: 6 }}>¿Hasta cuándo? (vacío = indefinido)</p>
                <input type="month" value={fijoForm.hastaFecha} onChange={(e) => setFijoForm({ ...fijoForm, hastaFecha: e.target.value })} {...inp()} />
              </>}
              {fijoForm.tipo === "cuotas" && <>
                <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Cantidad de cuotas</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                  {[3, 6, 9, 12, 18, 24].map((n) => <button key={n} className="btn-pill" onClick={() => setFijoForm({ ...fijoForm, cuotasTotales: n })} style={{ width: 52, height: 42, borderRadius: 14, border: "none", background: fijoForm.cuotasTotales === n ? C.coral : C.coralSoft, color: fijoForm.cuotasTotales === n ? "#fff" : "#D4587E", fontWeight: 900, fontSize: 13 }}>{n}x</button>)}
                </div>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.ink2, marginBottom: 6 }}>Mes de inicio</p>
                <input type="month" value={fijoForm.desde} onChange={(e) => setFijoForm({ ...fijoForm, desde: e.target.value })} {...inp()} />
              </>}
              <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Método de pago</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                {METHODS.map((m) => <button key={m.id} className="btn-pill" onClick={() => setFijoForm({ ...fijoForm, method: m.id })} style={{ padding: "9px 14px", borderRadius: 99, border: "none", background: fijoForm.method === m.id ? (m.id === "credito" ? C.coral : C.celeste) : C.lavandaSoft, color: fijoForm.method === m.id ? (m.id === "credito" ? "#fff" : "#1A6BA0") : C.ink, fontSize: 13, fontWeight: 800 }}>{m.icon} {m.label}</button>)}
              </div>
              <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Categoría</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
                {CATS.map((c) => <button key={c.id} className="btn-pill" onClick={() => setFijoForm({ ...fijoForm, cat: c.id })} style={{ padding: "8px 14px", borderRadius: 99, border: "none", background: fijoForm.cat === c.id ? `${c.color}22` : C.lavandaSoft, color: fijoForm.cat === c.id ? c.color : C.ink, fontSize: 13, fontWeight: 800 }}>{c.emoji} {c.label}</button>)}
              </div>
              <button onClick={submitFijo} style={{ width: "100%", padding: 16, borderRadius: 18, border: "none", background: C.lavanda, color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 8px 20px ${C.lavanda}55` }}>
                {editFijoId ? "Guardar cambios" : "Agregar gasto fijo"}
              </button>
            </div>
          </div>
        )}

        {/* TOAST con undo opcional */}
        {toast && (
          <div style={{ position: "fixed", bottom: "calc(env(safe-area-inset-bottom) + 110px)", left: "50%", transform: "translateX(-50%)", background: C.ink, color: "#fff", padding: "10px 16px 10px 20px", borderRadius: 99, fontSize: 13, fontWeight: 700, zIndex: 300, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 12, boxShadow: `0 10px 28px rgba(45,36,56,.35)`, animation: toast.undoFn ? "toast 4.5s ease forwards" : "toast 2.2s ease forwards" }}>
            <span>{toast.msg}</span>
            {toast.undoFn && (
              <button onClick={() => { toast.undoFn(); setToast(null); }} style={{ background: C.lavanda, color: "#fff", border: "none", borderRadius: 99, padding: "6px 14px", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Deshacer</button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
