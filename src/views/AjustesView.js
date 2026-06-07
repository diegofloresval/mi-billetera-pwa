import { useState } from "react";
import { C } from "../constants";
import { Icon } from "../components/Icon";
import { uid } from "../helpers";

const S = {
  root: { paddingTop: 12 },
  sectionLabel: { fontSize: 11, fontWeight: 800, color: C.ink2, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 },
  profileCard: { background: C.card, borderRadius: 20, padding: "16px 18px", marginBottom: 22, boxShadow: `0 4px 14px ${C.hoja}1F` },
  fieldLabel: { fontSize: 12, color: C.ink2, marginBottom: 6, fontWeight: 600 },
  nameInput: { width: "100%", border: "none", background: "transparent", fontSize: 18, fontWeight: 800, color: C.ink, fontFamily: "inherit", padding: 0 },
  row: { background: C.card, borderRadius: 20, padding: "16px 18px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12, boxShadow: `0 4px 14px ${C.hoja}1F` },
  rowDanger: { background: C.card, borderRadius: 20, padding: "16px 18px", marginBottom: 22, display: "flex", alignItems: "center", gap: 12, boxShadow: `0 4px 14px ${C.coral}26` },
  iconCircleHoja: { width: 42, height: 42, borderRadius: "50%", background: C.hojaSoft, display: "flex", alignItems: "center", justifyContent: "center", color: C.inkOnHoja },
  iconCircleMenta: { width: 42, height: 42, borderRadius: "50%", background: C.mentaSoft, display: "flex", alignItems: "center", justifyContent: "center", color: C.esmeralda },
  iconCircleCor: { width: 42, height: 42, borderRadius: "50%", background: C.coralSoft, display: "flex", alignItems: "center", justifyContent: "center", color: C.inkDanger },
  rowBody: { flex: 1 },
  rowTitle: { fontWeight: 800, fontSize: 14, color: C.ink },
  rowTitleDanger: { fontWeight: 800, fontSize: 14, color: C.inkDanger },
  rowSub: { fontSize: 11, color: C.ink2, marginTop: 2 },
  pillBtnHoja: { padding: "8px 16px", borderRadius: 99, border: "none", background: C.hoja, color: C.inkOnHoja, fontWeight: 800, fontSize: 12, cursor: "pointer" },
  pillBtnMenta: { padding: "8px 16px", borderRadius: 99, border: "none", background: C.menta, color: C.inkOnHoja, fontWeight: 800, fontSize: 12, cursor: "pointer" },
  pillBtnCor: { padding: "8px 16px", borderRadius: 99, border: "none", background: C.coral, color: C.inkDanger, fontWeight: 800, fontSize: 12, cursor: "pointer" },
  hiddenInput: { display: "none" },
  aboutCard: { background: C.hojaSoft, borderRadius: 20, padding: "20px 18px", textAlign: "center" },
  aboutEmoji: { fontSize: 32 },
  aboutTitle: { fontWeight: 900, fontSize: 16, color: C.esmeralda, marginTop: 4 },
  aboutSub: { fontSize: 12, color: C.esmeralda, marginTop: 2, opacity: 0.85 },
  catCard: { background: C.card, borderRadius: 20, padding: "14px 16px", marginBottom: 22, boxShadow: `0 4px 14px ${C.hoja}1F` },
  catRow: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.hojaSoft}` },
  catEmojiCircle: { width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, background: C.mentaSoft },
  catLabel: { flex: 1, fontWeight: 700, fontSize: 14, color: C.ink },
  catDelBtn: { border: "none", background: "transparent", color: C.inkDanger, cursor: "pointer", padding: 6, display: "flex", alignItems: "center" },
  catEmpty: { fontSize: 12, color: C.ink2, padding: "6px 0 10px" },
  formRow: { display: "flex", gap: 8, alignItems: "center", marginTop: 12 },
  emojiInput: { width: 48, height: 40, borderRadius: 12, border: `1.5px solid ${C.hojaSoft}`, textAlign: "center", fontSize: 20, padding: 0, color: C.ink, background: "#fff" },
  labelInput: { flex: 1, height: 40, borderRadius: 12, border: `1.5px solid ${C.hojaSoft}`, padding: "0 12px", fontSize: 14, color: C.ink, background: "#fff" },
  addBtn: { marginTop: 10, width: "100%", padding: "10px 16px", borderRadius: 99, border: "none", background: C.hoja, color: C.inkOnHoja, fontWeight: 800, fontSize: 13, cursor: "pointer" },
  addBtnDisabled: { marginTop: 10, width: "100%", padding: "10px 16px", borderRadius: 99, border: "none", background: C.hojaSoft, color: C.inkOnHoja, fontWeight: 800, fontSize: 13, cursor: "not-allowed", opacity: 0.7 },
  fxCard: { background: C.card, borderRadius: 20, padding: "16px 18px", marginBottom: 22, boxShadow: `0 4px 14px ${C.hoja}1F` },
  fxCurrent: { fontWeight: 800, fontSize: 16, color: C.ink },
  fxUpdated: { fontSize: 11, color: C.ink2, marginTop: 4 },
  fxWarn: { fontSize: 11, color: C.inkDanger, marginTop: 4, fontWeight: 700 },
  fxFormRow: { display: "flex", gap: 8, alignItems: "center", marginTop: 12 },
  fxInput: { flex: 1, height: 40, borderRadius: 12, border: `1.5px solid ${C.hojaSoft}`, padding: "0 12px", fontSize: 14, color: C.ink, background: "#fff" },
  fxSaveBtn: { padding: "0 18px", height: 40, borderRadius: 99, border: "none", background: C.hoja, color: C.inkOnHoja, fontWeight: 800, fontSize: 13, cursor: "pointer" },
  fxSaveBtnDisabled: { padding: "0 18px", height: 40, borderRadius: 99, border: "none", background: C.hojaSoft, color: C.inkOnHoja, fontWeight: 800, fontSize: 13, cursor: "not-allowed", opacity: 0.7 },
};

function daysSince(iso) {
  if (!iso) return null;
  const then = new Date(iso + "T00:00:00").getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / 86400000);
}

const FX_SOURCES = [
  { id: "blue", label: "Blue" },
  { id: "oficial", label: "Oficial" },
  { id: "mep", label: "MEP" },
];

export function AjustesView({ nombre, onChangeNombre, onExport, onImportClick, onBorrarTodo, fileInputRef, onFileChange, customCats = [], onAddCustomCat, onDelCustomCat, fxRate = { USD_ARS: 0, updatedAt: null, source: "blue", auto: false }, fxSource = "blue", onUpdateFxRate, onChangeFxSource, onRefreshFx }) {
  const [emoji, setEmoji] = useState("");
  const [label, setLabel] = useState("");
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
    onAddCustomCat?.({ id: uid(), label: label.trim(), emoji: e, color: C.menta, custom: true });
    setEmoji(""); setLabel("");
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
              <div style={S.catEmojiCircle}>{c.emoji}</div>
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
        </div>
        <button onClick={handleAdd} disabled={!canAdd} style={canAdd ? S.addBtn : S.addBtnDisabled} className="btn-pill">
          Agregar categoría
        </button>
      </div>

      <p style={S.sectionLabel}>💱 Tipo de cambio</p>
      <div style={S.fxCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <p style={S.fxCurrent}>
            {fxRate?.USD_ARS > 0 ? `1 USD = $${fxRate.USD_ARS} ARS` : "No definido"}
          </p>
          {fxRate?.auto && (
            <span style={{ fontSize: 10, fontWeight: 900, color: C.inkOnHoja, background: C.hojaSoft, borderRadius: 99, padding: "3px 8px", letterSpacing: 0.5 }}>AUTO</span>
          )}
        </div>
        <p style={S.fxUpdated}>
          Actualizado: {fxRate?.updatedAt || "—"}
          {fxRate?.source ? ` · ${fxRate.source}` : ""}
        </p>
        {fxStale && <p style={S.fxWarn}>Actualizá el tipo de cambio</p>}

        <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
          {FX_SOURCES.map((src) => {
            const active = fxSource === src.id;
            return (
              <button
                key={src.id}
                onClick={() => active ? null : onChangeFxSource?.(src.id)}
                className="btn-pill"
                style={{
                  padding: "6px 14px",
                  borderRadius: 99,
                  border: active ? "none" : `1.5px solid ${C.hojaSoft}`,
                  background: active ? C.hoja : "transparent",
                  color: active ? C.inkOnHoja : C.ink2,
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: "pointer",
                }}
                aria-pressed={active}
              >
                {src.label}
              </button>
            );
          })}
          <button onClick={() => onRefreshFx?.()} className="btn-pill" style={{ marginLeft: "auto", padding: "6px 14px", borderRadius: 99, border: "none", background: C.mentaSoft, color: C.esmeralda, fontWeight: 800, fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon name="refresh" size={14} /> Actualizar
          </button>
        </div>

        <div style={S.fxFormRow}>
          <input
            type="number"
            inputMode="decimal"
            value={fxInput}
            onChange={(e) => setFxInput(e.target.value)}
            placeholder="O ingresá uno manual"
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
        <div style={S.iconCircleHoja}><Icon name="upload" size={20} /></div>
        <div style={S.rowBody}>
          <p style={S.rowTitle}>Exportar datos</p>
          <p style={S.rowSub}>Descargá un JSON con toda tu info</p>
        </div>
        <button className="btn-pill" onClick={onExport} style={S.pillBtnHoja}>Exportar</button>
      </div>

      <div style={S.row}>
        <div style={S.iconCircleMenta}><Icon name="download" size={20} /></div>
        <div style={S.rowBody}>
          <p style={S.rowTitle}>Importar datos</p>
          <p style={S.rowSub}>Reemplazá tu info actual con un backup</p>
        </div>
        <button className="btn-pill" onClick={onImportClick} style={S.pillBtnMenta}>Importar</button>
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
        <p style={S.aboutEmoji}>🐱</p>
        <p style={S.aboutTitle}>Mi Billetera v0.3</p>
        <p style={S.aboutSub}>Hecha para llevar tus gastos de forma simple</p>
      </div>
    </div>
  );
}
