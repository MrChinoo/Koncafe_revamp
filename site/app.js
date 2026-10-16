// Demo autónoma: los pedidos existen únicamente en esta sesión del navegador.
const MENU = Object.freeze([
  {
    id: "caramel",
    name: "Caramel macchiato",
    category: "Café",
    price: 76,
    description: "Espresso doble, leche cremosa y caramelo suave.",
    image: "caramel.jpg",
    tag: "Favorito",
    kind: "drink",
    temperatures: ["Frío", "Caliente"],
  },
  {
    id: "matcha",
    name: "Matcha latte",
    category: "Matcha",
    price: 82,
    description: "Matcha de sabor intenso con leche a tu elección.",
    image: "matcha.jpg",
    tag: "Especialidad",
    kind: "drink",
    temperatures: ["Frío", "Caliente"],
  },
  {
    id: "oreo",
    name: "Frappé cookies & cream",
    category: "Frappés",
    price: 89,
    description: "Café frío, galleta de cacao y una textura irresistible.",
    image: "oreo.jpg",
    tag: "Más pedido",
    kind: "drink",
    temperatures: ["Frío"],
  },
  {
    id: "cacahuate",
    name: "Latte de cacahuate",
    category: "Café",
    price: 84,
    description: "Espresso, crema de cacahuate y espuma sedosa.",
    image: "cacahuate.jpg",
    tag: "Nuevo",
    kind: "drink",
    temperatures: ["Frío", "Caliente"],
  },
  {
    id: "americano",
    name: "Americano de la casa",
    category: "Café",
    price: 49,
    description: "Extracción aromática, equilibrada y sin complicaciones.",
    art: "☕",
    kind: "drink",
    temperatures: ["Caliente", "Frío"],
  },
  {
    id: "chai",
    name: "Chai especiado",
    category: "Té",
    price: 72,
    description: "Canela, cardamomo y notas cálidas en cada sorbo.",
    art: "✳",
    kind: "drink",
    temperatures: ["Caliente", "Frío"],
  },
  {
    id: "coldbrew",
    name: "Cold brew 12 h",
    category: "Café",
    price: 69,
    description: "Extracción lenta, perfil suave y final refrescante.",
    art: "◌",
    kind: "drink",
    temperatures: ["Frío"],
  },
  {
    id: "croissant",
    name: "Croissant de mantequilla",
    category: "Panadería",
    price: 58,
    description: "Hojaldre dorado con centro ligero y mantequilloso.",
    art: "🥐",
    kind: "food",
  },
  {
    id: "sandwich",
    name: "Sándwich de la casa",
    category: "Panadería",
    price: 108,
    description: "Pan artesanal, queso, vegetales frescos y aderezo.",
    art: "🥪",
    kind: "food",
  },
  {
    id: "brownie",
    name: "Brownie de chocolate",
    category: "Panadería",
    price: 65,
    description: "Cacao intenso y textura húmeda para acompañar tu café.",
    art: "▦",
    kind: "food",
  },
]);
const CATEGORIES = ["Todo", "Café", "Matcha", "Frappés", "Té", "Panadería"];
const SIZE_OPTIONS = [
  { label: "Regular", delta: 0 },
  { label: "Grande", delta: 14 },
];
const MILK_OPTIONS = [
  { label: "Entera", delta: 0 },
  { label: "Deslactosada", delta: 5 },
  { label: "Avena", delta: 10 },
];
const EXTRA_OPTIONS = [
  { label: "Shot extra", delta: 12 },
  { label: "Jarabe de vainilla", delta: 9 },
];
const STORAGE_KEY = "koncafe-kiosk-demo-v2";
const app = document.querySelector("#app");
const modalRoot = document.querySelector("#modal-root");
const announcer = document.querySelector("#announcer");
let focusBeforeModal = null;
const money = (amount) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
const productById = (id) => MENU.find((product) => product.id === id);

function node(tag, properties = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(properties)) {
    if (key === "class") element.className = value;
    else if (key === "onClick") element.addEventListener("click", value);
    else if (key === "onInput") element.addEventListener("input", value);
    else if (key === "onChange") element.addEventListener("change", value);
    else if (key === "disabled") element.disabled = Boolean(value);
    else if (key === "value") element.value = value;
    else if (value !== null && value !== undefined)
      element.setAttribute(key, String(value));
  }
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    element.append(
      child instanceof Node ? child : document.createTextNode(String(child)),
    );
  }
  return element;
}

