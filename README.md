# KonCafe · kiosco de pedidos (demo)

Demostración pública de un kiosco de cafetería. Permite explorar un menú de
ejemplo, personalizar bebidas, agregar productos, simular un pedido y seguirlo
en una vista de barra. **No cobra, factura ni envía órdenes reales.**

## Decisión de datos

El catálogo vive en `site/app.js` y el estado del carrito y la cola usa
`sessionStorage`. Es la opción más segura y simple para una demo pública:
respuesta inmediata, cero credenciales, sin escrituras en la base productiva y
sin costo de backend. La cola se comparte entre pantallas de la misma pestaña;
no entre dispositivos. Cuando exista un caso real para sincronizar tablets,
deberá montarse un backend de demostración aislado con autenticación, reglas y
límites propios.

## Ejecutar

```bash
firebase emulators:start --only hosting --project koncafe-106af
```

Abrir `http://127.0.0.1:5000`. La página no necesita `npm install`.

## Publicar

```bash
firebase deploy --only hosting:koncafe-revamp --project koncafe-106af
```

El Hosting comparte el proyecto Firebase con la aplicación real, pero esta
configuración publica exclusivamente `site/` y no despliega reglas, Functions ni
otros sitios. Cuatro fotografías se reutilizaron de `KonCafe_Estable` y las otras
seis se generaron para esta demo y se optimizaron en JPEG. Los iconos de acceso
directo se pueden reconstruir con `powershell -File scripts/build-icons.ps1`.

## Guía y futuro chatbot

`site/chat-help.js` ofrece una guía local con respuestas predefinidas. La
interfaz deja un espacio claro para integrar más adelante un chatbot real:
reemplazar la función `answer()` por una llamada a un backend propio con
autenticación, límites de uso y protección de secretos. La política CSP actual
bloquea conexiones externas deliberadamente; al integrar el backend se debe
autorizar solo su origen concreto en `firebase.json`. No se deben incluir claves
del proveedor de IA en el navegador. La guía actual no envía ni almacena
conversaciones.
