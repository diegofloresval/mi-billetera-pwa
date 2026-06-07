import { C } from "../constants";
import { ModalSheet } from "./ModalSheet";
import { Icon } from "./Icon";

const S = {
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 4 },
  item: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "18px 12px", borderRadius: 20, border: "none", background: C.hojaSoft, cursor: "pointer", fontFamily: "inherit" },
  iconWrap: { width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  label: { fontSize: 13, fontWeight: 800, color: C.ink },
};

export function FabMenu({ onPick, onClose }) {
  const opts = [
    { id: "gasto", label: "Gasto", icon: "remove", bg: C.coral, fg: C.inkDanger },
    { id: "ingreso", label: "Ingreso", icon: "add", bg: C.hoja, fg: C.inkOnHoja },
    { id: "sueldo", label: "Sueldo", icon: "work", bg: C.menta, fg: C.inkOnHoja },
    { id: "fijo", label: "Gasto fijo", icon: "calendar_today", bg: C.hoja, fg: C.inkOnHoja },
  ];
  return (
    <ModalSheet title="¿Qué querés agregar?" onClose={onClose}>
      <div style={S.grid}>
        {opts.map((o) => (
          <button key={o.id} className="btn-pill" onClick={() => onPick(o.id)} style={S.item}>
            <span style={{ ...S.iconWrap, background: o.bg, color: o.fg }}>
              <Icon name={o.icon} size={24} weight={700} />
            </span>
            <span style={S.label}>{o.label}</span>
          </button>
        ))}
      </div>
    </ModalSheet>
  );
}