function safeItem(raw) {
  if (!raw || typeof raw !== "object" || !productById(raw.productId))
    return null;
  const product = productById(raw.productId);
  const size = SIZE_OPTIONS.some((option) => option.label === raw.size)
    ? raw.size
    : "Regular";
  const milk =
    product.kind === "drink" &&
    MILK_OPTIONS.some((option) => option.label === raw.milk)
      ? raw.milk
      : "Entera";
  const temperature = product.temperatures?.includes(raw.temperature)
    ? raw.temperature
    : (product.temperatures?.[0] ?? "");
  const extra =
    product.kind === "drink" &&
    EXTRA_OPTIONS.some((option) => option.label === raw.extra)
      ? raw.extra
      : "";
  const quantity = Math.min(
    20,
    Math.max(1, Number.isInteger(raw.quantity) ? raw.quantity : 1),
  );
  return {
    productId: product.id,
    size: product.kind === "food" ? "Regular" : size,
    milk,
    temperature,
    extra,
    quantity,
  };
}

function sampleOrders() {
  return [
    {
      id: "sample-1",
      number: "D-102",
      createdAt: Date.now() - 480000,
      status: "preparing",
      service: "Para llevar",
      method: "Tarjeta de prueba",
      sample: true,
      items: [
        {
          productId: "matcha",
          size: "Regular",
          milk: "Avena",
          temperature: "Frío",
          extra: "",
          quantity: 1,
        },
      ],
    },
    {
      id: "sample-2",
      number: "D-103",
      createdAt: Date.now() - 180000,
      status: "pending",
      service: "Para consumir aquí",
      method: "Efectivo de prueba",
      sample: true,
      items: [
        {
          productId: "croissant",
          size: "Regular",
          milk: "Entera",
          temperature: "",
          extra: "",
          quantity: 2,
        },
      ],
    },
  ];
}

function loadSession() {
  try {
    const raw = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
    return {
      cart: Array.isArray(raw.cart)
        ? raw.cart.slice(0, 30).map(safeItem).filter(Boolean)
        : [],
      orders: Array.isArray(raw.orders)
        ? raw.orders
            .slice(0, 12)
            .filter(
              (order) =>
                order &&
                typeof order.id === "string" &&
                Array.isArray(order.items),
            )
            .map((order) => ({
              id: order.id.slice(0, 60),
              number:
                typeof order.number === "string"
                  ? order.number.slice(0, 12)
                  : "D-000",
              createdAt: Number.isFinite(order.createdAt)
                ? order.createdAt
                : Date.now(),
              status: ["pending", "preparing", "ready", "delivered"].includes(
                order.status,
              )
                ? order.status
                : "pending",
              service:
                order.service === "Para llevar"
                  ? "Para llevar"
                  : "Para consumir aquí",
              method:
                order.method === "Efectivo de prueba"
                  ? "Efectivo de prueba"
                  : "Tarjeta de prueba",
              sample: Boolean(order.sample),
              items: order.items.slice(0, 30).map(safeItem).filter(Boolean),
            }))
            .filter((order) => order.items.length)
        : sampleOrders(),
    };
  } catch {
    return { cart: [], orders: sampleOrders() };
  }
}

const session = loadSession();
const state = {
  page: "welcome",
  category: "Todo",
  query: "",
  cart: session.cart,
  orders: session.orders,
  service: "Para consumir aquí",
  method: "Tarjeta de prueba",
  lastOrderId: null,
  draft: null,
};
function save() {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ cart: state.cart, orders: state.orders }),
    );
  } catch {
    /* La demo sigue funcionando si el almacenamiento está bloqueado. */
  }
}
function announce(message) {
  announcer.textContent = message;
}
function go(page) {
  state.page = page;
  state.draft = null;
  modalRoot.replaceChildren();
  window.scrollTo({ top: 0, behavior: "auto" });
  render();
  app.focus({ preventScroll: true });
}
function quantity() {
  return state.cart.reduce((sum, item) => sum + item.quantity, 0);
}
function unitPrice(item) {
  const product = productById(item.productId);
  if (!product) return 0;
  return (
    product.price +
    (product.kind === "drink"
      ? (SIZE_OPTIONS.find((option) => option.label === item.size)?.delta ??
          0) +
        (MILK_OPTIONS.find((option) => option.label === item.milk)?.delta ??
          0) +
        (EXTRA_OPTIONS.find((option) => option.label === item.extra)?.delta ??
          0)
      : 0)
  );
}
function total(items) {
  return items.reduce((sum, item) => sum + unitPrice(item) * item.quantity, 0);
}
function itemKey(item) {
  return [
    item.productId,
    item.size,
    item.milk,
    item.temperature,
    item.extra,
  ].join("|");
}

