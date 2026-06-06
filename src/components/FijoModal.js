import { C, CATS, METHODS, CURRENCIES } from "../constants";
import { ModalSheet } from "./ModalSheet";

const inp = (extra = {}) => ({
  style: { width: "100%", border: `1.5px solid ${C.hojaSoft}`, borderRadius: 16, padding: "14px 16px", fontSize: 15, color: C.ink, fontFamily: "inherit", background: C.card, marginBottom: 10, ...extra.style },
  ...extra,
});

export function FijoModal({ fijoForm, setFijoForm, editFijoId, customCats = [], onSubmit, onClose }) {
  const allCats = [...CATS, ...customCats];
  const title = `📌 ${editFijoId ? "Editar gasto fijo" : "Nuevo gasto fijo"}`;
  return (
    <ModalSheet title={title} onClose={onClose}>
      <input placeholder="Nombre (ej: Gym, Celular, Spotify…)" value={fijoForm.desc} onChange={(e) => setFijoForm({ ...fijoForm, desc: e.target.value })} {...inp()} />
      <input placeholder="Monto mensual / por cuota $" type="number" value={fijoForm.monto} onChange={(e) => setFijoForm({ ...fijoForm, monto: e.target.value })} {...inp()} />
      <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Moneda</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {CURRENCIES.map((cur) => {
          const active = (fijoForm.currency || "ARS") === cur.id;
          return (
            <button key={cur.id} className="btn-pill" onClick={() => setFijoForm({ ...fijoForm, currency: cur.id })} style={{ flex: 1, padding: "10px 14px", borderRadius: 99, border: "none", background: active ? C.hoja : C.hojaSoft, color: active ? "#fff" : C.ink, fontSize: 13, fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>{cur.symbol} {cur.id}</button>
          );
        })}
      </div>
      <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Tipo</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {[{ id: "mensual", label: "🔄 Mensual" }, { id: "cuotas", label: "⏳ Cuotas" }].map((t) => (
          <button key={t.id} className="btn-pill" onClick={() => setFijoForm({ ...fijoForm, tipo: t.id })} style={{ flex: 1, padding: "12px 8px", borderRadius: 16, border: "none", background: fijoForm.tipo === t.id ? C.hoja : C.hojaSoft, color: fijoForm.tipo === t.id ? "#fff" : C.ink, fontSize: 13, fontWeight: 800 }}>{t.label}</button>
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
            {[3, 6, 9, 12, 18, 24].map((n) => <button key={n} className="btn-pill" onClick={() => setFijoForm({ ...fijoForm, cuotasTotales: n })} style={{ width: 52, height: 42, borderRadius: 14, border: "none", background: fijoForm.cuotasTotales === n ? C.coral : C.coralSoft, color: fijoForm.cuotasTotales === n ? "#fff" : C.inkDanger, fontWeight: 900, fontSize: 13 }}>{n}x</button>)}
          </div>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.ink2, marginBottom: 6 }}>Mes de inicio</p>
          <input type="month" value={fijoForm.desde} onChange={(e) => setFijoForm({ ...fijoForm, desde: e.target.value })} {...inp()} />
        </>}
      </div>
      <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Método de pago</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {METHODS.map((m) => <button key={m.id} className="btn-pill" onClick={() => setFijoForm({ ...fijoForm, method: m.id })} style={{ padding: "9px 14px", borderRadius: 99, border: "none", background: fijoForm.method === m.id ? (m.id === "credito" ? C.coral : C.hoja) : C.hojaSoft, color: fijoForm.method === m.id ? "#fff" : C.ink, fontSize: 13, fontWeight: 800 }}>{m.icon} {m.label}</button>)}
      </div>
      <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Categoría</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
        {allCats.map((c) => <button key={c.id} className="btn-pill" onClick={() => setFijoForm({ ...fijoForm, cat: c.id })} style={{ padding: "8px 14px", borderRadius: 99, border: "none", background: fijoForm.cat === c.id ? C.menta : C.hojaSoft, color: C.ink, fontSize: 13, fontWeight: 800 }}>{c.emoji} {c.label}</button>)}
      </div>
      <button onClick={onSubmit} style={{ width: "100%", padding: 16, borderRadius: 18, border: "none", background: C.hoja, color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 8px 20px ${C.hoja}66` }}>
        {editFijoId ? "Guardar cambios" : "Agregar gasto fijo"}
      </button>
    </ModalSheet>
  );
}
