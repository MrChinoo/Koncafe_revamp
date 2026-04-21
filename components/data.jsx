// Menu catalog + i18n strings

const T = {
  es: {
    tap_to_start: 'Toca para comenzar',
    slow_coffee: 'Slow coffee · fast service',
    categories: {
      espresso: 'Calientes',
      filter: 'Sin Azúcar',
      matcha: 'Matcha',
      cold: 'Frías & Frappe',
      smoothie: 'Smoothies',
      toast: 'Alimentos',
      pastry: 'Pastelería',
      cake: 'Postres',
    },
    size: 'Tamaño',
    milk: 'Leche',
    sweetness: 'Dulzor',
    shots: 'Shots',
    extras: 'Extras',
    temperature: 'Temperatura',
    hot: 'Caliente',
    iced: 'Frío',
    add_to_order: 'Añadir al pedido',
    order: 'Pedido',
    cart: 'Tu pedido',
    empty_cart: 'Tu pedido está vacío',
    continue: 'Continuar',
    checkout: 'Pagar',
    subtotal: 'Subtotal',
    discount: 'Descuento',
    points: 'Puntos',
    total: 'Total',
    loyalty: 'Koncaffe Club',
    loyalty_prompt: '¿Eres miembro?',
    loyalty_sub: 'Identifícate con tu número o código QR para acumular puntos',
    scan_qr: 'Escanear código',
    enter_phone: 'Número de teléfono',
    skip: 'Continuar sin cuenta',
    payment: 'Método de pago',
    card: 'Tarjeta',
    cash: 'Efectivo',
    invoice: 'Factura',
    need_invoice: '¿Necesitas factura?',
    rfc: 'RFC',
    email: 'Correo',
    business: 'Razón social',
    insert_card: 'Inserta o acerca tu tarjeta',
    processing: 'Procesando',
    order_number: 'Número de orden',
    thank_you: 'Gracias',
    pickup: 'Recoge en barra cuando llamen tu número',
    est: 'Tiempo estimado',
    mins: 'min',
    new_order: 'Nueva orden',
    points_earned: 'puntos ganados',
    for_here: 'Para aquí',
    to_go: 'Para llevar',
    custom: 'Personaliza',
    back: 'Volver',
    remove: 'Quitar',
    edit: 'Editar',
    apply: 'Aplicar',
    promo: 'Código promocional',
    redeem_points: 'Canjear puntos',
    available: 'Disponibles',
    hello: 'Hola',
    popular: 'Más pedidos',
    new: 'Nuevo',
    recommended: 'Recomendado',
  },
  en: {
    tap_to_start: 'Tap to begin',
    slow_coffee: 'Slow coffee · fast service',
    categories: {
      espresso: 'Hot drinks',
      filter: 'Sugar-free',
      matcha: 'Matcha',
      cold: 'Cold & Frappe',
      smoothie: 'Smoothies',
      toast: 'Food',
      pastry: 'Pastry',
      cake: 'Desserts',
    },
    size: 'Size',
    milk: 'Milk',
    sweetness: 'Sweetness',
    shots: 'Shots',
    extras: 'Extras',
    temperature: 'Temperature',
    hot: 'Hot',
    iced: 'Iced',
    add_to_order: 'Add to order',
    order: 'Order',
    cart: 'Your order',
    empty_cart: 'Your order is empty',
    continue: 'Continue',
    checkout: 'Checkout',
    subtotal: 'Subtotal',
    discount: 'Discount',
    points: 'Points',
    total: 'Total',
    loyalty: 'Koncaffe Club',
    loyalty_prompt: 'Are you a member?',
    loyalty_sub: 'Sign in with your phone or QR to earn points',
    scan_qr: 'Scan QR code',
    enter_phone: 'Phone number',
    skip: 'Continue without account',
    payment: 'Payment method',
    card: 'Card',
    cash: 'Cash',
    invoice: 'Invoice',
    need_invoice: 'Need an invoice?',
    rfc: 'Tax ID',
    email: 'Email',
    business: 'Business name',
    insert_card: 'Insert or tap your card',
    processing: 'Processing',
    order_number: 'Order number',
    thank_you: 'Thank you',
    pickup: 'Pick up at the counter when called',
    est: 'Estimated time',
    mins: 'min',
    new_order: 'New order',
    points_earned: 'points earned',
    for_here: 'For here',
    to_go: 'To go',
    custom: 'Customize',
    back: 'Back',
    remove: 'Remove',
    edit: 'Edit',
    apply: 'Apply',
    promo: 'Promo code',
    redeem_points: 'Redeem points',
    available: 'Available',
    hello: 'Hello',
    popular: 'Most ordered',
    new: 'New',
    recommended: 'Recommended',
  }
};

