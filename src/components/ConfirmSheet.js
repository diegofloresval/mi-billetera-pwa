import { C } from "../constants";
import { ModalSheet } from "./ModalSheet";

const S = {
  message: { fontSize: 14, color: C.ink2, lineHeight: 1.5, marginBottom: 20 },
  actions: { display: "flex", gap: 10 },
  cancel: { flex: 1, padding: "12px 0", borderRadius: 99, border: "none", background: C.hojaSoft, color: C.inkOnHoja, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
  confirm: { flex: 1, padding: "12px 0", borderRadius: 99, border: "none", background: C.hoja, color: C.inkOnHoja, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
  confirmDanger: { flex: 1, padding: "12px 0", borderRadius: 99, border: "none", background: C.coral, color: C.inkDanger, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
};

export function ConfirmSheet({ open, title = "Confirmar", message, confirmLabel = "Confirmar", cancelLabel = "Cancelar", danger = false, onConfirm, onClose }) {
  if (!open) return null;
  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };
  return (
    <ModalSheet title={title} onClose={onClose}>
      {message && <p style={S.message}>{message}</p>}
      <div style={S.actions}>
        <button onClick={onClose} style={S.cancel} className="btn-pill">{cancelLabel}</button>
        <button onClick={handleConfirm} style={danger ? S.confirmDanger : S.confirm} className="btn-pill">{confirmLabel}</button>
      </div>
    </ModalSheet>
  );
}
