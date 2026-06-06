import { C, CURRENCIES, AHORRO_COLORS } from "../constants";
import { ModalSheet } from "./ModalSheet";

const inp = (extra = {}) => ({
  style: { width: "100%", border: `1.5px solid ${C.hojaSoft}`, borderRadius: 16, padding: "14px 16px", fontSize: 15, color: C.ink, fontFamily: "inherit", background: C.card, marginBottom: 10, ...extra.style },
  ...extra,
});

const S = {
  labelMicro: { fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
  pillRow: { display: "flex", gap: 8, marginBottom: 16 },
  colorRow: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 },
  submit: { width: "100%", padding: 16, borderRadius: 18, border: "none", background: C.hoja, color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 8px 20px ${C.hoja}66` },
};

export function AhorroModal({ ahorroForm, setAhorroForm, editAhorroId, onSubmit, onClose }) {
  const selectedColor = ahorroForm.color || AHORRO_COLORS[0];
  const title = `🐷 ${editAhorroId ? "Editar meta" : "Nueva meta de ahorro"}`;
  return (
    <ModalSheet title={title} onClose={onClose}>
      <input placeholder="Nombre (ej: Vacaciones, Auto, Notebook…)" value={ahorroForm.nombre} onChange={(e) => setAhorroForm({ ...ahorroForm, nombre: e.target.value })} {...inp()} />
      <input placeholder="Meta total $" type="number" value={ahorroForm.meta} onChange={(e) => setAhorroForm({ ...ahorroForm, meta: e.target.value })} {...inp()} />
      <p style={S.labelMicro}>Moneda</p>
      <div style={S.pillRow}>
        {CURRENCIES.map((cur) => {
          const active = (ahorroForm.currency || "ARS") === cur.id;
          return (
            <button key={cur.id} className="btn-pill" onClick={() => setAhorroForm({ ...ahorroForm, currency: cur.id })} style={{ flex: 1, padding: "10px 14px", borderRadius: 99, border: "none", background: active ? C.hoja : C.hojaSoft, color: active ? "#fff" : C.ink, fontSize: 13, fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>{cur.symbol} {cur.id}</button>
          );
        })}
      </div>
      <p style={S.labelMicro}>Emoji</p>
      <input placeholder="🐷" maxLength={4} value={ahorroForm.emoji} onChange={(e) => setAhorroForm({ ...ahorroForm, emoji: e.target.value })} {...inp({ style: { textAlign: "center", fontSize: 22 } })} />
      <p style={S.labelMicro}>Color</p>
      <div style={S.colorRow}>
        {AHORRO_COLORS.map((col) => {
          const active = selectedColor === col;
          return (
            <button key={col} aria-label={`Color ${col}`} onClick={() => setAhorroForm({ ...ahorroForm, color: col })} style={{ width: 38, height: 38, borderRadius: "50%", border: active ? `3px solid ${C.ink}` : `3px solid ${C.card}`, background: col, cursor: "pointer", boxShadow: `0 2px 8px ${col}66`, padding: 0, fontFamily: "inherit" }} />
          );
        })}
      </div>
      <button onClick={onSubmit} style={S.submit}>
        {editAhorroId ? "Guardar cambios" : "Crear meta"}
      </button>
    </ModalSheet>
  );
}