const MENU = [
  // ESPRESSO
  { id:'e1', cat:'espresso', art:'espresso', name_es:'Espresso',            name_en:'Espresso',             kr:'에스프레소', price:45,  desc_es:'Doble extracción, 18g',         desc_en:'Double extraction, 18g',      tag:'popular', tempOpts:['hot'] },
  { id:'e2', cat:'espresso', art:'latte',    name_es:'Latte',               name_en:'Latte',                kr:'라떼',       price:68,  desc_es:'Leche vaporizada sedosa',       desc_en:'Silky steamed milk',           tag:'popular', tempOpts:['hot','iced'] },
  { id:'e3', cat:'espresso', art:'latte',    name_es:'Flat White',          name_en:'Flat White',           kr:'플랫화이트', price:70,  desc_es:'Doble ristretto, microespuma',  desc_en:'Double ristretto, microfoam',  tempOpts:['hot'] },
  { id:'e4', cat:'espresso', art:'espresso', name_es:'Cortado',             name_en:'Cortado',              kr:'코르타도',   price:55,  desc_es:'Equilibrio 1:1',                desc_en:'1:1 balance',                 tempOpts:['hot'] },
  { id:'e5', cat:'espresso', art:'latte',    name_es:'Cappuccino',          name_en:'Cappuccino',           kr:'카푸치노',   price:65,  desc_es:'Espuma densa, notas cacao',     desc_en:'Dense foam, cocoa notes',     tempOpts:['hot'] },
  { id:'e6', cat:'espresso', art:'latte',    name_es:'Mocha',               name_en:'Mocha',                kr:'모카',       price:78,  desc_es:'Espresso, chocolate 70%',       desc_en:'Espresso, 70% chocolate',     tempOpts:['hot','iced'] },

  // FILTER
  { id:'f1', cat:'filter',   art:'filter',   name_es:'V60 Etiopía',         name_en:'V60 Ethiopia',         kr:'V60 에티오피아', price:78, desc_es:'Floral · notas cítricas',    desc_en:'Floral · citrus notes',        tag:'recommended', tempOpts:['hot'] },
  { id:'f2', cat:'filter',   art:'filter',   name_es:'Chemex Colombia',     name_en:'Chemex Colombia',      kr:'케멕스 콜롬비아', price:72, desc_es:'Cuerpo medio · chocolate',    desc_en:'Medium body · chocolate',     tempOpts:['hot'] },
  { id:'f3', cat:'filter',   art:'filter',   name_es:'Aeropress Kenya',     name_en:'Aeropress Kenya',      kr:'에어로프레스 케냐', price:75, desc_es:'Intenso · frutos rojos',     desc_en:'Intense · red berries',       tempOpts:['hot'] },
  { id:'f4', cat:'filter',   art:'filter',   name_es:'Americano',           name_en:'Americano',            kr:'아메리카노', price:50,  desc_es:'Espresso largo',                desc_en:'Long espresso',                tempOpts:['hot','iced'] },

  // MATCHA & TEA
  { id:'m1', cat:'matcha',   art:'matcha',   name_es:'Matcha Latte',        name_en:'Matcha Latte',         kr:'말차 라떼',  price:85,  desc_es:'Ceremonial grade · Uji',        desc_en:'Ceremonial grade · Uji',       tag:'new', tempOpts:['hot','iced'] },
  { id:'m2', cat:'matcha',   art:'matcha',   name_es:'Hojicha Latte',       name_en:'Hojicha Latte',        kr:'호지차 라떼', price:82,  desc_es:'Té tostado, ahumado suave',     desc_en:'Roasted tea, soft smoke',      tempOpts:['hot','iced'] },
  { id:'m3', cat:'matcha',   art:'matcha',   name_es:'Matcha Yuzu',         name_en:'Matcha Yuzu',          kr:'말차 유자',  price:92,  desc_es:'Yuzu, miel de acacia',          desc_en:'Yuzu, acacia honey',           tag:'new', tempOpts:['iced'] },
  { id:'m4', cat:'matcha',   art:'matcha',   name_es:'Genmaicha',           name_en:'Genmaicha',            kr:'현미차',     price:55,  desc_es:'Té verde con arroz tostado',    desc_en:'Green tea, roasted rice',      tempOpts:['hot'] },

  // COLD
  { id:'c1', cat:'cold',     art:'cold',     name_es:'Cold Brew 12h',       name_en:'12h Cold Brew',        kr:'콜드 브루',  price:72,  desc_es:'Extracción lenta, suave',       desc_en:'Slow extraction, smooth',      tag:'popular', tempOpts:['iced'] },
  { id:'c2', cat:'cold',     art:'cold',     name_es:'Nitro Cold Brew',     name_en:'Nitro Cold Brew',      kr:'니트로',     price:88,  desc_es:'Cremoso como stout',            desc_en:'Creamy like stout',            tempOpts:['iced'] },
  { id:'c3', cat:'cold',     art:'cold',     name_es:'Espresso Tónica',     name_en:'Espresso Tonic',       kr:'에스프레소 토닉', price:80, desc_es:'Cítrico, efervescente',        desc_en:'Citrus, effervescent',         tempOpts:['iced'] },
  { id:'c4', cat:'cold',     art:'cold',     name_es:'Affogato',            name_en:'Affogato',             kr:'아포가토',   price:85,  desc_es:'Helado vainilla + espresso',    desc_en:'Vanilla gelato + espresso',    tempOpts:['iced'] },

  // SMOOTHIE
  { id:'s1', cat:'smoothie', art:'smoothie', name_es:'Mango Yogurt',        name_en:'Mango Yogurt',         kr:'망고 요거트', price:78,  desc_es:'Mango, yogurt griego, miel',    desc_en:'Mango, greek yogurt, honey',   tempOpts:['iced'] },
  { id:'s2', cat:'smoothie', art:'smoothie', name_es:'Green Detox',         name_en:'Green Detox',          kr:'그린 디톡스', price:82,  desc_es:'Espinaca, manzana, jengibre',   desc_en:'Spinach, apple, ginger',       tempOpts:['iced'] },
  { id:'s3', cat:'smoothie', art:'smoothie', name_es:'Berry Açaí',          name_en:'Berry Açaí',           kr:'베리 아사이', price:88,  desc_es:'Açaí, frutos rojos, plátano',   desc_en:'Açaí, berries, banana',        tempOpts:['iced'] },

  // TOAST
  { id:'t1', cat:'toast',    art:'toast',    name_es:'Toast de Aguacate',   name_en:'Avocado Toast',        kr:'아보카도 토스트', price:95, desc_es:'Sourdough · sésamo · lima',   desc_en:'Sourdough · sesame · lime',    tag:'popular', noCustom:false },
  { id:'t2', cat:'toast',    art:'toast',    name_es:'Tamago Sando',        name_en:'Tamago Sando',         kr:'타마고 산도', price:92,  desc_es:'Milk bread · huevo cremoso',    desc_en:'Milk bread · creamy egg',     },
  { id:'t3', cat:'toast',    art:'toast',    name_es:'Salmón & Yuzu',       name_en:'Salmon & Yuzu',        kr:'연어 유자', price:128, desc_es:'Queso crema, ikura, yuzu',      desc_en:'Cream cheese, ikura, yuzu',   tag:'recommended' },
  { id:'t4', cat:'toast',    art:'toast',    name_es:'Honey Butter',        name_en:'Honey Butter',         kr:'허니 버터', price:68,  desc_es:'Pan de miel, mantequilla',      desc_en:'Honey bread, butter',         },

  // PASTRY
  { id:'p1', cat:'pastry',   art:'pastry',   name_es:'Croissant mantequilla', name_en:'Butter Croissant',  kr:'크루아상', price:55,  desc_es:'Hojaldre 72h',                 desc_en:'72h laminated dough',         tag:'popular' },
  { id:'p2', cat:'pastry',   art:'pastry',   name_es:'Pan au chocolat',     name_en:'Pain au chocolat',    kr:'쇼콜라',   price:62,  desc_es:'Chocolate 70%',                desc_en:'70% chocolate',              },
  { id:'p3', cat:'pastry',   art:'pastry',   name_es:'Scone matcha',        name_en:'Matcha Scone',         kr:'말차 스콘', price:58,  desc_es:'Matcha, chocolate blanco',     desc_en:'Matcha, white chocolate',    tag:'new' },
  { id:'p4', cat:'pastry',   art:'pastry',   name_es:'Canelé',              name_en:'Canelé',               kr:'카늘레',   price:52,  desc_es:'Vainilla · ron añejo',         desc_en:'Vanilla · aged rum',          },

  // CAKE
  { id:'k1', cat:'cake',     art:'cake',     name_es:'Tarta basca de queso', name_en:'Basque Cheesecake',  kr:'바스크 치즈케이크', price:95, desc_es:'Caramelizada en horno leña', desc_en:'Wood-fired caramelized',       tag:'popular' },
  { id:'k2', cat:'cake',     art:'cake',     name_es:'Tiramisú de hojicha', name_en:'Hojicha Tiramisu',     kr:'호지차 티라미수', price:98, desc_es:'Mascarpone, hojicha',         desc_en:'Mascarpone, hojicha',          tag:'new' },
  { id:'k3', cat:'cake',     art:'cake',     name_es:'Pastel de zanahoria', name_en:'Carrot Cake',          kr:'캐럿 케이크', price:85, desc_es:'Queso crema, nuez',           desc_en:'Cream cheese, walnut',         },
];

