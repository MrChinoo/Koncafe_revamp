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
  if (focus) {
    window.scrollTo({ top: 0, behavior: "instant" });
    const target = instance.focus ?? view;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    const heading = instance.el.querySelector("h1");
    if (heading) {
      document.title = `${heading.textContent.replace(/\s+/g, " ").trim()} · Koyo`;
      announce(heading.textContent);
    }
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

startSimulation();
startIdleWatcher();

// Retira la pantalla de carga cuando las fuentes están listas (o a los 1.2 s).
const boot = document.getElementById("boot");
Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 1200))]).then(() => {
  document.documentElement.classList.add("is-ready");
  boot?.addEventListener("transitionend", () => boot.remove(), { once: true });
  setTimeout(() => boot?.remove(), 900);
});
