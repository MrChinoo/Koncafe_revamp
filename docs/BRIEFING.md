# Koyo 고요 · Briefing e identidad de la demo

> Documento rector del kiosco demo publicado en `koncafe-revamp.web.app` y
> mostrado en `joabgaribay.com/sitios`. Toda decisión visual o de producto de
> la demo debe poder justificarse con este documento.

---

## 1. Contexto del proyecto

| | |
|---|---|
| **Qué es** | Demostración comercial interactiva del kiosco de autoservicio que opera en producción (`KonCafe_Estable`), presentada con una marca ficticia propia: **Koyo 고요**. |
| **Para quién** | Dueños y gerentes de cafeterías, panaderías y coffee shops que evalúan digitalizar su mostrador. |
| **Dónde vive** | Enlazada desde el portafolio `joabgaribay.com/sitios`. Se abre en laptop, tablet o celular, casi siempre por primera vez y sin guía. |
| **Qué debe lograr** | Que en menos de 2 minutos el visitante entienda el flujo completo —pedir, pagar, preparar y medir— y lo sienta tan pulido como para imaginarlo en su propio local. |
| **Qué NO es** | No cobra, no factura, no envía pedidos y no se conecta a Firebase Auth/Firestore. Todo se simula en el navegador. |

### Objetivos medibles de la demo

1. **Recorrido completo en ≤ 90 s** desde la portada hasta el ticket.
2. **Primera pintura útil < 1 s** en 4G; peso inicial < 400 KB.
3. **Cero errores** de consola y de CSP.
4. **Tres vistas del negocio** visibles en un clic: cliente, barra y gerente.
5. AA de contraste en texto y objetivos táctiles ≥ 48 px.

---

## 1.1 Nombre: Koyo 고요

| | |
|---|---|
| **Coreano** | 고요 — *quietud, calma, silencio sereno* (romanización estricta *goyo*; *Koyo* es la grafía de marca). |
| **Eco japonés** | *kōyō* 紅葉 — las hojas que cambian de color en otoño: el mismo mundo de luz entre hojas del concepto *Komorebi*. |
| **Por qué** | Contiene "KO" (continuidad con el monograma de los vasos), dos sílabas abiertas fáciles en español, sin significados incómodos. |
| **Descartados** | *Kafe Onni* 카페 언니 ("la hermana mayor"; en japonés *oni* = demonio), *Kokong* 코콩 (infantil), *Kopi* 코피 (en coreano: sangrado de nariz). |
| **Firma** | **Koyo** + 고요 · descriptor "café de la quietud" / *slow coffee · smart service*. |

La infraestructura conserva sus identificadores técnicos (`koncafe-revamp`, `koncafe-106af`).

---

## 2. Concepto creativo: *Komorebi* · 木漏れ日

*Komorebi* es la luz del sol que se filtra entre las hojas. Es la metáfora de la
marca: **una pausa cálida en medio de la prisa**. La tecnología debe sentirse
como esa luz: presente, suave y nunca invasiva.

Estrella del norte heredada de la referencia Stitch: **"The Curated Stillness"**
—la quietud curada—. Minimalismo cálido coreano/japonés, editorial, con aire,
asimetría intencional y materiales táctiles (cerámica, papel kraft, madera clara).

**Lo memorable:** una luz de hojas que se mueve lentamente sobre el papel en la
portada y reaparece como pétalos al confirmar el pedido. Es la firma de la marca.

### Personalidad

| Es | No es |
|---|---|
| Serena, precisa, hospitalaria | Fría, clínica, corporativa |
| Editorial y artesanal | Recargada o "techie" |
| Segura de sí, sin gritar | Promocional, llena de signos de exclamación |
| Contemporánea con raíz coreana | Kitsch o caricatura de Asia |

### Voz y tono

- Tutea, frases cortas, verbos sensoriales: *elige, ajusta, acompaña, recoge*.
- Un acento editorial por pantalla, en cursiva y terracota: *"Una pausa **a tu ritmo.**"*
- Microcopy honesto sobre la simulación: "Pago de prueba", "Ticket ilustrativo".
- El coreano aparece como **acento tipográfico**, nunca como texto que haya que leer
  para usar la interfaz (고요, 커피, 말차, 감사합니다).

---

## 3. Identidad visual

### 3.1 Logotipo

- **Monograma 고:** la sílaba coreana *ko* construida con trazos geométricos de puntas
  redondas: **ㄱ** (k) arriba y **ㅗ** (o) abajo —literalmente "KO"—, con un círculo
  terracota dentro del gancho: el sol que se filtra entre las hojas.
- **Ícono de app / favicon:** monograma en `paper` sobre baldosa `ink` con radio 25 %;
  legible desde 16 px (`site/favicon.svg`, PNG 32/180/192/512).
- **Firma completa:** monograma + "Koyo" en Plus Jakarta Sans 800 (−0.03 em) +
  "고요" en Noto Sans KR 500, al 60 % de opacidad.