// Customization schemas by category
const CUSTOM = {
  espresso: {
    size:       { label_es:'Tamaño',      label_en:'Size',     options:[{k:'S', sub:'240ml', d:-5}, {k:'M', sub:'360ml', d:0, def:true}, {k:'L', sub:'480ml', d:+10}] },
    temperature:{ label_es:'Temperatura', label_en:'Temperature', options:[{k:'hot', label_es:'Caliente', label_en:'Hot', def:true}, {k:'iced', label_es:'Frío', label_en:'Iced'}] },
    milk:       { label_es:'Leche',       label_en:'Milk',     options:[{k:'whole', label_es:'Entera', label_en:'Whole', def:true}, {k:'oat', label_es:'Avena', label_en:'Oat', d:+8}, {k:'almond', label_es:'Almendra', label_en:'Almond', d:+8}, {k:'soy', label_es:'Soya', label_en:'Soy', d:+6}, {k:'lactose', label_es:'Deslactosada', label_en:'Lactose-free', d:+4}] },
    sweetness:  { label_es:'Dulzor',      label_en:'Sweetness', options:[{k:'0', label_es:'Sin', label_en:'None'}, {k:'25', label_es:'25%', label_en:'25%'}, {k:'50', label_es:'50%', label_en:'50%', def:true}, {k:'75', label_es:'75%', label_en:'75%'}, {k:'100', label_es:'100%', label_en:'100%'}] },
    shots:      { label_es:'Shots',       label_en:'Shots',    stepper:true, min:1, max:4, def:2, perUnit:10 },
    extras:     { label_es:'Extras',      label_en:'Extras',   multi:true, options:[{k:'vanilla', label_es:'Vainilla', label_en:'Vanilla', d:+8}, {k:'caramel', label_es:'Caramelo', label_en:'Caramel', d:+8}, {k:'hazelnut', label_es:'Avellana', label_en:'Hazelnut', d:+8}, {k:'cinnamon', label_es:'Canela', label_en:'Cinnamon', d:+4}] },
  },
  filter: {
    size:      { label_es:'Tamaño', label_en:'Size', options:[{k:'S', sub:'240ml', d:-5},{k:'M', sub:'360ml', d:0, def:true},{k:'L', sub:'480ml', d:+10}] },
    temperature:{ label_es:'Temperatura', label_en:'Temperature', options:[{k:'hot', label_es:'Caliente', label_en:'Hot', def:true}, {k:'iced', label_es:'Frío', label_en:'Iced'}] },
  },
  matcha: {
    size:      { label_es:'Tamaño', label_en:'Size', options:[{k:'S', sub:'240ml', d:-5},{k:'M', sub:'360ml', d:0, def:true},{k:'L', sub:'480ml', d:+10}] },
    temperature:{ label_es:'Temperatura', label_en:'Temperature', options:[{k:'hot', label_es:'Caliente', label_en:'Hot', def:true}, {k:'iced', label_es:'Frío', label_en:'Iced'}] },
    milk:      { label_es:'Leche', label_en:'Milk', options:[{k:'whole', label_es:'Entera', label_en:'Whole', def:true}, {k:'oat', label_es:'Avena', label_en:'Oat', d:+8}, {k:'almond', label_es:'Almendra', label_en:'Almond', d:+8}] },
    sweetness: { label_es:'Dulzor', label_en:'Sweetness', options:[{k:'0', label_es:'Sin', label_en:'None'},{k:'25', label_es:'25%', label_en:'25%'},{k:'50', label_es:'50%', label_en:'50%', def:true},{k:'75', label_es:'75%', label_en:'75%'},{k:'100', label_es:'100%', label_en:'100%'}] },
    extras:    { label_es:'Extras', label_en:'Extras', multi:true, options:[{k:'honey', label_es:'Miel', label_en:'Honey', d:+6}, {k:'yuzu', label_es:'Yuzu', label_en:'Yuzu', d:+10}, {k:'vanilla', label_es:'Vainilla', label_en:'Vanilla', d:+8}] },
  },
  cold: {
    size:      { label_es:'Tamaño', label_en:'Size', options:[{k:'M', sub:'360ml', d:0, def:true},{k:'L', sub:'480ml', d:+10}] },
    ice:       { label_es:'Hielo', label_en:'Ice', options:[{k:'less', label_es:'Poco', label_en:'Less'}, {k:'reg', label_es:'Normal', label_en:'Regular', def:true}, {k:'extra', label_es:'Extra', label_en:'Extra'}] },
    sweetness: { label_es:'Dulzor', label_en:'Sweetness', options:[{k:'0', label_es:'Sin', label_en:'None', def:true},{k:'50', label_es:'50%', label_en:'50%'},{k:'100', label_es:'100%', label_en:'100%'}] },
  },
  smoothie: {
    size:      { label_es:'Tamaño', label_en:'Size', options:[{k:'M', sub:'400ml', d:0, def:true},{k:'L', sub:'500ml', d:+10}] },
    base:      { label_es:'Base', label_en:'Base', options:[{k:'yogurt', label_es:'Yogurt', label_en:'Yogurt', def:true}, {k:'milk', label_es:'Leche', label_en:'Milk'}, {k:'oat', label_es:'Avena', label_en:'Oat', d:+8}, {k:'coconut', label_es:'Coco', label_en:'Coconut', d:+8}] },
    extras:    { label_es:'Boost', label_en:'Boost', multi:true, options:[{k:'protein', label_es:'Proteína', label_en:'Protein', d:+15},{k:'chia', label_es:'Chía', label_en:'Chia', d:+8},{k:'collagen', label_es:'Colágeno', label_en:'Collagen', d:+18}] },
  },
  toast: {
    bread:     { label_es:'Pan', label_en:'Bread', options:[{k:'sourdough', label_es:'Sourdough', label_en:'Sourdough', def:true}, {k:'milk', label_es:'Milk bread', label_en:'Milk bread'}, {k:'whole', label_es:'Integral', label_en:'Whole grain'}] },
    extras:    { label_es:'Extras', label_en:'Extras', multi:true, options:[{k:'egg', label_es:'Huevo', label_en:'Egg', d:+18}, {k:'avocado', label_es:'Aguacate', label_en:'Avocado', d:+22}, {k:'cheese', label_es:'Queso', label_en:'Cheese', d:+12}] },
  },
  pastry: {
    warm:      { label_es:'Temperatura', label_en:'Temperature', options:[{k:'room', label_es:'Natural', label_en:'Room', def:true}, {k:'warm', label_es:'Tibio', label_en:'Warmed'}] },
  },
  cake: {
    warm:      { label_es:'Temperatura', label_en:'Temperature', options:[{k:'cold', label_es:'Frío', label_en:'Cold', def:true}, {k:'room', label_es:'Natural', label_en:'Room'}] },
  },
};

