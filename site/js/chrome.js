// Marco de la aplicación: barra de demo, barra del kiosco, recorrido e inactividad.
import { h, icon, logoMark } from "./dom.js";
import { t } from "./i18n.js";
import { store } from "./store.js";
import { navigate, currentPath, lastKioskPath } from "./router.js";
import { cartCount } from "./orders.js";
import { countTo } from "./motion.js";
import { openDialog, toast, announce } from "./ui.js";

export function brandLockup({ compact = false } = {}) {
  return h("a", { class: ["brand", compact && "brand--compact"], href: "#/", "aria-label": "Koyo — inicio", "data-no-start": "" },
    h("span", { class: "brand-mark" }, logoMark()),
    h("span", { class: "brand-text" },
      h("span", { class: "brand-name" }, "Koyo ", h("span", { class: "kr brand-kr" }, "고요")),
      !compact && h("span", { class: "brand-tag" }, t("brand.tagline")),
    ),
  );
}

export function langToggle() {
  const current = store.get().lang;
  const option = (code, label) =>
    h("button", {
      type: "button",
      class: ["lang-option", current === code && "is-active"],
      "aria-pressed": String(current === code),
      lang: code,
      onClick: (event) => {
        event.stopPropagation();
        if (store.get().lang !== code) store.set({ lang: code });
      },
    }, label);
  return h("div", { class: "lang-toggle", role: "group", "aria-label": "Idioma / Language" },
    icon("globe"), option("es", "ES"), option("en", "EN"));
}

/* ── Barra del kiosco ─────────────────────────────────────────── */

const STEPS = [
  { key: "steps.menu", paths: ["/menu", "/producto"] },
  { key: "steps.order", paths: ["/pedido"] },
  { key: "steps.pay", paths: ["/pago"] },
  { key: "steps.done", paths: ["/listo"] },
];

export function renderTopbar(root) {
  const path = currentPath();
  const active = STEPS.findIndex((step) => step.paths.some((p) => path.startsWith(p)));
  const count = cartCount();
  const countEl = h("span", { class: "bag-count mono" });
  countEl.textContent = String(count);
  const bag = h("button", {
    class: ["bag-button", count === 0 && "is-empty"],
    type: "button",
    id: "bag-button",
    "aria-label": t("bag.aria", { n: count }),
    onClick: () => navigate("/pedido"),
  }, icon("bag"), h("span", { class: "bag-label" }, t("bag")), countEl);

  root.replaceChildren(
    brandLockup({ compact: true }),
    h("ol", { class: "steps", "aria-label": "Progreso" },
      STEPS.map((step, index) =>
        h("li", {
          class: ["step", index < active && "is-done", index === active && "is-current"],
          "aria-current": index === active ? "step" : undefined,
        },
        h("span", { class: "step-dot mono" }, index < active ? icon("check") : String(index + 1)),
        h("span", { class: "step-label" }, t(step.key))),
      ),
    ),
    h("div", { class: "topbar-actions" }, langToggle(), bag),
  );
  return { countEl, bag };
}

export function updateBag(root) {
  const bag = root.querySelector("#bag-button");
  if (!bag) return;
  const count = cartCount();
  const countEl = bag.querySelector(".bag-count");
  countTo(countEl, count);
  bag.classList.toggle("is-empty", count === 0);
  bag.setAttribute("aria-label", t("bag.aria", { n: count }));
}

/* ── Barra de demostración ────────────────────────────────────── */

const MODES = [
  { id: "kiosk", path: "/", icon: "kiosk", key: "demo.kiosk" },
  { id: "bar", path: "/barra", icon: "barista", key: "demo.bar" },
  { id: "manager", path: "/gerente", icon: "chart", key: "demo.manager" },
];

export function renderDemoBar(root, mode) {
  const s = store.get();
  const guideDone = Object.keys(s.guide).length;
  root.replaceChildren(
    h("div", { class: "demo-bar-inner" },
      h("p", { class: "demo-id" },
        h("span", { class: "demo-pulse", "aria-hidden": "true" }),
        h("strong", {}, t("demo.label")),
        h("span", { class: "demo-note" }, t("demo.note")),
      ),
      h("nav", { class: "mode-switch", "aria-label": "Modo de la demo" },
        MODES.map((m) =>
          h("a", {
            class: ["mode-link", mode === m.id && "is-active"],
            href: `#${m.id === "kiosk" ? lastKioskPath() : m.path}`,
            "aria-current": mode === m.id ? "page" : undefined,
          }, icon(m.icon), h("span", {}, t(m.key))),
        ),
      ),
      h("div", { class: "demo-tools" },
        h("button", {
          class: ["demo-tool", guideDone < 5 && "has-dot"],
          type: "button",
          onClick: openGuide,
          "aria-haspopup": "dialog",
        }, icon("route"), h("span", {}, t("demo.guide")), h("span", { class: "mono demo-progress" }, `${guideDone}/5`)),
        h("button", {
          class: "demo-tool demo-tool--icon",
          type: "button",
          "aria-label": t("demo.reset"),
          title: t("demo.reset"),
          onClick: () => {
            store.reset();
            navigate("/");
            toast(t("demo.resetDone"), { iconName: "reset" });
          },
        }, icon("reset")),
      ),
    ),
  );
}

