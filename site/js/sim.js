// Simulador de operación: siembra una cola creíble, inyecta clientes
// ficticios y avanza los pedidos que nadie está atendiendo manualmente.
import { store } from "./store.js";
import { PRODUCTS, DEMO_NAMES, defaultSelection, optionGroups } from "./data.js";
import { buildOrder, updateOrder, activeOrders, lineKey } from "./orders.js";

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const SECOND = 1000;

// Ritmos de la demo (más rápidos que la operación real para que se note).
const PACE = {
  kiosk: { start: 6 * SECOND, item: 7 * SECOND, deliver: 120 * SECOND },
  sim: { start: 22 * SECOND, item: 16 * SECOND, deliver: 95 * SECOND },
  spawnMin: 26 * SECOND,
  spawnMax: 44 * SECOND,
  maxActive: 7,
};

function randomSelection(product) {
  const selection = defaultSelection(product);
  for (const group of optionGroups(product)) {
    if (group.type === "multi") selection[group.id] = Math.random() < 0.35 ? [pick(group.options).id] : [];
    else if (Math.random() < 0.5) selection[group.id] = pick(group.options).id;
  }
  return selection;
}

function randomItems() {
  const count = Math.random() < 0.55 ? 1 : Math.random() < 0.8 ? 2 : 3;
  const items = [];
  for (let i = 0; i < count; i++) {
    const product = pick(PRODUCTS);
    const selection = randomSelection(product);
    items.push({ key: lineKey(product.id, selection), productId: product.id, selection, qty: Math.random() < 0.85 ? 1 : 2 });
  }
  return items;
}

function simOrder(createdAt, status = "received") {
  const order = buildOrder({
    items: randomItems(),
    name: pick(DEMO_NAMES),
    method: pick(["card", "card", "card", "cash", "qr"]),
    service: Math.random() < 0.6 ? "here" : "togo",
    invoice: Math.random() < 0.15,
    member: Math.random() < 0.55,
    source: "sim",
    createdAt,
    status,
  });
  if (status === "preparing") {
    order.startedAt = Math.max(createdAt, Date.now() - 6 * SECOND);
    order.items = order.items.map((item, index) => ({ ...item, done: index === 0 && order.items.length > 1 }));
  }
  return order;
}

export function seed() {
  if (store.get().seeded) return;
  const now = Date.now();
  const seeded = [
    simOrder(now - 7.5 * 60 * SECOND, "preparing"),
    simOrder(now - 4 * 60 * SECOND, "preparing"),
    simOrder(now - 2.2 * 60 * SECOND, "received"),
    simOrder(now - 50 * SECOND, "received"),
  ];
  let seq = store.get().seq;
  for (const order of seeded) {
    seq += 1;
    order.seq = seq;
    order.number = `A-${String(seq).padStart(2, "0")}`;
  }
  store.set((s) => ({ orders: [...s.orders, ...seeded], seq, seeded: true }));
}

function autoAdvance(order, now) {
  if (order.manual) return null;
  const pace = order.source === "kiosk" ? PACE.kiosk : PACE.sim;
  if (order.status === "received" && now - order.createdAt > pace.start) {
    return { status: "preparing", startedAt: now };
  }
  if (order.status === "preparing") {
    const started = order.startedAt ?? now;
    const pending = order.items.findIndex((item) => !item.done);
    if (pending === -1) return { status: "ready", readyAt: now };
    const doneCount = order.items.filter((item) => item.done).length;
    if (now - started > pace.item * (doneCount + 1)) {
      return { items: order.items.map((item, i) => (i === pending ? { ...item, done: true } : item)) };
    }
  }
  if (order.status === "ready" && now - (order.readyAt ?? now) > pace.deliver) {
    return { status: "delivered", deliveredAt: now };
  }
  return null;
}

let nextSpawn = 0;
let timer = null;

function tick() {
  if (document.visibilityState !== "visible") return;
  const now = Date.now();
  const s = store.get();
  for (const order of s.orders) {
    const patch = autoAdvance(order, now);
    if (patch) updateOrder(order.id, patch);
  }
  if (s.sim && now > nextSpawn) {
    if (nextSpawn && activeOrders(s.orders).length < PACE.maxActive) {
      const order = simOrder(now);
      store.set((state) => {
        const seq = state.seq + 1;
        return { orders: [...state.orders, { ...order, seq, number: `A-${String(seq).padStart(2, "0")}` }], seq };
      });
    }
    nextSpawn = now + PACE.spawnMin + Math.random() * (PACE.spawnMax - PACE.spawnMin);
  }
}

export function startSimulation() {
  seed();
  clearInterval(timer);
  timer = setInterval(tick, SECOND);
}
