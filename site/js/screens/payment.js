// 05 · Pago — el último paso, sin fricción.
import { h, icon, accent, money } from "../dom.js";
import { t, productName } from "../i18n.js";
import { productById } from "../data.js";
import { navigate } from "../router.js";
import { cartTotals, placeKioskOrder } from "../orders.js";
import { countTo } from "../motion.js";
import { announce, openDialog } from "../ui.js";
import { fakeQr } from "../qr.js";
import { store, completeGuide } from "../store.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function setCheckout(patch) {
  store.set((s) => ({ checkout: { ...s.checkout, ...patch } }));
}

function optionCard({ name, value, current, iconName, title, sub, onSelect, className = "" }) {
  return h("label", { class: ["pay-option", className] },
    h("input", { type: "radio", name, value, class: "sr-only", checked: current === value, onChange: () => onSelect(value) }),
    h("span", { class: "pay-option-icon" }, icon(iconName)),
    h("span", { class: "pay-option-text" }, h("strong", {}, title), h("span", {}, sub)),
    h("span", { class: "pay-option-check", "aria-hidden": "true" }, icon("check")),
  );
}

/** Escena de cobro simulada. */
async function processPayment(method, total) {
  const stage = h("div", { class: `proc proc--${method}` });
  const title = h("h2", { class: "h2 proc-title" });
  const sub = h("p", { class: "muted proc-sub" });
  const visual = h("div", { class: "proc-visual", "aria-hidden": "true" });
  stage.append(visual, title, sub, h("p", { class: "proc-amount mono" }, money(total)));
  const dialog = openDialog(stage, { label: t("pay.method"), className: "sheet--center sheet--proc", dismissible: false });

  const setPhase = (phase, titleText, subText = "") => {
    stage.dataset.phase = phase;
    title.textContent = titleText;
    sub.textContent = subText;
    announce(titleText);
  };

  if (method === "card") {
    visual.append(
      h("span", { class: "terminal" }, h("span", { class: "terminal-screen mono" }, money(total)), h("span", { class: "terminal-keys" })),
      h("span", { class: "nfc" }, icon("nfc")),
      h("span", { class: "card-chip" }, icon("card")),
    );
    setPhase("tap", t("proc.tap"), t("proc.tapSub"));
    await wait(1900);
  } else if (method === "qr") {
    visual.append(h("span", { class: "qr-pay" }, fakeQr(`pay-${Date.now()}`, { className: "qr qr--pay" })));
    setPhase("tap", t("proc.qr"), t("proc.tapSub"));
    await wait(2300);
  }

  if (method !== "cash") {
    visual.append(h("span", { class: "spinner" }));
    setPhase("processing", t("proc.processing"));
    await wait(1200);
  }

  visual.append(h("span", { class: "approved" },
    h("svg", { svg: true, viewBox: "0 0 52 52", class: "approved-svg" },
      h("circle", { svg: true, cx: "26", cy: "26", r: "24", class: "approved-ring" }),
      h("path", { svg: true, d: "M15 27l7 7 15-16", class: "approved-tick" }),
    ),
  ));
  setPhase("approved", method === "cash" ? t("proc.cash") : t("proc.approved"), method === "cash" ? t("proc.cashSub") : "");
  await wait(1100);
  dialog.close();
}