/* ── Recorrido guiado ─────────────────────────────────────────── */

const GUIDE = [
  { id: "s1", path: "/menu" },
  { id: "s2", path: "/pedido" },
  { id: "s3", path: "/pago" },
  { id: "s4", path: "/barra" },
  { id: "s5", path: "/gerente" },
];

export function openGuide() {
  const s = store.get();
  const done = GUIDE.filter((step) => s.guide[step.id]).length;
  let dialog;
  const content = h("div", { class: "guide" },
    h("header", { class: "guide-head" },
      h("div", {},
        h("p", { class: "eyebrow" }, `${done}/5`),
        h("h2", { class: "h2" }, t("guide.title")),
        h("p", { class: "muted" }, done === 5 ? t("guide.done") : t("guide.lead")),
      ),
      h("button", { class: "icon-button", type: "button", "aria-label": t("guide.close"), onClick: () => dialog.close() }, icon("close")),
    ),
    h("div", { class: "guide-meter", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "5", "aria-valuenow": String(done) },
      h("span", { class: "guide-meter-fill", style: { "--p": String(done / 5) } })),
    h("ol", { class: "guide-steps" },
      GUIDE.map((step, index) =>
        h("li", { class: ["guide-step", s.guide[step.id] && "is-done"] },
          h("span", { class: "guide-check" }, s.guide[step.id] ? icon("check") : String(index + 1)),
          h("span", { class: "guide-label" }, t(`guide.${step.id}`)),
          h("button", {
            class: "chip-link",
            type: "button",
            onClick: () => {
              dialog.close();
              navigate(step.path);
            },
          }, t("guide.go"), icon("arrow")),
        ),
      ),
    ),
  );
  dialog = openDialog(content, { label: t("guide.title"), className: "sheet--guide" });
}

/* ── Inactividad del kiosco ───────────────────────────────────── */

const IDLE_MS = 75_000;
const GRACE_S = 10;

export function startIdleWatcher() {
  let idleTimer = null;
  let prompt = null;

  const eligible = () => {
    const path = currentPath();
    return ["/menu", "/producto", "/pedido", "/pago"].some((p) => path.startsWith(p));
  };

  const endSession = () => {
    store.set({ cart: [], member: null, redeem: false, checkout: { ...store.get().checkout, name: "", invoice: false } });
    navigate("/");
  };

  const showPrompt = () => {
    if (!eligible() || prompt) return;
    let remaining = GRACE_S;
    const counter = h("span", { class: "mono" }, String(remaining));
    const ring = h("span", { class: "idle-ring", style: { "--p": "1" } }, counter);
    const text = h("p", { class: "muted" }, t("idle.text", { n: remaining }));
    const content = h("div", { class: "idle" },
      ring,
      h("h2", { class: "h2" }, t("idle.title")),
      text,
      h("div", { class: "idle-actions" },
        h("button", { class: "button button--ghost", type: "button", onClick: () => { prompt.close(); endSession(); } }, t("idle.leave")),
        h("button", { class: "cta", type: "button", onClick: () => prompt.close() }, t("idle.stay")),
      ),
    );
    prompt = openDialog(content, { label: t("idle.title"), className: "sheet--center", onClose: () => { clearInterval(tick); prompt = null; arm(); } });
    announce(t("idle.title"));
    const tick = setInterval(() => {
      remaining -= 1;
      counter.textContent = String(remaining);
      text.textContent = t("idle.text", { n: remaining });
      ring.style.setProperty("--p", String(remaining / GRACE_S));
      if (remaining <= 0) {
        clearInterval(tick);
        prompt?.close();
        endSession();
      }
    }, 1000);
  };

  const arm = () => {
    clearTimeout(idleTimer);
    if (prompt) return;
    idleTimer = setTimeout(showPrompt, IDLE_MS);
  };

  for (const type of ["pointerdown", "keydown", "wheel", "touchstart"]) {
    window.addEventListener(type, arm, { passive: true });
  }
  window.addEventListener("hashchange", arm);
  arm();
}
