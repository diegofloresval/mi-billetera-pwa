import { C } from "../constants";
import { Icon } from "../components/Icon";

export function InstallBanner({ onInstall, onDismiss }) {
  return (
    <div style={{ background: `linear-gradient(135deg,${C.hoja},${C.esmeralda})`, margin: "14px 16px 0", borderRadius: 20, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: `0 8px 24px ${C.hoja}66` }}>
      <span style={{ fontSize: 26 }}>📲</span>
      <div style={{ flex: 1 }}>
        <p style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>Instalá la app</p>
        <p style={{ color: "rgba(255,255,255,.95)", fontSize: 11 }}>Acceso rápido desde el inicio</p>
      </div>
      <button onClick={onInstall} style={{ minHeight: 44, padding: "10px 18px", borderRadius: 99, border: "none", background: "#fff", color: C.esmeralda, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>Instalar</button>
      <button onClick={onDismiss} aria-label="Cerrar" style={{ background: "none", border: "none", color: "rgba(255,255,255,.85)", cursor: "pointer", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}><Icon name="close" size={22} /></button>
    </div>
  );
}
