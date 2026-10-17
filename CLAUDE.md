# KonCafe Kiosco · demostración comercial

Este repositorio publica **sólo** `site/` en `https://koncafe-revamp.web.app/`.
El proyecto de Hosting es `koncafe-106af`, pero esta demo **no usa Firebase Auth,
Firestore, Functions ni pagos**. Nunca desplegar reglas o funciones desde aquí.

## Arquitectura

- `site/index.html`: estructura y metadatos.
- `site/styles.css`: diseño adaptable y animaciones, con reducción de movimiento.
- `site/app.js`: catálogo ficticio, carrito, personalización, ticket y cola de barra.
- `site/chat-help.js`: guía local con respuestas predefinidas; punto de integración
  para un chatbot futuro, sin conexiones ni claves en el cliente.
- `site/assets/`: cuatro fotografías reutilizadas de `KonCafe_Estable` y seis
  imágenes generadas para completar el catálogo.
- `site/favicon.svg`, iconos PNG y `site/manifest.webmanifest`: identidad visual.
- `scripts/build-icons.ps1`: reconstruye los iconos PNG desde la misma paleta.
- `firebase.json`: publica únicamente `site/` y añade cabeceras de seguridad.

No requiere bundler ni dependencias de ejecución. Los datos viven en
`sessionStorage` del navegador. Los pedidos no cruzan dispositivos y no llegan a
la cafetería. El pago es una simulación explícita y no solicita datos financieros.

## Desarrollo y verificación

En la raíz, usar el emulador local de Hosting:

```bash
firebase emulators:start --only hosting --project koncafe-106af
```

Comprobar sintaxis: `node --check site/app.js` y
`node --check site/chat-help.js`.

Recorrido manual: inicio → menú/filtro/búsqueda → personalizar → carrito →
opciones de servicio y pago de prueba → ticket → barra → avanzar hasta entregado.
Probar también vista móvil, teclado y reinicio de demo.
Verificar las diez fotografías, la guía local y la ausencia de errores de CSP.

## Despliegue

```bash
firebase deploy --only hosting:koncafe-revamp --project koncafe-106af
```

No usar `firebase deploy` sin `--only hosting:koncafe-revamp` porque el proyecto
Firebase es compartido con producción. Mantener los archivos de desarrollo y
logs fuera de `site/`.
