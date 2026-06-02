import { useState, useEffect, useRef, useCallback } from "react";

// ── storage ────────────────────────────────────────────────────────────────────
const STORE_KEY = "billetera_data_v1";
const saveData = (data) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch(e){} };
const loadData = () => { try { const d = localStorage.getItem(STORE_KEY); return d ? JSON.parse(d) : null; } catch(e){ return null; } };

// ── helpers ────────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n || 0);
const today = () => new Date().toISOString().slice(0, 10);
const currentMonth = () => new Date().toISOString().slice(0, 7);

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
};

// ── logic ──────────────────────────────────────────────────────────────────────
const fijoActivoEsteMes = (f) => {
  if (!f.activo) return false;
  if (f.tipo === "cuotas") {
    if ((f.cuotasTotales - f.cuotasPagadas) <= 0) return false;
    if (f.desde && currentMonth() < f.desde) return false;
    return true;
  }
  if (!f.hastaFecha) return true;
  return currentMonth() <= f.hastaFecha;
};

const isThisMonth = (fecha) => typeof fecha === "string" && fecha.slice(0, 7) === currentMonth();

const cuotaLabel = (f) => {
  const rest = f.cuotasTotales - f.cuotasPagadas;
  return `Cuota ${f.cuotasPagadas + 1}/${f.cuotasTotales} · quedan ${rest}`;
};

// ── components ─────────────────────────────────────────────────────────────────
function AnimNumber({ value, style }) {
  const [disp, setDisp] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const s = prev.current, e = value, dur = 700, t0 = performance.now();
    const step = (now) => {
      const t = Math.min((now - t0) / dur, 1);
      setDisp(Math.round(s + (e - s) * (1 - Math.pow(1 - t, 4))));
      if (t < 1) requestAnimationFrame(step); else prev.current = e;
    };
    requestAnimationFrame(step);
  }, [value]);
  return <span style={style}>{fmt(disp)}</span>;
}

function Bar({ spent, budget, color }) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  return (
    <div style={{ height: 5, borderRadius: 99, background: "#F0F0F0", overflow: "hidden", marginTop: 6 }}>
      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: pct >= 100 ? "#E74C3C" : color, transition: "width 0.6s cubic-bezier(.34,1.56,.64,1)" }} />
    </div>
  );
}

