// Movimiento: transiciones entre escenas, números vivos, vuelo a la bolsa y hojas.
import { h, prefersReducedMotion } from "./dom.js";

const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";

/** Envuelve un cambio de DOM en View Transitions cuando está disponible. */
export function transition(update, direction = "forward") {
  const root = document.documentElement;
  root.dataset.nav = direction;
  if (!document.startViewTransition || prefersReducedMotion()) {
    update();
    return Promise.resolve();
  }
  const vt = document.startViewTransition(update);
  return vt.finished.catch(() => {}).finally(() => delete root.dataset.nav);
}

const counters = new WeakMap();
/** Anima un número de su valor actual al nuevo con easing. */
export function countTo(el, to, format = (n) => String(Math.round(n)), duration = 520, initial = to) {
  const from = counters.get(el) ?? initial;
  counters.set(el, to);
  if (from === to || prefersReducedMotion()) {
    el.textContent = format(to);
    return;
  }
  const start = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = format(from + (to - from) * eased);
    if (p < 1 && counters.get(el) === to) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  el.animate(
    [{ transform: "translateY(0)" }, { transform: "translateY(-2px)" }, { transform: "translateY(0)" }],
    { duration: 300, easing: EASE },
  );
}

/** Clona la imagen y la hace volar hacia el objetivo (la bolsa). */
export function flyTo(source, target) {
  if (!source || !target || prefersReducedMotion()) return Promise.resolve();
  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (!from.width || !to.width) return Promise.resolve();
  const ghost = h("img", { class: "fly-ghost", src: source.currentSrc || source.src, alt: "" });
  ghost.style.setProperty("left", `${from.left}px`);
  ghost.style.setProperty("top", `${from.top}px`);
  ghost.style.setProperty("width", `${from.width}px`);
  ghost.style.setProperty("height", `${from.height}px`);
  document.body.append(ghost);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const animation = ghost.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1, borderRadius: "28px" },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 90}px) scale(.55)`, opacity: 1, borderRadius: "40px", offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(.12)`, opacity: 0.2, borderRadius: "999px" },
    ],
    { duration: 720, easing: "cubic-bezier(.5,0,.3,1)" },
  );
  return animation.finished.then(() => {
    ghost.remove();
    target.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }],
      { duration: 380, easing: EASE },
    );
  });
}

/** Lluvia de hojas: la firma komorebi al confirmar. */
export function leafFall(container, count = 22) {
  if (prefersReducedMotion()) return;
  const layer = h("div", { class: "leaf-layer", "aria-hidden": "true" });
  const tones = ["var(--matcha-soft)", "var(--clay-soft)", "var(--amber)", "var(--matcha)"];
  for (let i = 0; i < count; i++) {
    const leaf = h("span", { class: "leaf" });
    leaf.style.setProperty("--x", `${Math.random() * 100}%`);
    leaf.style.setProperty("--drift", `${(Math.random() - 0.5) * 220}px`);
    leaf.style.setProperty("--spin", `${(Math.random() - 0.5) * 720}deg`);
    leaf.style.setProperty("--delay", `${Math.random() * 900}ms`);
    leaf.style.setProperty("--dur", `${2600 + Math.random() * 1800}ms`);
    leaf.style.setProperty("--size", `${10 + Math.random() * 12}px`);
    leaf.style.setProperty("--tone", tones[i % tones.length]);
    layer.append(leaf);
  }
  container.append(layer);
  setTimeout(() => layer.remove(), 5200);
}

/**
 * Elemento compartido entre menú y detalle: la foto "viaja" de la tarjeta
 * a la pantalla de producto (y de regreso) con View Transitions.
 */
const SHARED_NAME = "product-hero";
let sharedId = null;
export const shared = {
  name: SHARED_NAME,
  set(img, id) {
    sharedId = id;
    document.querySelectorAll(".is-shared").forEach((el) => {
      el.classList.remove("is-shared");
      el.style.removeProperty("view-transition-name");
    });
    img.classList.add("is-shared");
    img.style.setProperty("view-transition-name", SHARED_NAME);
  },
  /** Asigna el nombre compartido a la imagen del producto recordado dentro de root. */
  restore(root) {
    if (!sharedId) return;
    const img = root.querySelector(`img[data-product="${sharedId}"]`);
    if (img) {
      img.classList.add("is-shared");
      img.style.setProperty("view-transition-name", SHARED_NAME);
      setTimeout(() => {
        img.classList.remove("is-shared");
        img.style.removeProperty("view-transition-name");
      }, 900);
    }
  },
  get id() {
    return sharedId;
  },
};

/** Aplica índice de escalonado a los hijos para revelados en cascada. */
export function stagger(elements, start = 0) {
  elements.forEach((el, index) => el.style.setProperty("--i", String(start + index)));
}