// ── Mapeo de categorías Firestore → revamp ────────────────────────────────
const FS_CAT_MAP = {
  // Bebidas calientes (KonCafe real)
  'calientes': 'espresso',
  'espresso': 'espresso',
  'cafe-caliente': 'espresso',
  'latte': 'espresso',
  // Sin azúcar / espresso puro (KonCafe real)
  'sin-azucar': 'filter',
  'filtrados': 'filter',
  'filter': 'filter',
  'americano': 'filter',
  // Matcha y té
  'matcha': 'matcha',
  'te': 'matcha',
  'té': 'matcha',
  // Frías / Frappe / Cold Brew (KonCafe real)
  'frios': 'cold',
  'cold-brew': 'cold',
  'cafe-frio': 'cold',
  'frappe': 'cold',
  'cold': 'cold',
  // Smoothies
  'smoothies': 'smoothie',
  'smoothie': 'smoothie',
  // Alimentos salados (KonCafe real)
  'alimentos': 'toast',
  'salados': 'toast',
  'tostadas': 'toast',
  'toast': 'toast',
  // Pastelería
  'reposteria': 'pastry',
  'pastry': 'pastry',
  'pan': 'pastry',
  // Postres (KonCafe real)
  'postres': 'cake',
  'postre': 'cake',
  'cake': 'cake',
};

