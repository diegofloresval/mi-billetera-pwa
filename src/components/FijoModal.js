import { C, CATS, METHODS, CURRENCIES } from "../constants";
import { ModalSheet } from "./ModalSheet";

const inp = (extra = {}) => ({
  style: { width: "100%", border: `1.5px solid ${C.hojaSoft}`, borderRadius: 16, padding: "14px 16px", fontSize: 15, color: C.ink, fontFamily: "inherit", background: C.card, marginBottom: 10, ...extra.style },
  ...extra,
});

const S = {
  labelMicro: { fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
  labelSmall: { fontSize: 12, fontWeight: 700, color: C.ink2, marginBottom: 6 },
  pillRow: { display: "flex", gap: 8, marginBottom: 16 },
  pillRowWrap: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 },
  typeRow: { display: "flex", gap: 10, marginBottom: 16 },
  variantBox: { minHeight: 150 },
  cuotasGrid: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 },
  catGrid: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 },
  submit: { width: "100%", padding: 16, borderRadius: 18, border: "none", background: C.hoja, color: C.inkOnHoja, fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 8px 20px ${C.hoja}66` },
};

const TIPOS = [{ id: "mensual", label: "🔄 Mensual" }, { id: "cuotas", label: "⏳ Cuotas" }];
const CUOTAS_OPS = [3, 6, 9, 12, 18, 24];

export function FijoModal({ fijoForm, setFijoForm, editFijoId, customCats = [], onSubmit, onClose }) {
  const allCats = [...CATS, ...customCats];
  const title = `📌 ${editFijoId ? "Editar gasto fijo" : "Nuevo gasto fijo"}`;
  return (
    <ModalSheet title={title} onClose={onClose}>
      <input aria-label="Nombre" placeholder="Nombre (ej: Gym, Celular, Spotify…)" value={fijoForm.desc} onChange={(e) => setFijoForm({ ...fijoForm, desc: e.target.value })} {...inp()} />
      <input aria-label="Monto" placeholder="Monto mensual / por cuota $" type="number" value={fijoForm.monto} onChange={(e) => setFijoForm({ ...fijoForm, monto: e.target.value })} {...inp()} />
      <p style={S.labelMicro}>Moneda</p>
      <div style={S.pillRow}>
        {CURRENCIES.map((cur) => {
          const active = (fijoForm.currency || "ARS") === cur.id;
          return (
            <button key={cur.id} className="btn-pill" onClick={() => setFijoForm({ ...fijoForm, currency: cur.id })} style={{ flex: 1, padding: "10px 14px", borderRadius: 99, border: "none", background: active ? C.hoja : C.hojaSoft, color: active ? C.inkOnHoja : C.ink, fontSize: 13, fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>{cur.symbol} {cur.id}</button>
          );
        })}
      </div>
      <p style={S.labelMicro}>Tipo</p>
      <div style={S.typeRow}>
        {TIPOS.map((t) => (
          <button key={t.id} className="btn-pill" onClick={() => setFijoForm({ ...fijoForm, tipo: t.id })} style={{ flex: 1, padding: "12px 8px", borderRadius: 16, border: "none", background: fijoForm.tipo === t.id ? C.hoja : C.hojaSoft, color: fijoForm.tipo === t.id ? C.inkOnHoja : C.ink, fontSize: 13, fontWeight: 800 }}>{t.label}</button>
        ))}
      </div>
      <div style={S.variantBox}>
        {fijoForm.tipo === "mensual" && <>
          <label htmlFor="fijo-hasta" style={S.labelSmall}>¿Hasta cuándo? (vacío = indefinido)</label>
          <input id="fijo-hasta" aria-label="Hasta cuándo" type="month" value={fijoForm.hastaFecha} onChange={(e) => setFijoForm({ ...fijoForm, hastaFecha: e.target.value })} {...inp()} />
        </>}
        {fijoForm.tipo === "cuotas" && <>
          <p style={S.labelMicro}>Cantidad de cuotas</p>
          <div style={S.cuotasGrid}>
            {CUOTAS_OPS.map((n) => <button key={n} className="btn-pill" onClick={() => setFijoForm({ ...fijoForm, cuotasTotales: n })} style={{ width: 52, height: 42, borderRadius: 14, border: "none", background: fijoForm.cuotasTotales === n ? C.menta : C.hojaSoft, color: C.inkOnHoja, fontWeight: 900, fontSize: 13 }}>{n}x</button>)}
          </div>
          <label htmlFor="fijo-desde" style={S.labelSmall}>Mes de inicio</label>
          <input id="fijo-desde" aria-label="Mes de inicio" type="month" value={fijoForm.desde} onChange={(e) => setFijoForm({ ...fijoForm, desde: e.target.value })} {...inp()} />
        </>}
      </div>
      <p style={S.labelMicro}>Método de pago</p>
      <div style={S.pillRowWrap}>
        {METHODS.map((m) => <button key={m.id} className="btn-pill" onClick={() => setFijoForm({ ...fijoForm, method: m.id })} style={{ padding: "9px 14px", borderRadius: 99, border: "none", background: fijoForm.method === m.id ? (m.id === "credito" ? C.coral : C.hoja) : C.hojaSoft, color: fijoForm.method === m.id ? (m.id === "credito" ? C.inkDanger : C.inkOnHoja) : C.ink, fontSize: 13, fontWeight: 800 }}>{m.icon} {m.label}</button>)}
      </div>
      <p style={S.labelMicro}>Categoría</p>
      <div style={S.catGrid}>
        {allCats.map((c) => {
          const active = fijoForm.cat === c.id;
          return (
            <button key={c.id} className="btn-pill" aria-pressed={active} onClick={() => setFijoForm({ ...fijoForm, cat: c.id })} style={{ padding: "8px 14px", borderRadius: 99, border: "none", background: active ? C.menta : C.hojaSoft, color: C.ink, fontSize: 13, fontWeight: active ? 900 : 700 }}>{active ? "✓ " : ""}{c.emoji} {c.label}</button>
          );
        })}
      </div>
      <button onClick={onSubmit} style={S.submit}>
        {editFijoId ? "Guardar cambios" : "Agregar gasto fijo"}
      </button>
    </ModalSheet>
  );
}
