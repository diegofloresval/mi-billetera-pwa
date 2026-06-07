import { useState } from "react";
import { C } from "../constants";

export function BudgetInput({ initial, color, onSave, onCancel }) {
  const [val, setVal] = useState(String(initial ?? ""));
  const save = () => onSave(Number(val) || 0);
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <input
        aria-label="Presupuesto"
        type="number"
        inputMode="numeric"
        value={val}
        autoFocus
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") save(); else if (e.key === "Escape") onCancel(); }}
        style={{ flex: 1, minWidth: 0, border: `1.5px solid ${color}`, borderRadius: 12, padding: "8px 12px", fontSize: 13, fontWeight: 700, color: C.ink, background: C.bg, fontFamily: "inherit" }}
      />
      <button
        onClick={save}
        style={{ border: "none", background: color, color: "#fff", borderRadius: 12, padding: "8px 12px", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
      >✓</button>
    </div>
  );
}
