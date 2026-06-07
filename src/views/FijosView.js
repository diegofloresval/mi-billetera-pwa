import { C } from "../constants";
import { fmt } from "../helpers";
import { FijoCard } from "../components/FijoCard";
import { ManekiNeko } from "../components/ManekiNeko";


export function FijosView({ totalFijos, activosFijos, inactivosFijos, fijos, onEditFijo, onDelFijo, onToggleFijo, onPagarFijo }) {
  return (
    <div className="fade-in" style={{ paddingTop: 8 }}>
      <div style={{ background: C.hojaSoft, borderRadius: 26, padding: "20px 20px", marginBottom: 22, textAlign: "center" }}>
        <p style={{ fontSize: 12, color: C.ink2, fontWeight: 700, marginBottom: 4 }}>Total activos este mes</p>
        <p style={{ fontWeight: 900, fontSize: 40, color: C.inkDanger, fontVariantNumeric: "tabular-nums", letterSpacing: -1 }}>{fmt(totalFijos)}</p>
      </div>
      {activosFijos.length > 0 && <>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, letterSpacing: 1.5, textTransform: "uppercase" }}>Activos este mes</p>
          <p style={{ fontSize: 12, fontWeight: 800, color: C.esmeralda }}>{activosFijos.length} {activosFijos.length === 1 ? "servicio" : "servicios"}</p>
        </div>
        {activosFijos.map((f) => <FijoCard key={f.id} f={f} onEdit={() => onEditFijo(f)} onDel={() => onDelFijo(f.id)} onToggle={() => onToggleFijo(f.id)} onPagar={() => onPagarFijo(f.id)} />)}
      </>}
      {inactivosFijos.length > 0 && <>
        <p style={{ fontSize: 11, fontWeight: 800, color: C.ink2, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, marginTop: 26 }}>Inactivos / Terminados</p>
        {inactivosFijos.map((f) => <FijoCard key={f.id} f={f} onEdit={() => onEditFijo(f)} onDel={() => onDelFijo(f.id)} onToggle={() => onToggleFijo(f.id)} onPagar={() => onPagarFijo(f.id)} />)}
      </>}
      {fijos.length === 0 && (
        <div style={{ textAlign: "center", marginTop: 60, padding: "0 20px" }}>
          <div style={{ marginBottom: 14, display: "flex", justifyContent: "center" }}>
            <ManekiNeko size={180} variant="stop" alt="Maneki neko frenando gastos" />
          </div>
          <p style={{ color: C.ink, fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Sin gastos fijos</p>
          <p style={{ color: C.ink2, fontSize: 13 }}>Agregá gym, celular, cuotas...</p>
        </div>
      )}
    </div>
  );
}
