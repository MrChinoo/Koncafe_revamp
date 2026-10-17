# Koyo 고요 · Kiosco de autoservicio (demo comercial)

Demostración interactiva del kiosco que opera en producción (`KonCafe_Estable`),
presentada con la marca ficticia **Koyo 고요** («quietud»). Publicada en
`https://koncafe-revamp.web.app` y enlazada desde `joabgaribay.com/sitios`.
Muestra el negocio completo en tres vistas:

| Vista | Ruta | Qué demuestra |
|---|---|---|
| **Kiosco** | `#/` → `#/menu` → `#/producto/:id` → `#/pedido` → `#/pago` → `#/listo` | Pedido, personalización, Club de lealtad, cobro y ticket |
| **Barra** | `#/barra` | Cola en vivo por carriles, temporizadores de servicio y checklist |
| **Gerente** | `#/gerente` | Ventas del día, horas pico, productos estrella y métodos de pago |

**No cobra, no factura y no envía pedidos.** Todo se simula en el navegador
(`sessionStorage`); un simulador inyecta clientes ficticios para que la barra se
sienta viva.

La identidad, el concepto *Komorebi* y las especificaciones de cada pantalla
están en [`docs/BRIEFING.md`](docs/BRIEFING.md).

## Arquitectura

Sin bundler ni dependencias en tiempo de ejecución: HTML + CSS + módulos ES nativos.

```
site/
├── index.html            Marco, precarga de fuentes, sin código en línea (CSP)
├── css/
│   ├── tokens.css        Tokens de diseño + @font-face autoalojadas
│   ├── base.css          Tipografía, componentes, transiciones, komorebi
│   ├── kiosk.css         Pantallas del cliente
│   ├── barista.css       Barra (modo oscuro)
│   └── manager.css       Panel del gerente
├── js/
│   ├── main.js           Arranque, rutas, montaje con View Transitions
│   ├── router.js         Router por hash (enlaces directos a cada vista)
│   ├── store.js          Estado con suscripción + sessionStorage
│   ├── data.js           Catálogo, opciones por perfil, cliente demo
│   ├── orders.js         Carrito, totales, pedidos, SLA
│   ├── sim.js            Simulador de operación
│   ├── i18n.js           Textos ES/EN
│   ├── chrome.js         Barra de demo, barra del kiosco, recorrido, inactividad
│   ├── motion.js         Transiciones, contadores, vuelo a la bolsa, hojas
│   ├── ui.js · dom.js · qr.js
│   └── screens/          attract · menu · product · cart · payment · confirm · barista · manager
├── fonts/                Plus Jakarta Sans, Manrope, JetBrains Mono (WOFF2 variables) + Noto Sans KR (subconjunto)
└── img/                  Producto en WebP 480/960, rosetta, grano
```

## Ejecutar en local

```bash
firebase emulators:start --only hosting --project koncafe-106af
```

Abrir `http://127.0.0.1:5000`. No requiere `npm install`.

## Verificar

```bash
for f in site/js/*.js site/js/screens/*.js; do node --check "$f"; done
```

Recorrido manual: inicio → menú (filtro, búsqueda, agregado rápido) → producto
(personalizar) → pedido (Club por QR o teléfono, canje) → pago (tarjeta, efectivo
o QR) → confirmación (estado en vivo) → barra (avanzar) → gerente. Probar también
inglés, móvil (390 px), teclado y `prefers-reduced-motion`. Sin errores de consola
ni de CSP.

## Recursos

Las fotos y los iconos se regeneran con `scripts/build-assets.mjs` (requiere
`sharp` sólo en desarrollo; ver el encabezado del script).

## Publicar

```bash
firebase deploy --only hosting:koncafe-revamp --project koncafe-106af
```

El proyecto Firebase es compartido con producción: **nunca** usar `firebase deploy`
sin `--only hosting:koncafe-revamp`, ni desplegar reglas o funciones desde aquí.
