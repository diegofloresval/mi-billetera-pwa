import { useState } from "react";
import { C, CAT } from "../constants";
import { fmt, cuotaLabel } from "../helpers";
import { Icon } from "../components/Icon";
import { AnimNumber } from "../components/AnimNumber";
import { ManekiNeko } from "../components/ManekiNeko";

const TOGGLE_WRAP = { display: "inline-flex", background: C.bg, borderRadius: 99, padding: 3, gap: 2 };
const TOGGLE_BTN = (active, disabled) => ({
  border: "none",
  background: active ? C.hoja : "transparent",
  color: active ? C.inkOnHoja : (disabled ? `${C.ink2}88` : C.ink),
  fontWeight: 800,
  fontSize: 11,
  padding: "6px 12px",
  borderRadius: 99,
  cursor: disabled ? "not-allowed" : "pointer",
  fontFamily: "inherit",
  opacity: disabled ? 0.6 : 1,
  transition: "all .18s",
});

export function HomeView({
  balance, balanceUnified, sueldo, totalFijos, totalIngresos, totalGastos,
  totalsByCurrency, totalsUnifiedARS, fxRate,
  activosFijos, top5, txs, mthInfo, onGoMovimientos, onGoFijos, onEditTx,
  ahorros = [], onGoAhorros,
}) {
  const [viewMode, setViewMode] = useState("split");

  const byC = totalsByCurrency || { ARS: { ingresos: totalIngresos, gastos: totalGastos, fijos: totalFijos }, USD: { ingresos: 0, gastos: 0, fijos: 0 } };
  const hasUSD = byC.USD.ingresos > 0 || byC.USD.gastos > 0;
  const unifiedAvailable = !!totalsUnifiedARS;
  const showToggle = hasUSD;
  const effectiveMode = viewMode === "unified" && !unifiedAvailable ? "split" : viewMode;

  const ingDisplayARS = effectiveMode === "unified" && totalsUnifiedARS ? totalsUnifiedARS.ingresos : byC.ARS.ingresos;
  const gstDisplayARS = effectiveMode === "unified" && totalsUnifiedARS ? totalsUnifiedARS.gastos : byC.ARS.gastos;
  const fjsDisplayARS = effectiveMode === "unified" && totalsUnifiedARS ? totalsUnifiedARS.fijos : byC.ARS.fijos;
  const showUSDRow = effectiveMode === "split" && hasUSD;

  return (
    <div className="fade-in">
      <div style={{ background: C.hojaSoft, borderRadius: 28, padding: "22px 22px", marginTop: 16, position: "relative", overflow: "hidden", boxShadow: `0 10px 32px ${C.hoja}55` }}>
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
            <p style={{ color: C.ink2, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 800 }}>Balance del mes</p>
            {showToggle && (
              <div style={TOGGLE_WRAP}>
                <button onClick={() => setViewMode("split")} style={TOGGLE_BTN(effectiveMode === "split", false)}>Por moneda</button>
                <button
                  onClick={() => unifiedAvailable && setViewMode("unified")}
                  disabled={!unifiedAvailable}
                  style={TOGGLE_BTN(effectiveMode === "unified", !unifiedAvailable)}
                  title={!unifiedAvailable ? "Definí el tipo de cambio en Ajustes" : ""}
                >Unificado ARS</button>
              </div>
            )}
          </div>
          <AnimNumber value={effectiveMode === "unified" && balanceUnified != null ? balanceUnified : balance} style={{ display: "block", fontSize: 40, fontWeight: 900, color: C.ink, marginTop: 6, letterSpacing: -1, fontVariantNumeric: "tabular-nums" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.hojaSoft, color: C.ink, borderRadius: 99, padding: "5px 12px", fontSize: 11, fontWeight: 800, border: `1px solid ${C.hoja}55` }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.esmeralda }} /> Sueldo {fmt(sueldo)}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.coralSoft, color: C.ink, borderRadius: 99, padding: "5px 12px", fontSize: 11, fontWeight: 800, border: `1px solid ${C.coral}55` }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.coral }} /> Fijos {fmt(fjsDisplayARS)}{showUSDRow && byC.USD.fijos > 0 ? ` · ${fmt(byC.USD.fijos, "USD")}` : ""}
            </span>
          </div>
          {showToggle && !unifiedAvailable && (
            <p style={{ fontSize: 10, color: C.ink2, marginTop: 10, fontWeight: 600 }}>Definí el tipo de cambio en Ajustes para unificar.</p>
          )}
          {effectiveMode === "unified" && fxRate && fxRate.USD_ARS > 0 && (
            <p style={{ fontSize: 10, color: C.ink2, marginTop: 10, fontWeight: 600 }}>USD convertido a {fmt(fxRate.USD_ARS)} / US$1</p>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
        <div style={{ background: C.menta, borderRadius: 24, padding: "18px 18px", display: "flex", flexDirection: "column", gap: 12, boxShadow: `0 8px 22px ${C.menta}55` }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,.6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <Icon name="north_east" size={20} weight={700} />
          </div>
          <div>
            <p style={{ color: `${C.ink}99`, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>Ingresos</p>
            <p style={{ color: C.ink, fontWeight: 900, fontSize: 17, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>{fmt(ingDisplayARS)}</p>
            {showUSDRow && byC.USD.ingresos > 0 && (
              <p style={{ color: C.ink, fontWeight: 800, fontSize: 12, fontVariantNumeric: "tabular-nums", marginTop: 2, opacity: 0.75 }}>{fmt(byC.USD.ingresos, "USD")}</p>
            )}
          </div>
        </div>
        <div style={{ background: C.coral, borderRadius: 24, padding: "18px 18px", display: "flex", flexDirection: "column", gap: 12, boxShadow: `0 8px 22px ${C.coral}55` }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,.6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <Icon name="south_west" size={20} weight={700} />
          </div>
          <div>
            <p style={{ color: `${C.ink}99`, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>Gastos</p>
            <p style={{ color: C.ink, fontWeight: 900, fontSize: 17, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>{fmt(gstDisplayARS)}</p>
            {showUSDRow && byC.USD.gastos > 0 && (
              <p style={{ color: C.ink, fontWeight: 800, fontSize: 12, fontVariantNumeric: "tabular-nums", marginTop: 2, opacity: 0.75 }}>{fmt(byC.USD.gastos, "USD")}</p>
            )}
          </div>
        </div>
      </div>

      {activosFijos.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontWeight: 800, fontSize: 18, color: C.ink, display: "inline-flex", alignItems: "center", gap: 8 }}><Icon name="push_pin" size={20} filled color={C.esmeralda} /> Fijos del mes</p>
            <button onClick={onGoFijos} style={{ background: "none", border: "none", color: C.esmeralda, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Ver todo →</button>
          </div>
          {activosFijos.slice(0, 3).map((f) => {
            const cat = CAT[f.cat] || CAT["otro"];
            return (
              <div key={f.id} style={{ background: C.card, borderRadius: 20, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, marginBottom: 10, boxShadow: `0 4px 16px ${C.hoja}1F` }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.mentaSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{cat.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 800, fontSize: 14, color: C.ink }}>{f.desc}</p>
                  <span style={{ fontSize: 10, background: C.hojaSoft, color: C.inkOnHoja, borderRadius: 99, padding: "3px 9px", fontWeight: 900, marginTop: 4, display: "inline-block", textTransform: "uppercase", letterSpacing: 0.4 }}>
                    {f.tipo === "cuotas" ? `⏳ ${cuotaLabel(f)}` : "🔄 Mensual"}
                  </span>
                </div>
                <p style={{ fontWeight: 900, fontSize: 15, color: C.inkDanger, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>-{fmt(f.monto, f.currency || "ARS")}</p>
              </div>
            );
          })}
        </div>
      )}

      {ahorros.length > 0 && (() => {
        const totARS = ahorros.filter((a) => (a.currency || "ARS") === "ARS").reduce((s, a) => s + (a.actual || 0), 0);
        const totUSD = ahorros.filter((a) => a.currency === "USD").reduce((s, a) => s + (a.actual || 0), 0);
        return (
          <div style={{ marginTop: 22 }}>
            <div onClick={onGoAhorros} className="btn-pill" style={{ background: C.card, borderRadius: 22, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, boxShadow: `0 4px 16px ${C.hoja}1F`, cursor: "pointer" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.hojaSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><ManekiNeko size={24} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 800, fontSize: 14, color: C.ink }}>Ahorros</p>
                <p style={{ fontSize: 11, color: C.ink2, marginTop: 2, fontWeight: 600 }}>{ahorros.length} meta{ahorros.length === 1 ? "" : "s"}</p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {totARS > 0 && <p style={{ fontWeight: 900, fontSize: 14, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{fmt(totARS, "ARS")}</p>}
                {totUSD > 0 && <p style={{ fontWeight: 800, fontSize: 12, color: C.ink2, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>{fmt(totUSD, "USD")}</p>}
                {totARS === 0 && totUSD === 0 && <p style={{ fontWeight: 800, fontSize: 12, color: C.ink2 }}>Sin aportes</p>}
              </div>
            </div>
          </div>
        );
      })()}

      {top5.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ fontWeight: 800, fontSize: 20, color: C.ink }}>Top gastos 🏆</p>
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6, margin: "0 -16px", padding: "2px 16px 8px" }}>
            {top5.map((c, i) => {
              const palette = [C.coralSoft, C.menta, C.hojaSoft, C.esmeraldaSoft, C.mentaSoft];
              const bg = palette[i % palette.length];
              return (
                <div key={c.id} style={{ flexShrink: 0, width: 128, height: 132, borderRadius: 20, padding: "14px 12px", background: bg, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", boxShadow: `0 4px 14px ${C.hoja}1A` }}>
                  <div style={{ position: "absolute", top: 8, left: 8, width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,.75)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: C.ink, fontSize: 11 }}>{i + 1}</div>
                  <span style={{ fontSize: 30, marginBottom: 6 }}>{c.emoji}</span>
                  <p style={{ color: `${C.ink}99`, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{c.label}</p>
                  <p style={{ color: C.ink, fontWeight: 900, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>{fmt(c.total)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontWeight: 800, fontSize: 20, color: C.ink, display: "inline-flex", alignItems: "center", gap: 8 }}>Movimientos recientes <Icon name="history" size={20} color={C.ink2} /></p>
          <button onClick={onGoMovimientos} style={{ background: "none", border: "none", color: C.esmeralda, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Ver todo →</button>
        </div>
        {txs.length === 0 ? (
          <p style={{ color: C.ink2, textAlign: "center", padding: 30 }}>Todavía no hay movimientos<br /><small>Usá el botón + para agregar</small></p>
        ) : (
          <div style={{ background: C.card, borderRadius: 26, overflow: "hidden", boxShadow: `0 4px 18px ${C.hoja}1F` }}>
            {txs.slice(0, 5).map((tx, idx, arr) => {
              const cat = CAT[tx.cat] || { emoji: "💰", color: C.menta };
              const mth = mthInfo(tx.method);
              return (
                <div key={tx.id} className="tx-row" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", borderBottom: idx < arr.length - 1 ? `1px solid ${C.bg}` : "none" }} onClick={() => onEditTx(tx)}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: C.mentaSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{tx.cat === "ahorro" ? <ManekiNeko size={24} /> : cat.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 800, fontSize: 14, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.desc}</p>
                    <p style={{ fontSize: 11, color: C.ink2, marginTop: 2, fontWeight: 500 }}>{tx.fecha} · {mth.icon} {mth.label}</p>
                  </div>
                  <p style={{ fontWeight: 900, fontSize: 15, color: tx.type === "ingreso" ? C.inkSuccess : C.ink, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{tx.type === "ingreso" ? "+" : "-"}{fmt(tx.monto, tx.currency || "ARS")}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
