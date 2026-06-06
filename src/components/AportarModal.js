import { useState } from "react";
import { C } from "../constants";
import { today } from "../helpers";

export function AportarModal({ ahorro, onConfirm, onClose }) {
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(today());
  const num = Number(monto);
  const valid = Number.isFinite(num) && num > 0;
  const confirm = () => {
    if (!valid) return;
    onConfirm(num, fecha);
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(26,61,42,.55)", zIndex: 250, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div className="fade-in" style={{ width: "100%", maxWidth: 360, background: C.card, borderRadius: 26, padding: "24px 22px" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <p style={{ fontWeight: 800, fontSize: 17, color: C.ink }}>{ahorro.emoji} Aportar a {ahorro.nombre}</p>
          <button onClick={onClose} aria-label="Cerrar" style={{ border: "none", background: "transparent", color: C.ink2, fontSize: 20, cursor: "pointer", padding: 4, fontFamily: "inherit", lineHeight: 1 }}>✕</button>
        </div>
        <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Monto ({ahorro.currency || "ARS"})</p>
        <input autoFocus type="number" placeholder="0" value={monto} onChange={(e) => setMonto(e.target.value)} style={{ width: "100%", border: `1.5px solid ${C.hojaSoft}`, borderRadius: 16, padding: "14px 16px", fontSize: 18, color: C.ink, fontFamily: "inherit", background: C.card, marginBottom: 12, fontWeight: 800 }} />
        <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Fecha</p>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ width: "100%", border: `1.5px solid ${C.hojaSoft}`, borderRadius: 16, padding: "14px 16px", fontSize: 14, color: C.ink, fontFamily: "inherit", background: C.card, marginBottom: 16 }} />
        <button onClick={confirm} disabled={!valid} style={{ width: "100%", padding: 14, borderRadius: 16, border: "none", background: ahorro.color, color: "#fff", fontSize: 15, fontWeight: 800, cursor: valid ? "pointer" : "not-allowed", fontFamily: "inherit", boxShadow: valid ? `0 6px 16px ${ahorro.color}66` : "none", opacity: valid ? 1 : 0.5 }}>
          Confirmar aporte
        </button>
      </div>
    </div>
  );
}
