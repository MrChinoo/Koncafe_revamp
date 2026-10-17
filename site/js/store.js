// Store mínimo con suscripción y persistencia por pestaña (sessionStorage).
// La demo nunca escribe fuera del navegador.

const STORAGE_KEY = "koncafe-komorebi-v1";
const PERSISTED = ["lang", "cart", "member", "redeem", "checkout", "orders", "seq", "lastOrderId", "guide", "sim", "seeded", "previousStars"];

const initial = () => ({
  lang: document.documentElement.lang?.startsWith("en") ? "en" : "es",
  cart: [],
  member: null,
  redeem: false,
  checkout: { service: "here", method: "card", invoice: false, name: "" },
  orders: [],
  seq: 27,
  lastOrderId: null,
  guide: {},
  sim: true,
  seeded: false,
});

function load() {
  try {
    const raw = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
    if (!raw || typeof raw !== "object") return initial();
    const state = initial();
    for (const key of PERSISTED) if (key in raw) state[key] = raw[key];
    if (!Array.isArray(state.cart)) state.cart = [];
    if (!Array.isArray(state.orders)) state.orders = [];
    return state;
  } catch {
    return initial();
  }
}

let state = load();
const listeners = new Set();
let scheduled = false;
let lastNotified = state;

function persist() {
  try {
    const snapshot = {};
    for (const key of PERSISTED) snapshot[key] = state[key];
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* almacenamiento bloqueado: la demo sigue en memoria */
  }
}

export const store = {
  get: () => state,
  /** Acepta un parche o una función (estado) => parche. Notifica en microtarea. */
  set(patch) {
    const next = typeof patch === "function" ? patch(state) : patch;
    if (!next) return;
    state = { ...state, ...next };
    persist();
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      const previous = lastNotified;
      lastNotified = state;
      for (const listener of listeners) listener(state, previous);
    });
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  reset() {
    const { lang } = state;
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
    store.set({ ...initial(), lang });
  },
};

/** Marca un paso del recorrido guiado. */
export function completeGuide(step) {
  if (store.get().guide[step]) return;
  store.set((s) => ({ guide: { ...s.guide, [step]: true } }));
}