// ── Art por categoría Firestore original ──────────────────────────────────
const ART_MAP = {
  'calientes': 'latte',
  'sin-azucar': 'espresso',
  'frios': 'cold',
  'cold-brew': 'cold',
  'matcha': 'matcha',
  'alimentos': 'toast',
  'postres': 'cake',
  'espresso': 'espresso',
  'latte': 'latte',
  'filtrados': 'filter',
  'smoothie': 'smoothie',
  'smoothies': 'smoothie',
  'pastry': 'pastry',
  'reposteria': 'pastry',
};

// Construye CUSTOM dinámico desde los sizes y extras de Firestore
function buildCustomFromFirestore(product) {
  const cat = product.cat;
  const base = CUSTOM[cat] || {};
  const override = {};

  // Sizes de Firestore → reemplaza el campo 'size' del schema
  if (product._sizes && product._sizes.length > 0) {
    const sizeOpts = product._sizes.map((s, i) => ({
      k: s.name,
      sub: s.name,
      d: s.priceModifier || 0,
      def: i === 0,
    }));
    override.size = {
      label_es: 'Tamaño',
      label_en: 'Size',
      options: sizeOpts,
    };
  }

  // Extras de Firestore → agrega al campo 'extras' del schema
  if (product._extras && product._extras.length > 0) {
    const extraOpts = product._extras.map(e => ({
      k: e.name,
      label_es: e.name,
      label_en: e.name,
      d: e.price || 0,
    }));
    override.extras = {
      label_es: 'Extras',
      label_en: 'Extras',
      multi: true,
      options: extraOpts,
    };
  }

  return Object.keys(override).length > 0 ? { ...base, ...override } : base;
}

