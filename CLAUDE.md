# Koyo 고요 · Kiosco demo comercial

Este repositorio publica **sólo** `site/` en `https://koncafe-revamp.web.app/`
(enlazada desde `joabgaribay.com/sitios` para mostrar el producto a cafeterías).
El proyecto de Hosting es `koncafe-106af`, pero esta demo **no usa Firebase Auth,
Firestore, Functions ni pagos**. Nunca desplegar reglas o funciones desde aquí.

**Documento rector:** [`docs/BRIEFING.md`](docs/BRIEFING.md) — concepto *Komorebi*,
paleta, tipografía, movimiento y especificación de cada pantalla. Cualquier cambio
visual debe respetarlo (regla "sin líneas", CTA en degradado terracota, matcha
sólo para éxito/selección/lealtad, acento editorial en cursiva).

## Arquitectura

Módulos ES nativos, sin bundler ni dependencias de ejecución (ver `README.md`).

- `site/js/main.js` monta pantallas por ruta hash con View Transitions.
- Cada pantalla en `site/js/screens/*.js` exporta `{ mode, theme?, chrome, render(params) }`;
  `render` devuelve `{ el, focus?, update?(state, prev), destroy?() }`.
- Estado global en `site/js/store.js` (`store.get/set/subscribe`), persistido en
  `sessionStorage`. Lógica de pedidos en `orders.js`; simulación en `sim.js`.
- Textos en `i18n.js` (ES/EN). Barra y gerente tienen su propio diccionario local.
- Rutas: `#/`, `#/menu`, `#/producto/:id[?linea=n]`, `#/pedido`, `#/pago`, `#/listo`,
  `#/barra`, `#/gerente`.

## Reglas importantes

- **CSP estricta** (`firebase.json`): nada de `<script>`/`<style>` en línea, ni
  atributos `style="…"`, ni `data:` URIs, ni orígenes externos. Los estilos
  dinámicos van por `el.style.setProperty`. Fuentes e imágenes autoalojadas.
- Usar `h()`, `icon()` y `productImage()` de `dom.js` para construir DOM.
- Animar sólo `transform`/`opacity`; respetar `prefers-reduced-motion`. Evitar
  `filter: blur` y `mix-blend-mode` en capas grandes animadas (rendimiento de kiosco).
- La paleta de gráficas del gerente está validada con la skill `dataviz`; si se
  cambia, volver a validar.

## Desarrollo y verificación

```bash
firebase emulators:start --only hosting --project koncafe-106af
for f in site/js/*.js site/js/screens/*.js; do node --check "$f"; done
```

Recorrido manual en escritorio y 390 px: inicio → menú → producto → pedido (Club,
canje) → pago (tarjeta/efectivo/QR) → confirmación → barra → gerente → inglés.
Sin errores de consola ni de CSP.

## Despliegue

```bash
firebase deploy --only hosting:koncafe-revamp --project koncafe-106af
```

No usar `firebase deploy` sin `--only hosting:koncafe-revamp` porque el proyecto
Firebase es compartido con producción. Mantener archivos de desarrollo y logs
fuera de `site/`.
