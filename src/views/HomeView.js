import { C, CAT } from "../constants";
import { fmt, cuotaLabel } from "../helpers";
import { Icon } from "../components/Icon";
import { AnimNumber } from "../components/AnimNumber";

export function HomeView({ balance, sueldo, totalFijos, totalIngresos, totalGastos, activosFijos, top5, txs, mthInfo, onGoMovimientos, onGoFijos, onEditTx }) {
  return (
    <div className="fade-in">
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

      {activosFijos.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontWeight: 800, fontSize: 18, color: C.ink }}>📌 Fijos del mes</p>
            <button onClick={onGoFijos} style={{ background: "none", border: "none", color: C.lavanda, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Ver todo →</button>
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

      <div style={{ marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontWeight: 800, fontSize: 20, color: C.ink }}>Movimientos recientes ⏳</p>
          <button onClick={onGoMovimientos} style={{ background: "none", border: "none", color: C.lavanda, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Ver todo →</button>
        </div>
        {txs.length === 0 ? (
          <p style={{ color: C.ink2, textAlign: "center", padding: 30 }}>Todavía no hay movimientos 🪴<br /><small>Usá el botón + para agregar</small></p>
        ) : (
          <div style={{ background: C.card, borderRadius: 26, overflow: "hidden", boxShadow: `0 4px 18px ${C.lavanda}12` }}>
            {txs.slice(0, 5).map((tx, idx, arr) => {
              const cat = CAT[tx.cat] || { emoji: "💰", color: C.menta };
              const mth = mthInfo(tx.method);
              return (
                <div key={tx.id} className="tx-row" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", borderBottom: idx < arr.length - 1 ? `1px solid ${C.bg}` : "none" }} onClick={() => onEditTx(tx)}>
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
  );
}
