import { useState, useEffect } from "react";
import { C, CATS, METHODS, CURRENCIES } from "../constants";
import { fmt, guessCat } from "../helpers";
import { ModalSheet } from "./ModalSheet";

const inp = (extra = {}) => ({
  style: { width: "100%", border: `1.5px solid ${C.hojaSoft}`, borderRadius: 16, padding: "14px 16px", fontSize: 15, color: C.ink, fontFamily: "inherit", background: C.card, marginBottom: 10, ...extra.style },
  ...extra,
});

const toggleBtn = (active, accent, activeColor) => ({
  flex: 1, padding: "10px 14px", borderRadius: 99, border: "none",
  background: active ? accent : C.hojaSoft,
  color: active ? activeColor : C.ink,
  fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
  transition: "all .18s",
});

const S = {
  labelMicro: { fontSize: 11, fontWeight: 800, color: C.ink2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
  toggleRow: { display: "flex", gap: 8, marginBottom: 20 },
  amountRow: { display: "flex", gap: 10 },
  pillRow: { display: "flex", gap: 8, marginBottom: 16 },
  pillRowWrap: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 },
  catGrid: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 },
  sueldoInfo: { fontSize: 13, color: C.ink2, marginBottom: 10 },
  inkStrong: { color: C.ink },
};

export function TxModal({ modalType, setModalType, form, setForm, editId, sueldo, customCats = [], onSubmit, onClose }) {
  const allCats = [...CATS, ...customCats];
  const showToggle = modalType !== "sueldo" && !editId;
  const [userPickedCat, setUserPickedCat] = useState(!!editId);
  useEffect(() => { setUserPickedCat(!!editId); }, []); // eslint-disable-line react-hooks/exhaustive-deps
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
  const title = modalType === "ingreso" ? "💰 Agregar ingreso" : modalType === "sueldo" ? "💼 Mi sueldo" : `${editId ? "✏️ Editar" : "➕ Nuevo"} gasto`;
  const submitBg = modalType === "ingreso" ? C.esmeralda : modalType === "sueldo" ? C.menta : C.hoja;
  const submitColor = modalType === "ingreso" ? "#fff" : C.inkOnHoja;
  return (
    <ModalSheet title={title} onClose={onClose}>
      {showToggle && (
        <div style={S.toggleRow}>
          <button className="btn-pill" onClick={() => switchType("gasto")} style={toggleBtn(modalType === "gasto", C.coral, C.inkDanger)}>➖ Gasto</button>
          <button className="btn-pill" onClick={() => switchType("ingreso")} style={toggleBtn(modalType === "ingreso", C.hoja, C.inkOnHoja)}>➕ Ingreso</button>
        </div>
      )}
      {modalType === "sueldo" ? (
        <><p style={S.sueldoInfo}>Actual: <strong style={S.inkStrong}>{fmt(sueldo)}</strong></p>
          <input placeholder="Nuevo sueldo" type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} {...inp()} /></>
      ) : (
        <>
          <input placeholder="Descripción" value={form.desc} onChange={onDescChange} {...inp()} />
          <div style={S.amountRow}>
            <input placeholder="Monto $" type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} {...inp({ style: { flex: 1, marginBottom: 10 } })} />
            <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} {...inp({ style: { flex: 1, marginBottom: 10, fontSize: 13 } })} />
          </div>
          <p style={S.labelMicro}>Moneda</p>
          <div style={S.pillRow}>
            {CURRENCIES.map((cur) => {
              const active = (form.currency || "ARS") === cur.id;
              return (
                <button key={cur.id} className="btn-pill" onClick={() => setForm({ ...form, currency: cur.id })} style={{ flex: 1, padding: "10px 14px", borderRadius: 99, border: "none", background: active ? C.hoja : C.hojaSoft, color: active ? C.inkOnHoja : C.ink, fontSize: 13, fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>{cur.symbol} {cur.id}</button>
              );
            })}
          </div>
          {modalType !== "ingreso" && <>
            <p style={S.labelMicro}>Método de pago</p>
            <div style={S.pillRowWrap}>
              {METHODS.map((m) => <button key={m.id} className="btn-pill" onClick={() => setForm({ ...form, method: m.id })} style={{ padding: "9px 14px", borderRadius: 99, border: "none", background: form.method === m.id ? (m.id === "credito" ? C.coral : C.hoja) : C.hojaSoft, color: form.method === m.id ? (m.id === "credito" ? C.inkDanger : C.inkOnHoja) : C.ink, fontSize: 13, fontWeight: 800 }}>{m.icon} {m.label}</button>)}
            </div>
            <p style={S.labelMicro}>Categoría</p>
            <div style={S.catGrid}>
              {allCats.map((c) => <button key={c.id} className="btn-pill" onClick={() => pickCat(c.id)} style={{ padding: "8px 14px", borderRadius: 99, border: "none", background: form.cat === c.id ? C.menta : C.hojaSoft, color: C.ink, fontSize: 13, fontWeight: 800 }}>{c.emoji} {c.label}</button>)}
            </div>
          </>}
        </>
      )}
      <button onClick={onSubmit} style={{ width: "100%", padding: 16, borderRadius: 18, border: "none", background: submitBg, color: submitColor, fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 8px 20px ${submitBg}66` }}>
        {editId ? "Guardar" : modalType === "sueldo" ? "Actualizar sueldo" : modalType === "ingreso" ? "Agregar ingreso" : "Agregar gasto"}
      </button>
    </ModalSheet>
  );
}