function badge(text, extraClass = "") {
  return node("span", { class: `badge ${extraClass}` }, text);
}
function button(
  text,
  handler,
  className = "button button-dark",
  attributes = {},
) {
  return node(
    "button",
    { type: "button", class: className, onClick: handler, ...attributes },
    text,
  );
}
function brand() {
  return node(
    "button",
    {
      type: "button",
      class: "brand",
      onClick: () => go("welcome"),
      "aria-label": "KonCafe, ir al inicio",
    },
    node("span", { class: "brand-mark", "aria-hidden": "true" }, "K"),
    node(
      "span",
      { class: "brand-word" },
      "koncafe",
      node("small", {}, "slow coffee · smart service"),
    ),
  );
}
function renderHeader() {
  const header = document.querySelector("#site-header");
  const controls = node("nav", {
    class: "header-actions",
    "aria-label": "Navegación principal",
  });
  if (state.page !== "welcome")
    controls.append(
      button("Inicio", () => go("welcome"), "text-button desktop-only"),
    );
  controls.append(
    button("Vista barra", () => go("barista"), "text-button barista-link"),
  );
  controls.append(
    button(`Tu pedido  ${quantity()}`, () => go("cart"), "button cart-button", {
      "aria-label": `Ver pedido, ${quantity()} ${quantity() === 1 ? "producto" : "productos"}`,
    }),
  );
  header.replaceChildren(
    brand(),
    node(
      "div",
      { class: "header-middle" },
      badge("DEMO INTERACTIVA", "demo-badge"),
      node("span", {}, "Una experiencia de pedido sin filas"),
    ),
    controls,
  );
}

function renderWelcome() {
  const hero = node("section", { class: "hero" });
  const copy = node(
    "div",
    { class: "hero-copy" },
    node(
      "div",
      { class: "eyebrow" },
      node("span", { class: "eyebrow-line" }),
      "TU CAFÉ, A TU RITMO",
    ),
    node("h1", {}, "Una pausa que empieza ", node("em", {}, "contigo.")),
    node(
      "p",
      { class: "hero-lead" },
      "Descubre, personaliza y pide lo que se te antoja. Un kiosco pensado para hacer simple cada visita a tu cafetería.",
    ),
    node(
      "div",
      { class: "hero-actions" },
      button(
        "Comenzar pedido de prueba  ↗",
        () => go("menu"),
        "button button-dark button-large",
      ),
      button(
        "Ver cómo funciona",
        () =>
          document
            .querySelector("#how-it-works")
            ?.scrollIntoView({ behavior: "smooth" }),
        "button button-outline button-large",
      ),
    ),
    node(
      "p",
      { class: "helper-copy" },
      "Explora libremente. Los precios y pagos son simulados.",
    ),
  );
  const visual = node(
    "div",
    { class: "hero-visual" },
    node(
      "div",
      { class: "hero-photo-wrap" },
      node("img", {
        src: "/assets/caramel.jpg",
        alt: "Caramel macchiato KonCafe",
        class: "hero-photo",
        fetchpriority: "high",
      }),
    ),
    node(
      "div",
      { class: "hero-note hero-note-top" },
      node("span", { class: "tiny-label" }, "HECHO A TU GUSTO"),
      node("strong", {}, "Tu café. Tus reglas."),
      node("span", {}, "Tamaño, leche y extras."),
    ),
    node(
      "div",
      { class: "hero-note hero-note-bottom" },
      node("span", { class: "hero-note-icon", "aria-hidden": "true" }, "✳"),
      node(
        "span",
        {},
        node("strong", {}, "Listo en pocos pasos"),
        node("small", {}, "Pide y recoge en barra"),
      ),
    ),
    node(
      "div",
      { class: "hero-orbit", "aria-hidden": "true" },
      "GOOD COFFEE, GOOD DAY ·",
    ),
  );
  hero.append(copy, visual);
  const steps = node(
    "section",
    {
      id: "how-it-works",
      class: "steps-section",
      "aria-label": "Cómo funciona",
    },
    node(
      "div",
      { class: "section-heading" },
      node(
        "div",
        {},
        node("span", { class: "overline" }, "ASÍ DE FÁCIL"),
        node("h2", {}, "Del antojo a la barra."),
      ),
      node("p", {}, "Un recorrido intuitivo que puedes probar ahora mismo."),
    ),
    node(
      "div",
      { class: "steps-grid" },
      step(
        "01",
        "Explora el menú",
        "Filtra categorías o busca tu favorito entre bebidas y bocados.",
      ),
      step(
        "02",
        "Hazlo tuyo",
        "Ajusta tamaño, temperatura, leche y extras con el precio siempre a la vista.",
      ),
      step(
        "03",
        "Confirma y recoge",
        "Simula el pago, recibe tu número y mira cómo avanza en barra.",
      ),
    ),
  );
  const showcase = node(
    "section",
    { class: "showcase" },
    node(
      "div",
      {},
      node("span", { class: "overline" }, "HECHO PARA ANTOJARSE"),
      node("h2", {}, "Cada detalle cuenta."),
      node(
        "p",
        {},
        "Un menú claro, una compra ágil y una experiencia amable para volver por otro café.",
      ),
      button("Explorar el menú  →", () => go("menu"), "button button-light"),
    ),
    node(
      "div",
      { class: "showcase-image" },
      node("img", {
        src: "/assets/matcha.jpg",
        alt: "Matcha latte KonCafe",
        loading: "lazy",
      }),
    ),
  );
  app.replaceChildren(hero, steps, showcase);
}
function step(number, title, description) {
  return node(
    "article",
    { class: "step-card" },
    node("span", { class: "step-number" }, number),
    node(
      "div",
      { class: "step-icon", "aria-hidden": "true" },
      number === "01" ? "☰" : number === "02" ? "✳" : "✓",
    ),
    node("h3", {}, title),
    node("p", {}, description),
  );
}

