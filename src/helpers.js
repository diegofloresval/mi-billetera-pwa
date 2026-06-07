import { STORE_KEY, CAT, INITIAL_STATE } from "./constants";

const isValidYmd = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const isValidYm = (s) => typeof s === "string" && /^\d{4}-\d{2}$/.test(s);

const sanitizeCurrency = (c) => (c === "USD" || c === "ARS") ? c : "ARS";

const sanitizeTx = (t, validCatIds) => {
  if (!t || typeof t !== "object") return null;
  const monto = Number(t.monto);
  if (!Number.isFinite(monto) || monto < 0) return null;
  if (!isValidYmd(t.fecha)) return null;
  const type = t.type === "ingreso" ? "ingreso" : "gasto";
  const catOk = validCatIds ? validCatIds.has(t.cat) : !!CAT[t.cat];
  const cat = type === "ingreso" ? "ingreso" : (catOk ? t.cat : "otro");
  const fxAtTxRaw = Number(t.fxAtTx);
  const fxAtTx = Number.isFinite(fxAtTxRaw) && fxAtTxRaw > 0 ? fxAtTxRaw : null;
  return {
    id: typeof t.id === "string" && t.id ? t.id : Math.random().toString(36).slice(2, 9),
    type,
    monto,
    fecha: t.fecha,
    cat,
    desc: typeof t.desc === "string" ? t.desc : "",
    method: typeof t.method === "string" ? t.method : "debito",
    currency: sanitizeCurrency(t.currency),
    fxAtTx,
  };
};

const sanitizeFijo = (f, validCatIds) => {
  if (!f || typeof f !== "object") return null;
  const monto = Number(f.monto);
  if (!Number.isFinite(monto) || monto < 0) return null;
  if (typeof f.desc !== "string" || !f.desc) return null;
  const tipo = f.tipo === "cuotas" ? "cuotas" : "mensual";
  const catOk = validCatIds ? validCatIds.has(f.cat) : !!CAT[f.cat];
  return {
    id: typeof f.id === "string" && f.id ? f.id : Math.random().toString(36).slice(2, 9),
    desc: f.desc,
    monto,
    cat: catOk ? f.cat : "otro",
    method: typeof f.method === "string" ? f.method : "debito",
    tipo,
    activo: f.activo !== false,
    hastaFecha: tipo === "mensual" ? (isValidYm(f.hastaFecha) ? f.hastaFecha : null) : null,
    cuotasTotales: tipo === "cuotas" && Number.isFinite(Number(f.cuotasTotales)) ? Number(f.cuotasTotales) : null,
    cuotasPagadas: tipo === "cuotas" && Number.isFinite(Number(f.cuotasPagadas)) ? Number(f.cuotasPagadas) : 0,
    desde: tipo === "cuotas" && isValidYm(f.desde) ? f.desde : null,
    currency: sanitizeCurrency(f.currency),
  };
};

const VALID_FX_SOURCES = ["blue", "oficial", "mep"];
const sanitizeFxSource = (s) => VALID_FX_SOURCES.includes(s) ? s : "blue";

const sanitizeFxRate = (fx) => {
  if (!fx || typeof fx !== "object") return { USD_ARS: 0, updatedAt: null, source: "blue", auto: false };
  const n = Number(fx.USD_ARS);
  const USD_ARS = Number.isFinite(n) && n >= 0 ? n : 0;
  const updatedAt = typeof fx.updatedAt === "string" ? fx.updatedAt : null;
  return { USD_ARS, updatedAt, source: sanitizeFxSource(fx.source), auto: fx.auto === true };
};

const sanitizeAhorro = (a) => {
  if (!a || typeof a !== "object") return null;
  if (typeof a.id !== "string" || !a.id) return null;
  if (typeof a.nombre !== "string" || !a.nombre) return null;
  const meta = Number(a.meta);
  if (!Number.isFinite(meta) || meta <= 0) return null;
  const actual = Number(a.actual);
  if (!Number.isFinite(actual) || actual < 0) return null;
  if (typeof a.color !== "string" || !a.color) return null;
  if (typeof a.emoji !== "string" || !a.emoji) return null;
  return {
    id: a.id,
    nombre: a.nombre,
    meta,
    actual,
    color: a.color,
    emoji: a.emoji,
    currency: sanitizeCurrency(a.currency),
  };
};

const sanitizeAporte = (p) => {
  if (!p || typeof p !== "object") return null;
  if (typeof p.id !== "string" || !p.id) return null;
  if (typeof p.ahorroId !== "string" || !p.ahorroId) return null;
  const monto = Number(p.monto);
  if (!Number.isFinite(monto) || monto <= 0) return null;
  if (!isValidYmd(p.fecha)) return null;
  return {
    id: p.id,
    ahorroId: p.ahorroId,
    monto,
    fecha: p.fecha,
    currency: sanitizeCurrency(p.currency),
    txId: typeof p.txId === "string" && p.txId ? p.txId : null,
  };
};

