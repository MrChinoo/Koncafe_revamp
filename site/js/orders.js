// Dominio: carrito, totales, creación y avance de pedidos.
import { store } from "./store.js";
import { productById, unitPrice, optionGroups, STARS_PER_PESO } from "./data.js";

export const lineKey = (productId, selection) => `${productId}|${JSON.stringify(selection)}`;

export function lineTotal(line) {
  const product = productById(line.productId);
  return product ? unitPrice(product, line.selection) * line.qty : 0;
}

export function cartCount(cart = store.get().cart) {
  return cart.reduce((sum, line) => sum + line.qty, 0);
}

export function cartTotals(state = store.get()) {
  const subtotal = state.cart.reduce((sum, line) => sum + lineTotal(line), 0);
  const canRedeem = Boolean(state.member && state.member.stars >= state.member.reward.cost && subtotal > 0);
  const discount = state.redeem && canRedeem ? Math.min(state.member.reward.value, subtotal) : 0;
  const total = Math.max(0, subtotal - discount);
  const tax = total - total / 1.16;
  const stars = Math.floor(total * STARS_PER_PESO);
  return { subtotal, discount, total, tax, stars, count: cartCount(state.cart), canRedeem };
}

export function addToCart(productId, selection, qty = 1) {
  const key = lineKey(productId, selection);
  store.set((s) => {
    const existing = s.cart.find((line) => line.key === key);
    const cart = existing
      ? s.cart.map((line) => (line.key === key ? { ...line, qty: Math.min(20, line.qty + qty) } : line))
      : [...s.cart, { key, productId, selection, qty }];
    return { cart };
  });
}

export function replaceLine(oldKey, productId, selection, qty) {
  const key = lineKey(productId, selection);
  store.set((s) => {
    const others = s.cart.filter((line) => line.key !== oldKey && line.key !== key);
    const index = s.cart.findIndex((line) => line.key === oldKey);
    const cart = [...others];
    cart.splice(Math.max(0, Math.min(index, cart.length)), 0, { key, productId, selection, qty });
    return { cart };
  });
}

export function setQty(key, qty) {
  store.set((s) => ({
    cart: qty <= 0
      ? s.cart.filter((line) => line.key !== key)
      : s.cart.map((line) => (line.key === key ? { ...line, qty: Math.min(20, qty) } : line)),
  }));
}

/** Descripción corta de la personalización: "Mediano · Frío · Avena · Shot extra". */
export function describeSelection(product, selection, t) {
  const parts = [];
  for (const group of optionGroups(product)) {
    const value = selection[group.id];
    if (group.type === "multi") for (const id of value ?? []) parts.push(t(`opt.${id}`));
    else if (group.type === "scale") parts.push(`${t("group.sweet")} ${value}%`);
    else if (value) parts.push(t(`opt.${value}`));
  }
  return parts.join(" · ");
}

const laneOf = (productId) => (productById(productId)?.category === "bakery" ? "food" : "drinks");

export function slaMinutes(items) {
  const units = items.reduce((sum, item) => sum + item.qty, 0);
  return Math.min(12, 3 + units);
}

export function buildOrder({ items, name, method, service, invoice, member, source, createdAt = Date.now(), status = "received" }) {
  const s = store.get();
  const seq = s.seq + 1;
  const subtotal = items.reduce((sum, line) => sum + lineTotal(line), 0);
  return {
    id: `o${createdAt.toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    number: `A-${String(seq).padStart(2, "0")}`,
    seq,
    name,
    source,
    items: items.map((line) => ({ ...line, done: status !== "received" && status !== "preparing", lane: laneOf(line.productId) })),
    subtotal,
    total: subtotal,
    discount: 0,
    method,
    service,
    invoice: Boolean(invoice),
    member: Boolean(member),
    stars: 0,
    createdAt,
    status,
    manual: false,
    sla: slaMinutes(items),
  };
}

/** Confirma el carrito actual como pedido del kiosco. Devuelve el pedido creado. */
export function placeKioskOrder() {
  const s = store.get();
  const totals = cartTotals(s);
  const order = {
    ...buildOrder({
      items: s.cart,
      name: s.checkout.name.trim() || s.member?.name || "",
      method: s.checkout.method,
      service: s.checkout.service,
      invoice: s.checkout.invoice,
      member: s.member,
      source: "kiosk",
    }),
    total: totals.total,
    discount: totals.discount,
    stars: s.member ? totals.stars : 0,
    potentialStars: totals.stars,
  };
  const member = s.member
    ? {
        ...s.member,
        stars: s.member.stars - (totals.discount ? s.member.reward.cost : 0) + order.stars,
      }
    : null;
  store.set({
    orders: [...s.orders, order],
    seq: order.seq,
    lastOrderId: order.id,
    member,
    previousStars: s.member?.stars ?? 0,
  });
  return order;
}

export function updateOrder(id, patch) {
  store.set((s) => ({
    orders: s.orders.map((order) => (order.id === id ? { ...order, ...(typeof patch === "function" ? patch(order) : patch) } : order)),
  }));
}

/** Avanza un pedido al siguiente estado (acción principal en barra). */
export function advanceOrder(id, { manual = true } = {}) {
  const now = Date.now();
  updateOrder(id, (order) => {
    const base = { manual: order.manual || manual };
    if (order.status === "received") return { ...base, status: "preparing", startedAt: now };
    if (order.status === "preparing") return { ...base, status: "ready", readyAt: now, items: order.items.map((item) => ({ ...item, done: true })) };
    if (order.status === "ready") return { ...base, status: "delivered", deliveredAt: now };
    return base;
  });
}

export function toggleItem(id, index) {
  updateOrder(id, (order) => {
    const items = order.items.map((item, i) => (i === index ? { ...item, done: !item.done } : item));
    const status = order.status === "received" ? "preparing" : order.status;
    return { items, status, manual: true, startedAt: order.startedAt ?? Date.now() };
  });
}

/** Marca listos los productos de un carril; si ya no queda nada, el pedido pasa a "listo". */
export function completeLane(id, lane) {
  const now = Date.now();
  updateOrder(id, (order) => {
    const items = order.items.map((item) => (item.lane === lane ? { ...item, done: true } : item));
    const allDone = items.every((item) => item.done);
    return {
      items,
      manual: true,
      startedAt: order.startedAt ?? now,
      status: allDone ? "ready" : "preparing",
      readyAt: allDone ? now : order.readyAt,
    };
  });
}

/** Estado de tiempo contra el SLA: ok · warn (≥ 70 %) · late (≥ 100 %). */
export function slaState(order, now = Date.now()) {
  const elapsed = now - order.createdAt;
  const ratio = elapsed / (order.sla * 60_000);
  return { elapsed, ratio, tone: ratio >= 1 ? "late" : ratio >= 0.7 ? "warn" : "ok" };
}

export const activeOrders =(orders) => orders.filter((order) => order.status !== "delivered");