function visual(product, className = "") {
  return product.image
    ? node(
        "div",
        { class: `product-visual ${className}` },
        node("img", {
          src: `/assets/${product.image}`,
          alt: product.name,
          loading: "lazy",
        }),
      )
    : node(
        "div",
        {
          class: `product-visual art art-${product.id} ${className}`,
          "aria-hidden": "true",
        },
        node("span", {}, product.art),
      );
}
function productCard(product) {
  return node(
    "article",
    { class: "product-card" },
    node(
      "button",
      {
        type: "button",
        class: "product-open",
        onClick: () => openProduct(product),
        "aria-label": `Personalizar ${product.name}`,
      },
      visual(product),
      product.tag ? badge(product.tag, "product-tag") : null,
    ),
    node(
      "div",
      { class: "product-content" },
      node("span", { class: "product-category" }, product.category),
      node("h3", {}, product.name),
      node("p", {}, product.description),
      node(
        "div",
        { class: "product-bottom" },
        node("strong", {}, money(product.price)),
        button("Agregar  +", () => openProduct(product), "button button-add", {
          "aria-label": `Agregar ${product.name} al pedido`,
        }),
      ),
    ),
  );
}
function renderMenu() {
  const heading = node(
    "div",
    { class: "menu-heading" },
    node(
      "div",
      {},
      node("span", { class: "overline" }, "EL MENÚ"),
      node("h1", {}, "Encuentra tu próximo favorito."),
      node(
        "p",
        {},
        "Bebidas y algo rico para acompañar. Personaliza cada elección a tu manera.",
      ),
    ),
    node(
      "div",
      { class: "menu-heading-stamp", "aria-hidden": "true" },
      "MADE WITH ☕",
    ),
  );
  const search = node("input", {
    type: "search",
    placeholder: "Buscar bebida o alimento",
    "aria-label": "Buscar en el menú",
    value: state.query,
    maxlength: "60",
  });
  const grid = node("div", { class: "products-grid" });
  const count = node("span", { class: "results-count" });
  function updateGrid() {
    const query = state.query.trim().toLocaleLowerCase("es-MX");
    const filtered = MENU.filter(
      (product) =>
        (state.category === "Todo" || state.category === product.category) &&
        `${product.name} ${product.description} ${product.category}`
          .toLocaleLowerCase("es-MX")
          .includes(query),
    );
    count.textContent = `${filtered.length} ${filtered.length === 1 ? "producto" : "productos"}`;
    grid.replaceChildren(
      ...(filtered.length
        ? filtered.map(productCard)
        : [
            node(
              "div",
              { class: "empty-state" },
              node("span", { "aria-hidden": "true" }, "⌕"),
              node("h2", {}, "No encontramos ese antojo"),
              node(
                "p",
                {},
                "Prueba con otra palabra o explora todas las categorías.",
              ),
              button(
                "Ver todo",
                () => {
                  state.category = "Todo";
                  state.query = "";
                  renderMenu();
                },
                "button button-outline",
              ),
            ),
          ]),
    );
  }
  search.addEventListener("input", (event) => {
    state.query = event.target.value;
    updateGrid();
  });
  const categories = node(
    "div",
    {
      class: "category-row",
      role: "group",
      "aria-label": "Categorías del menú",
    },
    ...CATEGORIES.map((category) =>
      button(
        category,
        () => {
          state.category = category;
          renderMenu();
        },
        `category-chip ${state.category === category ? "active" : ""}`,
        { "aria-pressed": state.category === category },
      ),
    ),
  );
  const toolbar = node(
    "div",
    { class: "menu-toolbar" },
    categories,
    node(
      "label",
      { class: "search-box" },
      node("span", { "aria-hidden": "true" }, "⌕"),
      search,
    ),
  );
  const menu = node(
    "section",
    { class: "menu-page page-container" },
    heading,
    toolbar,
    node(
      "div",
      { class: "results-bar" },
      count,
      node("span", {}, "Precios ilustrativos · MXN"),
    ),
    grid,
  );
  app.replaceChildren(menu);
  if (state.cart.length)
    app.append(
      node(
        "div",
        { class: "floating-cart" },
        node(
          "span",
          {},
          `${quantity()} ${quantity() === 1 ? "producto" : "productos"} · ${money(total(state.cart))}`,
        ),
        button("Ver pedido  →", () => go("cart"), "button button-light"),
      ),
    );
  updateGrid();
}

