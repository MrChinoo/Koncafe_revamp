# Koncafe Revamp — Contexto para Claude

## Descripción del proyecto

Kiosco HiFi para cafetería KonCafe — **rediseño** basado en estética coreana/japonesa warm minimal.
Proyecto hermano de `KonCafe_Demo` (React+Vite), este es un **SPA estática** sin bundler.
Conectado al mismo Firebase project (`koncafe-106af`) y mismas colecciones Firestore.

**Demo vivo:** https://koncafe-revamp.web.app  
**Proyecto Firebase:** https://console.firebase.google.com/project/koncafe-106af

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18.3.1 (UMD CDN) + Babel Standalone 7.29.0 |
| Estilos | CSS puro con design tokens en `styles/tokens.css` |
| Backend | Firebase 9.22.2 compat SDK (CDN) |
| Auth | Firebase Auth — Google Sign-In (popup) |
| Base de datos | Firestore mismo proyecto que KonCafe_Demo |
| Hosting | Firebase Hosting — site: `koncafe-revamp` |

## Arquitectura

```
Koncafe_revamp/
├── Koncaffe Kiosk.html     ← Entry point + App component + React root
├── firebase.js             ← Config Firebase + helpers globales (db, auth, recordSale, awardPoints)
├── components/
│   ├── atoms.jsx           ← UI primitives: ProductArt, Button, Chip, Stepper, Monogram, Icon set
│   ├── data.jsx            ← MENU[] (38 productos hardcoded + categorías) + T{} i18n (ES/EN)
│   └── frame.jsx           ← KioskFrame, TopBar, FlowSteps
├── screens/
│   ├── attract.jsx         ← Welcome screen con botón barista oculto
│   ├── menu.jsx            ← Catálogo con 3 layouts (cards/list/editorial)
│   ├── detail.jsx          ← Customización de producto
│   ├── cart.jsx            ← Carrito + promo + redención de puntos
│   ├── loyalty.jsx         ← Google Sign-In real + phone lookup Firestore
│   ├── payment.jsx         ← Pago + creación de orden en Firestore + awardPoints
│   ├── confirm.jsx         ← Confirmación con número de orden
│   └── barista.jsx         ← Cola tiempo real + avance pasos + markReady + recordSale
└── styles/
    └── tokens.css          ← Design system completo (colores, tipografía, shadows, animations)
```

## Patrón crítico — Sin bundler

Los archivos `.jsx` se cargan como `<script type="text/babel">` en el HTML principal.
**NO hay imports ni exports** — todas las funciones se exponen con `Object.assign(window, {...})`.
Las funciones globales en `firebase.js` (`db`, `auth`, `googleProvider`, `recordSaleInFirestore`, 
`awardPointsInFirestore`, `getOrCreateUser`) están disponibles en todos los JSX.

**Orden de carga en el HTML (NO reordenar):**
1. Firebase CDN compat (app, auth, firestore)
2. `firebase.js` (init + helpers)
3. React + React-DOM + Babel
4. `components/atoms.jsx` → `components/data.jsx` → `components/frame.jsx`
5. `screens/*.jsx` (en orden)
6. App inline en el propio HTML

## Colecciones Firestore (mismo schema que KonCafe_Demo)

- **`orders/{orderId}`** — pedidos creados desde `payment.jsx`
  - `status`: `pending_cash | pending | preparing | ready | delivered`
  - `preparationStep`: `0-3`
  - `branchId`: `'branch-001'`
  
- **`sales/{orderId}`** — escritas desde `barista.jsx` al marcar `ready`
  - Función: `recordSaleInFirestore(order)` en `firebase.js`
  
- **`users/{uid}`** — perfil del cliente con `points`, `tier`, `totalSpent`
  - Función: `awardPointsInFirestore(uid, orderId, total)` en `firebase.js`

- **`users/{uid}/pointsTransactions`** — historial de estrellas ganadas

## Design System

