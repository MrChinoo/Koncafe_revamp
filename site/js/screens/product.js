// 03 · Producto — hazlo tuyo.
import { h, icon, money, productImage } from "../dom.js";
import { t, productName, productDesc } from "../i18n.js";
import { productById, optionGroups, defaultSelection, unitPrice } from "../data.js";
import { navigate, currentQuery } from "../router.js";
import { addToCart, replaceLine } from "../orders.js";
import { countTo, flyTo, shared } from "../motion.js";
import { announce, toast } from "../ui.js";
import { store, completeGuide } from "../store.js";

const GROUP_ICON = { size: "cup", temp: "hot", milk: "leaf", sweet: "sparkle", extras: "plus", warm: "hot" };

function deltaLabel(delta) {
  if (!delta) return null;
  return h("span", { class: "delta mono" }, `${delta > 0 ? "+" : "−"}${money(Math.abs(delta))}`);
}

function groupHeader(group) {
  const hintKey = `group.${group.id}.hint`;
  const hint = t(hintKey);
  return h("legend", { class: "group-head" },
    h("span", { class: "group-title" }, t(`group.${group.id}`)),
    hint !== hintKey && h("span", { class: "micro group-hint" }, hint),
  );
}

export default {
  mode: "kiosk",
  chrome: { topbar: true },
  render({ id }) {
    const product = productById(id);
    if (!product) {
      queueMicrotask(() => navigate("/menu"));
      return { el: h("section", { class: "screen" }) };
    }

    const editIndex = currentQuery().get("linea");
    const editing = editIndex !== null ? store.get().cart[Number(editIndex)] : null;
    const selection = editing && editing.productId === product.id ? structuredClone(editing.selection) : defaultSelection(product);
    let qty = editing?.qty ?? 1;

    const totalEl = h("strong", { class: "bar-total mono" });
    const qtyEl = h("output", { class: "qty-value mono", "aria-live": "polite" }, String(qty));
    const syncTotal = () => countTo(totalEl, unitPrice(product, selection) * qty, money);

    const groups = optionGroups(product).map((group) => {
      const fieldset = h("fieldset", { class: `option-group option-group--${group.id} option-group--${group.type}` }, groupHeader(group));
      const name = `opt-${group.id}`;

      if (group.type === "multi") {
        const list = h("div", { class: "extras" });
        for (const option of group.options) {
          const input = h("input", {
            type: "checkbox", name, value: option.id, class: "sr-only",
            checked: selection[group.id].includes(option.id),
            onChange: (event) => {
              const set = new Set(selection[group.id]);
              event.target.checked ? set.add(option.id) : set.delete(option.id);
              selection[group.id] = [...set];
              syncTotal();
            },
          });
          list.append(h("label", { class: "extra" }, input,
            h("span", { class: "extra-check", "aria-hidden": "true" }, icon("check")),
            h("span", { class: "extra-name" }, t(`opt.${option.id}`)),
            deltaLabel(option.delta) ?? h("span", { class: "delta delta--free micro" }, t("opt.free")),
          ));
        }
        fieldset.append(list);
        return fieldset;
      }

      const list = h("div", { class: `choices choices--${group.id}` });
      const sync = () => {
        const index = group.options.findIndex((o) => o.id === selection[group.id]);
        list.style.setProperty("--idx", String(Math.max(0, index)));
        list.style.setProperty("--n", String(group.options.length));
      };
      if (group.type === "scale") list.append(h("span", { class: "scale-thumb", "aria-hidden": "true" }));

      for (const option of group.options) {
        const input = h("input", {
          type: "radio", name, value: option.id, class: "sr-only",
          checked: selection[group.id] === option.id,
          onChange: () => {
            selection[group.id] = option.id;
            sync();
            syncTotal();
          },
        });
        let body;
        if (group.id === "size") {
          const cup = icon("cup", "icon size-cup");
          cup.style.setProperty("--s", String(option.scale));
          body = [cup, h("span", { class: "choice-name" }, t(`opt.${option.id}`)), h("span", { class: "micro" }, `${option.oz} oz`), deltaLabel(option.delta)];
        } else if (group.id === "temp" || group.id === "warm") {
          body = [icon(option.id === "cold" ? "cold" : option.id === "room" ? "leaf" : "hot"), h("span", { class: "choice-name" }, t(`opt.${option.id}`))];
        } else if (group.type === "scale") {
          body = [h("span", { class: "choice-name mono" }, `${option.id}%`)];
        } else {
          body = [h("span", { class: "choice-name" }, t(`opt.${option.id}`)), deltaLabel(option.delta)];
        }
        list.append(h("label", { class: "choice" }, input, ...body));
      }
      sync();
      fieldset.append(list);
      return fieldset;
    });

    const photo = productImage(product, { sizes: "(max-width: 900px) 92vw, 44vw", eager: true, className: "detail-img" });
    photo.style.setProperty("view-transition-name", shared.name);

    const setQty = (next) => {
      qty = Math.min(20, Math.max(1, next));
      qtyEl.textContent = String(qty);
      minus.disabled = qty === 1;
      syncTotal();
    };
    const minus = h("button", { class: "step-btn", type: "button", "aria-label": "−1", onClick: () => setQty(qty - 1) }, icon("minus"));
    const plus = h("button", { class: "step-btn", type: "button", "aria-label": "+1", onClick: () => setQty(qty + 1) }, icon("plus"));
    minus.disabled = qty === 1;

    const submit = async () => {
      if (editing) {
        replaceLine(editing.key, product.id, { ...selection }, qty);
        navigate("/pedido");
        return;
      }
      addToCart(product.id, { ...selection }, qty);
      if (product.profile !== "food") completeGuide("s1");
      announce(t("menu.added", { name: productName(product) }));
      await flyTo(photo, document.getElementById("bag-button"));
      toast(t("menu.added", { name: productName(product) }), { iconName: "bag" });
      navigate("/menu");
    };

    const el = h("section", { class: "screen detail", "aria-labelledby": "detail-title" },
      h("div", { class: "detail-stage" },
        h("div", { class: "detail-visual" },
          h("button", { class: "pill-back", type: "button", onClick: () => navigate(editing ? "/pedido" : "/menu") }, icon("back"), editing ? t("bag") : t("detail.back")),
          h("figure", { class: "detail-photo" }, photo, h("span", { class: "detail-halo", "aria-hidden": "true" })),
          h("div", { class: "detail-title" },
            h("p", { class: "eyebrow" }, t("detail.series"), h("span", { class: "kr" }, ` · ${product.kr}`)),
            h("h1", { class: "h1", id: "detail-title" }, productName(product)),
            h("p", { class: "lead" }, productDesc(product)),
          ),
        ),
        h("form", { class: "detail-options", onSubmit: (event) => { event.preventDefault(); submit(); } }, groups),
      ),
      h("footer", { class: "action-bar" },
        h("div", { class: "qty" }, h("span", { class: "micro" }, t("detail.qty")), h("div", { class: "stepper" }, minus, qtyEl, plus)),
        h("div", { class: "bar-sum" }, h("span", { class: "micro" }, t("detail.total")), totalEl),
        h("button", { class: "cta cta--lg", type: "button", onClick: submit },
          editing ? t("detail.update") : t("detail.add"), h("span", { class: "cta-orb" }, icon(editing ? "check" : "bag"))),
      ),
    );

    totalEl.textContent = money(unitPrice(product, selection) * qty);
    countTo(totalEl, unitPrice(product, selection) * qty, money);
    for (const fieldset of groups) fieldset.querySelector(".group-head")?.prepend(h("span", { class: "group-icon" }, icon(GROUP_ICON[fieldset.className.match(/option-group--(\w+)/)[1]] ?? "plus")));

    return { el, focus: el.querySelector("h1") };
  },
};