function openProduct(product) {
  focusBeforeModal = document.activeElement;
  state.draft = {
    productId: product.id,
    size: "Regular",
    milk: "Entera",
    temperature: product.temperatures?.[0] ?? "",
    extra: "",
    quantity: 1,
  };
  document.body.style.overflow = "hidden";
  document.querySelector(".app-shell").inert = true;
  renderModal();
}
function options(label, values, current, update) {
  return node(
    "fieldset",
    { class: "option-group" },
    node("legend", {}, label),
    node(
      "div",
      { class: "option-list" },
      ...values.map((option) => {
        const name = typeof option === "string" ? option : option.label;
        const delta = typeof option === "string" ? 0 : option.delta;
        const caption = `${name}${delta ? `  +${money(delta)}` : ""}`;
        return button(
          caption,
          () => {
            update(name);
            renderModal(caption);
          },
          `option ${current === name ? "selected" : ""}`,
          { "aria-pressed": current === name },
        );
      }),
    ),
  );
}
function renderModal(focusLabel = "") {
  const draft = state.draft;
  if (!draft) {
    modalRoot.replaceChildren();
    return;
  }
  const product = productById(draft.productId);
  if (!product) return;
  const modal = node("div", {
    class: "modal-backdrop",
    onClick: (event) => {
      if (event.target === modal) closeModal();
    },
  });
  const panel = node("section", {
    class: "product-modal",
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": "modal-title",
  });
  const fields = node("div", { class: "modal-fields" });
  if (product.kind === "drink") {
    fields.append(
      options("Tamaño", SIZE_OPTIONS, draft.size, (value) => {
        draft.size = value;
      }),
    );
    fields.append(
      options(
        "Temperatura",
        product.temperatures,
        draft.temperature,
        (value) => {
          draft.temperature = value;
        },
      ),
    );
    fields.append(
      options("Tipo de leche", MILK_OPTIONS, draft.milk, (value) => {
        draft.milk = value;
      }),
    );
    fields.append(
      options(
        "Un toque extra",
        [{ label: "Sin extras", delta: 0 }, ...EXTRA_OPTIONS],
        draft.extra || "Sin extras",
        (value) => {
          draft.extra = value === "Sin extras" ? "" : value;
        },
      ),
    );
  } else
    fields.append(
      node(
        "p",
        { class: "food-note" },
        "Recién preparado para acompañar tu bebida.",
      ),
    );
  const counter = node(
    "div",
    { class: "quantity-control", "aria-label": "Cantidad" },
    button(
      "−",
      () => {
        draft.quantity = Math.max(1, draft.quantity - 1);
        renderModal("Disminuir cantidad");
      },
      "counter-button",
      { "aria-label": "Disminuir cantidad", disabled: draft.quantity <= 1 },
    ),
    node("strong", {}, draft.quantity),
    button(
      "+",
      () => {
        draft.quantity = Math.min(20, draft.quantity + 1);
        renderModal("Aumentar cantidad");
      },
      "counter-button",
      { "aria-label": "Aumentar cantidad", disabled: draft.quantity >= 20 },
    ),
  );
  panel.append(
    node(
      "div",
      { class: "modal-image" },
      visual(product),
      badge("A TU GUSTO", "modal-image-badge"),
    ),
    node(
      "div",
      { class: "modal-body" },
      node(
        "div",
        { class: "modal-topline" },
        node("span", { class: "overline" }, product.category),
        button("×", closeModal, "close-button", {
          "aria-label": "Cerrar detalle",
        }),
      ),
      node("h2", { id: "modal-title" }, product.name),
      node("p", { class: "modal-description" }, product.description),
      fields,
      node(
        "div",
        { class: "modal-order-row" },
        counter,
        button(
          `Agregar · ${money(unitPrice(draft) * draft.quantity)}`,
          addDraft,
          "button button-dark modal-add",
        ),
      ),
    ),
  );
  modal.append(panel);
  modalRoot.replaceChildren(modal);
  const target = [...panel.querySelectorAll("button")].find(
    (element) =>
      element.textContent.trim() === focusLabel ||
      element.getAttribute("aria-label") === focusLabel,
  );
  (target || panel.querySelector(".close-button")).focus();
}
function closeModal() {
  state.draft = null;
  modalRoot.replaceChildren();
  document.body.style.overflow = "";
  document.querySelector(".app-shell").inert = false;
  if (focusBeforeModal?.isConnected) focusBeforeModal.focus();
  focusBeforeModal = null;
}
function addDraft() {
  const draft = state.draft;
  if (!draft) return;
  const existing = state.cart.find((item) => itemKey(item) === itemKey(draft));
  if (existing)
    existing.quantity = Math.min(20, existing.quantity + draft.quantity);
  else state.cart.push({ ...draft });
  save();
  closeModal();
  render();
  announce(`${productById(draft.productId).name} agregado al pedido`);
}