- **Zona de respeto:** el diámetro del sol por los cuatro lados.
- **Rosetta** (arte latte de Estable): sólo como sello o marca de agua al 6–10 %.
- No deformar, no aplicar degradados al logotipo, no usarlo sobre fotografía sin velo.

### 3.2 Paleta

Base de la referencia Stitch (Material 3, semilla terracota) reinterpretada en
roles semánticos. Todos los valores viven en `site/css/tokens.css`.

| Rol | Token | Hex | Uso |
|---|---|---|---|
| Papel | `--paper` | `#FEF9EA` | Lienzo base |
| Papel bajo | `--paper-low` | `#F8F3E4` | Secciones grandes |
| Papel medio | `--paper-mid` | `#F2EDDE` | Contenedores |
| Papel alto | `--paper-high` | `#ECE8D9` | Chips, campos |
| Cerámica | `--paper-max` | `#E6E2D3` | Botón secundario |
| Blanco sol | `--sun` | `#FFFFFF` | Tarjetas elevadas |
| Tinta | `--ink` | `#1D1C13` | Texto principal (nunca `#000`) |
| Tinta suave | `--ink-soft` | `#55433D` | Texto secundario, metadatos |
| Tinta tenue | `--ink-faint` | `#88726C` | Ayudas, placeholders |
| Barro | `--clay` | `#99462A` | Primario, acento editorial |
| Barro claro | `--clay-soft` | `#D97757` | Degradado de CTA, destacados |
| Matcha | `--matcha` | `#576A4E` | Éxito, selección, lealtad |
| Matcha claro | `--matcha-soft` | `#849878` | Chips seleccionados |
| Hoja | `--leaf` | `#DDE6D2` | Fondos de éxito |
| Ámbar | `--amber` | `#C08A2E` | Estrellas, alertas suaves |
| Noche | `--night` | `#1A1914` | Fondo de la barra (modo oscuro) |

**Reglas**

- *Sin líneas:* los límites se marcan con cambio de tono entre niveles de papel,
  no con bordes de 1 px. Si accesibilidad lo exige: "borde fantasma" al 15 %.
- *CTA de barro:* degradado 135° de `--clay` a `--clay-soft`, como terracota cocida.
- *Matcha con mesura:* sólo para éxito, selección y el club de lealtad.
- *Vidrio:* barras flotantes con papel al 72 % y `backdrop-filter: blur(20px)`.

### 3.3 Tipografía

Fuentes autoalojadas en WOFF2 variable (cumple la CSP `font-src 'self'`).

| Familia | Uso | Peso |
|---|---|---|
| **Plus Jakarta Sans** | Titulares, precios grandes, botones | 600–800, tracking −0.03 em |
| **Plus Jakarta Sans Italic** | El acento editorial terracota | 700 |
| **Manrope** | Cuerpo y controles | 400–600, interlineado 1.6 |
| **JetBrains Mono** | Números de orden, tickets, temporizadores | 500 |
| **Noto Sans KR** (subconjunto 4 KB) | Acentos en coreano | 500 |

Escala fluida (`clamp`): display 3.5–6 rem · h1 2.4–3.5 rem · h2 1.6–2.2 rem ·
h3 1.25 rem · cuerpo 1 rem · micro 0.6875 rem en MAYÚSCULAS con +0.12 em.

### 3.4 Fotografía

- Producto en vaso de la marca sobre concreto claro, luz lateral natural.
- Formatos WebP a 480 y 960 px con `srcset`; contenedores con radio de 24–32 px
  o arco superior (como cerámica torneada).
- Nunca fondos de stock genéricos; el ambiente lo construye la luz komorebi.

### 3.5 Iconografía

Trazo lineal de 1.6 px, puntas redondeadas, retícula de 24 px, dibujados en
SVG en línea. Sin iconos rellenos salvo estados activos.

### 3.6 Profundidad y forma

- Sombra ambiental única: `0 20px 40px rgba(29,28,19,.06)`; nunca > 10 % de opacidad.
- Radios: 12 (chips) · 20 (controles) · 28 (tarjetas) · 999 (píldoras).
- Espacio negativo como componente: márgenes asimétricos, 20 % más aire del que parece necesario.

### 3.7 Movimiento

| Principio | Aplicación |
|---|---|
| **Respira, no rebota** | Curva `cubic-bezier(.2,.8,.2,1)`; 180 ms (micro), 320 ms (componentes), 520 ms (escenas). |
| **Continuidad** | View Transitions API: la foto del producto viaja de la tarjeta al detalle. |
| **Causa visible** | Al agregar, la foto vuela hacia la bolsa; los totales cuentan hacia el nuevo valor. |
| **Recompensa** | Hojas que caen al confirmar; estrellas que suman. |
| **Respeto** | `prefers-reduced-motion` desactiva desplazamientos y deja sólo fundidos. |

