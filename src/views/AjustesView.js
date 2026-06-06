import { useState } from "react";
import { C, CUSTOM_CAT_COLORS } from "../constants";
import { Icon } from "../components/Icon";
import { uid } from "../helpers";

const S = {
  root: { paddingTop: 12 },
  sectionLabel: { fontSize: 11, fontWeight: 800, color: C.ink2, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 },
  profileCard: { background: C.card, borderRadius: 20, padding: "16px 18px", marginBottom: 22, boxShadow: `0 4px 14px ${C.lavanda}10` },
  fieldLabel: { fontSize: 12, color: C.ink2, marginBottom: 6, fontWeight: 600 },
  nameInput: { width: "100%", border: "none", background: "transparent", fontSize: 18, fontWeight: 800, color: C.ink, fontFamily: "inherit", padding: 0 },
  row: { background: C.card, borderRadius: 20, padding: "16px 18px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12, boxShadow: `0 4px 14px ${C.lavanda}10` },
  rowDanger: { background: C.card, borderRadius: 20, padding: "16px 18px", marginBottom: 22, display: "flex", alignItems: "center", gap: 12, boxShadow: `0 4px 14px ${C.coral}1A` },
  iconCircleLav: { width: 42, height: 42, borderRadius: "50%", background: C.lavandaSoft, display: "flex", alignItems: "center", justifyContent: "center", color: "#6B46C1" },
  iconCircleCel: { width: 42, height: 42, borderRadius: "50%", background: C.celesteSoft, display: "flex", alignItems: "center", justifyContent: "center", color: "#1A6BA0" },
  iconCircleCor: { width: 42, height: 42, borderRadius: "50%", background: C.coralSoft, display: "flex", alignItems: "center", justifyContent: "center", color: "#D4587E" },
  rowBody: { flex: 1 },
  rowTitle: { fontWeight: 800, fontSize: 14, color: C.ink },
  rowTitleDanger: { fontWeight: 800, fontSize: 14, color: "#D4587E" },
  rowSub: { fontSize: 11, color: C.ink2, marginTop: 2 },
  pillBtnLav: { padding: "8px 16px", borderRadius: 99, border: "none", background: C.lavanda, color: "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer" },
  pillBtnCel: { padding: "8px 16px", borderRadius: 99, border: "none", background: C.celeste, color: "#1A6BA0", fontWeight: 800, fontSize: 12, cursor: "pointer" },
  pillBtnCor: { padding: "8px 16px", borderRadius: 99, border: "none", background: C.coral, color: "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer" },
  hiddenInput: { display: "none" },
  aboutCard: { background: C.lavandaSoft, borderRadius: 20, padding: "20px 18px", textAlign: "center" },
  aboutEmoji: { fontSize: 32 },
  aboutTitle: { fontWeight: 900, fontSize: 16, color: "#6B46C1", marginTop: 4 },
  aboutSub: { fontSize: 12, color: "#6B46C1", marginTop: 2, opacity: 0.85 },
  catCard: { background: C.card, borderRadius: 20, padding: "14px 16px", marginBottom: 22, boxShadow: `0 4px 14px ${C.lavanda}10` },
  catRow: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.lavandaSoft}` },
  catEmojiCircle: { width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  catLabel: { flex: 1, fontWeight: 700, fontSize: 14, color: C.ink },
  catDelBtn: { border: "none", background: "transparent", color: "#D4587E", cursor: "pointer", padding: 6, display: "flex", alignItems: "center" },
  catEmpty: { fontSize: 12, color: C.ink2, padding: "6px 0 10px" },
  formRow: { display: "flex", gap: 8, alignItems: "center", marginTop: 12 },
  emojiInput: { width: 48, height: 40, borderRadius: 12, border: `1.5px solid ${C.lavandaSoft}`, textAlign: "center", fontSize: 20, padding: 0, color: C.ink, background: "#fff" },
  labelInput: { flex: 1, height: 40, borderRadius: 12, border: `1.5px solid ${C.lavandaSoft}`, padding: "0 12px", fontSize: 14, color: C.ink, background: "#fff" },
  colorSelect: { height: 40, borderRadius: 12, border: `1.5px solid ${C.lavandaSoft}`, padding: "0 8px", fontSize: 14, background: "#fff", color: C.ink },
  addBtn: { marginTop: 10, width: "100%", padding: "10px 16px", borderRadius: 99, border: "none", background: C.lavanda, color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer" },
  addBtnDisabled: { marginTop: 10, width: "100%", padding: "10px 16px", borderRadius: 99, border: "none", background: C.lavandaSoft, color: "#6B46C1", fontWeight: 800, fontSize: 13, cursor: "not-allowed", opacity: 0.7 },
  fxCard: { background: C.card, borderRadius: 20, padding: "16px 18px", marginBottom: 22, boxShadow: `0 4px 14px ${C.lavanda}10` },
  fxCurrent: { fontWeight: 800, fontSize: 16, color: C.ink },
  fxUpdated: { fontSize: 11, color: C.ink2, marginTop: 4 },
  fxWarn: { fontSize: 11, color: C.coral, marginTop: 4, fontWeight: 700 },
  fxFormRow: { display: "flex", gap: 8, alignItems: "center", marginTop: 12 },
  fxInput: { flex: 1, height: 40, borderRadius: 12, border: `1.5px solid ${C.lavandaSoft}`, padding: "0 12px", fontSize: 14, color: C.ink, background: "#fff" },
  fxSaveBtn: { padding: "0 18px", height: 40, borderRadius: 99, border: "none", background: C.lavanda, color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer" },
  fxSaveBtnDisabled: { padding: "0 18px", height: 40, borderRadius: 99, border: "none", background: C.lavandaSoft, color: "#6B46C1", fontWeight: 800, fontSize: 13, cursor: "not-allowed", opacity: 0.7 },
};

function daysSince(iso) {
  if (!iso) return null;
  const then = new Date(iso + "T00:00:00").getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / 86400000);
}

export function AjustesView({ nombre, onChangeNombre, onExport, onImportClick, onBorrarTodo, fileInputRef, onFileChange, customCats = [], onAddCustomCat, onDelCustomCat, fxRate = { USD_ARS: 0, updatedAt: null }, onUpdateFxRate }) {
  const [emoji, setEmoji] = useState("");
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(CUSTOM_CAT_COLORS[0]);
  const [fxInput, setFxInput] = useState("");

  const canAdd = emoji.trim() && label.trim();
  const canSaveFx = fxInput.trim() && Number(fxInput) > 0;

  const handleSaveFx = () => {
    if (!canSaveFx) return;
    onUpdateFxRate?.(Number(fxInput));
    setFxInput("");
  };

  const fxDays = daysSince(fxRate?.updatedAt);
  const fxStale = fxDays !== null && fxDays > 30;

  const handleAdd = () => {
    if (!canAdd) return;
    const e = Array.from(emoji.trim())[0] || emoji.trim();
    onAddCustomCat?.({ id: uid(), label: label.trim(), emoji: e, color, custom: true });
    setEmoji(""); setLabel(""); setColor(CUSTOM_CAT_COLORS[0]);
  };

  return (
    <div className="fade-in" style={S.root}>
      <p style={S.sectionLabel}>Perfil</p>
      <div style={S.profileCard}>
        <p style={S.fieldLabel}>Tu nombre</p>
        <input value={nombre} onChange={(e) => onChangeNombre(e.target.value)} placeholder="¿Cómo te llamás?" style={S.nameInput} />
      </div>

      <p style={S.sectionLabel}>🏷️ Mis categorías</p>
      <div style={S.catCard}>
        {customCats.length === 0 ? (
          <p style={S.catEmpty}>Todavía no agregaste categorías propias.</p>
        ) : (
          customCats.map((c) => (
            <div key={c.id} style={S.catRow}>
              <div style={{ ...S.catEmojiCircle, background: c.color + "22", color: c.color }}>{c.emoji}</div>
              <span style={S.catLabel}>{c.label}</span>
              <button onClick={() => onDelCustomCat?.(c.id)} style={S.catDelBtn} aria-label="Eliminar categoría">
                <Icon name="delete" size={20} />
              </button>
            </div>
          ))
        )}
        <div style={S.formRow}>
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="🎯"
            maxLength={4}
            style={S.emojiInput}
            aria-label="Emoji"
          />
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Nombre"
            style={S.labelInput}
            aria-label="Nombre"
          />
          <select value={color} onChange={(e) => setColor(e.target.value)} style={S.colorSelect} aria-label="Color">
            {CUSTOM_CAT_COLORS.map((c) => (
              <option key={c} value={c} style={{ color: c }}>{c}</option>
            ))}
          </select>
        </div>
        <button onClick={handleAdd} disabled={!canAdd} style={canAdd ? S.addBtn : S.addBtnDisabled} className="btn-pill">
          Agregar categoría
        </button>
      </div>

      <p style={S.sectionLabel}>💱 Tipo de cambio</p>
      <div style={S.fxCard}>
        <p style={S.fxCurrent}>
          {fxRate?.USD_ARS > 0 ? `1 USD = $${fxRate.USD_ARS} ARS` : "No definido"}
        </p>
        <p style={S.fxUpdated}>Actualizado: {fxRate?.updatedAt || "—"}</p>
        {fxStale && <p style={S.fxWarn}>Actualizá el tipo de cambio</p>}
        <div style={S.fxFormRow}>
          <input
            type="number"
            inputMode="decimal"
            value={fxInput}
            onChange={(e) => setFxInput(e.target.value)}
            placeholder="Ej: 1200"
            style={S.fxInput}
            aria-label="Nuevo tipo de cambio"
          />
          <button onClick={handleSaveFx} disabled={!canSaveFx} style={canSaveFx ? S.fxSaveBtn : S.fxSaveBtnDisabled} className="btn-pill">
            Guardar
          </button>
        </div>
      </div>

      <p style={S.sectionLabel}>Datos</p>
      <div style={S.row}>
        <div style={S.iconCircleLav}><Icon name="upload" size={20} /></div>
        <div style={S.rowBody}>
          <p style={S.rowTitle}>Exportar datos</p>
          <p style={S.rowSub}>Descargá un JSON con toda tu info</p>
        </div>
        <button className="btn-pill" onClick={onExport} style={S.pillBtnLav}>Exportar</button>
      </div>

      <div style={S.row}>
        <div style={S.iconCircleCel}><Icon name="download" size={20} /></div>
        <div style={S.rowBody}>
          <p style={S.rowTitle}>Importar datos</p>
          <p style={S.rowSub}>Reemplazá tu info actual con un backup</p>
        </div>
        <button className="btn-pill" onClick={onImportClick} style={S.pillBtnCel}>Importar</button>
        <input ref={fileInputRef} type="file" accept="application/json" style={S.hiddenInput} onChange={onFileChange} />
      </div>

      <div style={S.rowDanger}>
        <div style={S.iconCircleCor}><Icon name="delete" size={20} /></div>
        <div style={S.rowBody}>
          <p style={S.rowTitleDanger}>Borrar todo</p>
          <p style={S.rowSub}>Esta acción no se puede deshacer</p>
        </div>
        <button className="btn-pill" onClick={onBorrarTodo} style={S.pillBtnCor}>Borrar</button>
      </div>

      <p style={S.sectionLabel}>Acerca de</p>
      <div style={S.aboutCard}>
        <p style={S.aboutEmoji}>💜</p>
        <p style={S.aboutTitle}>Mi Billetera v0.2</p>
        <p style={S.aboutSub}>Hecha para llevar tus gastos de forma simple</p>
      </div>
    </div>
  );
}
