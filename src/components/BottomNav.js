import { C } from "../constants";
import { Icon } from "./Icon";

const TABS = [
  { id: "Home", icon: "home", label: "Inicio" },
  { id: "Movimientos", icon: "receipt_long", label: "Movim." },
  { id: "Fijos", icon: "calendar_today", label: "Fijos" },
  { id: "Presupuesto", icon: "account_balance_wallet", label: "Presup." },
  { id: "Ajustes", icon: "settings", label: "Ajustes" },
];

export function BottomNav({ tab, onChange }) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: C.card, borderRadius: "28px 28px 0 0", display: "flex", justifyContent: "space-around", alignItems: "center", paddingTop: 10, paddingBottom: "calc(env(safe-area-inset-bottom) + 10px)", paddingLeft: 8, paddingRight: 8, boxShadow: `0 -8px 30px ${C.lavanda}1A`, zIndex: 100 }}>
      {TABS.map((t) => {
        const active = tab === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} className="btn-pill" style={{ background: active ? `${C.lavanda}1A` : "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 10px", borderRadius: 16, color: active ? C.lavanda : C.ink2 }}>
            <Icon name={t.icon} size={22} filled={active} weight={active ? 600 : 400} />
            <span style={{ fontSize: 10, fontWeight: active ? 800 : 600, fontFamily: "inherit" }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Fab({ onClick }) {
  return (
    <button aria-label="Agregar gasto" className="btn-pill" onClick={onClick} style={{ position: "fixed", bottom: "calc(env(safe-area-inset-bottom) + 96px)", right: "max(20px, calc(50% - 215px + 20px))", width: 60, height: 60, borderRadius: "50%", border: "none", background: C.coral, color: "#fff", cursor: "pointer", boxShadow: `0 12px 28px ${C.coral}99`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 101 }}>
      <Icon name="add" size={30} weight={700} />
    </button>
  );
}