---

## 4. Experiencia: arquitectura de pantallas

La demo tiene **tres modos**, accesibles desde la barra de demostración superior:

```
Kiosco (cliente)  →  Inicio → Menú → Producto → Pedido + Club → Pago → Confirmación
Barra (barista)   →  Cola en vivo por carriles, temporizadores, checklist
Gerente           →  Ventas del día, horas pico, productos estrella, mezcla de pagos
```

Las rutas usan hash (`#/menu`, `#/barra`, `#/gerente`) para poder enlazar cada
vista desde el portafolio.

### 4.1 Inicio (atracción)
- Luz komorebi animada sobre papel, titular display con acento en cursiva.
- Composición asimétrica: foto en arco + tarjeta flotante de "Hoy" que rota
  productos + tarjeta matcha del Club.
- Toda la pantalla invita a tocar; CTA terracota "Toca para comenzar".
- Píldora de vidrio con promesas operativas: sin filas · tarjeta o efectivo · factura.

### 4.2 Menú
- Titular + buscador de relleno suave.
- Riel de categorías con fotografía circular y contador.
- Retícula de tarjetas: foto en arco, etiqueta, nombre + coreano, precio en mono,
  botón "+" de agregado rápido con vuelo a la bolsa.
- Barra de vidrio inferior con subtotal animado cuando hay productos.

### 4.3 Producto (personalización)
- Pantalla completa (no modal) con transición compartida de la foto.
- Tamaño en tarjetas con taza a escala, temperatura segmentada, leche en chips
  matcha, dulzor con indicador deslizante, extras como tarjetas alternables.
- Barra inferior: volver · cantidad · total animado · "Agregar al pedido".

### 4.4 Pedido + Club Koyo
- Lista editable (cantidad, editar, quitar) con resumen de personalización.
- Tarjeta de lealtad: identificación simulada por QR o teléfono → saludo,
  estrellas, progreso a la siguiente recompensa y canje aplicable.
- Resumen: subtotal, recompensa, IVA incluido, total y estrellas por ganar.

### 4.5 Pago
- Servicio (aquí / para llevar) y nombre para llamar el pedido.
- Métodos: tarjeta (terminal con pulso NFC), efectivo en caja, pago con QR.
- Interruptor de factura (el ticket incluye QR de facturación).
- Escena de procesamiento simulada: acercar → procesando → aprobado.

### 4.6 Confirmación
- Ticket de papel con bordes perforados, tipografía mono y QR ilustrativo.
- Número de orden protagonista, tiempo estimado y línea de estado que avanza
  en vivo (sincronizada con la barra).
- Estrellas ganadas con conteo, lluvia de hojas, cuenta regresiva para volver al inicio.

### 4.7 Barra (modo oscuro)
- Métricas: activos, atrasados, espera promedio.
- Carriles Bebidas / Alimentos; tarjetas con anillo de tiempo (a tiempo,
  acelera, atrasado), checklist por producto y acción principal única.
- Simulador de clientes que inyecta pedidos para que la cola se sienta viva.

### 4.8 Gerente
- KPIs del día con variación, ventas por hora (barras), productos estrella,
  mezcla de métodos de pago y participación del Club. Se actualiza con cada pedido.

### 4.9 Transversales
- **Inactividad:** a los 75 s aparece "¿Sigues ahí?" con 10 s de gracia; luego
  vuelve al inicio y limpia el pedido (buena práctica de kiosco).
- **Idiomas:** ES / EN en toda la interfaz del cliente.
- **Guía de demo:** recorrido sugerido que se marca solo conforme se completa.

---

## 5. Estándares técnicos

| Área | Decisión |
|---|---|
| Stack | HTML + CSS + JavaScript en módulos ES nativos. Sin bundler ni dependencias en tiempo de ejecución. |
| Estado | Store mínimo con suscripción; persistencia en `sessionStorage` (aislado por pestaña). |
| Rutas | Hash router con View Transitions API y degradación elegante. |
| Seguridad | CSP estricta `self` (sin inline, sin `data:`), cabeceras `nosniff`, `frame-ancestors 'none'`. |
| Rendimiento | WOFF2 variables precargadas, WebP con `srcset`, `loading="lazy"`, `decoding="async"`, caché larga para fuentes/imágenes. |
| Accesibilidad | Semántica nativa, foco visible, `aria-live` para anuncios, navegación por teclado, `prefers-reduced-motion`, objetivos ≥ 48 px. |
| Responsivo | Verificado en 360, 390 (móvil), 820 vertical, 1024 / 1180 / 1366 horizontal (tablet) y 1920 px (escritorio). |
| Verificación | `node --check` en cada módulo + recorrido Playwright en escritorio y móvil sin errores de consola. |
| Datos | Catálogo y pedidos ficticios. **Nunca** escribir en Firestore de producción desde la demo. |
