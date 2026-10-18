# Revisión autónoma — 18 de octubre de 2026

## Qué contiene

Demo comercial estática Koyo: HTML, CSS y módulos ES, sin bundler, sin package.json ni dependencias de runtime. La ausencia de package.json es parte de su arquitectura. Simula cliente, barra y gerente con `sessionStorage`; no ejecuta cobros, facturas ni pedidos reales.

Árbol inicialmente limpio en `main`, `dc05fa8`; `git fetch origin --prune` confirmó que coincide con el remoto. Su target Hosting es `koncafe-revamp`, distinto del POS estable. La política CSP restringe scripts y estilos al origen y bloquea conexiones de red, formularios y objetos.

## Corrección y verificación de esta pasada

`site/js/router.js` lanzaba `URIError` si un enlace traía un escape incompleto (`#/%`, por ejemplo); podía impedir que arrancara toda la demo. Ahora vuelve a la ruta inicial cuando no puede decodificar el enlace.

- `node --test scripts/router.test.mjs`: **3/3 pruebas correctas**; rutas normales, escapes incompletos y consulta de un enlace dañado.
- `node scripts/check-static.mjs`: sintaxis de los **20 módulos JavaScript** y sus imports locales, **0 fallos**. Se incorporó este control y las regresiones al predeploy de Hosting y al workflow `Calidad estática`, sin instalar dependencias.
- QA real con Playwright en el servidor local existente: abrir `#/%` recupera la portada; «Toca para comenzar» navega a `#/menu` y muestra «Encuentra tu momento». Consola: **0 errores y 0 advertencias**. La sesión de navegador se cerró al terminar.
- Registros en `../_revision_2026-10-18/gym_cafe/`. La comprobación de navegador anterior cubre entrada y navegación inicial, no todo el recorrido comercial.

## Entrega y publicación

La corrección y sus comprobaciones se entregaron primero a `maintenance/autonomous-2026-10-18`; el [CI de mantenimiento](https://github.com/MrChinoo/Koncafe_revamp/actions/runs/39162082938) pasó sobre `e4f0f00`. Se integró a main por fast-forward; el [CI de main](https://github.com/MrChinoo/Koncafe_revamp/actions/runs/39162135459) también pasó.

El 18 de octubre de 2026 se publicó únicamente **Hosting `koncafe-revamp`**, mediante `firebase deploy --only hosting:koncafe-revamp --project koncafe-106af --non-interactive`. El proyecto es compartido, pero el comando seleccionó expresamente el site de la demo y no incluyó Firestore, Functions ni el site del POS estable. El predeploy ejecutó los 20 módulos y las tres regresiones sin fallos.

La comprobación previa confirmó que el router publicado correspondía a la base `dc05fa8`. Después de publicar, `https://koncafe-revamp.web.app` respondió HTTP 200 y el router publicado coincide con `e4f0f00` (SHA-256 normalizado `c28f3e73b62dbaf77bcd746a4285bf4d0cd45d02f9303c2c4c1633991b753143`). Se comprobaron CSP y `nosniff`; la prueba de navegador descrita arriba fue local, antes de desplegar.

## Plan de continuidad

1. **P1 — QA del recorrido comercial.** Verificar menú, personalización, bolsa, pago simulado, confirmación, barra y gerente en móvil/tablet/escritorio, ambas traducciones, teclado y movimiento reducido. Criterio: recorrido completo sin errores de consola y con rótulo inequívoco de simulación.
2. **P1 — Persistencia robusta.** Cubrir almacenamiento bloqueado o corrupto, restauración de sesión con versión anterior y dos pestañas. Un fallo de `sessionStorage` debe mantener la demo funcional y presentar un estado válido.
3. **P1 — Integridad estática.** El predeploy y CI ya comprueban sintaxis, imports de módulos y regresiones del router. Ampliar la verificación a imágenes, fuentes y enlaces locales. Validar CSP en el sitio publicado con un navegador real antes del próximo deploy.
4. **P2 — Rendimiento y medición.** Conservar imágenes responsivas y precarga del LCP; registrar accesibilidad, carga móvil y peso total. No instalar un framework solo para homogeneizar el stack de la flota.

## Avance estimado

**85 % ± 12 puntos como demo comercial, confianza baja**: funcionalidad 90 %, calidad 85 %, seguridad 90 %, operación/documentación 75 %. No es un 85 % de un POS operativo; pagos, identidad y backend reales están explícitamente fuera de su alcance.
