// 04 · Pedido + Club Koyo.
import { h, icon, accent, money, productImage } from "../dom.js";
import { t, productName } from "../i18n.js";
import { productById, DEMO_MEMBER } from "../data.js";
import { navigate } from "../router.js";
import { cartTotals, lineTotal, setQty, describeSelection } from "../orders.js";
import { countTo, stagger, reflowList, vtIdent } from "../motion.js";
import { announce, toast, openDialog } from "../ui.js";
import { store, completeGuide } from "../store.js";

function signIn() {
  store.set({ member: { ...DEMO_MEMBER, reward: { ...DEMO_MEMBER.reward } } });
  completeGuide("s2");
  toast(t("club.welcome", { name: DEMO_MEMBER.name, n: DEMO_MEMBER.stars }), { iconName: "star", tone: "matcha" });
}

function scanDialog() {
  let dialog;
  const content = h("div", { class: "scan" },
    h("div", { class: "scan-frame", "aria-hidden": "true" },
      h("span", { class: "scan-corner scan-corner--tl" }), h("span", { class: "scan-corner scan-corner--tr" }),
      h("span", { class: "scan-corner scan-corner--bl" }), h("span", { class: "scan-corner scan-corner--br" }),
      h("span", { class: "scan-phone" }, icon("qr")),
      h("span", { class: "scan-line" }),
    ),
    h("h2", { class: "h2" }, t("club.scan")),
    h("p", { class: "muted" }, t("club.scanning")),
  );
  dialog = openDialog(content, { label: t("club.scan"), className: "sheet--center" });
  const timer = setTimeout(() => {
    content.classList.add("is-found");
    setTimeout(() => {
      dialog.close();
      signIn();
    }, 650);
  }, 1900);
  dialog.el.addEventListener("close", () => clearTimeout(timer), { once: true });
}

function phoneDialog() {
  let digits = "";
  let dialog;
  const display = h("output", { class: "phone-display mono", "aria-live": "polite" });
  const confirm = h("button", { class: "cta", type: "button", disabled: true, onClick: () => { dialog.close(); signIn(); } }, t("club.confirm"), icon("arrow"));
  const render = () => {
    const padded = digits.padEnd(10, "·");
    display.textContent = `${padded.slice(0, 2)} ${padded.slice(2, 6)} ${padded.slice(6, 10)}`;
    confirm.disabled = digits.length < 10;
  };
  const press = (key) => {
    if (key === "del") digits = digits.slice(0, -1);
    else if (digits.length < 10) digits += key;
    render();
  };
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];
  const content = h("div", { class: "phone" },
    h("h2", { class: "h2" }, t("club.phoneTitle")),
    h("p", { class: "muted" }, t("club.phoneHint")),
    display,
    h("div", { class: "keypad" }, keys.map((key) =>
      key === ""
        ? h("span")
        : h("button", { class: "key mono", type: "button", "aria-label": key === "del" ? "Borrar" : key, onClick: () => press(key) }, key === "del" ? icon("back") : key),
    )),
    confirm,
  );
  const onKey = (event) => {
    if (/^\d$/.test(event.key)) press(event.key);
    else if (event.key === "Backspace") press("del");
  };
  render();
  dialog = openDialog(content, { label: t("club.phoneTitle"), className: "sheet--center" });
  dialog.el.addEventListener("keydown", onKey);
}

function lineCard(line, index) {
  const product = productById(line.productId);
  if (!product) return null;
  const qtyEl = h("output", { class: "qty-value mono" }, String(line.qty));
  return h("article", { class: "line reveal", role: "listitem", dataset: { vt: vtIdent("ln", line.key) } },
    h("div", { class: "line-media" }, productImage(product, { sizes: "120px" })),
    h("div", { class: "line-info" },
      h("h3", { class: "line-title" }, productName(product), h("span", { class: "kr line-kr" }, product.kr)),
      h("p", { class: "line-desc" }, describeSelection(product, line.selection, t)),
      h("div", { class: "line-actions" },
        h("div", { class: "stepper stepper--sm" },
          h("button", { class: "step-btn", type: "button", "aria-label": `${productName(product)} −1`, onClick: () => {
            if (line.qty === 1) toast(t("cart.removed", { name: productName(product) }), { iconName: "trash" });
            setQty(line.key, line.qty - 1);
          } }, icon(line.qty === 1 ? "trash" : "minus")),
          qtyEl,
          h("button", { class: "step-btn", type: "button", "aria-label": `${productName(product)} +1`, onClick: () => setQty(line.key, line.qty + 1) }, icon("plus")),
        ),
        h("button", { class: "text-link", type: "button", onClick: () => navigate(`/producto/${product.id}?linea=${index}`) }, icon("edit"), t("cart.edit")),
      ),
    ),
    h("span", { class: "line-price mono" }, money(lineTotal(line))),
  );
}

