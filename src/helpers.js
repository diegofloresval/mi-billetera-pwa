import { STORE_KEY, CAT, INITIAL_STATE } from "./constants";

const isValidYmd = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const isValidYm = (s) => typeof s === "string" && /^\d{4}-\d{2}$/.test(s);

const sanitizeTx = (t) => {
  if (!t || typeof t !== "object") return null;
  const monto = Number(t.monto);
  if (!Number.isFinite(monto) || monto < 0) return null;
  if (!isValidYmd(t.fecha)) return null;
  const type = t.type === "ingreso" ? "ingreso" : "gasto";
  const cat = type === "ingreso" ? "ingreso" : (CAT[t.cat] ? t.cat : "otro");
  return {
    id: typeof t.id === "string" && t.id ? t.id : Math.random().toString(36).slice(2, 9),
    type,
    monto,
    fecha: t.fecha,
    cat,
    desc: typeof t.desc === "string" ? t.desc : "",
    method: typeof t.method === "string" ? t.method : "debito",
  };
};

const sanitizeFijo = (f) => {
  if (!f || typeof f !== "object") return null;
  const monto = Number(f.monto);
  if (!Number.isFinite(monto) || monto < 0) return null;
  if (typeof f.desc !== "string" || !f.desc) return null;
  const tipo = f.tipo === "cuotas" ? "cuotas" : "mensual";
  return {
    id: typeof f.id === "string" && f.id ? f.id : Math.random().toString(36).slice(2, 9),
    desc: f.desc,
    monto,
    cat: CAT[f.cat] ? f.cat : "otro",
    method: typeof f.method === "string" ? f.method : "debito",
    tipo,
    activo: f.activo !== false,
    hastaFecha: tipo === "mensual" ? (isValidYm(f.hastaFecha) ? f.hastaFecha : null) : null,
    cuotasTotales: tipo === "cuotas" && Number.isFinite(Number(f.cuotasTotales)) ? Number(f.cuotasTotales) : null,
    cuotasPagadas: tipo === "cuotas" && Number.isFinite(Number(f.cuotasPagadas)) ? Number(f.cuotasPagadas) : 0,
    desde: tipo === "cuotas" && isValidYm(f.desde) ? f.desde : null,
  };
};

export const sanitizeState = (raw) => {
  if (!raw || typeof raw !== "object") return { state: { ...INITIAL_STATE }, dropped: 0 };
  const txsIn = Array.isArray(raw.txs) ? raw.txs : [];
  const fijosIn = Array.isArray(raw.fijos) ? raw.fijos : [];
  const txs = txsIn.map(sanitizeTx).filter(Boolean);
  const fijos = fijosIn.map(sanitizeFijo).filter(Boolean);
  const dropped = (txsIn.length - txs.length) + (fijosIn.length - fijos.length);
  return {
    state: {
      ...INITIAL_STATE,
      txs,
      fijos,
      budgets: raw.budgets && typeof raw.budgets === "object" ? { ...INITIAL_STATE.budgets, ...raw.budgets } : INITIAL_STATE.budgets,
      sueldo: Number.isFinite(Number(raw.sueldo)) ? Number(raw.sueldo) : 0,
      nombre: typeof raw.nombre === "string" ? raw.nombre : "",
    },
    dropped,
  };
};

export const saveData = (data) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); return true; }
  catch { return false; }
};

export const loadData = () => {
  try {
    const d = localStorage.getItem(STORE_KEY);
    if (!d) return { state: null, dropped: 0, error: null };
    const parsed = JSON.parse(d);
    const { state, dropped } = sanitizeState(parsed);
    return { state, dropped, error: null };
  } catch (e) {
    return { state: null, dropped: 0, error: "corrupt" };
  }
};

export const uid = () => Math.random().toString(36).slice(2, 9);

export const fmt = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n || 0);

export const today = () => new Date().toISOString().slice(0, 10);
export const currentMonth = () => new Date().toISOString().slice(0, 7);
export const monthOf = (fecha) => typeof fecha === "string" ? fecha.slice(0, 7) : null;
export const isInMonth = (fecha, ym) => monthOf(fecha) === ym;

export const saludo = () => {
  const h = new Date().getHours();
  if (h < 6) return "Buenas noches";
  if (h < 13) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
};

export const monthLabel = (ym) => {
  const [y, m] = ym.split("-").map(Number);
  const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  return `${meses[m-1]} ${y}`;
};

export const addMonth = (ym, delta) => {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
};

export const fijoActivoEsteMes = (f, ym = currentMonth()) => {
  if (!f.activo) return false;
  if (f.tipo === "cuotas") {
    if ((f.cuotasTotales - f.cuotasPagadas) <= 0) return false;
    if (f.desde) {
      if (ym < f.desde) return false;
      const hasta = addMonth(f.desde, f.cuotasTotales - 1);
      if (ym > hasta) return false;
    }
    return true;
  }
  if (!f.hastaFecha) return true;
  return ym <= f.hastaFecha;
};

export const cuotaLabel = (f) => {
  const rest = f.cuotasTotales - f.cuotasPagadas;
  return `Cuota ${f.cuotasPagadas + 1}/${f.cuotasTotales} · quedan ${rest}`;
};