const sanitizeCustomCat = (c) => {
  if (!c || typeof c !== "object") return null;
  if (typeof c.id !== "string" || !c.id) return null;
  if (typeof c.label !== "string" || !c.label) return null;
  if (typeof c.emoji !== "string" || !c.emoji) return null;
  if (typeof c.color !== "string" || !c.color) return null;
  return { id: c.id, label: c.label, emoji: c.emoji, color: c.color, custom: true };
};

export const sanitizeState = (raw) => {
  if (!raw || typeof raw !== "object") return { state: { ...INITIAL_STATE }, dropped: 0 };
  const txsIn = Array.isArray(raw.txs) ? raw.txs : [];
  const fijosIn = Array.isArray(raw.fijos) ? raw.fijos : [];
  const customCatsIn = Array.isArray(raw.customCats) ? raw.customCats : [];
  const customCats = customCatsIn.map(sanitizeCustomCat).filter(Boolean);
  const validCatIds = new Set([...Object.keys(CAT), ...customCats.map((c) => c.id)]);
  const txs = txsIn.map((t) => sanitizeTx(t, validCatIds)).filter(Boolean);
  const fijos = fijosIn.map((f) => sanitizeFijo(f, validCatIds)).filter(Boolean);
  const ahorrosIn = Array.isArray(raw.ahorros) ? raw.ahorros : [];
  const aportesIn = Array.isArray(raw.aportes) ? raw.aportes : [];
  const ahorros = ahorrosIn.map(sanitizeAhorro).filter(Boolean);
  const aportes = aportesIn.map(sanitizeAporte).filter(Boolean);
  const dropped =
    (txsIn.length - txs.length) +
    (fijosIn.length - fijos.length) +
    (customCatsIn.length - customCats.length) +
    (ahorrosIn.length - ahorros.length) +
    (aportesIn.length - aportes.length);
  return {
    state: {
      ...INITIAL_STATE,
      txs,
      fijos,
      budgets: raw.budgets && typeof raw.budgets === "object" ? { ...INITIAL_STATE.budgets, ...raw.budgets } : INITIAL_STATE.budgets,
      sueldo: Number.isFinite(Number(raw.sueldo)) ? Number(raw.sueldo) : 0,
      nombre: typeof raw.nombre === "string" ? raw.nombre : "",
      customCats,
      fxRate: sanitizeFxRate(raw.fxRate),
      fxSource: sanitizeFxSource(raw.fxSource),
      ahorros,
      aportes,
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

export const fmt = (n, currency = "ARS") => {
  const val = n || 0;
  if (currency === "USD") {
    const num = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    return `US$ ${num}`;
  }
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(val);
};

export const toARS = (monto, currency, fxRate) => {
  if (currency === "ARS" || !currency) return monto;
  const rate = fxRate && Number(fxRate.USD_ARS);
  if (!rate) return null;
  return monto * rate;
};

const FX_SOURCE_MAP = { blue: "blue", oficial: "oficial", mep: "bolsa" };

export const fetchFxRate = async (source = "blue") => {
  const slug = FX_SOURCE_MAP[source] || "blue";
  const res = await fetch(`https://dolarapi.com/v1/dolares/${slug}`);
  if (!res.ok) throw new Error("fx_fetch_failed");
  const data = await res.json();
  const venta = Number(data?.venta);
  const compra = Number(data?.compra);
  const mid = Number.isFinite(venta) && Number.isFinite(compra) && compra > 0
    ? Math.round((venta + compra) / 2)
    : (Number.isFinite(venta) ? Math.round(venta) : null);
  if (!mid || mid <= 0) throw new Error("fx_invalid");
  return mid;
};

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

const GUESS_RULES = [
  { cat: "supermercado", patterns: ["super", "coto", "disco", "jumbo", "carrefour", "walmart", "mercado", "🛒"] },
  { cat: "transporte",   patterns: ["uber", "cabify", "taxi", "nafta", "combustible", "subte", "colectivo", "bondi", "sube", "🚌", "🚗", "⛽"] },
  { cat: "ocio",         patterns: ["cine", "netflix", "spotify", "juego", "joystick", "🎮", "🎬"] },
  { cat: "salud",        patterns: ["farmacia", "medico", "doctor", "hospital", "💊"] },
  { cat: "ropa",         patterns: ["zara", "adidas", "nike", "remera", "pantalon", "👟", "👕"] },
  { cat: "casa",         patterns: ["alquiler", "expensas", "🏠"] },
  { cat: "educacion",    patterns: ["curso", "libro", "universidad", "📚"] },
  { cat: "restaurante",  patterns: ["resto", "pizza", "hamburguesa", "sushi", "🍕", "🍔", "🍣"] },
  { cat: "servicios",    patterns: ["luz", "agua", "gas", "internet", "edesur", "💡"] },
  { cat: "suscripcion",  patterns: ["suscripcion", "membresia", "📱"] },
  { cat: "gym",          patterns: ["gym", "gimnasio", "smartfit", "🏋"] },
];

export const guessCat = (desc) => {
  if (typeof desc !== "string") return null;
  const s = desc.toLowerCase().trim();
  if (!s) return null;
  for (const rule of GUESS_RULES) {
    for (const p of rule.patterns) {
      if (s.includes(p)) return rule.cat;
    }
  }
  return null;
};
