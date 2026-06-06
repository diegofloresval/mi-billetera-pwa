import { C, CURRENCIES, AHORRO_COLORS } from "../constants";

const inp = (extra = {}) => ({
  style: { width: "100%", border: `1.5px solid ${C.hojaSoft}`, borderRadius: 16, padding: "14px 16px", fontSize: 15, color: C.ink, fontFamily: "inherit", background: C.card, marginBottom: 10, ...extra.style },
  ...extra,
});

export function AhorroModal({ ahorroForm, setAhorroForm, editAhorroId, onSubmit, onClose }) {
  const currentColor = ahorroForm.color || AHORRO_COLORS[0];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(26,61,42,.55)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div className="slide-up" style={{ width: "100%", maxWidth: 430, background: C.card, borderRadius: "28px 28px 0 0", padding: "24px 20px calc(env(safe-area-inset-bottom) + 32px)", maxHeight: "92dvh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ width: 44, height: 5, borderRadius: 99, background: C.hojaSoft, margin: "0 auto 22px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <p style={{ fontWeight: 800, fontSize: 19, color: C.ink }}>🐷 {editAhorroId ? "Editar meta" : "Nueva meta de ahorro"}</p>
          <button onClick={onClose} aria-label="Cerrar" style={{ border: "none", background: "transparent", color: C.ink2, fontSize: 22, cursor: "pointer", padding: 4, aspectRatio: "1 / 1", fontFamily: "inherit", lineHeight: 1 }}>✕</button>
        </div>
        <input placeholder="Nombre (ej: Vacaciones, Auto, Notebook…)" value={ahorroForm.nombre} onChange={(e) => setAhorroForm({ ...ahorroForm, nombre: e.target.value })} {...inp()} />
        <input placeholder="Meta total $" type="number" value={ahorroForm.meta} onChange={(e) => setAhorroForm({ ...ahorroForm, meta: e.target.value })} {...inp()} />
        <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Moneda</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {CURRENCIES.map((cur) => {
            const active = (ahorroForm.currency || "ARS") === cur.id;
            return (
              <button key={cur.id} className="btn-pill" onClick={() => setAhorroForm({ ...ahorroForm, currency: cur.id })} style={{ flex: 1, padding: "10px 14px", borderRadius: 99, border: "none", background: active ? C.hoja : C.hojaSoft, color: active ? "#fff" : C.ink, fontSize: 13, fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>{cur.symbol} {cur.id}</button>
            );
          })}
        </div>
        <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Emoji</p>
        <input placeholder="🐷" maxLength={4} value={ahorroForm.emoji} onChange={(e) => setAhorroForm({ ...ahorroForm, emoji: e.target.value })} {...inp({ style: { textAlign: "center", fontSize: 22 } })} />
        <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Color</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
          {AHORRO_COLORS.map((col) => {
            const active = currentColor === col;
            return (
              <button key={col} aria-label={`Color ${col}`} onClick={() => setAhorroForm({ ...ahorroForm, color: col })} style={{ width: 38, height: 38, borderRadius: "50%", border: active ? `3px solid ${C.ink}` : `3px solid ${C.card}`, background: col, cursor: "pointer", boxShadow: `0 2px 8px ${col}66`, padding: 0, fontFamily: "inherit" }} />
            );
          })}
        </div>
        <button onClick={onSubmit} style={{ width: "100%", padding: 16, borderRadius: 18, border: "none", background: C.hoja, color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 8px 20px ${C.hoja}66` }}>
          {editAhorroId ? "Guardar cambios" : "Crear meta"}
        </button>
      </div>
    </div>
  );
}
