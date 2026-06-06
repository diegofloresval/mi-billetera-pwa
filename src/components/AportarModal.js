import { useState } from "react";
import { C } from "../constants";
import { today } from "../helpers";

const S = {
  overlay: { position: "fixed", inset: 0, background: "rgba(26,61,42,.55)", zIndex: 250, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  dialog: { width: "100%", maxWidth: 360, background: C.card, borderRadius: 26, padding: "24px 22px" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  title: { fontWeight: 800, fontSize: 17, color: C.ink },
  close: { border: "none", background: "transparent", color: C.ink2, fontSize: 20, cursor: "pointer", padding: 4, fontFamily: "inherit", lineHeight: 1 },
  labelMicro: { fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
  inputBase: { width: "100%", border: `1.5px solid ${C.hojaSoft}`, borderRadius: 16, padding: "14px 16px", color: C.ink, fontFamily: "inherit", background: C.card },
  inputMonto: { fontSize: 18, marginBottom: 12, fontWeight: 800 },
  inputFecha: { fontSize: 14, marginBottom: 16 },
};

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
    <div style={S.overlay} onClick={onClose}>
      <div className="fade-in" style={S.dialog} onClick={(e) => e.stopPropagation()}>
        <div style={S.header}>
          <p style={S.title}>{ahorro.emoji} Aportar a {ahorro.nombre}</p>
          <button onClick={onClose} aria-label="Cerrar" style={S.close}>✕</button>
        </div>
        <p style={S.labelMicro}>Monto ({ahorro.currency || "ARS"})</p>
        <input autoFocus type="number" placeholder="0" value={monto} onChange={(e) => setMonto(e.target.value)} style={{ ...S.inputBase, ...S.inputMonto }} />
        <p style={S.labelMicro}>Fecha</p>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ ...S.inputBase, ...S.inputFecha }} />
        <button onClick={confirm} disabled={!valid} style={{ width: "100%", padding: 14, borderRadius: 16, border: "none", background: ahorro.color, color: C.inkOnHoja, fontSize: 15, fontWeight: 800, cursor: valid ? "pointer" : "not-allowed", fontFamily: "inherit", boxShadow: valid ? `0 6px 16px ${ahorro.color}66` : "none", opacity: valid ? 1 : 0.5 }}>
          Confirmar aporte
        </button>
      </div>
    </div>
  );
}
