import { C, CATS, METHODS } from "../constants";

const inp = (extra = {}) => ({
  style: { width: "100%", border: `1.5px solid ${C.lavandaSoft}`, borderRadius: 16, padding: "14px 16px", fontSize: 15, color: C.ink, fontFamily: "inherit", background: C.card, marginBottom: 10, ...extra.style },
  ...extra,
});

export function FijoModal({ fijoForm, setFijoForm, editFijoId, onSubmit, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(45,36,56,.45)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div className="slide-up" style={{ width: "100%", maxWidth: 430, background: C.card, borderRadius: "28px 28px 0 0", padding: "24px 20px calc(env(safe-area-inset-bottom) + 32px)", maxHeight: "92dvh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ width: 44, height: 5, borderRadius: 99, background: C.lavandaSoft, margin: "0 auto 22px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <p style={{ fontWeight: 800, fontSize: 19, color: C.ink }}>📌 {editFijoId ? "Editar gasto fijo" : "Nuevo gasto fijo"}</p>
          <button onClick={onClose} aria-label="Cerrar" style={{ border: "none", background: "transparent", color: C.ink2, fontSize: 22, cursor: "pointer", padding: 4, aspectRatio: "1 / 1", fontFamily: "inherit", lineHeight: 1 }}>✕</button>
        </div>
        <input placeholder="Nombre (ej: Gym, Celular, Spotify…)" value={fijoForm.desc} onChange={(e) => setFijoForm({ ...fijoForm, desc: e.target.value })} {...inp()} />
        <input placeholder="Monto mensual / por cuota $" type="number" value={fijoForm.monto} onChange={(e) => setFijoForm({ ...fijoForm, monto: e.target.value })} {...inp()} />
        <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Tipo</p>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {[{ id: "mensual", label: "🔄 Mensual" }, { id: "cuotas", label: "⏳ Cuotas" }].map((t) => (
            <button key={t.id} className="btn-pill" onClick={() => setFijoForm({ ...fijoForm, tipo: t.id })} style={{ flex: 1, padding: "12px 8px", borderRadius: 16, border: "none", background: fijoForm.tipo === t.id ? C.lavanda : C.lavandaSoft, color: fijoForm.tipo === t.id ? "#fff" : C.ink, fontSize: 13, fontWeight: 800 }}>{t.label}</button>
          ))}
        </div>
        <div style={{ minHeight: 150 }}>
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
        </div>
        <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Método de pago</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {METHODS.map((m) => <button key={m.id} className="btn-pill" onClick={() => setFijoForm({ ...fijoForm, method: m.id })} style={{ padding: "9px 14px", borderRadius: 99, border: "none", background: fijoForm.method === m.id ? (m.id === "credito" ? C.coral : C.celeste) : C.lavandaSoft, color: fijoForm.method === m.id ? (m.id === "credito" ? "#fff" : "#1A6BA0") : C.ink, fontSize: 13, fontWeight: 800 }}>{m.icon} {m.label}</button>)}
        </div>
        <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Categoría</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
          {CATS.map((c) => <button key={c.id} className="btn-pill" onClick={() => setFijoForm({ ...fijoForm, cat: c.id })} style={{ padding: "8px 14px", borderRadius: 99, border: "none", background: fijoForm.cat === c.id ? `${c.color}22` : C.lavandaSoft, color: fijoForm.cat === c.id ? c.color : C.ink, fontSize: 13, fontWeight: 800 }}>{c.emoji} {c.label}</button>)}
        </div>
        <button onClick={onSubmit} style={{ width: "100%", padding: 16, borderRadius: 18, border: "none", background: C.lavanda, color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 8px 20px ${C.lavanda}55` }}>
          {editFijoId ? "Guardar cambios" : "Agregar gasto fijo"}
        </button>
      </div>
    </div>
  );
}
