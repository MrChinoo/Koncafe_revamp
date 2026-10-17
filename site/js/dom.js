// Utilidades DOM sin dependencias. Compatible con CSP estricta:
// los estilos dinámicos usan CSSOM (style.setProperty), nunca atributos inline.

export function h(tag, props = {}, ...children) {
  const el = tag === "svg" || props.svg
    ? document.createElementNS("http://www.w3.org/2000/svg", tag)
    : document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false || key === "svg") continue;
    if (key === "class") el.setAttribute("class", Array.isArray(value) ? value.filter(Boolean).join(" ") : value);
    else if (key === "style") for (const [prop, v] of Object.entries(value)) el.style.setProperty(prop, v);
    else if (key === "dataset") Object.assign(el.dataset, value);
    else if (key.startsWith("on") && typeof value === "function") el.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === "text") el.textContent = value;
    else if (key in el && !(el instanceof SVGElement) && typeof value !== "string") el[key] = value;
    else el.setAttribute(key, value === true ? "" : value);
  }
  append(el, children);
  return el;
}

export function append(parent, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return parent;
}

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const moneyFormat = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});
export const money = (amount) => moneyFormat.format(Math.round(amount));

/** Texto con acento editorial: "Una pausa *a tu ritmo.*" → <em> en terracota. */
export function accent(text) {
  return text.split(/(\*[^*]+\*)/g).filter(Boolean).map((part) =>
    part.startsWith("*") ? h("em", { class: "accent" }, part.slice(1, -1)) : part,
  );
}

/** Imagen de producto responsiva (WebP 480/960). */
export function productImage(product, { sizes = "(max-width: 700px) 50vw, 25vw", eager = false, className = "" } = {}) {
  const base = `/img/products/${product.image}`;
  return h("img", {
    class: className,
    src: `${base}-480.webp`,
    srcset: `${base}-480.webp 480w, ${base}-960.webp 960w`,
    sizes,
    alt: "",
    width: 480,
    height: 560,
    loading: eager ? "eager" : "lazy",
    decoding: "async",
    fetchpriority: eager ? "high" : undefined,
  });
}

// Iconos de trazo 1.6 px en retícula de 24. Constantes de confianza.
const ICONS = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  bag: '<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 2.6 14.6 0 17M12 3.5c-2.6 2.4-2.6 14.6 0 17"/>',
  star: '<path d="m12 3.8 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8Z"/>',
  card: '<rect x="3.5" y="6" width="17" height="12" rx="2.5"/><path d="M3.5 10h17M7 14.5h3"/>',
  cash: '<rect x="3" y="6.5" width="18" height="11" rx="2"/><circle cx="12" cy="12" r="2.4"/><path d="M6.5 9.5v5M17.5 9.5v5"/>',
  qr: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2"/>',
  phone: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 17.5h2"/>',
  receipt: '<path d="M6 3.5h12v17l-3-2-3 2-3-2-3 2v-17Z"/><path d="M9 8h6M9 11.5h6M9 15h3"/>',
  here: '<path d="M4 11.5 12 5l8 6.5"/><path d="M6 10v9.5h12V10"/><path d="M10 19.5v-5h4v5"/>',
  togo: '<path d="M7 7h10l-1.2 13H8.2L7 7Z"/><path d="M6 7h12M9.5 4h5l.5 3h-6l.5-3Z"/>',
  cup: '<path d="M5 8h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V8Z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"/>',
  hot: '<path d="M8 4c-1 1.5 1 2.5 0 4M12 3c-1 1.5 1 2.5 0 4M16 4c-1 1.5 1 2.5 0 4"/><path d="M5 11h14l-1.5 9h-11L5 11Z"/>',
  cold: '<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/><path d="m9.5 4.5 2.5 2 2.5-2M9.5 19.5l2.5-2 2.5 2"/>',
  leaf: '<path d="M5 19c0-8 5-14 14-14 0 9-6 14-14 14Z"/><path d="M5 19 13 11"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
  kiosk: '<rect x="6" y="3" width="12" height="15" rx="2"/><path d="M9 21h6M12 18v3"/>',
  barista: '<path d="M6 9h10v5a5 5 0 0 1-10 0V9Z"/><path d="M16 11h1.5a2 2 0 0 1 0 4H16M8 3.5c0 1.5 1 1.5 1 3M12 3.5c0 1.5 1 1.5 1 3"/>',
  route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/>',
  reset: '<path d="M4.5 12a7.5 7.5 0 1 0 2.3-5.4"/><path d="M4.5 4.5v4h4"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
  trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>',
  sparkle: '<path d="M12 4v4M12 16v4M4 12h4M16 12h4M6.5 6.5l2.5 2.5M15 15l2.5 2.5M17.5 6.5 15 9M9 15l-2.5 2.5"/>',
  user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1-4 4-5.5 7-5.5s6 1.5 7 5.5"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16Z"/><path d="M10 20.5h4"/>',
  nfc: '<path d="M8.5 8.5a5 5 0 0 1 0 7M12 6a8.5 8.5 0 0 1 0 12M15.5 3.5a12 12 0 0 1 0 17"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
};

const iconTemplate = document.createElement("template");
export function icon(name, className = "icon") {
  iconTemplate.innerHTML = `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] ?? ""}</svg>`;
  return iconTemplate.content.firstElementChild;
}

/** Monograma de Koyo: la sílaba 고 (ㄱ = K, ㅗ = O) con el sol komorebi en terracota. */
export function logoMark(className = "logo-mark") {
  iconTemplate.innerHTML = `<svg class="${className}" viewBox="100 118 312 296" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="54" stroke-linecap="round" stroke-linejoin="round"><path d="M150 146 H350 Q362 146 362 158 V262"/><path d="M256 318 V368"/><path d="M128 386 H384"/></g><circle class="logo-sun" cx="226" cy="238" r="40"/></svg>`;
  return iconTemplate.content.firstElementChild;
}
