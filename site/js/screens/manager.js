// Gerente — el día del negocio de un vistazo. Datos base ficticios + pedidos de la sesión.
import { h, icon, money, logoMark } from "../dom.js";
import { productName, lang } from "../i18n.js";
import { PRODUCTS, productById } from "../data.js";
import { store, completeGuide } from "../store.js";
import { countTo, stagger } from "../motion.js";

const COPY = {
  es: {
    eyebrow: "Panel del gerente · hoy", title: "El día, *de un vistazo.*",
    sales: "Ventas", orders: "Pedidos", ticket: "Ticket promedio", club: "Clientes del Club", prep: "Preparación prom.",
    vsYesterday: "vs. ayer a esta hora", byHour: "Ventas por hora", byHourSub: "Pesos por franja · se actualiza con cada pedido",
    now: "Ahora", top: "Productos estrella", topSub: "Unidades vendidas hoy", mix: "Métodos de pago", mixSub: "Participación sobre ventas",
    table: "Ver tabla", chart: "Ver gráfica", hour: "Hora", amount: "Ventas", units: "uds.", live: "En vivo",
    session: "{n} pedidos de esta sesión incluidos", card: "Tarjeta", cash: "Efectivo", qr: "QR", product: "Producto",
    method: "Método", share: "Participación",
  },
  en: {
    eyebrow: "Manager dashboard · today", title: "Your day, *at a glance.*",
    sales: "Sales", orders: "Orders", ticket: "Average ticket", club: "Club customers", prep: "Avg. prep time",
    vsYesterday: "vs. yesterday at this time", byHour: "Sales by hour", byHourSub: "Pesos per hour · updates with every order",
    now: "Now", top: "Top sellers", topSub: "Units sold today", mix: "Payment methods", mixSub: "Share of sales",
    table: "Show table", chart: "Show chart", hour: "Hour", amount: "Sales", units: "units", live: "Live",
    session: "{n} orders from this session included", card: "Card", cash: "Cash", qr: "QR", product: "Product",
    method: "Method", share: "Share",
  },
};
const c = (key, vars = {}) => (COPY[lang()][key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

// Paleta categórica validada (dataviz validate_palette: light, superficie #FFF — 6/6 PASS).
const MIX = [
  { id: "card", color: "#A64B2A" },
  { id: "cash", color: "#D9A441" },
  { id: "qr", color: "#4E8A52" },
];

const OPEN = 7;
const CLOSE = 21;

// Generador determinista por fecha: el mismo día siempre muestra la misma base.
function seeded(seedText) {
  let seed = [...seedText].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);
  return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

function baseline() {
  const now = new Date();
  const random = seeded(now.toDateString());
  // Fuera del horario (o recién abierto) la demo muestra un día en curso a las 17:30
  // para que el panel siempre tenga una historia que contar.
  const open = now.getHours() >= OPEN + 2 && now.getHours() < CLOSE;
  const hourNow = open ? now.getHours() : 17;
  const minuteFraction = open ? now.getMinutes() / 60 : 0.5;
  const curve = (hour) => 0.35 + Math.exp(-((hour - 9) ** 2) / 3) * 1.1 + Math.exp(-((hour - 17) ** 2) / 4) * 0.8;
  const hours = [];
  for (let hour = OPEN; hour < CLOSE; hour++) {
    const elapsed = hour < hourNow ? 1 : hour === hourNow ? minuteFraction : 0;
    const orders = Math.round(curve(hour) * (9 + random() * 4) * elapsed);
    hours.push({ hour, orders, sales: Math.round(orders * (88 + random() * 26)) });
  }
  const units = Object.fromEntries(PRODUCTS.map((p) => [p.id, 0]));
  const totalOrders = hours.reduce((sum, h) => sum + h.orders, 0);
  const weights = { caramel: 1.6, matcha: 1.5, americano: 1.4, oreo: 1.1, croissant: 1.2, cacahuate: 0.8, coldbrew: 0.9, chai: 0.6, sandwich: 0.7, brownie: 0.8 };
  for (const product of PRODUCTS) units[product.id] = Math.round(totalOrders * 0.16 * weights[product.id] * (0.85 + random() * 0.3));
  const totalSales = hours.reduce((sum, h) => sum + h.sales, 0);
  return {
    hours,
    hourNow,
    units,
    mix: { card: totalSales * 0.64, cash: totalSales * 0.22, qr: totalSales * 0.14 },
    members: Math.round(totalOrders * 0.41),
    yesterday: Math.round(totalSales * (0.88 + random() * 0.08)),
    prepSeconds: 262,
  };
}

function aggregate() {
  const base = baseline();
  const session = store.get().orders.filter((o) => o.source === "kiosk" || o.status === "delivered" || o.status === "ready");
  const hours = base.hours.map((slot) => ({ ...slot }));
  const units = { ...base.units };
  const mix = { ...base.mix };
  let members = base.members;
  const prepSamples = [];
  for (const order of session) {
    const hour = new Date(order.createdAt).getHours();
    const slot = hours.find((s) => s.hour === hour) ?? hours.find((s) => s.hour === base.hourNow);
    slot.orders += 1;
    slot.sales += order.total;
    mix[order.method] = (mix[order.method] ?? 0) + order.total;
    if (order.member) members += 1;
    for (const item of order.items) units[item.productId] = (units[item.productId] ?? 0) + item.qty;
    if (order.readyAt && order.startedAt) prepSamples.push((order.readyAt - order.startedAt) / 1000);
  }
  const sales = hours.reduce((sum, s) => sum + s.sales, 0);
  const orders = hours.reduce((sum, s) => sum + s.orders, 0);
  const prep = prepSamples.length
    ? (base.prepSeconds * 20 + prepSamples.reduce((a, b) => a + b, 0)) / (20 + prepSamples.length)
    : base.prepSeconds;
  return { hours, hourNow: base.hourNow, units, mix, sales, orders, members, yesterday: base.yesterday, prep, sessionCount: session.length };
}

const mmss = (seconds) => {
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

function kpi(label, valueEl, extra) {
  return h("article", { class: "kpi reveal" }, h("span", { class: "micro" }, label), valueEl, extra);
}

export default {
  mode: "manager",
  chrome: { topbar: false },
  render() {
    completeGuide("s5");
    const salesEl = h("strong", { class: "kpi-value" });
    const ordersEl = h("strong", { class: "kpi-value" });
    const ticketEl = h("strong", { class: "kpi-value" });
    const clubEl = h("strong", { class: "kpi-value" });
    const prepEl = h("strong", { class: "kpi-value" });
    const deltaEl = h("span", { class: "kpi-delta" });
    const sessionEl = h("p", { class: "micro dash-session" });

    const hourChart = h("div", { class: "bars", role: "img" });
    const hourTable = h("table", { class: "data-table", hidden: true });
    const topList = h("ol", { class: "top-list" });
    const mixBar = h("div", { class: "mix-bar", role: "img" });
    const mixLegend = h("ul", { class: "mix-legend" });

    let showTable = false;
    const tableToggle = h("button", { class: "chip-link", type: "button", "aria-pressed": "false", onClick: () => {
      showTable = !showTable;
      hourChart.hidden = showTable;
      hourTable.hidden = !showTable;
      tableToggle.setAttribute("aria-pressed", String(showTable));
      tableToggle.textContent = showTable ? c("chart") : c("table");
    } }, c("table"));

    let signature = "";
    const draw = (first = false) => {
      const data = aggregate();
      const next = `${data.sales}|${data.orders}|${Math.round(data.prep)}`;
      if (!first && next === signature) return;
      signature = next;
      hourChart.classList.toggle("is-first", first);
      topList.classList.toggle("is-first", first);
      const fmt = (value) => money(value);
      const ticket = data.orders ? data.sales / data.orders : 0;
      const clubShare = data.orders ? (data.members / data.orders) * 100 : 0;
      if (first) {
        salesEl.textContent = fmt(data.sales);
        ordersEl.textContent = String(data.orders);
      }
      countTo(salesEl, data.sales, fmt, 900, first ? 0 : undefined);
      countTo(ordersEl, data.orders, undefined, 900, first ? 0 : undefined);
      countTo(ticketEl, ticket, fmt, 900, first ? 0 : undefined);
      countTo(clubEl, clubShare, (n) => `${Math.round(n)}%`, 900, first ? 0 : undefined);
      prepEl.textContent = mmss(data.prep);
      const change = ((data.sales - data.yesterday) / data.yesterday) * 100;
      deltaEl.replaceChildren(icon(change >= 0 ? "arrow" : "back", "icon delta-icon"), `${change >= 0 ? "+" : ""}${change.toFixed(1)}% ${c("vsYesterday")}`);
      deltaEl.classList.toggle("is-down", change < 0);
      sessionEl.textContent = c("session", { n: data.sessionCount });

      // Ventas por hora — una serie, un color, sin leyenda; tooltip por barra.
      const max = Math.max(...data.hours.map((s) => s.sales), 1);
      hourChart.setAttribute("aria-label", `${c("byHour")}: ${data.hours.filter((s) => s.sales).map((s) => `${s.hour}:00 ${money(s.sales)}`).join(", ")}`);
      const bars = data.hours.map((slot) => {
        const isNow = slot.hour === data.hourNow;
        const bar = h("div", { class: ["bar", isNow && "is-now", !slot.sales && "is-future"], tabindex: slot.sales ? "0" : undefined },
          h("span", { class: "bar-fill", style: { "--h": String(slot.sales / max) } }),
          h("span", { class: "bar-tip", role: "tooltip" }, h("strong", { class: "mono" }, money(slot.sales)), h("span", {}, `${slot.hour}:00 · ${slot.orders} ${c("orders").toLowerCase()}`)),
          h("span", { class: "bar-label mono" }, isNow ? c("now") : String(slot.hour)),
        );
        return bar;
      });
      stagger(bars);
      hourChart.replaceChildren(...bars);
      hourTable.replaceChildren(
        h("thead", {}, h("tr", {}, h("th", { scope: "col" }, c("hour")), h("th", { scope: "col" }, c("orders")), h("th", { scope: "col" }, c("amount")))),
        h("tbody", {}, data.hours.filter((s) => s.sales).map((s) => h("tr", {}, h("td", { class: "mono" }, `${s.hour}:00`), h("td", { class: "mono" }, String(s.orders)), h("td", { class: "mono" }, money(s.sales))))),
      );

      // Productos estrella — barras horizontales, etiqueta directa de valor.
      const ranked = Object.entries(data.units).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const topMax = ranked[0]?.[1] || 1;
      topList.replaceChildren(...ranked.map(([id, units], index) => {
        const product = productById(id);
        return h("li", { class: "top-item" },
          h("span", { class: "top-rank mono" }, String(index + 1).padStart(2, "0")),
          h("img", { class: "top-thumb", src: `/img/products/${product.image}-480.webp`, alt: "", width: 40, height: 40, loading: "lazy", decoding: "async" }),
          h("span", { class: "top-name" }, productName(product)),
          h("span", { class: "top-track" }, h("span", { class: "top-fill", style: { "--w": String(units / topMax) } })),
          h("span", { class: "top-value mono" }, `${units} ${c("units")}`),
        );
      }));

      // Mezcla de pagos — barra 100 % apilada + leyenda con etiquetas directas.
      const totalMix = MIX.reduce((sum, m) => sum + (data.mix[m.id] ?? 0), 0) || 1;
      mixBar.setAttribute("aria-label", MIX.map((m) => `${c(m.id)} ${Math.round(((data.mix[m.id] ?? 0) / totalMix) * 100)}%`).join(", "));
      mixBar.replaceChildren(...MIX.map((m) => {
        const seg = h("span", { class: "mix-seg", style: { "--w": String((data.mix[m.id] ?? 0) / totalMix), "--c": m.color } });
        return seg;
      }));
      mixLegend.replaceChildren(...MIX.map((m) => {
        const share = ((data.mix[m.id] ?? 0) / totalMix) * 100;
        return h("li", {},
          h("span", { class: "swatch", style: { "--c": m.color } }),
          h("span", { class: "mix-name" }, c(m.id)),
          h("strong", { class: "mono" }, `${share.toFixed(0)}%`),
          h("span", { class: "mono muted" }, money(data.mix[m.id] ?? 0)),
        );
      }));
    };

    const kpis = [
      kpi(c("sales"), salesEl, deltaEl),
      kpi(c("orders"), ordersEl),
      kpi(c("ticket"), ticketEl),
      kpi(c("club"), clubEl),
      kpi(c("prep"), prepEl),
    ];
    stagger(kpis);

    const el = h("section", { class: "screen manager", "aria-labelledby": "dash-title" },
      h("header", { class: "dash-head" },
        h("div", {},
          h("p", { class: "eyebrow" }, h("span", { class: "eyebrow-line" }), c("eyebrow")),
          h("h1", { class: "h1", id: "dash-title" }, c("title").split(/(\*[^*]+\*)/).filter(Boolean).map((part) => part.startsWith("*") ? h("em", { class: "accent" }, part.slice(1, -1)) : part)),
        ),
        h("div", { class: "dash-live" }, h("span", { class: "live-dot", "aria-hidden": "true" }), c("live"), h("span", { class: "dash-logo" }, logoMark())),
      ),
      h("div", { class: "kpis" }, kpis),
      sessionEl,
      h("div", { class: "dash-grid" },
        h("section", { class: "panel panel--hours" },
          h("header", { class: "panel-head" },
            h("div", {}, h("h2", { class: "h3" }, c("byHour")), h("p", { class: "micro" }, c("byHourSub"))),
            tableToggle,
          ),
          hourChart,
          hourTable,
        ),
        h("section", { class: "panel panel--top" },
          h("header", { class: "panel-head" }, h("div", {}, h("h2", { class: "h3" }, c("top")), h("p", { class: "micro" }, c("topSub")))),
          topList,
        ),
        h("section", { class: "panel panel--mix" },
          h("header", { class: "panel-head" }, h("div", {}, h("h2", { class: "h3" }, c("mix")), h("p", { class: "micro" }, c("mixSub")))),
          mixBar,
          mixLegend,
        ),
      ),
    );

    draw(true);

    return {
      el,
      focus: el.querySelector("h1"),
      update(state, prev) {
        if (state.orders !== prev.orders) draw();
      },
    };
  },
};

