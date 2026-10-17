// 06 · Confirmación — ticket, número y estado en vivo.
import { h, icon, accent, money, logoMark } from "../dom.js";
import { t, productName, lang } from "../i18n.js";
import { productById } from "../data.js";
import { navigate } from "../router.js";
import { describeSelection, lineTotal } from "../orders.js";
import { countTo, leafFall } from "../motion.js";
import { fakeQr } from "../qr.js";
import { store } from "../store.js";
import { toast, announce } from "../ui.js";

const STAGES = ["received", "preparing", "ready"];
const AUTO_RETURN_S = 60;

function ticket(order) {
  const date = new Date(order.createdAt);
  const stamp = date.toLocaleString(lang() === "en" ? "en-US" : "es-MX", { dateStyle: "short", timeStyle: "short" });
  const row = (label, value, className = "") => h("div", { class: ["t-row", className] }, h("span", {}, label), h("span", {}, value));
  return h("article", { class: "ticket", "aria-label": `${t("ticket.order")} ${order.number}` },
    h("header", { class: "t-head" },
      h("span", { class: "t-logo" }, logoMark()),
      h("strong", {}, "KOYO ", h("span", { class: "kr" }, "고요")),
      h("span", {}, t("terminal")),
      h("span", {}, stamp),
    ),
    h("div", { class: "t-order" }, h("span", {}, `${t("ticket.order")} ${order.number}`), h("span", {}, order.name || t("guest"))),
    h("ul", { class: "t-items" }, order.items.map((line) => {
      const product = productById(line.productId);
      return h("li", {},
        h("div", { class: "t-row" }, h("span", {}, `${line.qty} × ${productName(product)}`), h("span", {}, money(lineTotal(line)))),
        h("small", {}, describeSelection(product, line.selection, t)),
      );
    })),
    h("div", { class: "t-totals" },
      row(t("ticket.subtotal"), money(order.subtotal)),
      order.discount > 0 && row(t("ticket.reward"), `−${money(order.discount)}`),
      row(t("ticket.tax"), money(order.total - order.total / 1.16)),
      row(t("ticket.total"), money(order.total), "t-total"),
    ),
    h("div", { class: "t-meta" },
      row(t("ticket.service"), t(`service.${order.service}`)),
      row(t("ticket.method"), t(`method.${order.method}`)),
    ),
    h("div", { class: "t-qr" },
      fakeQr(order.id, { className: "qr qr--ticket" }),
      h("strong", {}, order.invoice ? t("ticket.invoice") : t("ticket.digital")),
      h("small", {}, t("ticket.illustrative")),
    ),
    h("footer", { class: "t-foot" }, t("ticket.footer")),
  );
}

