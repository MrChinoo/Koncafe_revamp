// Barra — la cola en vivo, en modo oscuro para la estación de preparación.
import { h, icon, logoMark } from "../dom.js";
import { t, productName, lang } from "../i18n.js";
import { productById, optionGroups } from "../data.js";
import { advanceOrder, toggleItem, completeLane, slaState, activeOrders } from "../orders.js";
import { store, completeGuide } from "../store.js";
import { toast } from "../ui.js";

const COPY = {
  es: {
    title: "Cola de pedidos", station: "Estación 1 · Barista Ana", active: "Activos", late: "Atrasados", avg: "Espera prom.",
    drinks: "Bebidas", food: "Alimentos", start: "Iniciar", drinksReady: "Bebidas listas", foodReady: "Alimentos listos",
    ready: "Listos para entregar", deliver: "Entregar", none: "Sin pedidos en este carril", simulate: "Simular clientes",
    ok: "A tiempo", warn: "Acelera", lateTone: "Atrasado", yours: "Tu pedido", received: "Nuevo", preparing: "En preparación",
    readyEmpty: "Aquí aparecen los pedidos terminados", delivered: "{n} entregado", newOrder: "Nuevo pedido {n}",
    cash: "Cobrar en caja", invoice: "Factura", member: "Club", here: "Aquí", togo: "Llevar",
  },
  en: {
    title: "Order queue", station: "Station 1 · Barista Ana", active: "Active", late: "Late", avg: "Avg. wait",
    drinks: "Drinks", food: "Food", start: "Start", drinksReady: "Drinks ready", foodReady: "Food ready",
    ready: "Ready for pickup", deliver: "Hand off", none: "No orders in this lane", simulate: "Simulate guests",
    ok: "On time", warn: "Hurry", lateTone: "Late", yours: "Your order", received: "New", preparing: "In progress",
    readyEmpty: "Finished orders show up here", delivered: "{n} handed off", newOrder: "New order {n}",
    cash: "Collect cash", invoice: "Invoice", member: "Club", here: "Here", togo: "To go",
  },
};
const c = (key, vars = {}) => (COPY[lang()][key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

const clock = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

function chips(product, selection) {
  const list = [];
  for (const group of optionGroups(product)) {
    const value = selection[group.id];
    if (group.type === "multi") for (const id of value ?? []) list.push(t(`opt.${id}`));
    else if (group.id === "sweet") { if (value !== "50") list.push(`${value}%`); }
    else if (value && !(group.id === "milk" && value === "whole")) list.push(t(`opt.${value}`));
  }
  return list;
}

function slaRing(order) {
  const ring = h("span", { class: "sla", dataset: { order: order.id } },
    h("svg", { svg: true, viewBox: "0 0 44 44", class: "sla-svg", "aria-hidden": "true" },
      h("circle", { svg: true, cx: "22", cy: "22", r: "19", class: "sla-track" }),
      h("circle", { svg: true, cx: "22", cy: "22", r: "19", class: "sla-arc", pathLength: "100" }),
    ),
    h("span", { class: "sla-time mono" }),
  );
  return ring;
}

function paintSla(ring, order, now) {
  const { elapsed, ratio, tone } = slaState(order, now);
  ring.querySelector(".sla-time").textContent = clock(elapsed);
  ring.style.setProperty("--p", String(Math.min(1, ratio)));
  ring.dataset.tone = tone;
  const card = ring.closest(".ticket-card");
  if (card) {
    card.dataset.tone = tone;
    const label = card.querySelector(".tone-label");
    if (label) label.textContent = c(tone === "late" ? "lateTone" : tone);
  }
}

function orderCard(order, lane, isNew) {
  const items = order.items.map((item, index) => ({ item, index })).filter(({ item }) => item.lane === lane);
  const laneDone = items.every(({ item }) => item.done);
  const action = order.status === "received"
    ? h("button", { class: "bar-action", type: "button", onClick: () => { advanceOrder(order.id); completeGuide("s4"); } }, icon("arrow"), c("start"))
    : h("button", {
        class: "bar-action bar-action--primary",
        type: "button",
        disabled: laneDone,
        onClick: () => { completeLane(order.id, lane); completeGuide("s4"); },
      }, icon("check"), c(lane === "drinks" ? "drinksReady" : "foodReady"));

  return h("article", { class: ["ticket-card", isNew && "is-new", order.source === "kiosk" && "is-yours"], dataset: { id: order.id, status: order.status } },
    h("header", { class: "tc-head" },
      slaRing(order),
      h("div", { class: "tc-id" },
        h("div", { class: "tc-line" },
          h("strong", { class: "tc-number mono" }, order.number),
          h("span", { class: "tone-pill" }, h("span", { class: "tone-dot" }), h("span", { class: "tone-label" })),
          order.source === "kiosk" && h("span", { class: "bar-chip bar-chip--yours" }, c("yours")),
        ),
        h("p", { class: "tc-name" }, icon("user"), order.name || t("guest")),
        h("p", { class: "tc-meta" },
          h("span", { class: "bar-chip" }, icon(order.service === "togo" ? "togo" : "here"), c(order.service)),
          order.method === "cash" && h("span", { class: "bar-chip bar-chip--warn" }, icon("cash"), c("cash")),
          order.member && h("span", { class: "bar-chip bar-chip--club" }, icon("star"), c("member")),
          order.invoice && h("span", { class: "bar-chip" }, icon("receipt"), c("invoice")),
        ),
      ),
    ),
    h("ul", { class: "tc-items" }, items.map(({ item, index }) => {
      const product = productById(item.productId);
      return h("li", {},
        h("button", {
          class: ["tc-item", item.done && "is-done"],
          type: "button",
          "aria-pressed": String(item.done),
          onClick: () => { toggleItem(order.id, index); completeGuide("s4"); },
        },
        h("span", { class: "tc-check" }, icon("check")),
        h("span", { class: "tc-qty mono" }, `${item.qty}×`),
        h("span", { class: "tc-item-body" },
          h("span", { class: "tc-item-name" }, productName(product)),
          h("span", { class: "tc-chips" }, chips(product, item.selection).map((label) => h("span", { class: "opt-chip" }, label))),
        )),
      );
    })),
    action,
  );
}

export default {
  mode: "bar",
  theme: "dark",
  chrome: { topbar: false },
  render() {
    const seen = new Set(store.get().orders.map((o) => o.id));
    const metricActive = h("strong", { class: "mono" });
    const metricLate = h("strong", { class: "mono" });
    const metricAvg = h("strong", { class: "mono" });
    const nowClock = h("span", { class: "mono" });
    const lanes = { drinks: h("div", { class: "lane-list" }), food: h("div", { class: "lane-list" }) };
    const laneCount = { drinks: h("span", { class: "lane-count mono" }), food: h("span", { class: "lane-count mono" }) };
    const readyRow = h("div", { class: "ready-row" });
    const sim = h("input", {
      type: "checkbox", class: "switch-input", id: "sim-toggle", role: "switch",
      checked: store.get().sim,
      onChange: (event) => store.set({ sim: event.target.checked }),
    });

    // Conserva el foco de teclado cuando la cola se redibuja.
    const rememberFocus = () => {
      const active = document.activeElement;
      const card = active?.closest?.(".ticket-card");
      if (!card) return null;
      return { id: card.dataset.id, lane: card.closest(".lane")?.classList[1], index: [...card.querySelectorAll("button")].indexOf(active) };
    };
    const restoreFocus = (memo) => {
      if (!memo) return;
      const card = el.querySelector(`.${memo.lane} .ticket-card[data-id="${memo.id}"]`);
      const buttons = card ? [...card.querySelectorAll("button")] : [];
      (buttons[memo.index] ?? buttons.at(-1))?.focus({ preventScroll: true });
    };

    const draw = () => {
      const memo = rememberFocus();
      const orders = activeOrders(store.get().orders).sort((a, b) => a.createdAt - b.createdAt);
      const queue = orders.filter((o) => o.status === "received" || o.status === "preparing");
      for (const lane of ["drinks", "food"]) {
        const list = queue.filter((o) => o.items.some((item) => item.lane === lane));
        laneCount[lane].textContent = String(list.length);
        lanes[lane].replaceChildren(...(list.length
          ? list.map((o) => orderCard(o, lane, !seen.has(o.id)))
          : [h("p", { class: "lane-empty" }, icon("sparkle"), c("none"))]));
      }
      const ready = orders.filter((o) => o.status === "ready");
      readyRow.replaceChildren(...(ready.length
        ? ready.map((o) => h("div", { class: ["ready-pill", !seen.has(o.id) && "is-new"] },
            h("strong", { class: "mono" }, o.number),
            h("span", {}, o.name || t("guest")),
            h("button", { class: "bar-action bar-action--ghost", type: "button", onClick: () => {
              advanceOrder(o.id);
              completeGuide("s4");
              toast(c("delivered", { n: o.number }), { iconName: "check", tone: "night" });
            } }, c("deliver")),
          ))
        : [h("p", { class: "lane-empty lane-empty--inline" }, c("readyEmpty"))]));
      for (const o of orders) seen.add(o.id);
      tick();
      restoreFocus(memo);
    };

    const tick = () => {
      const now = Date.now();
      const orders = activeOrders(store.get().orders);
      const queue = orders.filter((o) => o.status !== "ready");
      metricActive.textContent = String(orders.length);
      metricLate.textContent = String(queue.filter((o) => slaState(o, now).tone === "late").length);
      const avg = queue.length ? queue.reduce((sum, o) => sum + (now - o.createdAt), 0) / queue.length : 0;
      metricAvg.textContent = clock(avg);
      nowClock.textContent = new Date(now).toLocaleTimeString(lang() === "en" ? "en-US" : "es-MX", { hour: "2-digit", minute: "2-digit" });
      for (const ring of el.querySelectorAll(".sla")) {
        const order = orders.find((o) => o.id === ring.dataset.order);
        if (order) paintSla(ring, order, now);
      }
    };

    const metric = (value, label, tone = "") => h("div", { class: ["metric", tone && `metric--${tone}`] }, value, h("span", {}, label));

    const el = h("section", { class: "screen barista", "aria-labelledby": "bar-title" },
      h("header", { class: "bar-head" },
        h("div", { class: "bar-brand" },
          h("span", { class: "bar-logo" }, logoMark()),
          h("div", {}, h("h1", { class: "bar-title", id: "bar-title" }, c("title")), h("p", { class: "bar-sub" }, nowClock, " · ", c("station"))),
        ),
        h("div", { class: "bar-metrics" },
          metric(metricActive, c("active"), "clay"),
          metric(metricLate, c("late"), "late"),
          metric(metricAvg, c("avg")),
        ),
        h("label", { class: "sim-toggle", for: "sim-toggle" }, h("span", {}, c("simulate")), sim, h("span", { class: "switch", "aria-hidden": "true" })),
      ),
      h("div", { class: "lanes" },
        ["drinks", "food"].map((lane) =>
          h("section", { class: `lane lane--${lane}`, "aria-label": c(lane) },
            h("header", { class: "lane-head" },
              h("span", { class: "lane-icon" }, icon(lane === "drinks" ? "cup" : "leaf")),
              h("h2", {}, c(lane)),
              laneCount[lane],
              h("span", { class: "lane-legend" },
                ["ok", "warn", "late"].map((tone) => h("span", { class: `legend legend--${tone}` }, h("span", { class: "tone-dot" }), c(tone === "late" ? "lateTone" : tone)))),
            ),
            lanes[lane],
          )),
      ),
      h("section", { class: "ready-dock", "aria-label": c("ready") },
        h("h2", { class: "ready-title" }, icon("bell"), c("ready")),
        readyRow,
      ),
    );

    draw();
    const timer = setInterval(tick, 1000);

    return {
      el,
      focus: el.querySelector("h1"),
      update(state, prev) {
        if (state.orders !== prev.orders) {
          const fresh = state.orders.filter((o) => !prev.orders.some((p) => p.id === o.id));
          for (const o of fresh) toast(c("newOrder", { n: o.number }), { iconName: "bell", tone: "night" });
          draw();
        }
      },
      destroy: () => clearInterval(timer),
    };
  },
};