function itemSummary(item) {
  return productById(item.productId)?.kind === "food"
    ? ""
    : [item.size, item.temperature, item.milk, item.extra]
        .filter(Boolean)
        .join(" · ");
}
function orderLine(item, index, editable = false) {
  const product = productById(item.productId);
  if (!product) return null;
  return node(
    "div",
    { class: "order-line" },
    visual(product, "line-visual"),
    node(
      "div",
      { class: "order-line-info" },
      node("strong", {}, product.name),
      node("span", {}, itemSummary(item)),
      editable
        ? node(
            "div",
            { class: "line-controls" },
            button("−", () => changeQuantity(index, -1), "tiny-control", {
              "aria-label": `Quitar una unidad de ${product.name}`,
            }),
            node("span", {}, item.quantity),
            button("+", () => changeQuantity(index, 1), "tiny-control", {
              "aria-label": `Agregar una unidad de ${product.name}`,
            }),
            button("Eliminar", () => removeItem(index), "remove-button"),
          )
        : node("span", {}, `Cantidad: ${item.quantity}`),
    ),
    node(
      "strong",
      { class: "line-price" },
      money(unitPrice(item) * item.quantity),
    ),
  );
}
function changeQuantity(index, delta) {
  const item = state.cart[index];
  if (!item) return;
  item.quantity = Math.max(1, Math.min(20, item.quantity + delta));
  save();
  render();
}
function removeItem(index) {
  state.cart.splice(index, 1);
  save();
  render();
  announce("Producto eliminado del pedido");
}
function receiptSummary(items, action) {
  return node(
    "div",
    { class: "summary-box" },
    node(
      "div",
      {},
      node("span", {}, "Subtotal"),
      node("strong", {}, money(total(items))),
    ),
    node(
      "div",
      {},
      node("span", {}, "Descuentos"),
      node("strong", {}, money(0)),
    ),
    node(
      "div",
      { class: "summary-total" },
      node("span", {}, "Total"),
      node("strong", {}, money(total(items))),
    ),
    action,
  );
}
function renderCart() {
  const section = node(
    "section",
    { class: "cart-page page-container" },
    button("← Seguir explorando", () => go("menu"), "back-link"),
    node("span", { class: "overline" }, "TU PEDIDO"),
    node("h1", {}, "Todo listo para disfrutar."),
  );
  if (!state.cart.length) {
    section.append(
      node(
        "div",
        { class: "empty-cart" },
        node("span", { class: "empty-icon", "aria-hidden": "true" }, "☕"),
        node("h2", {}, "Tu pedido empieza con algo rico."),
        node("p", {}, "Explora el menú y agrega lo que más se te antoje."),
        button("Ver menú  →", () => go("menu")),
      ),
    );
    app.replaceChildren(section);
    return;
  }
  section.append(
    node(
      "p",
      { class: "page-intro" },
      `${quantity()} ${quantity() === 1 ? "producto" : "productos"} en tu carrito. Puedes ajustar cantidades antes de continuar.`,
    ),
  );
  const lines = node(
    "div",
    { class: "cart-lines" },
    ...state.cart.map((item, index) => orderLine(item, index, true)),
  );
  const side = node(
    "aside",
    { class: "cart-aside" },
    node("h2", {}, "Resumen"),
    receiptSummary(
      state.cart,
      button(
        "Continuar al pago de prueba  →",
        () => go("checkout"),
        "button button-dark button-full",
      ),
    ),
    node(
      "p",
      { class: "aside-note" },
      "Este pedido es una simulación. No se procesará ningún cobro.",
    ),
  );
  section.append(node("div", { class: "cart-layout" }, lines, side));
  app.replaceChildren(section);
}