function FijoCard({ f, onEdit, onDel, onToggle, onPagar }) {
  const cat = CAT[f.cat] || CAT["otro"];
  const mth = METHODS.find((m) => m.id === f.method) || METHODS[0];
  const rest = f.tipo === "cuotas" ? f.cuotasTotales - f.cuotasPagadas : null;
  const pctCuota = f.tipo === "cuotas" ? Math.round((f.cuotasPagadas / f.cuotasTotales) * 100) : null;
  const dim = !fijoActivoEsteMes(f);
  return (
    <div style={{ background: dim ? "#F9F9FB" : "#fff", borderRadius: 18, padding: "15px 16px", opacity: dim ? 0.65 : 1, border: dim ? "1.5px dashed #E0E4EF" : "none", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: `${cat.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{cat.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: "#1A1D2E" }}>{f.desc}</p>
          <div style={{ display: "flex", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, background: f.tipo === "cuotas" ? "#FFF0F8" : "#EEF5FF", color: f.tipo === "cuotas" ? "#E91E8C" : "#4A90D9", borderRadius: 6, padding: "1px 8px", fontWeight: 700 }}>
              {f.tipo === "cuotas" ? `⏳ ${cuotaLabel(f)}` : f.hastaFecha ? `🔄 hasta ${f.hastaFecha}` : "🔄 Indefinido"}
            </span>
            <span style={{ fontSize: 10, background: "#F5F5FA", color: "#888", borderRadius: 6, padding: "1px 8px", fontWeight: 700 }}>{mth.icon} {mth.label}</span>
          </div>
          {f.tipo === "cuotas" && (
            <div style={{ marginTop: 6, height: 4, borderRadius: 99, background: "#F0F0F0", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pctCuota}%`, background: "#E91E8C", borderRadius: 99, transition: "width .5s" }} />
            </div>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontWeight: 900, fontSize: 16, color: "#E74C3C", fontFamily: "monospace" }}>-{fmt(f.monto)}</p>
          {f.tipo === "cuotas" && rest > 0 && <p style={{ fontSize: 10, color: "#999", marginTop: 2 }}>quedan {rest}</p>}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12, paddingTop: 10, borderTop: "1px solid #F5F5FA" }}>
        {f.tipo === "cuotas" && rest > 0 && (
          <button onClick={onPagar} style={{ flex: 1, padding: "7px 0", borderRadius: 10, border: "none", background: "#F0FFF4", color: "#27AE60", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>✓ Pagar cuota</button>
        )}
        <button onClick={onEdit} style={{ flex: 1, padding: "7px 0", borderRadius: 10, border: "none", background: "#F5F5FA", color: "#555", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>✏️ Editar</button>
        <button onClick={onToggle} style={{ flex: 1, padding: "7px 0", borderRadius: 10, border: "none", background: f.activo ? "#FFF5EE" : "#F0FFF4", color: f.activo ? "#E8854A" : "#27AE60", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{f.activo ? "⏸ Pausar" : "▶ Activar"}</button>
        <button onClick={onDel} style={{ width: 34, padding: "7px 0", borderRadius: 10, border: "none", background: "#FFF0F0", color: "#E74C3C", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>🗑️</button>
      </div>
    </div>
  );
}

// ── main app ───────────────────────────────────────────────────────────────────
export default function App() {
  const [state, setState] = useState(() => loadData() || INITIAL_STATE);
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

  const { txs, fijos, budgets, sueldo } = state;

  // persist on every change
  useEffect(() => { saveData(state); }, [state]);

  // PWA install prompt
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); setShowInstall(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const upd = useCallback((patch) => setState((s) => ({ ...s, ...patch })), []);

  // totals (mes actual — todo lo que dice "Este mes" debe contar solo el mes en curso)
  const gastosMes = txs.filter((t) => t.type === "gasto" && isThisMonth(t.fecha));
  const ingresosMes = txs.filter((t) => t.type === "ingreso" && isThisMonth(t.fecha));
  const totalFijos = fijos.filter(fijoActivoEsteMes).reduce((a, f) => a + f.monto, 0);
  const totalGastos = gastosMes.reduce((a, t) => a + t.monto, 0) + totalFijos;
  const totalIngresos = ingresosMes.reduce((a, t) => a + t.monto, 0) + sueldo;
  const balance = totalIngresos - totalGastos;

  const spentByCat = (cat) =>
    gastosMes.filter((g) => g.cat === cat).reduce((a, g) => a + g.monto, 0) +
    fijos.filter((f) => f.cat === cat && fijoActivoEsteMes(f)).reduce((a, f) => a + f.monto, 0);

  const top5 = [...CATS].map((c) => ({ ...c, total: spentByCat(c.id) })).filter((c) => c.total > 0).sort((a, b) => b.total - a.total).slice(0, 5);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const openModal = (type) => {
    setModalType(type); setEditId(null);
    setForm({ desc: "", monto: "", cat: "supermercado", fecha: today(), method: "debito" });
    setShowModal(true);
  };

  const submit = () => {
    if (!form.monto) return;
    if (modalType === "sueldo") { upd({ sueldo: Number(form.monto) }); showToast("Sueldo actualizado ✓"); setShowModal(false); return; }
    const base = { ...form, monto: Number(form.monto), id: editId || uid(), type: modalType === "ingreso" ? "ingreso" : "gasto" };
    if (modalType === "ingreso") { base.cat = "ingreso"; base.desc = base.desc || "Ingreso"; }
    if (editId) { upd({ txs: txs.map((x) => (x.id === editId ? base : x)) }); showToast("Actualizado ✓"); }
    else { upd({ txs: [base, ...txs] }); showToast(modalType === "ingreso" ? "Ingreso agregado ✓" : "Gasto agregado ✓"); }
    setShowModal(false);
  };

  const del = (id) => { upd({ txs: txs.filter((x) => x.id !== id) }); showToast("Eliminado"); };

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
    if (!fijoForm.monto || !fijoForm.desc) return;
    const base = { desc: fijoForm.desc, monto: Number(fijoForm.monto), cat: fijoForm.cat, method: fijoForm.method, tipo: fijoForm.tipo, activo: true,
      hastaFecha: fijoForm.tipo === "mensual" ? (fijoForm.hastaFecha || null) : null,
      cuotasTotales: fijoForm.tipo === "cuotas" ? Number(fijoForm.cuotasTotales) : null,
      cuotasPagadas: editFijoId ? (fijos.find(f => f.id === editFijoId)?.cuotasPagadas || 0) : 0,
      desde: fijoForm.tipo === "cuotas" ? fijoForm.desde : null };
    if (editFijoId) { upd({ fijos: fijos.map((x) => x.id === editFijoId ? { ...x, ...base, id: editFijoId } : x) }); showToast("Actualizado ✓"); }
    else { upd({ fijos: [{ ...base, id: uid() }, ...fijos] }); showToast("Gasto fijo agregado ✓"); }
    setShowFijoModal(false);
  };

  const delFijo = (id) => { upd({ fijos: fijos.filter((x) => x.id !== id) }); showToast("Eliminado"); };
  const toggleFijo = (id) => upd({ fijos: fijos.map((x) => x.id === id ? { ...x, activo: !x.activo } : x) });
  const pagarCuota = (id) => { upd({ fijos: fijos.map((x) => x.id === id ? { ...x, cuotasPagadas: Math.min(x.cuotasPagadas + 1, x.cuotasTotales) } : x) }); showToast("Cuota registrada ✓"); };

  const mthInfo = (id) => METHODS.find((m) => m.id === id) || METHODS[0];
  const activosFijos = fijos.filter(fijoActivoEsteMes);
  const inactivosFijos = fijos.filter((f) => !fijoActivoEsteMes(f));

  const installApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") { setShowInstall(false); showToast("¡App instalada! 🎉"); }
    setInstallPrompt(null);
  };

  // ── render ─────────────────────────────────────────────────────────────────
  const inp = (extra = {}) => ({
    style: { width: "100%", border: "1.5px solid #E8E8F0", borderRadius: 14, padding: "13px 16px", fontSize: 15, color: "#1A1D2E", fontFamily: "inherit", background: "#fff", marginBottom: 10, ...extra.style },
    ...extra,
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
        body{background:#F5F6FA;font-family:'Nunito',sans-serif;overscroll-behavior:none;}
        ::-webkit-scrollbar{display:none;}
        input,select,button{font-family:'Nunito',sans-serif;outline:none;}
        .slide-up{animation:slideUp 0.38s cubic-bezier(.34,1.2,.64,1) both;}
        .fade-in{animation:fadeIn 0.28s ease both;}
        @keyframes slideUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes toast{0%{opacity:0;transform:translateY(10px) scale(.9)}15%{opacity:1;transform:none}85%{opacity:1}100%{opacity:0;transform:translateY(-6px)}}
        .tx-row:active{background:#F0F2F8 !important;}
        .btn-pill{transition:all .18s;cursor:pointer;}
        .btn-pill:active{transform:scale(.95);}
        .safe-top{padding-top:env(safe-area-inset-top);}
        .safe-bot{padding-bottom:calc(env(safe-area-inset-bottom) + 16px);}
      `}</style>

      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100dvh", background: "#F5F6FA", position: "relative" }}>

        {/* TOP BAR */}
        <div className="safe-top" style={{ background: "#fff", padding: "16px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 0 rgba(0,0,0,.06)", position: "sticky", top: 0, zIndex: 50 }}>
          <div>
            <p style={{ fontSize: 13, color: "#999", fontWeight: 500 }}>Buenos días 👋</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: "#1A1D2E" }}>Mi Billetera</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => openModal("ingreso")} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: "#EEF5FF", color: "#4A90D9", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            <button onClick={() => openModal("sueldo")}  style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: "#FFF5EE", color: "#E8854A", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>💼</button>
          </div>
        </div>

        {/* INSTALL BANNER */}
        {showInstall && (
          <div style={{ background: "linear-gradient(135deg,#1A1D2E,#3D4580)", margin: "12px 16px 0", borderRadius: 16, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>📲</span>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>Instalá la app</p>
              <p style={{ color: "rgba(255,255,255,.6)", fontSize: 11 }}>Acceso rápido desde tu pantalla de inicio</p>
            </div>
            <button onClick={installApp} style={{ padding: "7px 14px", borderRadius: 10, border: "none", background: "#E8854A", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>Instalar</button>
            <button onClick={() => setShowInstall(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,.5)", fontSize: 18, cursor: "pointer", lineHeight: 1, padding: 0 }}>×</button>
          </div>
        )}

        <div style={{ padding: "0 16px 110px", overflowY: "auto", maxHeight: "calc(100dvh - 68px)" }}>

          {/* ─── HOME ─── */}
          {tab === "Home" && (
            <div className="fade-in">
              {/* Balance */}
              <div style={{ background: "linear-gradient(135deg,#1A1D2E 0%,#2D3154 60%,#3D4580 100%)", borderRadius: 24, padding: "24px 24px 20px", marginTop: 16, position: "relative", overflow: "hidden", boxShadow: "0 8px 32px rgba(26,29,46,.3)" }}>
                <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(74,144,217,.25)" }} />
                <div style={{ position: "absolute", bottom: -20, left: -10, width: 90, height: 90, borderRadius: "50%", background: "rgba(46,204,113,.2)" }} />
                <p style={{ color: "rgba(255,255,255,.55)", fontSize: 13, letterSpacing: 1, textTransform: "uppercase", fontWeight: 600 }}>Balance total</p>
                <AnimNumber value={balance} style={{ display: "block", fontSize: 36, fontWeight: 900, color: "#fff", marginTop: 4, letterSpacing: -1, fontFamily: "monospace" }} />
                <p style={{ color: "rgba(255,255,255,.4)", fontSize: 12, marginTop: 8 }}>Sueldo: {fmt(sueldo)} · Fijos: {fmt(totalFijos)}</p>
              </div>

              {/* Income/Expenses */}
              <div style={{ background: "#1A1D2E", borderRadius: 20, padding: "16px 20px", marginTop: 10, display: "flex", boxShadow: "0 4px 16px rgba(26,29,46,.15)" }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(46,204,113,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#2ECC71" }}>↑</span></div>
                  <div><p style={{ color: "rgba(255,255,255,.5)", fontSize: 11, fontWeight: 600 }}>Ingresos</p><p style={{ color: "#fff", fontWeight: 800, fontSize: 14, fontFamily: "monospace" }}>{fmt(totalIngresos)}</p></div>
                </div>
                <div style={{ width: 1, height: 36, background: "rgba(255,255,255,.1)", margin: "0 16px", alignSelf: "center" }} />
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(231,76,60,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#E74C3C" }}>↓</span></div>
                  <div><p style={{ color: "rgba(255,255,255,.5)", fontSize: 11, fontWeight: 600 }}>Gastos</p><p style={{ color: "#fff", fontWeight: 800, fontSize: 14, fontFamily: "monospace" }}>{fmt(totalGastos)}</p></div>
                </div>
              </div>

              {/* Fijos este mes */}
              {activosFijos.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <p style={{ fontWeight: 800, fontSize: 17, color: "#1A1D2E" }}>📌 Fijos del mes</p>
                    <button onClick={() => setTab("Fijos")} style={{ background: "none", border: "none", color: "#4A90D9", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Ver todo →</button>
                  </div>
                  {activosFijos.slice(0, 3).map((f) => {
                    const cat = CAT[f.cat] || CAT["otro"];
                    return (
                      <div key={f.id} style={{ background: "#fff", borderRadius: 16, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 13, background: `${cat.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{cat.emoji}</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 700, fontSize: 14, color: "#1A1D2E" }}>{f.desc}</p>
                          <span style={{ fontSize: 10, background: f.tipo === "cuotas" ? "#FFF0F8" : "#EEF5FF", color: f.tipo === "cuotas" ? "#E91E8C" : "#4A90D9", borderRadius: 6, padding: "1px 7px", fontWeight: 700 }}>
                            {f.tipo === "cuotas" ? `⏳ ${cuotaLabel(f)}` : "🔄 Mensual"}
                          </span>
                        </div>
                        <p style={{ fontWeight: 800, fontSize: 15, color: "#E74C3C", fontFamily: "monospace", flexShrink: 0 }}>-{fmt(f.monto)}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Top 5 */}
              {top5.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <p style={{ fontWeight: 800, fontSize: 17, color: "#1A1D2E" }}>Top gastos</p>
                    <span style={{ background: "#E8F5E9", color: "#2ECC71", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>Este mes</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6 }}>
                    {top5.map((c, i) => (
                      <div key={c.id} style={{ minWidth: 130, borderRadius: 20, padding: "18px 16px", background: c.color, flexShrink: 0, overflow: "hidden", boxShadow: `0 6px 20px ${c.color}55`, position: "relative" }}>
                        <div style={{ position: "absolute", top: -12, right: -12, width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,.15)" }} />
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 13, marginBottom: 28 }}>{i + 1}</div>
                        <p style={{ color: "rgba(255,255,255,.85)", fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{c.emoji} {c.label}</p>
                        <p style={{ color: "#fff", fontWeight: 900, fontSize: 15, fontFamily: "monospace" }}>{fmt(c.total)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recientes */}
              <div style={{ marginTop: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <p style={{ fontWeight: 800, fontSize: 17, color: "#1A1D2E" }}>Recientes</p>
                  <button onClick={() => setTab("Movimientos")} style={{ background: "none", border: "none", color: "#4A90D9", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Ver todo →</button>
                </div>
                {txs.length === 0 && <p style={{ color: "#bbb", textAlign: "center", padding: 30 }}>Todavía no hay movimientos 🪴<br /><small>Usá el botón + para agregar</small></p>}
                {txs.slice(0, 5).map((tx) => {
                  const cat = CAT[tx.cat] || { emoji: "💰", color: "#2ECC71" };
                  const mth = mthInfo(tx.method);
                  return (
                    <div key={tx.id} className="tx-row" style={{ background: "#fff", borderRadius: 16, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", marginBottom: 8 }} onClick={() => startEdit(tx)}>
                      <div style={{ width: 42, height: 42, borderRadius: 14, background: `${cat.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{cat.emoji}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, color: "#1A1D2E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.desc}</p>
                        <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                          <span style={{ fontSize: 11, color: "#999" }}>{tx.fecha}</span>
                          <span style={{ fontSize: 10, background: tx.method === "credito" ? "#FFF0F8" : "#EEF5FF", color: tx.method === "credito" ? "#E91E8C" : "#4A90D9", borderRadius: 6, padding: "1px 7px", fontWeight: 700 }}>{mth.icon} {mth.label}</span>
                        </div>
                      </div>
                      <p style={{ fontWeight: 800, fontSize: 15, color: tx.type === "ingreso" ? "#2ECC71" : "#1A1D2E", fontFamily: "monospace", flexShrink: 0 }}>{tx.type === "ingreso" ? "+" : "-"}{fmt(tx.monto)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── MOVIMIENTOS ─── */}
          {tab === "Movimientos" && (
            <div className="fade-in">
              <p style={{ fontWeight: 800, fontSize: 20, color: "#1A1D2E", marginTop: 20, marginBottom: 16 }}>Todos los movimientos</p>
              {txs.length === 0 && <p style={{ textAlign: "center", color: "#bbb", marginTop: 60 }}>Sin movimientos 🪴</p>}
              {txs.map((tx) => {
                const cat = CAT[tx.cat] || { emoji: "💰", color: "#2ECC71", label: "Ingreso" };
                const mth = mthInfo(tx.method);
                return (
                  <div key={tx.id} className="tx-row" style={{ background: "#fff", borderRadius: 18, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", marginBottom: 10 }} onClick={() => startEdit(tx)}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: `${cat.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{cat.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: "#1A1D2E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.desc}</p>
                      <div style={{ display: "flex", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: "#999" }}>{cat.label} · {tx.fecha}</span>
                        <span style={{ fontSize: 10, background: tx.method === "credito" ? "#FFF0F8" : "#EEF5FF", color: tx.method === "credito" ? "#E91E8C" : "#4A90D9", borderRadius: 6, padding: "1px 7px", fontWeight: 700 }}>{mth.icon} {mth.label}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontWeight: 800, fontSize: 15, color: tx.type === "ingreso" ? "#2ECC71" : "#E74C3C", fontFamily: "monospace" }}>{tx.type === "ingreso" ? "+" : "-"}{fmt(tx.monto)}</p>
                      <button onClick={(e) => { e.stopPropagation(); del(tx.id); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#ccc", marginTop: 2 }}>🗑️</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── FIJOS ─── */}
          {tab === "Fijos" && (
            <div className="fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 6 }}>
                <p style={{ fontWeight: 800, fontSize: 20, color: "#1A1D2E" }}>📌 Gastos fijos</p>
                <button onClick={() => openFijoModal()} style={{ padding: "8px 16px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#1A1D2E,#3D4580)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>+ Agregar</button>
              </div>
              <p style={{ fontSize: 13, color: "#999", marginBottom: 20 }}>Total activos este mes: <strong style={{ color: "#E74C3C" }}>{fmt(totalFijos)}</strong></p>
              {activosFijos.length > 0 && <>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#AAB0C6", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Activos este mes</p>
                {activosFijos.map((f) => <FijoCard key={f.id} f={f} onEdit={() => openFijoModal(f)} onDel={() => delFijo(f.id)} onToggle={() => toggleFijo(f.id)} onPagar={() => pagarCuota(f.id)} />)}
              </>}
              {inactivosFijos.length > 0 && <>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#AAB0C6", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, marginTop: 20 }}>Inactivos / Terminados</p>
                {inactivosFijos.map((f) => <FijoCard key={f.id} f={f} onEdit={() => openFijoModal(f)} onDel={() => delFijo(f.id)} onToggle={() => toggleFijo(f.id)} onPagar={() => pagarCuota(f.id)} />)}
              </>}
              {fijos.length === 0 && <p style={{ textAlign: "center", color: "#bbb", marginTop: 60 }}>Sin gastos fijos 🪴<br /><small>Agregá gym, celular, cuotas...</small></p>}
            </div>
          )}

          {/* ─── PRESUPUESTO ─── */}
          {tab === "Presupuesto" && (
            <div className="fade-in">
              <p style={{ fontWeight: 800, fontSize: 20, color: "#1A1D2E", marginTop: 20, marginBottom: 6 }}>Presupuesto mensual</p>
              <p style={{ fontSize: 13, color: "#999", marginBottom: 18 }}>Tocá una categoría para editar el límite</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {CATS.map((c) => {
                  const spent = spentByCat(c.id);
                  const budget = budgets[c.id] || 0;
                  const over = budget > 0 && spent > budget;
                  const editing = budgetEdit === c.id;
                  return (
                    <div key={c.id} style={{ background: "#fff", borderRadius: 18, padding: "14px 14px 12px", cursor: "pointer", border: editing ? `2px solid ${c.color}` : "2px solid transparent" }} onClick={() => setBudgetEdit(editing ? null : c.id)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <span style={{ fontSize: 22 }}>{c.emoji}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, background: over ? "#FFE8E8" : "#F0F8FF", color: over ? "#E74C3C" : "#4A90D9", borderRadius: 8, padding: "2px 6px" }}>{over ? "⚠️ Excedido" : budget > 0 ? `queda ${fmt(budget - spent)}` : "sin límite"}</span>
                      </div>
                      <p style={{ fontWeight: 700, fontSize: 13, color: "#1A1D2E", marginTop: 8 }}>{c.label}</p>
                      <p style={{ fontWeight: 900, fontSize: 14, color: "#1A1D2E", fontFamily: "monospace" }}>{fmt(spent)}</p>
                      <Bar spent={spent} budget={budget} color={c.color} />
                      {editing && (
                        <div style={{ marginTop: 10 }} onClick={(e) => e.stopPropagation()}>
                          <input type="number" defaultValue={budget} autoFocus
                            onBlur={(e) => { upd({ budgets: { ...budgets, [c.id]: Number(e.target.value) } }); setBudgetEdit(null); }}
                            style={{ width: "100%", border: `1.5px solid ${c.color}`, borderRadius: 10, padding: "6px 10px", fontSize: 13, fontWeight: 700, color: "#1A1D2E", background: "#FAFAFA", fontFamily: "inherit" }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM NAV */}
        <div className="safe-bot" style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#fff", borderTop: "1px solid #F0F2F8", display: "flex", paddingTop: 10, zIndex: 100 }}>
          {[{ id: "Home", icon: "🏠", label: "Home" }, { id: "Movimientos", icon: "📋", label: "Movim." }, { id: "Fijos", icon: "📌", label: "Fijos" }, { id: "Presupuesto", icon: "🎯", label: "Presup." }].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "0 0 4px" }}>
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              <span style={{ fontSize: 10, fontWeight: tab === t.id ? 800 : 500, color: tab === t.id ? "#1A1D2E" : "#AAB0C6", fontFamily: "inherit" }}>{t.label}</span>
              {tab === t.id && <div style={{ width: 18, height: 3, borderRadius: 99, background: "#1A1D2E" }} />}
            </button>
          ))}
        </div>

        {/* FAB */}
        <button onClick={() => openModal("gasto")} style={{ position: "fixed", bottom: 76, right: "calc(50% - 215px + 16px)", width: 52, height: 52, borderRadius: 16, border: "none", background: "linear-gradient(135deg,#E8854A,#E91E8C)", color: "#fff", fontSize: 24, cursor: "pointer", boxShadow: "0 6px 20px rgba(232,133,74,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 101 }}>+</button>

        {/* MODAL GASTO/INGRESO/SUELDO */}
        {showModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowModal(false)}>
            <div className="slide-up" style={{ width: "100%", maxWidth: 430, background: "#fff", borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", maxHeight: "92dvh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ width: 40, height: 4, borderRadius: 99, background: "#E0E4EF", margin: "0 auto 20px" }} />
              <p style={{ fontWeight: 800, fontSize: 18, color: "#1A1D2E", marginBottom: 20 }}>{modalType === "ingreso" ? "💰 Agregar ingreso" : modalType === "sueldo" ? "💼 Mi sueldo" : `${editId ? "✏️ Editar" : "➕ Nuevo"} gasto`}</p>
              {modalType === "sueldo" ? (
                <><p style={{ fontSize: 13, color: "#999", marginBottom: 8 }}>Actual: <strong>{fmt(sueldo)}</strong></p>
                  <input placeholder="Nuevo sueldo" type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} {...inp()} /></>
              ) : (
                <>
                  <input placeholder="Descripción" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} {...inp()} />
                  <div style={{ display: "flex", gap: 10 }}>
                    <input placeholder="Monto $" type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} {...inp({ style: { flex: 1, marginBottom: 10 } })} />
                    <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} {...inp({ style: { flex: 1, marginBottom: 10, fontSize: 13 } })} />
                  </div>
                  {modalType !== "ingreso" && <>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#999", marginBottom: 8, textTransform: "uppercase", letterSpacing: .8 }}>Método de pago</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                      {METHODS.map((m) => <button key={m.id} className="btn-pill" onClick={() => setForm({ ...form, method: m.id })} style={{ padding: "8px 14px", borderRadius: 12, border: `2px solid ${form.method === m.id ? (m.id === "credito" ? "#E91E8C" : "#4A90D9") : "#E8E8F0"}`, background: form.method === m.id ? (m.id === "credito" ? "#FFF0F8" : "#EEF5FF") : "#fff", color: "#1A1D2E", fontSize: 13, fontWeight: 700 }}>{m.icon} {m.label}</button>)}
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#999", marginBottom: 8, textTransform: "uppercase", letterSpacing: .8 }}>Categoría</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                      {CATS.map((c) => <button key={c.id} className="btn-pill" onClick={() => setForm({ ...form, cat: c.id })} style={{ padding: "7px 14px", borderRadius: 12, border: `2px solid ${form.cat === c.id ? c.color : "#E8E8F0"}`, background: form.cat === c.id ? `${c.color}18` : "#fff", color: form.cat === c.id ? c.color : "#555", fontSize: 13, fontWeight: 700 }}>{c.emoji} {c.label}</button>)}
                    </div>
                  </>}
                </>
              )}
              <button onClick={submit} style={{ width: "100%", padding: 15, borderRadius: 16, border: "none", background: modalType === "ingreso" ? "linear-gradient(135deg,#2ECC71,#1ABC9C)" : modalType === "sueldo" ? "linear-gradient(135deg,#E8854A,#F39C12)" : "linear-gradient(135deg,#1A1D2E,#3D4580)", color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                {editId ? "Guardar" : modalType === "sueldo" ? "Actualizar sueldo" : modalType === "ingreso" ? "Agregar ingreso" : "Agregar gasto"}
              </button>
            </div>
          </div>
        )}

        {/* MODAL FIJOS */}
        {showFijoModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowFijoModal(false)}>
            <div className="slide-up" style={{ width: "100%", maxWidth: 430, background: "#fff", borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", maxHeight: "92dvh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ width: 40, height: 4, borderRadius: 99, background: "#E0E4EF", margin: "0 auto 20px" }} />
              <p style={{ fontWeight: 800, fontSize: 18, color: "#1A1D2E", marginBottom: 20 }}>📌 {editFijoId ? "Editar gasto fijo" : "Nuevo gasto fijo"}</p>
              <input placeholder="Nombre (ej: Gym, Celular, Spotify…)" value={fijoForm.desc} onChange={(e) => setFijoForm({ ...fijoForm, desc: e.target.value })} {...inp()} />
              <input placeholder="Monto mensual / por cuota $" type="number" value={fijoForm.monto} onChange={(e) => setFijoForm({ ...fijoForm, monto: e.target.value })} {...inp()} />
              <p style={{ fontSize: 12, fontWeight: 700, color: "#999", marginBottom: 8, textTransform: "uppercase", letterSpacing: .8 }}>Tipo</p>
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                {[{ id: "mensual", label: "🔄 Mensual" }, { id: "cuotas", label: "⏳ Cuotas" }].map((t) => (
                  <button key={t.id} className="btn-pill" onClick={() => setFijoForm({ ...fijoForm, tipo: t.id })} style={{ flex: 1, padding: "10px 8px", borderRadius: 12, border: `2px solid ${fijoForm.tipo === t.id ? "#1A1D2E" : "#E8E8F0"}`, background: fijoForm.tipo === t.id ? "#1A1D2E" : "#fff", color: fijoForm.tipo === t.id ? "#fff" : "#555", fontSize: 13, fontWeight: 700 }}>{t.label}</button>
                ))}
              </div>
              {fijoForm.tipo === "mensual" && <>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#999", marginBottom: 6 }}>¿Hasta cuándo? (vacío = indefinido)</p>
                <input type="month" value={fijoForm.hastaFecha} onChange={(e) => setFijoForm({ ...fijoForm, hastaFecha: e.target.value })} {...inp()} />
              </>}
              {fijoForm.tipo === "cuotas" && <>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#999", marginBottom: 8, textTransform: "uppercase", letterSpacing: .8 }}>Cantidad de cuotas</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  {[3, 6, 9, 12, 18, 24].map((n) => <button key={n} className="btn-pill" onClick={() => setFijoForm({ ...fijoForm, cuotasTotales: n })} style={{ width: 48, height: 40, borderRadius: 12, border: `2px solid ${fijoForm.cuotasTotales === n ? "#E91E8C" : "#E8E8F0"}`, background: fijoForm.cuotasTotales === n ? "#FFF0F8" : "#fff", color: "#1A1D2E", fontWeight: 800, fontSize: 13 }}>{n}x</button>)}
                </div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#999", marginBottom: 6 }}>Mes de inicio</p>
                <input type="month" value={fijoForm.desde} onChange={(e) => setFijoForm({ ...fijoForm, desde: e.target.value })} {...inp()} />
              </>}
              <p style={{ fontSize: 12, fontWeight: 700, color: "#999", marginBottom: 8, textTransform: "uppercase", letterSpacing: .8 }}>Método de pago</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {METHODS.map((m) => <button key={m.id} className="btn-pill" onClick={() => setFijoForm({ ...fijoForm, method: m.id })} style={{ padding: "8px 14px", borderRadius: 12, border: `2px solid ${fijoForm.method === m.id ? (m.id === "credito" ? "#E91E8C" : "#4A90D9") : "#E8E8F0"}`, background: fijoForm.method === m.id ? (m.id === "credito" ? "#FFF0F8" : "#EEF5FF") : "#fff", color: "#1A1D2E", fontSize: 13, fontWeight: 700 }}>{m.icon} {m.label}</button>)}
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#999", marginBottom: 8, textTransform: "uppercase", letterSpacing: .8 }}>Categoría</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {CATS.map((c) => <button key={c.id} className="btn-pill" onClick={() => setFijoForm({ ...fijoForm, cat: c.id })} style={{ padding: "7px 14px", borderRadius: 12, border: `2px solid ${fijoForm.cat === c.id ? c.color : "#E8E8F0"}`, background: fijoForm.cat === c.id ? `${c.color}18` : "#fff", color: fijoForm.cat === c.id ? c.color : "#555", fontSize: 13, fontWeight: 700 }}>{c.emoji} {c.label}</button>)}
              </div>
              <button onClick={submitFijo} style={{ width: "100%", padding: 15, borderRadius: 16, border: "none", background: "linear-gradient(135deg,#1A1D2E,#3D4580)", color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                {editFijoId ? "Guardar cambios" : "Agregar gasto fijo"}
              </button>
            </div>
          </div>
        )}

        {toast && <div style={{ position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)", background: "#1A1D2E", color: "#fff", padding: "10px 24px", borderRadius: 24, fontSize: 13, fontWeight: 700, zIndex: 300, whiteSpace: "nowrap", animation: "toast 2.2s ease forwards" }}>{toast}</div>}
      </div>
    </>
  );
}