**Paleta:**
- `--ivory` (#F6F1E8) fondo principal
- `--cream` (#EFE6D4) cards / sidebars
- `--charcoal` (#2A2620) texto principal / botones dark
- `--terracotta` (#D97757) acento primario (CTAs, highlights)
- `--matcha` (#7A8B5C) success / tier color

**Tipografía:**
- `--font-sans`: DM Sans (Google Fonts CDN, pesos 300-800)
- `--font-kr`: Noto Sans KR (nombres coreanos)
- `--font-mono`: JetBrains Mono (precios, números, códigos)

**Clases utilitarias:** `t-display`, `t-h1`-`t-h4`, `t-body-lg`, `t-body`, `t-sm`, `t-xs`, `t-micro`, `mono`, `kr`

## Flujo de datos end-to-end

```
1. Attract → click "Toca para comenzar"
2. Menu → seleccionar producto
3. Detail → personalizar → "Añadir al pedido"
4. Cart → revisar, código promo KONCAFFE15, canjear puntos
5. Loyalty → Google Sign-In (popup auth) → obtiene puntos reales de Firestore
6. Payment → tarjeta (demo 2.4s) o efectivo → crea `orders/` en Firestore
             si tarjeta: llama awardPoints inmediatamente
7. Confirm → número de orden, ticket, puntos ganados
8. Barista → [acceso: botón "Barista" en footer del Attract o panel Tweaks]
           → suscripción onSnapshot a orders en cola
           → avanza preparationStep 0→1→2→3
           → markReady → recordSale + awardPoints (para efectivo)
```

## Acceso al panel de Barista

1. En la pantalla Attract: clic en el botón "Barista" (footer bottom-right, casi invisible)
2. En el Tweaks panel: botón "Barista →" (activar Tweaks con `__activate_edit_mode` postMessage)
3. El panel Tweaks también permite cambiar layouts: `menuLayout`, `detailVariant`, `loyaltyReveal`

## Deploy

```bash
# Desde /Koncafe_revamp/
firebase deploy --only hosting --project koncafe-106af

# Ver sitio vivo:
# https://koncafe-revamp.web.app
```

## Comandos útiles

```bash
# Ver logs de deploy
firebase hosting:channel:list --project koncafe-106af

# Preview channel (antes de producción)
firebase hosting:channel:deploy preview --project koncafe-106af
```

## Reglas Firestore importantes

Las reglas del proyecto `koncafe-106af` deben permitir:
- Escritura en `orders/` sin auth (pedidos de guests)
- Lectura de `menu/` sin auth
- Lectura/escritura en `users/{uid}` solo al usuario autenticado

Si los pedidos de invitados fallan, revisar y actualizar las reglas en:
https://console.firebase.google.com/project/koncafe-106af/firestore/rules

## Pendientes

### ALTA PRIORIDAD
- [ ] Agregar `koncafe-revamp.web.app` a dominios autorizados en Firebase Auth Console si Google Sign-In falla
      → https://console.firebase.google.com/project/koncafe-106af/authentication/settings
- [ ] Cargar menú real desde Firestore `menu/` (actualmente usa array hardcoded MENU en data.jsx)
- [ ] Canje de puntos real en Checkout (actualmente solo resta del total localmente, no actualiza Firestore)

### MEDIA PRIORIDAD
- [ ] Pantalla de perfil: historial de puntos y pedidos del usuario logueado
- [ ] Notificación push cuando pedido cambia a 'ready' (n8n / FCM)
- [ ] Código promo dinámico (actualmente hardcoded KONCAFFE15 en cart.jsx)

### BAJA PRIORIDAD
- [ ] CFDI real vía facturapi.io o SAT
- [ ] Cámara real para QR scanner (jsQR library)
- [ ] Modo manager (dashboard de ventas del día)

## Notas importantes

- **NO usar imports ES6** — este proyecto no tiene bundler
- **NO instalar npm packages** — todo via CDN
- Los archivos `.jsx` son cargados por Babel Standalone en el browser
- Si agregas una nueva pantalla: 1) crear `screens/nueva.jsx`, 2) agregar `<script type="text/babel">` al HTML, 3) exponer con `Object.assign(window, { ScreenNueva })`, 4) agregar el step al App component
- La variable CSS `--mist` existe en tokens.css — revisar antes de crear nuevas variables
