// Catálogo ficticio de la demo. Precios ilustrativos en MXN (IVA incluido).

export const CATEGORIES = Object.freeze([
  { id: "all", es: "Todo", en: "All", kr: "전체", image: "caramel" },
  { id: "coffee", es: "Café", en: "Coffee", kr: "커피", image: "americano" },
  { id: "matcha", es: "Matcha y té", en: "Matcha & tea", kr: "말차", image: "matcha" },
  { id: "frappe", es: "Frappés", en: "Frappés", kr: "프라페", image: "oreo" },
  { id: "bakery", es: "Panadería", en: "Bakery", kr: "빵", image: "croissant" },
]);

export const PRODUCTS = Object.freeze([
  {
    id: "caramel", category: "coffee", profile: "coffee", price: 76, image: "caramel",
    tag: "signature", temps: ["cold", "hot"], kr: "카라멜",
    es: { name: "Caramel macchiato", desc: "Espresso doble, leche cremosa y caramelo tostado en casa." },
    en: { name: "Caramel macchiato", desc: "Double espresso, creamy milk and house-toasted caramel." },
  },
  {
    id: "cacahuate", category: "coffee", profile: "coffee", price: 84, image: "cacahuate",
    tag: "new", temps: ["cold", "hot"], kr: "땅콩 라떼",
    es: { name: "Latte de cacahuate", desc: "Espresso, crema de cacahuate tostado y espuma sedosa." },
    en: { name: "Peanut latte", desc: "Espresso, roasted peanut cream and silky foam." },
  },
  {
    id: "americano", category: "coffee", profile: "coffee", price: 49, image: "americano",
    temps: ["hot", "cold"], kr: "아메리카노",
    es: { name: "Americano de la casa", desc: "Grano de Chiapas, perfil limpio con notas de cacao." },
    en: { name: "House americano", desc: "Chiapas beans, clean profile with cocoa notes." },
  },
  {
    id: "coldbrew", category: "coffee", profile: "coldbrew", price: 69, image: "coldbrew",
    temps: ["cold"], kr: "콜드브루",
    es: { name: "Cold brew 12 h", desc: "Extracción lenta en frío. Suave, dulce natural, sin acidez." },
    en: { name: "12 h cold brew", desc: "Slow cold extraction. Smooth, naturally sweet, low acidity." },
  },
  {
    id: "matcha", category: "matcha", profile: "matcha", price: 82, image: "matcha",
    tag: "popular", temps: ["cold", "hot"], kr: "말차 라떼",
    es: { name: "Matcha latte", desc: "Matcha ceremonial batido a mano con la leche que prefieras." },
    en: { name: "Matcha latte", desc: "Ceremonial matcha whisked by hand with your milk of choice." },
  },
  {
    id: "chai", category: "matcha", profile: "tea", price: 72, image: "chai",
    temps: ["hot", "cold"], kr: "차이",
    es: { name: "Chai especiado", desc: "Canela, cardamomo y jengibre en infusión lenta con leche." },
    en: { name: "Spiced chai", desc: "Cinnamon, cardamom and ginger slow-steeped with milk." },
  },
  {
    id: "oreo", category: "frappe", profile: "frappe", price: 89, image: "oreo",
    tag: "popular", temps: ["cold"], kr: "쿠키 프라페",
    es: { name: "Frappé cookies & cream", desc: "Café frío, galleta de cacao y crema batida ligera." },
    en: { name: "Cookies & cream frappé", desc: "Cold coffee, cocoa cookie and light whipped cream." },
  },
  {
    id: "croissant", category: "bakery", profile: "food", price: 58, image: "croissant",
    kr: "크루아상",
    es: { name: "Croissant de mantequilla", desc: "Hojaldre de 72 capas horneado cada mañana." },
    en: { name: "Butter croissant", desc: "72-layer laminated dough baked every morning." },
  },
  {
    id: "sandwich", category: "bakery", profile: "food", price: 108, image: "sandwich",
    kr: "샌드위치",
    es: { name: "Sándwich de la casa", desc: "Pan de masa madre, jamón serrano, queso y arúgula." },
    en: { name: "House sandwich", desc: "Sourdough, serrano ham, cheese and arugula." },
  },
  {
    id: "brownie", category: "bakery", profile: "food", price: 65, image: "brownie",
    tag: "signature", kr: "브라우니",
    es: { name: "Brownie de cacao", desc: "Cacao de Tabasco al 70 %, centro húmedo y sal de mar." },
    en: { name: "Cocoa brownie", desc: "70 % Tabasco cocoa, fudgy center and sea salt." },
  },
]);

