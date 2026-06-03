import { C, CAT } from "../constants";
import { fmt, monthLabel } from "../helpers";
import { Icon } from "../components/Icon";

export function MovimientosView({ mesesDisponibles, movMes, setMovMes, ingMovMes, gstMovMes, txsMes, mthInfo, onEditTx, onDelTx }) {
  return (
    <div className="fade-in" style={{ paddingTop: 8 }}>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 12 }}>
        {mesesDisponibles.map((ym) => (
          <button key={ym} className="btn-pill" onClick={() => setMovMes(ym)} style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 99, border: "none", background: movMes === ym ? C.lavanda : C.card, color: movMes === ym ? "#fff" : C.ink, fontWeight: 800, fontSize: 13, cursor: "pointer", boxShadow: movMes === ym ? `0 4px 14px ${C.lavanda}55` : `0 2px 8px ${C.lavanda}10` }}>
            {monthLabel(ym).split(" ")[0]}
          </button>
        ))}
      </div>

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
          <div key={tx.id} className="tx-row" style={{ background: C.card, borderRadius: 22, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", marginBottom: 10, boxShadow: `0 3px 14px ${C.lavanda}10` }} onClick={() => onEditTx(tx)}>
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
              <button aria-label="Eliminar" onClick={(e) => { e.stopPropagation(); onDelTx(tx.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: `${C.ink2}88`, padding: 2, display: "flex" }}>
                <Icon name="delete" size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