function renderCheckout() {
  if (!state.cart.length) return go("cart");
  const section = node(
    "section",
    { class: "checkout-page page-container" },
    button("← Volver al pedido", () => go("cart"), "back-link"),
    node("span", { class: "overline" }, "ÚLTIMO PASO"),
    node("h1", {}, "¿Cómo lo prefieres?"),
    node(
      "p",
      { class: "page-intro" },
      "Selecciona cómo recogerías tu pedido y prueba el cierre de compra.",
    ),
  );
  const service = node(
    "div",
    { class: "choice-list" },
    ...["Para consumir aquí", "Para llevar"].map((value) =>
      button(
        node("span", {}, value === "Para llevar" ? "↗" : "⌂", "  ", value),
        () => {
          state.service = value;
          render();
        },
        `choice ${state.service === value ? "selected" : ""}`,
        { "aria-pressed": state.service === value },
      ),
    ),
  );
  const method = node(
    "div",
    { class: "choice-list" },
    ...["Tarjeta de prueba", "Efectivo de prueba"].map((value) =>
      button(
        node(
          "span",
          {},
          value === "Tarjeta de prueba" ? "▣" : "◉",
          "  ",
          value,
        ),
        () => {
          state.method = value;
          render();
        },
        `choice ${state.method === value ? "selected" : ""}`,
        { "aria-pressed": state.method === value },
      ),
    ),
  );
  const form = node(
    "div",
    { class: "checkout-form" },
    node(
      "div",
      { class: "checkout-block" },
      node("span", { class: "block-number" }, "01"),
      node("div", {}, node("h2", {}, "Tu pedido es…"), service),
    ),
    node(
      "div",
      { class: "checkout-block" },
      node("span", { class: "block-number" }, "02"),
      node(
        "div",
        {},
        node("h2", {}, "Forma de pago simulada"),
        method,
        node(
          "p",
          { class: "choice-help" },
          "No solicitamos datos de tarjeta ni realizamos transacciones.",
        ),
      ),
    ),
  );
  const side = node(
    "aside",
    { class: "cart-aside" },
    node("h2", {}, "Tu selección"),
    node(
      "div",
      { class: "checkout-items" },
      ...state.cart.map((item) =>
        node(
          "div",
          {},
          node(
            "span",
            {},
            `${item.quantity} × ${productById(item.productId).name}`,
          ),
          node("strong", {}, money(unitPrice(item) * item.quantity)),
        ),
      ),
    ),
    receiptSummary(
      state.cart,
      button(
        "Confirmar pedido de prueba  →",
        placeOrder,
        "button button-dark button-full",
      ),
    ),
    node(
      "p",
      { class: "aside-note" },
      "Ticket de demostración. No se envía a la cafetería.",
    ),
  );
  section.append(node("div", { class: "cart-layout" }, form, side));
  app.replaceChildren(section);
}
function placeOrder() {
  if (!state.cart.length) return;
  let number;
  const existingNumbers = new Set(state.orders.map((order) => order.number));
  do {
    const random = new Uint16Array(1);
    crypto.getRandomValues(random);
    number = `D-${String(1000 + (random[0] % 9000))}`;
  } while (existingNumbers.has(number));
  const order = {
    id: crypto.randomUUID(),
    number,
    createdAt: Date.now(),
    status: "pending",
    service: state.service,
    method: state.method,
    sample: false,
    items: state.cart.map((item) => ({ ...item })),
  };
  state.orders.unshift(order);
  state.orders = state.orders.slice(0, 12);
  state.lastOrderId = order.id;
  state.cart = [];
  save();
  go("confirmed");
  announce(`Pedido de prueba ${order.number} confirmado`);
}
function renderConfirmed() {
  const order = state.orders.find((item) => item.id === state.lastOrderId);
  if (!order) return go("welcome");
  const page = node(
    "section",
    { class: "confirmed-page page-container" },
    node("div", { class: "confirmation-mark", "aria-hidden": "true" }, "✓"),
    node("span", { class: "overline" }, "PEDIDO DE PRUEBA CONFIRMADO"),
    node("h1", {}, "¡Nos vemos en barra!"),
    node("p", {}, "Así se vería la confirmación al terminar un pedido."),
    node(
      "div",
      { class: "ticket" },
      node(
        "div",
        { class: "ticket-head" },
        node("span", {}, "KONCAFE / DEMO"),
        node("span", {}, "SIN VALIDEZ DE COMPRA"),
      ),
      node("span", { class: "ticket-label" }, "TU NÚMERO"),
      node("strong", { class: "ticket-number" }, order.number),
      node("div", { class: "ticket-divider" }),
      node(
        "div",
        { class: "ticket-row" },
        node("span", {}, "Servicio"),
        node("strong", {}, order.service),
      ),
      node(
        "div",
        { class: "ticket-row" },
        node("span", {}, "Método"),
        node("strong", {}, order.method),
      ),
      node(
        "div",
        { class: "ticket-row" },
        node("span", {}, "Total ilustrativo"),
        node("strong", {}, money(total(order.items))),
      ),
      node("div", { class: "ticket-divider" }),
      node(
        "p",
        {},
        "Puedes seguir este pedido en la vista de barra de esta sesión.",
      ),
    ),
    node(
      "div",
      { class: "confirm-actions" },
      button("Ver pedido en barra  →", () => go("barista")),
      button("Iniciar otro pedido", () => go("menu"), "button button-outline"),
      button(
        "Imprimir ticket",
        () => window.print(),
        "text-button print-button",
      ),
    ),
  );
  app.replaceChildren(page);
}

