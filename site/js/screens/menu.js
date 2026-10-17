// 02 · Menú — encontrar el momento.
import { h, icon, accent, money, productImage, productThumb } from "../dom.js";
import { t, productName, productDesc, lang } from "../i18n.js";
import { CATEGORIES, PRODUCTS, defaultSelection } from "../data.js";
import { navigate } from "../router.js";
import { addToCart, cartTotals } from "../orders.js";
import { countTo, flyTo, stagger, shared, transition } from "../motion.js";
import { announce } from "../ui.js";

// Filtros recordados mientras dura la sesión de pedido.
const view = { category: "all", query: "" };

const normalize = (text) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function matches(product) {
  if (view.category !== "all" && product.category !== view.category) return false;
  if (!view.query) return true;
  const q = normalize(view.query);
  return [product.es.name, product.en.name, product.es.desc, product.kr].some((text) => normalize(text).includes(q));
}

function openProduct(product, img) {
  shared.set(img, product.id);
  navigate(`/producto/${product.id}`);
}

function productCard(product) {
  const img = productImage(product, { sizes: "(max-width: 640px) 46vw, (max-width: 1100px) 30vw, 22vw" });
  img.dataset.product = product.id;
  const quickAdd = h("button", {
    class: "quick-add",
    type: "button",
    "aria-label": t("menu.add", { name: productName(product) }),
    onClick: (event) => {
      event.stopPropagation();
      addToCart(product.id, defaultSelection(product));
      flyTo(img, document.getElementById("bag-button"));
      announce(t("menu.added", { name: productName(product) }));
    },
  }, icon("plus"));

  return h("article", { class: "product-card reveal", role: "listitem", dataset: { id: product.id } },
    h("button", {
      class: "card-hit",
      type: "button",
      "aria-label": `${productName(product)}, ${money(product.price)}`,
      onClick: () => openProduct(product, img),
    }),
    h("div", { class: "card-media" },
      img,
      product.tag && h("span", { class: `card-tag card-tag--${product.tag}` }, t(`tag.${product.tag}`)),
    ),
    h("div", { class: "card-body" },
      h("span", { class: "kr card-kr" }, product.kr),
      h("h3", { class: "card-title" }, productName(product)),
      h("p", { class: "card-desc" }, productDesc(product)),
      h("div", { class: "card-foot" },
        h("span", { class: "price mono" }, money(product.price)),
        quickAdd,
      ),
    ),
  );
}

export default {
  mode: "kiosk",
  chrome: { topbar: true },
  render() {
    const grid = h("div", { class: "product-grid", role: "list" });
    const meta = h("p", { class: "menu-meta micro" });
    const rail = h("div", { class: "cat-rail", role: "tablist", "aria-label": t("menu.eyebrow") });

    const drawGrid = () => {
      const list = PRODUCTS.filter(matches);
      meta.textContent = t("menu.count", { n: list.length });
      if (!list.length) {
        grid.replaceChildren(h("div", { class: "empty-state" }, icon("search"), h("p", {}, t("menu.empty", { q: view.query }))));
        return;
      }
      const cards = list.map(productCard);
      stagger(cards);
      grid.replaceChildren(...cards);
    };

    // Reacomodo animado al filtrar: cada tarjeta recibe un nombre de transición sólo
    // durante el cambio (así no interfiere con la transición entre pantallas).
    const nameCards = (on) => {
      for (const card of grid.querySelectorAll(".product-card")) {
        if (on) {
          card.style.setProperty("view-transition-name", `card-${card.dataset.id}`);
          card.style.setProperty("view-transition-class", "card");
          card.classList.remove("reveal");
        } else {
          card.style.removeProperty("view-transition-name");
          card.style.removeProperty("view-transition-class");
        }
      }
    };
    const reflow = (update) => {
      if (!document.startViewTransition) return update();
      nameCards(true);
      transition(() => {
        update();
        nameCards(true);
      }, "none").then(() => nameCards(false));
    };

    const drawRail = () => {
      rail.replaceChildren(...CATEGORIES.map((category) => {
        const count = category.id === "all" ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === category.id).length;
        const selected = view.category === category.id;
        return h("button", {
          class: ["cat", selected && "is-active"],
          type: "button",
          role: "tab",
          "aria-selected": String(selected),
          onClick: () => {
            if (view.category === category.id) return;
            view.category = category.id;
            drawRail();
            reflow(drawGrid);
          },
        },
        h("span", { class: "cat-photo" }, productThumb(category.image, 75)),
        h("span", { class: "cat-text" },
          h("span", { class: "cat-name" }, category[lang()]),
          h("span", { class: "cat-sub" }, h("span", { class: "kr" }, category.kr), " · ", h("span", { class: "mono" }, String(count))),
        ));
      }));
    };

    const search = h("input", {
      class: "search-input",
      type: "search",
      placeholder: t("menu.search"),
      "aria-label": t("menu.search"),
      value: view.query,
      autocomplete: "off",
      enterkeyhint: "search",
      onInput: (event) => {
        view.query = event.target.value.trim();
        drawGrid();
      },
    });

    // Barra flotante de la bolsa
    const dockCount = h("span", { class: "dock-count mono" });
    const dockTotal = h("strong", { class: "dock-total mono" });
    const dock = h("div", { class: "cart-dock", "aria-hidden": "true" },
      h("span", { class: "dock-bag" }, icon("bag"), dockCount),
      h("span", { class: "dock-sum" }, h("span", { class: "micro" }, t("menu.subtotal")), dockTotal),
      h("button", { class: "cta", type: "button", onClick: () => navigate("/pedido") }, t("menu.viewBag"), icon("arrow")),
    );
    const syncDock = (initial = false) => {
      const { count, subtotal } = cartTotals();
      dock.classList.toggle("is-visible", count > 0);
      dock.setAttribute("aria-hidden", String(count === 0));
      dock.inert = count === 0;
      if (initial) {
        dockCount.textContent = String(count);
        countTo(dockTotal, subtotal, money);
      } else {
        countTo(dockCount, count);
        countTo(dockTotal, subtotal, money);
      }
    };

    const el = h("section", { class: "screen menu", "aria-labelledby": "menu-title" },
      h("header", { class: "menu-head" },
        h("div", { class: "menu-heading" },
          h("p", { class: "eyebrow" }, h("span", { class: "eyebrow-line" }), t("menu.eyebrow")),
          h("h1", { class: "h1", id: "menu-title" }, t("menu.title").split("\n").map((line) => h("span", { class: "block" }, accent(line)))),
        ),
        h("label", { class: "search" }, icon("search"), search),
      ),
      rail,
      meta,
      grid,
      dock,
    );

    drawRail();
    drawGrid();
    syncDock(true);
    shared.restore(grid);

    return {
      el,
      focus: el.querySelector("h1"),
      update(state, prev) {
        if (state.cart !== prev.cart) syncDock();
      },
    };
  },
};
