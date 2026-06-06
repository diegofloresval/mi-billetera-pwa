import { useState, useEffect } from "react";
import { C, CATS, METHODS } from "../constants";
import { fmt, guessCat } from "../helpers";

const inp = (extra = {}) => ({
  style: { width: "100%", border: `1.5px solid ${C.lavandaSoft}`, borderRadius: 16, padding: "14px 16px", fontSize: 15, color: C.ink, fontFamily: "inherit", background: C.card, marginBottom: 10, ...extra.style },
  ...extra,
});

const toggleBtn = (active, accent, activeColor) => ({
  flex: 1, padding: "10px 14px", borderRadius: 99, border: "none",
  background: active ? accent : C.lavandaSoft,
  color: active ? activeColor : C.ink,
  fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
  transition: "all .18s",
});

export function TxModal({ modalType, setModalType, form, setForm, editId, sueldo, customCats = [], onSubmit, onClose }) {
  const allCats = [...CATS, ...customCats];
  const showToggle = modalType !== "sueldo" && !editId;
  const [userPickedCat, setUserPickedCat] = useState(!!editId);
  useEffect(() => { setUserPickedCat(!!editId); }, [editId]);
  const switchType = (newType) => {
    if (newType === modalType) return;
    setModalType(newType);
    setForm({ ...form, cat: newType === "gasto" ? "supermercado" : "ingreso" });
    setUserPickedCat(false);
  };
  const onDescChange = (e) => {
    const v = e.target.value;
    if (!userPickedCat && modalType === "gasto") {
      const g = guessCat(v);
      if (g) { setForm({ ...form, desc: v, cat: g }); return; }
    }
    setForm({ ...form, desc: v });
  };
  const pickCat = (id) => { setForm({ ...form, cat: id }); setUserPickedCat(true); };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(45,36,56,.45)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div className="slide-up" style={{ width: "100%", maxWidth: 430, background: C.card, borderRadius: "28px 28px 0 0", padding: "24px 20px calc(env(safe-area-inset-bottom) + 32px)", maxHeight: "92dvh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ width: 44, height: 5, borderRadius: 99, background: C.lavandaSoft, margin: "0 auto 22px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <p style={{ fontWeight: 800, fontSize: 19, color: C.ink }}>{modalType === "ingreso" ? "💰 Agregar ingreso" : modalType === "sueldo" ? "💼 Mi sueldo" : `${editId ? "✏️ Editar" : "➕ Nuevo"} gasto`}</p>
          <button onClick={onClose} aria-label="Cerrar" style={{ border: "none", background: "transparent", color: C.ink2, fontSize: 22, cursor: "pointer", padding: 4, aspectRatio: "1 / 1", fontFamily: "inherit", lineHeight: 1 }}>✕</button>
        </div>
        {showToggle && (
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <button className="btn-pill" onClick={() => switchType("gasto")} style={toggleBtn(modalType === "gasto", C.coral, "#A0314D")}>➖ Gasto</button>
            <button className="btn-pill" onClick={() => switchType("ingreso")} style={toggleBtn(modalType === "ingreso", C.menta, "#1F8C5B")}>➕ Ingreso</button>
          </div>
        )}
        {modalType === "sueldo" ? (
          <><p style={{ fontSize: 13, color: C.ink2, marginBottom: 10 }}>Actual: <strong style={{ color: C.ink }}>{fmt(sueldo)}</strong></p>
            <input placeholder="Nuevo sueldo" type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} {...inp()} /></>
        ) : (
          <>
            <input placeholder="Descripción" value={form.desc} onChange={onDescChange} {...inp()} />
            <div style={{ display: "flex", gap: 10 }}>
              <input placeholder="Monto $" type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} {...inp({ style: { flex: 1, marginBottom: 10 } })} />
              <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} {...inp({ style: { flex: 1, marginBottom: 10, fontSize: 13 } })} />
            </div>
            {modalType !== "ingreso" && <>
              <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Método de pago</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                {METHODS.map((m) => <button key={m.id} className="btn-pill" onClick={() => setForm({ ...form, method: m.id })} style={{ padding: "9px 14px", borderRadius: 99, border: "none", background: form.method === m.id ? (m.id === "credito" ? C.coral : C.celeste) : C.lavandaSoft, color: form.method === m.id ? (m.id === "credito" ? "#fff" : "#1A6BA0") : C.ink, fontSize: 13, fontWeight: 800 }}>{m.icon} {m.label}</button>)}
              </div>
              <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Categoría</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
                {allCats.map((c) => <button key={c.id} className="btn-pill" onClick={() => pickCat(c.id)} style={{ padding: "8px 14px", borderRadius: 99, border: "none", background: form.cat === c.id ? `${c.color}22` : C.lavandaSoft, color: form.cat === c.id ? c.color : C.ink, fontSize: 13, fontWeight: 800 }}>{c.emoji} {c.label}</button>)}
              </div>
            </>}
          </>
        )}
        <button onClick={onSubmit} style={{ width: "100%", padding: 16, borderRadius: 18, border: "none", background: modalType === "ingreso" ? C.menta : modalType === "sueldo" ? C.creme : C.lavanda, color: modalType === "ingreso" ? "#1F8C5B" : modalType === "sueldo" ? "#B8860B" : "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 8px 20px ${(modalType === "ingreso" ? C.menta : modalType === "sueldo" ? C.creme : C.lavanda)}55` }}>
          {editId ? "Guardar" : modalType === "sueldo" ? "Actualizar sueldo" : modalType === "ingreso" ? "Agregar ingreso" : "Agregar gasto"}
        </button>
      </div>
    </div>
  );
}
