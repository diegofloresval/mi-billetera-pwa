import { C, CATS } from "../constants";
import { fmt } from "../helpers";
import { Bar } from "../components/Bar";
import { BudgetInput } from "../components/BudgetInput";

export function PresupuestoView({ budgets, spentByCat, budgetEdit, setBudgetEdit, onSaveBudget }) {
  const totalBudget = Object.values(budgets).reduce((a, b) => a + (b || 0), 0);
  const totalSpent = CATS.reduce((a, c) => a + spentByCat(c.id), 0);
  const pct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const queda = Math.max(totalBudget - totalSpent, 0);

  return (
    <div className="fade-in" style={{ paddingTop: 8 }}>
      <div style={{ background: C.esmeralda, borderRadius: 24, padding: "18px 20px", marginBottom: 18, color: "#fff", boxShadow: `0 10px 28px ${C.esmeralda}66` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, opacity: 0.85, textTransform: "uppercase", letterSpacing: 1 }}>Total gastado</p>
            <p style={{ fontSize: 26, fontWeight: 900, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{fmt(totalSpent)}</p>
          </div>
          <span style={{ background: C.menta, color: C.inkOnHoja, borderRadius: 99, padding: "5px 12px", fontSize: 11, fontWeight: 800 }}>queda {fmt(queda)}</span>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,.25)", overflow: "hidden", marginTop: 12 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "#fff", borderRadius: 99 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, opacity: 0.85 }}>
          <span>$0</span><span>Meta: {fmt(totalBudget)}</span>
        </div>
      </div>

      <p style={{ fontSize: 13, color: C.ink2, marginBottom: 12, fontWeight: 600 }}>Tocá una categoría para editar el límite</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {CATS.map((c) => {
          const spent = spentByCat(c.id);
          const budget = budgets[c.id] || 0;
          const over = budget > 0 && spent > budget;
          const editing = budgetEdit === c.id;
          return (
            <div key={c.id} style={{ background: C.card, borderRadius: 20, padding: "14px 14px 12px", cursor: "pointer", border: editing ? `2px solid ${C.hoja}` : "2px solid transparent", boxShadow: `0 4px 14px ${C.hoja}1A` }} onClick={() => setBudgetEdit(editing ? null : c.id)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.mentaSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{c.emoji}</div>
                <span style={{ fontSize: 9, fontWeight: 800, background: over ? C.coralSoft : budget > 0 ? C.mentaSoft : C.hojaSoft, color: over ? C.inkDanger : budget > 0 ? C.inkSuccess : C.ink2, borderRadius: 99, padding: "3px 8px" }}>{over ? "⚠️ Excedido" : budget > 0 ? `queda ${fmt(budget - spent)}` : "sin límite"}</span>
              </div>
              <p style={{ fontWeight: 800, fontSize: 13, color: C.ink, marginTop: 10 }}>{c.label}</p>
              <p style={{ fontWeight: 900, fontSize: 15, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{fmt(spent)}</p>
              <Bar spent={spent} budget={budget} color={C.hoja} />
              {editing && (
                <div style={{ marginTop: 10 }} onClick={(e) => e.stopPropagation()}>
                  <BudgetInput
                    initial={budget}
                    color={C.hoja}
                    onSave={(n) => onSaveBudget(c.id, n)}
                    onCancel={() => setBudgetEdit(null)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
