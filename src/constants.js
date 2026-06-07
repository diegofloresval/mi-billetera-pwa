export const STORE_KEY = "billetera_data_v1";

export const C = {
  // base
  bg:        "#F8F6EE",
  card:      "#FFFFFF",
  ink:       "#1A3D2A",
  ink2:      "#4F7359",

  // marca verde
  esmeralda:     "#007A3D",
  esmeraldaSoft: "#D9EFE2",
  hoja:          "#73C653",
  hojaSoft:      "#E3F4D6",
  menta:         "#BEF8AD",
  mentaSoft:     "#EBFAE4",

  // único acento no-verde, sólo estados (gasto/danger)
  coral:     "#FBA1B7",
  coralSoft: "#FEE5EC",

  // alias semánticos para texto
  inkSuccess: "#007A3D",
  inkOnHoja:  "#0F5C2C",
  inkDanger:  "#A8324E",

  // jerarquía de sombras (sm: contenido, md: cards, lg: hero/FAB)
  shadowSm:   "0 2px 8px rgba(115,198,83,0.10)",
  shadowMd:   "0 4px 14px rgba(115,198,83,0.18)",
  shadowLg:   "0 10px 32px rgba(115,198,83,0.34)",
};

export const CATS = [
  { id: "supermercado", label: "Supermercado", emoji: "🛒", color: C.menta },
  { id: "transporte",   label: "Transporte",   emoji: "🚌", color: C.menta },
  { id: "ocio",         label: "Ocio",         emoji: "🎮", color: C.menta },
  { id: "salud",        label: "Salud",        emoji: "💊", color: C.menta },
  { id: "ropa",         label: "Ropa",         emoji: "👟", color: C.menta },
  { id: "casa",         label: "Casa",         emoji: "🏠", color: C.menta },
  { id: "educacion",    label: "Educación",    emoji: "📚", color: C.menta },
  { id: "restaurante",  label: "Restaurante",  emoji: "🍕", color: C.menta },
  { id: "servicios",    label: "Servicios",    emoji: "💡", color: C.menta },
  { id: "suscripcion",  label: "Suscripción",  emoji: "📱", color: C.menta },
  { id: "gym",          label: "Gym",          emoji: "🏋️", color: C.menta },
  { id: "otro",         label: "Otro",         emoji: "📦", color: C.menta },
];

export const AHORRO_CAT = { id: "ahorro", label: "Ahorro", emoji: "🐱", color: C.hoja };

export const CAT = Object.fromEntries([...CATS, AHORRO_CAT].map((c) => [c.id, c]));

export const METHODS = [
  { id: "debito",   label: "Débito",        icon: "💳" },
  { id: "credito",  label: "Crédito",       icon: "💳" },
  { id: "efectivo", label: "Efectivo",      icon: "💵" },
  { id: "transfer", label: "Transferencia", icon: "🏦" },
];

export const DEFAULT_BUDGETS = {
  supermercado: 80000, transporte: 25000, ocio: 40000, salud: 20000,
  ropa: 30000, casa: 50000, educacion: 15000, restaurante: 35000,
  servicios: 25000, suscripcion: 15000, gym: 25000, otro: 20000,
};

export const CURRENCIES = [
  { id: "ARS", symbol: "$",   label: "Pesos" },
  { id: "USD", symbol: "US$", label: "Dólares" },
];

export const INITIAL_STATE = {
  txs: [],
  fijos: [],
  budgets: DEFAULT_BUDGETS,
  sueldo: 0,
  nombre: "",
  customCats: [],
  fxRate: { USD_ARS: 0, updatedAt: null },
  ahorros: [],
  aportes: [],
};

// Mantenido por compatibilidad con datos existentes; ya no se ofrece selector de color
// al crear categorías custom. Todos los valores son verdes para mantener coherencia.
export const CUSTOM_CAT_COLORS = [
  C.menta, C.hoja, C.esmeraldaSoft, C.hojaSoft,
];

// 8 tonos verdes para las metas de ahorro
export const AHORRO_COLORS = [
  "#007A3D", "#1F8F4A", "#3FAA58", "#73C653",
  "#9BD980", "#BEF8AD", "#D6F5BD", "#E3F4D6",
];
