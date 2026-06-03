import { C } from "../constants";
import { Icon } from "../components/Icon";

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
};

export function AjustesView({ nombre, onChangeNombre, onExport, onImportClick, onBorrarTodo, fileInputRef, onFileChange }) {
  return (
    <div className="fade-in" style={S.root}>
      <p style={S.sectionLabel}>Perfil</p>
      <div style={S.profileCard}>
        <p style={S.fieldLabel}>Tu nombre</p>
        <input value={nombre} onChange={(e) => onChangeNombre(e.target.value)} placeholder="¿Cómo te llamás?" style={S.nameInput} />
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