export default {
  mode: "kiosk",
  chrome: { topbar: true },
  render() {
    const s = store.get();
    const order = s.orders.find((o) => o.id === s.lastOrderId);
    if (!order) {
      queueMicrotask(() => navigate("/"));
      return { el: h("section", { class: "screen" }) };
    }
    // El carrito ya se convirtió en pedido: lo vaciamos para el siguiente cliente.
    if (s.cart.length) store.set({ cart: [], redeem: false, checkout: { ...s.checkout, name: "", invoice: false } });

    const tracker = h("ol", { class: "tracker", "aria-live": "polite" });
    const etaEl = h("p", { class: "eta" });
    const drawStatus = (current) => {
      const index = Math.max(0, STAGES.indexOf(current.status === "delivered" ? "ready" : current.status));
      tracker.style.setProperty("--p", String(index / (STAGES.length - 1)));
      tracker.replaceChildren(...STAGES.map((stage, i) =>
        h("li", { class: ["track", i < index && "is-done", i === index && "is-current"] },
          h("span", { class: "track-dot" }, i < index || current.status === "ready" || current.status === "delivered" ? icon("check") : i === index ? h("span", { class: "track-pulse" }) : null),
          h("span", { class: "track-label" }, t(`done.stage.${stage}`)),
        )));
      const ready = index === STAGES.length - 1;
      etaEl.replaceChildren(icon(ready ? "bell" : "clock"), ready ? t("done.stage.ready") : t("done.eta", { n: order.sla }));
      etaEl.classList.toggle("is-ready", ready);
    };

    const starsEl = h("strong", { class: "stars-num mono" }, "+0");
    const starsCard = order.member
      ? h("div", { class: "stars-card" },
          h("span", { class: "stars-icon" }, icon("star")),
          h("div", {}, h("p", {}, starsEl, " ", h("span", { class: "micro" }, t("done.stars"))),
            h("p", { class: "muted" }, t("done.balance", { n: s.member?.stars ?? 0 }))))
      : h("div", { class: "stars-card stars-card--guest" },
          h("span", { class: "stars-icon" }, icon("leaf")),
          h("p", { class: "muted" }, t("done.joinClub", { n: order.potentialStars ?? 0 })));

    let remaining = AUTO_RETURN_S;
    const countdown = h("span", { class: "countdown", style: { "--p": "1" } });
    const countdownText = h("span", { class: "micro" }, t("done.autoReturn", { n: remaining }));
    const leave = () => {
      store.set({ member: null });
      navigate("/");
    };

    const el = h("section", { class: "screen confirm", "aria-labelledby": "done-title" },
      h("div", { class: "confirm-ticket" }, h("div", { class: "printer-slot", "aria-hidden": "true" }), ticket(order)),
      h("div", { class: "confirm-main" },
        h("p", { class: "eyebrow" }, h("span", { class: "eyebrow-line" }), t("done.thanks", { name: order.name || t("guest") })),
        h("h1", { class: "h1", id: "done-title" }, t("done.title").split("\n").map((line) => h("span", { class: "block" }, accent(line)))),
        h("div", { class: "number-card" },
          h("div", {},
            h("span", { class: "micro" }, t("done.number")),
            h("strong", { class: "order-number" }, order.number),
          ),
          etaEl,
        ),
        order.method === "cash" && h("p", { class: "cash-banner" }, icon("cash"), t("done.payAtCashier", { total: money(order.total) })),
        tracker,
        starsCard,
        h("div", { class: "confirm-actions" },
          h("button", { class: "button button--ghost", type: "button", onClick: () => navigate("/barra") }, icon("barista"), t("done.toBar")),
          h("button", { class: "cta", type: "button", onClick: leave }, t("done.newOrder"), icon("arrow")),
          h("span", { class: "auto-return" }, countdown, countdownText),
        ),
      ),
    );

    drawStatus(order);
    const timer = setInterval(() => {
      remaining -= 1;
      countdown.style.setProperty("--p", String(remaining / AUTO_RETURN_S));
      countdownText.textContent = t("done.autoReturn", { n: remaining });
      if (remaining <= 0) leave();
    }, 1000);
    // La recompensa se revela cuando el ticket termina de imprimirse.
    const reveal = setTimeout(() => {
      leafFall(el);
      if (order.member) countTo(starsEl, order.stars, (n) => `+${Math.round(n)}`, 1200, 0);
    }, 650);
    const resetTimer = () => {
      remaining = AUTO_RETURN_S;
    };
    el.addEventListener("pointerdown", resetTimer);

    return {
      el,
      focus: el.querySelector("h1"),
      update(state, prev) {
        if (state.orders === prev.orders) return;
        const current = state.orders.find((o) => o.id === order.id);
        const before = prev.orders.find((o) => o.id === order.id);
        if (current && before && current.status !== before.status) {
          drawStatus(current);
          if (current.status === "ready") {
            leafFall(el, 16);
            toast(t("done.readyToast", { n: order.number }), { iconName: "bell", tone: "matcha" });
            announce(t("done.readyToast", { n: order.number }));
          }
        }
      },
      destroy() {
        clearInterval(timer);
        clearTimeout(reveal);
      },
    };
  },
};
