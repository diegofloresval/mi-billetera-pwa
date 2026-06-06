import { C } from "../constants";

const S = {
  overlay: { position: "fixed", inset: 0, background: "rgba(26,61,42,.55)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" },
  sheet: { width: "100%", maxWidth: 430, background: C.card, borderRadius: "28px 28px 0 0", padding: "24px 20px calc(env(safe-area-inset-bottom) + 32px)", maxHeight: "92dvh", overflowY: "auto" },
  grab: { width: 44, height: 5, borderRadius: 99, background: C.hojaSoft, margin: "0 auto 22px" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 },
  title: { fontWeight: 800, fontSize: 19, color: C.ink },
  close: { border: "none", background: "transparent", color: C.ink2, fontSize: 22, cursor: "pointer", padding: 4, aspectRatio: "1 / 1", fontFamily: "inherit", lineHeight: 1 },
};

export function ModalSheet({ title, onClose, children }) {
  return (
    <div style={S.overlay} onClick={onClose}>
      <div className="slide-up" style={S.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={S.grab} />
        <div style={S.header}>
          <p style={S.title}>{title}</p>
          <button onClick={onClose} aria-label="Cerrar" style={S.close}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
