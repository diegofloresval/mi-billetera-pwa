import { C } from "../constants";

export function Bar({ spent, budget, color }) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  return (
    <div style={{ height: 6, borderRadius: 99, background: C.lavandaSoft, overflow: "hidden", marginTop: 8 }}>
      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: pct >= 100 ? C.coral : color, transition: "width 0.6s cubic-bezier(.34,1.56,.64,1)" }} />
    </div>
  );
}
