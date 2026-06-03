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
  ingresoBtn: { width: 42, height: 42, borderRadius: "50%", border: "none", background: C.lavanda, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px ${C.lavanda}55` },
  sueldoBtn: { width: 42, height: 42, borderRadius: "50%", border: "none", background: C.creme, color: C.ink, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px ${C.creme}88` },
  searchBtn: { width: 42, height: 42, borderRadius: "50%", border: "none", background: C.lavanda, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px ${C.lavanda}55` },
  avatar: { width: 42, height: 42, borderRadius: "50%", background: C.lavandaSoft, border: `2px solid ${C.lavanda}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#6B46C1", fontWeight: 900, fontSize: 16 },
  addFijoBtn: { flexShrink: 0, padding: "11px 18px", borderRadius: 99, border: "none", background: C.lavanda, color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, boxShadow: `0 6px 18px ${C.lavanda}55` },
};

export function TopBar({ tab, nombre, cm, onAddIngreso, onAddSueldo, onAddFijo }) {
  return (
    <div style={S.wrap}>
      <div style={S.titleBox}>
        <p style={S.title}>
          {tab === "Home" ? (nombre ? `¡Hola, ${nombre}! 👋` : "¡Hola! 👋")
            : tab === "Movimientos" ? "Movimientos"
            : tab === "Fijos" ? "📌 Gastos fijos"
            : tab === "Presupuesto" ? "Presupuesto"
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
        </div>
      )}
      {tab === "Movimientos" && (
        <div style={S.actionsAligned}>
          <button aria-label="Buscar" className="btn-pill" style={S.searchBtn}>
            <Icon name="search" size={22} weight={600} />
          </button>
          <div aria-hidden="true" style={S.avatar}>
            {(nombre || "D").trim().charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      {tab === "Fijos" && (
        <button className="btn-pill" onClick={onAddFijo} style={S.addFijoBtn}>
          <Icon name="add" size={18} weight={700} /> Agregar
        </button>
      )}
    </div>
  );
}
