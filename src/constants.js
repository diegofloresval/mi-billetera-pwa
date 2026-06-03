export const STORE_KEY = "billetera_data_v1";

export const C = {
  bg: "#FFF8F0",
  card: "#FFFFFF",
  ink: "#2D2438",
  ink2: "#8B8299",
  lavanda: "#A78BFA",
  lavandaSoft: "#EDE5FE",
  coral: "#FBA1B7",
  coralSoft: "#FEE5EC",
  menta: "#9EE6CF",
  mentaSoft: "#E0F7EE",
  creme: "#FFE4A1",
  cremeSoft: "#FFF3D1",
  celeste: "#BFE3FF",
  celesteSoft: "#E5F2FF",
};

export const CATS = [
  { id: "supermercado", label: "Supermercado", emoji: "🛒", color: "#E8854A" },
  { id: "transporte",   label: "Transporte",   emoji: "🚌", color: "#4A90D9" },
  { id: "ocio",         label: "Ocio",         emoji: "🎮", color: "#9B59B6" },
  { id: "salud",        label: "Salud",        emoji: "💊", color: "#2ECC71" },
  { id: "ropa",         label: "Ropa",         emoji: "👟", color: "#E91E8C" },
  { id: "casa",         label: "Casa",         emoji: "🏠", color: "#F39C12" },
  { id: "educacion",    label: "Educación",    emoji: "📚", color: "#1ABC9C" },
  { id: "restaurante",  label: "Restaurante",  emoji: "🍕", color: "#E74C3C" },
  { id: "servicios",    label: "Servicios",    emoji: "💡", color: "#3498DB" },
  { id: "suscripcion",  label: "Suscripción",  emoji: "📱", color: "#8E44AD" },
  { id: "gym",          label: "Gym",          emoji: "🏋️", color: "#27AE60" },
  { id: "otro",         label: "Otro",         emoji: "📦", color: "#95A5A6" },
];

export const CAT = Object.fromEntries(CATS.map((c) => [c.id, c]));

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

export const INITIAL_STATE = {
  txs: [],
  fijos: [],
  budgets: DEFAULT_BUDGETS,
  sueldo: 0,
  nombre: "",
};