export default {
  mode: "kiosk",
  chrome: { topbar: true },
  render() {
    const lines = h("div", { class: "lines", role: "list" });
    const club = h("section", { class: "club-card", "aria-live": "polite" });

    // Resumen con nodos persistentes para animar valores
    const subtotalEl = h("span", { class: "mono" });
    const rewardRow = h("div", { class: "sum-row sum-row--reward" }, h("span", {}, t("cart.reward")), h("span", { class: "mono reward-value" }));
    const taxEl = h("span", { class: "mono" });
    const totalEl = h("strong", { class: "sum-total mono" });
    const earnEl = h("p", { class: "earn" });
    const next = h("button", { class: "cta cta--block", type: "button", onClick: () => navigate("/pago") }, t("cart.next"), h("span", { class: "cta-orb" }, icon("arrow")));
    const summary = h("section", { class: "summary-card" },
      h("h2", { class: "h3" }, t("cart.summary")),
      h("div", { class: "sum-row" }, h("span", {}, t("cart.subtotal")), subtotalEl),
      rewardRow,
      h("div", { class: "sum-row sum-row--muted" }, h("span", {}, t("cart.tax")), taxEl),
      h("div", { class: "sum-total-row" }, h("span", {}, t("cart.total")), totalEl),
      earnEl,
      next,
    );

    const drawLines = () => {
      const { cart } = store.get();
      if (!cart.length) {
        lines.replaceChildren(h("div", { class: "empty-cart" },
          h("span", { class: "empty-rosetta", "aria-hidden": "true" }),
          h("h2", { class: "h2" }, t("cart.empty")),
          h("p", { class: "muted" }, t("cart.emptyText")),
          h("button", { class: "cta", type: "button", onClick: () => navigate("/menu") }, t("cart.toMenu"), icon("arrow")),
        ));
        return;
      }
      const cards = cart.map(lineCard).filter(Boolean);
      stagger(cards);
      lines.replaceChildren(...cards);
    };

    const drawClub = () => {
      const { member, redeem } = store.get();
      const totals = cartTotals();
      if (!member) {
        club.className = "club-card club-card--guest";
        club.replaceChildren(
          h("div", { class: "club-top" }, h("span", { class: "club-icon" }, icon("leaf")), h("h2", { class: "h3" }, t("club.title"))),
          h("p", { class: "muted" }, t("club.pitch")),
          h("div", { class: "club-actions" },
            h("button", { class: "button button--paper", type: "button", onClick: scanDialog }, icon("qr"), t("club.scan")),
            h("button", { class: "button button--paper", type: "button", onClick: phoneDialog }, icon("phone"), t("club.phone")),
          ),
        );
        return;
      }
      const starsEl = h("span", { class: "club-stars-num" });
      const progress = Math.min(1, member.stars / member.nextTier);
      club.className = "club-card club-card--member";
      club.replaceChildren(
        h("div", { class: "club-top" },
          h("span", { class: "club-avatar" }, member.name[0]),
          h("div", {}, h("h2", { class: "h3" }, t("club.hello", { name: member.name })), h("span", { class: "chip chip--matcha" }, t("club.tier", { tier: "Hoja" }))),
          h("button", { class: "text-link text-link--small", type: "button", onClick: () => store.set({ member: null, redeem: false }) }, t("club.signOut")),
        ),
        h("p", { class: "club-stars" }, starsEl, h("span", { class: "micro" }, t("club.stars"))),
        h("div", { class: "meter", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(member.nextTier), "aria-valuenow": String(member.stars) },
          h("span", { class: "meter-fill", style: { "--p": String(progress) } })),
        h("p", { class: "micro club-next" }, t("club.toNext", { n: Math.max(0, member.nextTier - member.stars) })),
        totals.canRedeem && h("button", {
          class: ["redeem", redeem && "is-on"],
          type: "button",
          "aria-pressed": String(redeem),
          onClick: () => {
            store.set({ redeem: !store.get().redeem });
            announce(store.get().redeem ? t("club.redeemed") : t("club.undo"));
          },
        },
        h("span", { class: "redeem-icon" }, icon(redeem ? "check" : "star")),
        h("span", {}, redeem ? t("club.redeemed") : t("club.redeem", { cost: member.reward.cost, value: money(member.reward.value) })),
        redeem && h("span", { class: "micro" }, t("club.undo"))),
      );
      starsEl.textContent = String(member.stars);
    };

    const drawSummary = () => {
      const totals = cartTotals();
      const { member } = store.get();
      countTo(subtotalEl, totals.subtotal, money);
      countTo(taxEl, totals.tax, money);
      countTo(totalEl, totals.total, money);
      rewardRow.hidden = !totals.discount;
      rewardRow.querySelector(".reward-value").textContent = `−${money(totals.discount)}`;
      earnEl.replaceChildren(icon("star"), member ? t("cart.earn", { n: totals.stars }) : t("done.joinClub", { n: totals.stars }));
      earnEl.classList.toggle("is-member", Boolean(member));
      next.disabled = totals.count === 0;
      summary.classList.toggle("is-empty", totals.count === 0);
    };

    const el = h("section", { class: "screen cart", "aria-labelledby": "cart-title" },
      h("div", { class: "cart-main" },
        h("button", { class: "pill-back", type: "button", onClick: () => navigate("/menu") }, icon("back"), t("cart.keep")),
        h("p", { class: "eyebrow" }, h("span", { class: "eyebrow-line" }), t("cart.eyebrow")),
        h("h1", { class: "h1", id: "cart-title" }, accent(t("cart.title"))),
        lines,
      ),
      h("aside", { class: "cart-side" }, club, summary),
    );

    drawLines();
    drawClub();
    drawSummary();
    // Tras la entrada inicial, los redibujos (cantidades) no repiten la animación.
    setTimeout(() => lines.classList.add("is-settled"), 900);

    return {
      el,
      focus: el.querySelector("h1"),
      update(state, prev) {
        if (state.cart !== prev.cart) {
          // Si cambia el número de líneas (quitar/agregar), la lista se reacomoda animada.
          if (state.cart.length !== prev.cart.length && state.cart.length && prev.cart.length) reflowList(lines, ".line", drawLines);
          else drawLines();
        }
        if (state.cart !== prev.cart || state.member !== prev.member || state.redeem !== prev.redeem) {
          drawClub();
          drawSummary();
        }
      },
    };
  },
};
