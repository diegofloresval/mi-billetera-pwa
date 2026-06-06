import { C, CAT, METHODS } from "../constants";
import { fmt, fijoActivoEsteMes, cuotaLabel } from "../helpers";

export function FijoCard({ f, onEdit, onDel, onToggle, onPagar }) {
  const cat = CAT[f.cat] || CAT["otro"];
  const mth = METHODS.find((m) => m.id === f.method) || METHODS[0];
  const rest = f.tipo === "cuotas" ? f.cuotasTotales - f.cuotasPagadas : null;
  const pctCuota = f.tipo === "cuotas" ? Math.round((f.cuotasPagadas / f.cuotasTotales) * 100) : null;
  const dim = !fijoActivoEsteMes(f);
  if (dim) {
    return (
      <div style={{ borderRadius: 24, padding: "16px 18px", border: `1.5px dashed ${C.hoja}66`, marginBottom: 12, background: "transparent" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.hojaSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, filter: "grayscale(0.6)", opacity: 0.7 }}>{cat.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 800, fontSize: 15, color: C.ink2 }}>{f.desc}</p>
            <p style={{ fontSize: 10, color: C.ink2, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>
              {f.tipo === "cuotas" && rest <= 0 ? "Plan completado" : !f.activo ? "Pausado" : "Inactivo este mes"}
            </p>
          </div>
          <p style={{ fontWeight: 900, fontSize: 15, color: C.ink2, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>-{fmt(f.monto)}</p>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {!f.activo && (
            <button onClick={onToggle} style={{ flex: 1, padding: "10px 0", borderRadius: 99, border: "none", background: C.hojaSoft, color: C.inkOnHoja, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>▶ Reactivar gasto</button>
          )}
          <button aria-label="Eliminar" onClick={onDel} style={{ width: 42, height: 38, borderRadius: 99, border: "none", background: C.coralSoft, color: C.inkDanger, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
          </button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ background: C.card, borderRadius: 26, padding: "18px 18px", marginBottom: 14, boxShadow: `0 6px 22px ${C.hoja}1F` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.mentaSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{cat.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 800, fontSize: 16, color: C.ink }}>{f.desc}</p>
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, background: f.tipo === "cuotas" ? C.coralSoft : C.hojaSoft, color: f.tipo === "cuotas" ? C.inkDanger : C.inkOnHoja, borderRadius: 99, padding: "3px 9px", fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.3 }}>
              {f.tipo === "cuotas" ? `⏳ ${cuotaLabel(f)}` : f.hastaFecha ? `🔄 hasta ${f.hastaFecha}` : "🔄 Mensual"}
            </span>
            <span style={{ fontSize: 10, background: C.mentaSoft, color: C.ink, borderRadius: 99, padding: "3px 9px", fontWeight: 800 }}>{mth.icon} {mth.label}</span>
          </div>
          {f.tipo === "cuotas" && (
            <div style={{ marginTop: 10, height: 6, borderRadius: 99, background: C.coralSoft, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pctCuota}%`, background: C.coral, borderRadius: 99, transition: "width .5s" }} />
            </div>
          )}
        </div>
        <p style={{ fontWeight: 900, fontSize: 17, color: C.inkDanger, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>-{fmt(f.monto)}</p>
      </div>
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.hoja}26`, display: "flex", flexDirection: "column", gap: 8 }}>
        {f.tipo === "cuotas" && rest > 0 && (
          <button onClick={onPagar} style={{ width: "100%", padding: "11px 0", borderRadius: 99, border: "none", background: C.mentaSoft, color: C.inkSuccess, fontWeight: 900, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: `0 4px 12px ${C.menta}88` }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span> Pagar cuota
          </button>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onEdit} style={{ flex: 1, padding: "10px 0", borderRadius: 99, border: "none", background: C.hojaSoft, color: C.inkOnHoja, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span> Editar
          </button>
          <button onClick={onToggle} style={{ flex: 1, padding: "10px 0", borderRadius: 99, border: "none", background: C.esmeraldaSoft, color: C.esmeralda, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>pause</span> Pausar
          </button>
          <button aria-label="Eliminar" onClick={onDel} style={{ width: 44, padding: "10px 0", borderRadius: 99, border: "none", background: C.coralSoft, color: C.inkDanger, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
