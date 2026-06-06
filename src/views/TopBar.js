import { C } from "../constants";
import { saludo, monthLabel } from "../helpers";
import { Icon } from "../components/Icon";

const S = {
  wrap: { background: C.bg, padding: "calc(env(safe-area-inset-top) + 18px) 22px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 50 },
  titleBox: { minWidth: 0, flex: 1 },
  title: { fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: -0.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  subtitle: { fontSize: 13, color: C.ink2, fontWeight: 500, marginTop: 2 },
  subtitleBold: { fontSize: 13, color: C.ink2, marginTop: 2, fontWeight: 600 },
  actions: { display: "flex", gap: 10, flexShrink: 0 },
  actionsAligned: { display: "flex", gap: 10, flexShrink: 0, alignItems: "center" },
  circleBtnBase: { width: 42, height: 42, borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  ingresoBtn: { width: 42, height: 42, borderRadius: "50%", border: "none", background: C.hoja, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px ${C.hoja}66` },
  sueldoBtn: { width: 42, height: 42, borderRadius: "50%", border: "none", background: C.menta, color: C.inkOnHoja, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px ${C.menta}88` },
  avatar: { width: 42, height: 42, borderRadius: "50%", background: C.hojaSoft, border: `2px solid ${C.hoja}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.esmeralda, fontWeight: 900, fontSize: 16 },
  addFijoBtn: { flexShrink: 0, padding: "11px 18px", borderRadius: 99, border: "none", background: C.hoja, color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, boxShadow: `0 6px 18px ${C.hoja}66` },
  settingsBtn: { width: 42, height: 42, borderRadius: "50%", border: "none", background: C.hojaSoft, color: C.inkOnHoja, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
};

export function TopBar({ tab, nombre, cm, onAddIngreso, onAddSueldo, onAddFijo, onOpenAjustes }) {
  return (
    <div style={S.wrap}>
      <div style={S.titleBox}>
        <p style={S.title}>
          {tab === "Home" ? (nombre ? `¡Hola, ${nombre}! 👋` : "¡Hola! 👋")
            : tab === "Movimientos" ? "Movimientos"
            : tab === "Fijos" ? "📌 Gastos fijos"
            : tab === "Presupuesto" ? "Presupuesto"
            : tab === "Ahorros" ? "🐷 Ahorros"
            : "⚙️ Ajustes"}
        </p>
        {tab === "Home" && (
          <p style={S.subtitle}>
            {saludo()} · {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        )}
        {tab === "Presupuesto" && <p style={S.subtitleBold}>{monthLabel(cm)}</p>}
      </div>
      {tab === "Home" && (
        <div style={S.actions}>
          <button aria-label="Agregar ingreso" className="btn-pill" onClick={onAddIngreso} style={S.ingresoBtn}>
            <Icon name="add" size={22} weight={700} />
          </button>
          <button aria-label="Mi sueldo" className="btn-pill" onClick={onAddSueldo} style={S.sueldoBtn}>
            <Icon name="work" size={20} weight={600} />
          </button>
          {onOpenAjustes && tab !== "Ajustes" && (
            <button aria-label="Ajustes" className="btn-pill" onClick={onOpenAjustes} style={S.settingsBtn}>
              <Icon name="settings" size={20} weight={600} />
            </button>
          )}
        </div>
      )}
      {tab === "Movimientos" && onOpenAjustes && (
        <div style={S.actionsAligned}>
          <button aria-label="Ajustes" className="btn-pill" onClick={onOpenAjustes} style={S.settingsBtn}>
            <Icon name="settings" size={20} weight={600} />
          </button>
        </div>
      )}
      {tab === "Fijos" && (
        <div style={S.actionsAligned}>
          <button className="btn-pill" onClick={onAddFijo} style={S.addFijoBtn}>
            <Icon name="add" size={18} weight={700} /> Agregar
          </button>
          {onOpenAjustes && (
            <button aria-label="Ajustes" className="btn-pill" onClick={onOpenAjustes} style={S.settingsBtn}>
              <Icon name="settings" size={20} weight={600} />
            </button>
          )}
        </div>
      )}
      {(tab === "Ahorros" || tab === "Presupuesto") && onOpenAjustes && (
        <div style={S.actionsAligned}>
          <button aria-label="Ajustes" className="btn-pill" onClick={onOpenAjustes} style={S.settingsBtn}>
            <Icon name="settings" size={20} weight={600} />
          </button>
        </div>
      )}
    </div>
  );
}
