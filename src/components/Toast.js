import { C } from "../constants";

export function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  return (
    <div style={{ position: "fixed", bottom: "calc(env(safe-area-inset-bottom) + 110px)", left: "50%", transform: "translateX(-50%)", background: C.ink, color: "#fff", padding: "10px 16px 10px 20px", borderRadius: 99, fontSize: 13, fontWeight: 700, zIndex: 300, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 12, boxShadow: `0 10px 28px rgba(26,61,42,.45)`, animation: toast.undoFn ? "toast 4.5s ease forwards" : "toast 2.2s ease forwards" }}>
      <span>{toast.msg}</span>
      {toast.undoFn && (
        <button onClick={() => { toast.undoFn(); onDismiss(); }} style={{ background: C.hoja, color: "#fff", border: "none", borderRadius: 99, padding: "6px 14px", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Deshacer</button>
      )}
    </div>
  );
}