const STATUS = {
  pending: "Recibido",
  preparing: "En preparación",
  ready: "Listo para recoger",
  delivered: "Entregado",
};
const NEXT = { pending: "preparing", preparing: "ready", ready: "delivered" };
function renderBarista() {
  const active = state.orders.filter((order) => order.status !== "delivered");
  const done = state.orders.filter((order) => order.status === "delivered");
  const section = node(
    "section",
    { class: "barista-page page-container" },
    button("← Volver al menú", () => go("menu"), "back-link"),
    node(
      "div",
      { class: "barista-heading" },
      node(
        "div",
        {},
        node("span", { class: "overline" }, "VISTA DE OPERACIÓN · DEMO"),
        node("h1", {}, "Pedidos en barra."),
        node(
          "p",
          { class: "page-intro" },
          "Avanza los pedidos para probar cómo se mueve la cola. Sólo visible en este navegador.",
        ),
      ),
      badge(`${active.length} activos`, "active-count"),
    ),
    node(
      "div",
      { class: "barista-metrics" },
      metric(
        "Por preparar",
        state.orders.filter((order) => order.status === "pending").length,
      ),
      metric(
        "En preparación",
        state.orders.filter((order) => order.status === "preparing").length,
      ),
      metric(
        "Listos",
        state.orders.filter((order) => order.status === "ready").length,
      ),
    ),
  );
  const cards = node("div", { class: "queue-grid" });
  if (!active.length)
    cards.append(
      node(
        "div",
        { class: "empty-state" },
        node("h2", {}, "La barra está al día."),
        node("p", {}, "Crea un pedido nuevo para verlo aquí."),
        button("Hacer un pedido  →", () => go("menu")),
      ),
    );
  else
    cards.append(
      ...active.map((order) =>
        node(
          "article",
          { class: "queue-card" },
          node(
            "div",
            { class: "queue-top" },
            node("strong", {}, order.number),
            badge(STATUS[order.status], `status-${order.status}`),
          ),
          node(
            "span",
            { class: "queue-time" },
            `${order.sample ? "Ejemplo · " : ""}${new Date(order.createdAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })} · ${order.service}`,
          ),
          node(
            "div",
            { class: "queue-items" },
            ...order.items.map((item) =>
              node(
                "div",
                {},
                node(
                  "strong",
                  {},
                  `${item.quantity} × ${productById(item.productId)?.name ?? "Producto"}`,
                ),
                node("small", {}, itemSummary(item)),
              ),
            ),
          ),
          node(
            "div",
            { class: "queue-bottom" },
            node("strong", {}, money(total(order.items))),
            button(
              order.status === "pending"
                ? "Iniciar preparación  →"
                : order.status === "preparing"
                  ? "Marcar listo  →"
                  : "Marcar entregado  ✓",
              () => advance(order.id),
              "button button-dark",
            ),
          ),
        ),
      ),
    );
  section.append(cards);
  if (done.length)
    section.append(
      node(
        "div",
        { class: "done-strip" },
        node(
          "strong",
          {},
          `${done.length} entregado${done.length === 1 ? "" : "s"} en esta sesión`,
        ),
        node("span", {}, done.map((order) => order.number).join(" · ")),
      ),
    );
  section.append(
    node(
      "div",
      { class: "reset-row" },
      node("p", {}, "Esta cola es local y contiene pedidos de ejemplo."),
      button("Reiniciar demo", resetDemo, "text-button"),
    ),
  );
  app.replaceChildren(section);
}
function metric(label, value) {
  return node(
    "div",
    { class: "metric" },
    node("strong", {}, value),
    node("span", {}, label),
  );
}
function advance(id) {
  const order = state.orders.find((item) => item.id === id);
  if (!order || !NEXT[order.status]) return;
  order.status = NEXT[order.status];
  save();
  render();
  announce(`Pedido ${order.number}: ${STATUS[order.status]}`);
}
function resetDemo() {
  state.cart = [];
  state.orders = sampleOrders();
  state.lastOrderId = null;
  save();
  render();
  announce("Demo reiniciada");
}
function render() {
  renderHeader();
  if (state.page === "menu") renderMenu();
  else if (state.page === "cart") renderCart();
  else if (state.page === "checkout") renderCheckout();
  else if (state.page === "confirmed") renderConfirmed();
  else if (state.page === "barista") renderBarista();
  else renderWelcome();
}
document.addEventListener("keydown", (event) => {
  if (!state.draft) return;
  if (event.key === "Escape") {
    closeModal();
    return;
  }
  if (event.key !== "Tab") return;
  const buttons = [...modalRoot.querySelectorAll("button:not(:disabled)")];
  if (!buttons.length) return;
  const first = buttons[0];
  const last = buttons[buttons.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
save();
render();
