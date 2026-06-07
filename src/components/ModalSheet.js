import { useRef, useState } from "react";
import { C } from "../constants";
import { Icon } from "./Icon";

const S = {
  overlay: { position: "fixed", inset: 0, background: "rgba(26,61,42,.55)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" },
  sheet: { width: "100%", maxWidth: 430, background: C.card, borderRadius: "28px 28px 0 0", padding: "24px 20px calc(env(safe-area-inset-bottom) + 32px)", maxHeight: "92dvh", overflowY: "auto", willChange: "transform" },
  grabWrap: { padding: "0 0 18px", margin: "-4px 0 4px", display: "flex", justifyContent: "center", cursor: "grab", touchAction: "none" },
  grab: { width: 44, height: 5, borderRadius: 99, background: C.hojaSoft },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 },
  title: { fontWeight: 800, fontSize: 19, color: C.ink },
  close: { border: "none", background: "transparent", color: C.ink2, cursor: "pointer", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit", lineHeight: 1, padding: 0 },
};

export function ModalSheet({ title, onClose, children }) {
  const sheetRef = useRef(null);
  const dragRef = useRef({ startY: 0, startT: 0, dragging: false });
  const [dy, setDy] = useState(0);

  const onTouchStart = (e) => {
    const t = e.touches[0];
    dragRef.current = { startY: t.clientY, startT: performance.now(), dragging: true };
  };
  const onTouchMove = (e) => {
    if (!dragRef.current.dragging) return;
    const delta = e.touches[0].clientY - dragRef.current.startY;
    if (delta > 0) setDy(delta);
  };
  const onTouchEnd = (e) => {
    if (!dragRef.current.dragging) return;
    const elapsed = performance.now() - dragRef.current.startT;
    const velocity = dy / Math.max(elapsed, 1);
    dragRef.current.dragging = false;
    if (dy > 80 && velocity > 0.3) {
      onClose?.();
    }
    setDy(0);
  };

  const sheetStyle = dy > 0 ? { ...S.sheet, transform: `translateY(${dy}px)`, transition: "none" } : S.sheet;

  return (
    <div style={S.overlay} onClick={onClose}>
      <div ref={sheetRef} className="slide-up" style={sheetStyle} onClick={(e) => e.stopPropagation()}>
        <div
          style={S.grabWrap}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          aria-hidden="true"
        >
          <div style={S.grab} />
        </div>
        <div style={S.header}>
          <p style={S.title}>{title}</p>
          <button onClick={onClose} aria-label="Cerrar" style={S.close}><Icon name="close" size={22} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