export const productById = (id) => PRODUCTS.find((product) => product.id === id);

// Opciones por perfil — cada grupo: { id, type: single|multi|scale, options[] }
const SIZES = {
  id: "size", type: "single", options: [
    { id: "s", oz: 8, delta: -8, scale: 0.78 },
    { id: "m", oz: 12, delta: 0, scale: 0.9 },
    { id: "l", oz: 16, delta: 12, scale: 1 },
  ], default: "m",
};
const TEMP = { id: "temp", type: "single", options: [{ id: "hot" }, { id: "cold" }] };
const MILK = {
  id: "milk", type: "single", options: [
    { id: "whole", delta: 0 }, { id: "lactose", delta: 5 },
    { id: "oat", delta: 12 }, { id: "almond", delta: 12 },
  ], default: "whole",
};
const SWEET = { id: "sweet", type: "scale", options: [0, 25, 50, 75, 100].map((v) => ({ id: String(v) })), default: "50" };
const COFFEE_EXTRAS = {
  id: "extras", type: "multi", options: [
    { id: "shot", delta: 14 }, { id: "vanilla", delta: 9 }, { id: "cinnamon", delta: 0 },
  ],
};
const MATCHA_EXTRAS = {
  id: "extras", type: "multi", options: [
    { id: "ceremonial", delta: 18 }, { id: "honey", delta: 6 }, { id: "foam", delta: 10 },
  ],
};
const FOOD_PREP = {
  id: "warm", type: "single", options: [{ id: "warm" }, { id: "room" }], default: "warm",
};
const FOOD_EXTRAS = {
  id: "extras", type: "multi", options: [{ id: "butter", delta: 8 }, { id: "split", delta: 0 }],
};

export const PROFILES = Object.freeze({
  coffee: [SIZES, TEMP, MILK, SWEET, COFFEE_EXTRAS],
  coldbrew: [SIZES, SWEET, { ...COFFEE_EXTRAS, options: COFFEE_EXTRAS.options.slice(1) }],
  matcha: [SIZES, TEMP, MILK, SWEET, MATCHA_EXTRAS],
  tea: [SIZES, TEMP, MILK, SWEET],
  frappe: [SIZES, MILK, SWEET, { id: "extras", type: "multi", options: [{ id: "shot", delta: 14 }, { id: "cream", delta: 0 }] }],
  food: [FOOD_PREP, FOOD_EXTRAS],
});

export function optionGroups(product) {
  return PROFILES[product.profile].map((group) =>
    group.id === "temp" ? { ...group, options: group.options.filter((o) => product.temps?.includes(o.id)), default: product.temps?.[0] } : group,
  ).filter((group) => group.options.length > 1 || group.type === "multi");
}

export function defaultSelection(product) {
  const selection = {};
  for (const group of optionGroups(product)) {
    selection[group.id] = group.type === "multi" ? [] : group.default ?? group.options[0].id;
  }
  return selection;
}

export function unitPrice(product, selection) {
  let price = product.price;
  for (const group of optionGroups(product)) {
    const picked = group.type === "multi" ? selection[group.id] ?? [] : [selection[group.id]];
    for (const option of group.options) if (picked.includes(option.id)) price += option.delta ?? 0;
  }
  return Math.max(0, price);
}

// Club Koyo — identidad simulada del cliente demo
export const DEMO_MEMBER = Object.freeze({
  name: "Mariana",
  stars: 420,
  tier: "hoja",
  nextTier: 600,
  reward: { cost: 100, value: 25 },
});

export const STARS_PER_PESO = 1 / 10;

export const DEMO_NAMES = ["Sofía", "Diego", "Valeria", "Emilio", "Regina", "Mateo", "Ximena", "Andrés", "Camila", "Leo", "Renata", "Iker"];
