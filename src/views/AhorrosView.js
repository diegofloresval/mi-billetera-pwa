import { useState, useMemo } from "react";
import { C } from "../constants";
import { fmt } from "../helpers";
import { AportarModal } from "../components/AportarModal";
import { ManekiNeko } from "../components/ManekiNeko";
import { Icon } from "../components/Icon";

const HEADER_LABEL = { fontSize: 12, color: C.ink2, fontWeight: 700, marginBottom: 4, display: "inline-flex", alignItems: "center", gap: 6 };

export function AhorrosView({ ahorros = [], onOpenModal, onAportar, onDelAhorro }) {
  const [aportarId, setAportarId] = useState(null);

  const byCurrency = useMemo(() => ahorros.reduce((acc, a) => {
    const cur = a.currency || "ARS";
    if (!acc[cur]) acc[cur] = { actual: 0, meta: 0 };
    acc[cur].actual += a.actual || 0;
    acc[cur].meta += a.meta || 0;
    return acc;
  }, {}), [ahorros]);
  const currencies = Object.keys(byCurrency);
  const totalActualGlobal = currencies.reduce((s, c) => s + byCurrency[c].actual, 0);
  const totalMetaGlobal = currencies.reduce((s, c) => s + byCurrency[c].meta, 0);
  const pctGlobal = totalMetaGlobal > 0 ? Math.min(100, Math.round((totalActualGlobal / totalMetaGlobal) * 100)) : 0;

  const aportarAhorro = aportarId ? ahorros.find((x) => x.id === aportarId) : null;

  return (
    <div className="fade-in" style={{ paddingTop: 8 }}>
      <div style={{ background: C.hojaSoft, borderRadius: 26, padding: "20px 20px", marginBottom: 22, textAlign: "center" }}>
        <p style={HEADER_LABEL}><ManekiNeko size={22} /> Mis ahorros</p>
        {currencies.length === 0 && (
          <p style={{ fontWeight: 900, fontSize: 34, color: C.esmeralda, fontVariantNumeric: "tabular-nums", letterSpacing: -1 }}>{fmt(0)}</p>
        )}
        {currencies.map((cur) => (
          <p key={cur} style={{ fontWeight: 900, fontSize: 30, color: C.esmeralda, fontVariantNumeric: "tabular-nums", letterSpacing: -1, lineHeight: 1.15 }}>
            {fmt(byCurrency[cur].actual, cur)}
            <span style={{ fontSize: 13, color: C.ink2, fontWeight: 700 }}> de {fmt(byCurrency[cur].meta, cur)}</span>
          </p>
        ))}
        {totalMetaGlobal > 0 && (
          <>
            <div style={{ marginTop: 14, height: 10, borderRadius: 99, background: `${C.esmeralda}26`, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pctGlobal}%`, background: C.esmeralda, borderRadius: 99, transition: "width .5s" }} />
            </div>
            <p style={{ fontSize: 11, color: C.ink2, fontWeight: 800, marginTop: 8, letterSpacing: 0.5 }}>{pctGlobal}% de tus metas</p>
          </>
        )}
      </div>

      {ahorros.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, letterSpacing: 1.5, textTransform: "uppercase" }}>Tus metas</p>
          <p style={{ fontSize: 12, fontWeight: 800, color: C.esmeralda }}>{ahorros.length} {ahorros.length === 1 ? "meta" : "metas"}</p>
        </div>
      )}

      {ahorros.map((a) => {
        const pct = a.meta > 0 ? Math.min(100, Math.round((a.actual / a.meta) * 100)) : 0;
        const completa = a.actual >= a.meta;
        return (
          <div key={a.id} style={{ background: C.card, borderRadius: 26, padding: "18px 18px", marginBottom: 14, boxShadow: `0 6px 22px ${a.color}1F` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${a.color}26`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{!a.emoji || a.emoji === "🐷" || a.emoji === "🐱" ? <ManekiNeko size={32} /> : a.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 800, fontSize: 16, color: C.ink }}>{a.nombre}</p>
                <p style={{ fontSize: 11, color: C.ink2, fontWeight: 700, marginTop: 2 }}>Meta {fmt(a.meta, a.currency)}</p>
              </div>
              {completa && (
                <span style={{ fontSize: 10, background: C.mentaSoft, color: C.inkSuccess, borderRadius: 99, padding: "4px 10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.5, flexShrink: 0 }}>✓ Listo</span>
              )}
            </div>

            <div style={{ marginTop: 14, height: 10, borderRadius: 99, background: `${a.color}26`, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: a.color, borderRadius: 99, transition: "width .5s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <p style={{ fontSize: 12, color: C.ink, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{fmt(a.actual, a.currency)} <span style={{ color: C.ink2, fontWeight: 700 }}>de {fmt(a.meta, a.currency)}</span></p>
              <p style={{ fontSize: 12, color: a.color, fontWeight: 900 }}>{pct}%</p>
            </div>

            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.hoja}26`, display: "flex", gap: 8 }}>
              <button onClick={() => onOpenModal(a)} style={{ flex: 1, padding: "10px 0", borderRadius: 99, border: "none", background: C.hojaSoft, color: C.inkOnHoja, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Icon name="edit" size={16} /> Editar
              </button>
              <button onClick={() => setAportarId(a.id)} style={{ flex: 1.3, padding: "10px 0", borderRadius: 99, border: "none", background: C.mentaSoft, color: C.inkSuccess, fontWeight: 900, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                + Aportar
              </button>
              <button aria-label="Eliminar" onClick={() => onDelAhorro(a.id)} style={{ width: 44, padding: "10px 0", borderRadius: 99, border: "none", background: C.coralSoft, color: C.inkDanger, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="delete" size={18} />
              </button>
            </div>
          </div>
        );
      })}

      {ahorros.length === 0 && (
        <div style={{ textAlign: "center", marginTop: 60, padding: "0 20px" }}>
          <div style={{ marginBottom: 14, display: "flex", justifyContent: "center" }}><ManekiNeko size={180} /></div>
          <p style={{ color: C.ink, fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Aún no tenés metas de ahorro</p>
          <p style={{ color: C.ink2, fontSize: 13, marginBottom: 20 }}>Creá tu primera meta y empezá a ahorrar para lo que quieras.</p>
          <button onClick={() => onOpenModal(null)} style={{ padding: "12px 22px", borderRadius: 99, border: "none", background: C.hoja, color: C.inkOnHoja, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 8px 20px ${C.hoja}66` }}>
            + Crear meta
          </button>
        </div>
      )}

      {aportarAhorro && (
        <AportarModal
          ahorro={aportarAhorro}
          onConfirm={(monto, fecha) => { onAportar(aportarAhorro.id, monto, undefined, fecha); setAportarId(null); }}
          onClose={() => setAportarId(null)}
        />
      )}
    </div>
  );
}