// Guarda esquemas de customización por productId (para detail.jsx)
const CUSTOM_FS = {};

// Carga productos reales de Firestore y actualiza el global MENU
async function loadMenuFromFirestore() {
  try {
    const snap = await db.collection('menu').where('available', '==', true).get();
    if (snap.empty) return null;

    const mapped = [];
    snap.forEach(doc => {
      const d = doc.data();
      const rawCat = (d.category || '').toLowerCase().trim();
      const cat    = FS_CAT_MAP[rawCat] || 'espresso';

      const art = ART_MAP[rawCat] || cat;
      const product = {
        id:      doc.id,
        cat,
        art,
        name_es: d.name || 'Producto',
        name_en: d.name || 'Product',
        kr:      d.name || '',
        price:   d.price || 0,
        desc_es: d.description || '',
        desc_en: d.description || '',
        tag:     null,
        _sizes:  d.sizes  || [],
        _extras: d.extras || [],
      };

      // Construir CUSTOM_FS dinámico para este producto
      CUSTOM_FS[doc.id] = buildCustomFromFirestore(product);

      mapped.push(product);
    });

    // Ordenar: bebidas primero, luego alimentos
    const ORDER = ['espresso','filter','matcha','cold','smoothie','toast','pastry','cake'];
    mapped.sort((a, b) => {
      const ai = ORDER.indexOf(a.cat);
      const bi = ORDER.indexOf(b.cat);
      if (ai !== bi) return ai - bi;
      return a.name_es.localeCompare(b.name_es);
    });

    // Actualizar global MENU para que ScreenMenu lo use en el siguiente render
    window.MENU = mapped;
    window.CUSTOM_FS = CUSTOM_FS;

    console.log(`[Koncaffe] Menú cargado de Firestore: ${mapped.length} productos`);
    return mapped;
  } catch (err) {
    console.warn('[Koncaffe] No se pudo cargar el menú de Firestore:', err.message);
    return null;
  }
}

Object.assign(window, { T, MENU, CUSTOM, CUSTOM_FS, loadMenuFromFirestore });
