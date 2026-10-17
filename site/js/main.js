// Arranque de la demo Koyo · Komorebi.
import { store } from "./store.js";
import { defineRoutes, startRouter, currentPath } from "./router.js";
import { transition } from "./motion.js";
import { renderTopbar, updateBag, renderDemoBar, startIdleWatcher } from "./chrome.js";
import { startSimulation } from "./sim.js";
import { announce } from "./ui.js";
import attract from "./screens/attract.js";
import menu from "./screens/menu.js";
import product from "./screens/product.js";
import cart from "./screens/cart.js";
import payment from "./screens/payment.js";
import confirm from "./screens/confirm.js";
import barista from "./screens/barista.js";
import manager from "./screens/manager.js";

defineRoutes([
  { path: "/", screen: attract },
  { path: "/menu", screen: menu },
  { path: "/producto/:id", screen: product },
  { path: "/pedido", screen: cart },
  { path: "/pago", screen: payment },
  { path: "/listo", screen: confirm },
  { path: "/barra", screen: barista },
  { path: "/gerente", screen: manager },
]);

const app = document.getElementById("app");
const view = document.getElementById("view");
const topbar = document.getElementById("topbar");
const demoBar = document.getElementById("demo-bar");

let mounted = null; // { screen, instance, params }

function syncDocument(screen) {
  const root = document.documentElement;
  root.lang = store.get().lang;
  root.dataset.theme = screen.theme ?? "light";
  app.dataset.mode = screen.mode;
  app.dataset.screen = currentPath().split("/")[1] || "inicio";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", screen.theme === "dark" ? "#1a1914" : "#fef9ea");
}

function mount({ route, params }, { focus = true } = {}) {
  mounted?.instance.destroy?.();
  const screen = route.screen;
  const instance = screen.render(params);
  syncDocument(screen);
  topbar.hidden = !screen.chrome?.topbar;
  if (screen.chrome?.topbar) renderTopbar(topbar);
  renderDemoBar(demoBar, screen.mode);
  view.replaceChildren(instance.el);
  mounted = { screen, instance, params };
  const heading = instance.el.querySelector("h1");
  if (heading) {
    // Las líneas de título son spans hermanos: textContent no añade espacios.
    const lines = [...heading.querySelectorAll(":scope > .display-line, :scope > .block")];
    const headingText = (lines.length ? lines.map((line) => line.textContent).join(" ") : heading.textContent)
      .replace(/\s+/g, " ").trim();
    document.title = `${headingText} · Koyo`;
    announce(headingText);
  }
  if (focus) {
    window.scrollTo({ top: 0, behavior: "instant" });
    const target = instance.focus ?? view;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }
}

startRouter((resolved, direction, force) => {
  if (!mounted || force) return mount(resolved);
  transition(() => mount(resolved), direction);
});

store.subscribe((state, prev) => {
  if (!mounted) return;
  if (state.lang !== prev.lang) {
    // El idioma cambia todo el texto: se vuelve a montar la vista actual sin transición.
    mount({ route: { screen: mounted.screen }, params: mounted.params }, { focus: false });
    return;
  }
  mounted.instance.update?.(state, prev);
  if (state.cart !== prev.cart && !topbar.hidden) updateBag(topbar);
  if (state.guide !== prev.guide) renderDemoBar(demoBar, mounted.screen.mode);
});

// La primera vista ya está montada: retiramos la pantalla de carga en el siguiente cuadro
// (las fuentes usan font-display: swap, no hace falta esperarlas).
const boot = document.getElementById("boot");
requestAnimationFrame(() => {
  document.documentElement.classList.add("is-ready");
  setTimeout(() => boot?.remove(), 700);
});

// Simulador e inactividad no son necesarios para la primera pintura.
const whenIdle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 400));
whenIdle(() => {
  startSimulation();
  startIdleWatcher();
}, { timeout: 1500 });