export default {
  mode: "kiosk",
  chrome: { topbar: true },
  render() {
    if (!store.get().cart.length) {
      queueMicrotask(() => navigate("/menu"));
      return { el: h("section", { class: "screen" }) };
    }
    const s = store.get();
    if (!s.checkout.name && s.member) setCheckout({ name: s.member.name });

    const nameInput = h("input", {
      class: "field-input",
      id: "order-name",
      type: "text",
      maxlength: "18",
      autocomplete: "given-name",
      placeholder: t("pay.namePh"),
      value: store.get().checkout.name,
      onInput: (event) => {
        setCheckout({ name: event.target.value });
        field.classList.remove("is-invalid");
      },
    });
    const nameError = h("p", { class: "field-error", id: "name-error" }, t("pay.nameRequired"));
    const field = h("div", { class: "field" },
      h("label", { class: "field-label", for: "order-name" }, t("pay.name")),
      nameInput,
      nameError,
    );
    nameInput.setAttribute("aria-describedby", "name-error");

    const serviceGroup = h("div", { class: "pay-grid pay-grid--2", role: "radiogroup", "aria-label": t("pay.service") });
    const methodGroup = h("div", { class: "pay-grid pay-grid--3", role: "radiogroup", "aria-label": t("pay.method") });
    const invoice = h("input", {
      type: "checkbox", class: "switch-input", id: "invoice", role: "switch",
      checked: s.checkout.invoice,
      onChange: (event) => setCheckout({ invoice: event.target.checked }),
    });

    const drawOptions = () => {
      const { checkout } = store.get();
      serviceGroup.replaceChildren(
        optionCard({ name: "service", value: "here", current: checkout.service, iconName: "here", title: t("pay.here"), sub: t("pay.here.sub"), onSelect: (v) => setCheckout({ service: v }) }),
        optionCard({ name: "service", value: "togo", current: checkout.service, iconName: "togo", title: t("pay.togo"), sub: t("pay.togo.sub"), onSelect: (v) => setCheckout({ service: v }) }),
      );
      methodGroup.replaceChildren(
        ...[["card", "card"], ["cash", "cash"], ["qr", "qr"]].map(([value, iconName]) =>
          optionCard({ name: "method", value, current: checkout.method, iconName, title: t(`pay.${value}`), sub: t(`pay.${value}.sub`), onSelect: (v) => setCheckout({ method: v }), className: "pay-option--method" })),
      );
    };

    const totals = cartTotals();
    const totalEl = h("strong", { class: "pay-total mono" });
    const payButton = h("button", { class: "cta cta--block cta--lg", type: "button" });
    const syncButton = () => {
      const { checkout } = store.get();
      payButton.replaceChildren(
        h("span", {}, checkout.method === "cash" ? t("pay.confirmCash") : t("pay.confirm", { total: money(cartTotals().total) })),
        h("span", { class: "cta-orb" }, icon(checkout.method === "cash" ? "check" : "arrow")),
      );
    };

    let busy = false;
    payButton.addEventListener("click", async () => {
      if (busy) return;
      const { checkout } = store.get();
      if (!checkout.name.trim()) {
        field.classList.add("is-invalid");
        nameInput.focus();
        field.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 320 });
        announce(t("pay.nameRequired"));
        return;
      }
      busy = true;
      payButton.disabled = true;
      await processPayment(checkout.method, cartTotals().total);
      if (checkout.method !== "cash") completeGuide("s3");
      placeKioskOrder();
      navigate("/listo");
    });

    const items = store.get().cart.map((line) => {
      const product = productById(line.productId);
      return h("li", { class: "mini-line" },
        h("span", {}, h("span", { class: "mono mini-qty" }, `${line.qty}×`), productName(product)),
      );
    });

    const el = h("section", { class: "screen payment", "aria-labelledby": "pay-title" },
      h("div", { class: "pay-main" },
        h("button", { class: "pill-back", type: "button", onClick: () => navigate("/pedido") }, icon("back"), t("bag")),
        h("p", { class: "eyebrow" }, h("span", { class: "eyebrow-line" }), t("pay.eyebrow")),
        h("h1", { class: "h1", id: "pay-title" }, t("pay.title").split("\n").map((line) => h("span", { class: "block" }, accent(line)))),
        h("section", { class: "pay-section" },
          h("h2", { class: "section-title" }, h("span", { class: "section-num mono" }, "01"), t("pay.service")),
          serviceGroup,
          field,
        ),
        h("section", { class: "pay-section" },
          h("h2", { class: "section-title" }, h("span", { class: "section-num mono" }, "02"), t("pay.method")),
          methodGroup,
          h("label", { class: "switch-row", for: "invoice" },
            h("span", { class: "switch-icon" }, icon("receipt")),
            h("span", { class: "switch-text" }, h("strong", {}, t("pay.invoice")), h("span", {}, t("pay.invoice.sub"))),
            invoice,
            h("span", { class: "switch", "aria-hidden": "true" }),
          ),
        ),
      ),
      h("aside", { class: "pay-side" },
        h("div", { class: "pay-summary" },
          h("div", { class: "pay-summary-top" },
            h("span", { class: "rings", "aria-hidden": "true" }),
            h("h2", { class: "h3" }, t("cart.summary")),
            h("ul", { class: "mini-lines" }, items),
          ),
          h("div", { class: "pay-summary-bottom" },
            h("span", { class: "micro" }, t("cart.total")),
            h("div", { class: "pay-total-row" }, totalEl, h("span", { class: "chip chip--leaf" }, icon("leaf"), t("ticket.tax"))),
            totals.discount > 0 && h("p", { class: "micro pay-reward" }, `${t("cart.reward")} −${money(totals.discount)}`),
            h("blockquote", { class: "quote" }, t("pay.quote")),
            payButton,
            h("p", { class: "micro pay-note" }, icon("info"), t("pay.note")),
          ),
        ),
      ),
    );

    drawOptions();
    syncButton();
    totalEl.textContent = money(totals.total);

    return {
      el,
      focus: el.querySelector("h1"),
      update(state, prev) {
        if (state.checkout.method !== prev.checkout.method) syncButton();
        if (state.cart !== prev.cart) countTo(totalEl, cartTotals().total, money);
      },
    };
  },
};
