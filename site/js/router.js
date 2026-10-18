// Router por hash: enlazable desde el portafolio (#/barra, #/gerente…).

const routes = [];
let handler = null;
let kioskPath = "/";

// Orden del recorrido para decidir la dirección de la transición.
const FLOW = ["/", "/menu", "/producto", "/pedido", "/pago", "/listo", "/barra", "/gerente"];

export function defineRoutes(list) {
  routes.push(...list);
}

export function currentPath() {
  // Un enlace pegado a medias puede contener un escape incompleto (% o %E0...).
  // El hash viene de fuera: si no se puede decodificar, volver al inicio conserva la demo.
  try {
    const raw = decodeURIComponent(location.hash.slice(1) || "/");
    return raw.split("?")[0] || "/";
  } catch {
    return "/";
  }
}

export function currentQuery() {
  const raw = location.hash.slice(1);
  const index = raw.indexOf("?");
  return new URLSearchParams(index === -1 ? "" : raw.slice(index + 1));
}

export function lastKioskPath() {
  return kioskPath;
}

export function navigate(path) {
  if (`#${path}` === location.hash) handler?.(true);
  else location.hash = path;
}

export function resolve(path = currentPath()) {
  for (const route of routes) {
    const names = [];
    const pattern = new RegExp(`^${route.path.replace(/:(\w+)/g, (_, name) => (names.push(name), "([^/]+)"))}$`);
    const match = path.match(pattern);
    if (match) {
      const params = Object.fromEntries(names.map((name, i) => [name, match[i + 1]]));
      return { route, params };
    }
  }
  return { route: routes[0], params: {} };
}

const flowIndex = (path) => FLOW.reduce((found, p, i) => (path === p || (p !== "/" && path.startsWith(p)) ? i : found), 0);

export function startRouter(onChange) {
  let previous = currentPath();
  handler = (force = false) => {
    const path = currentPath();
    const direction = flowIndex(path) >= flowIndex(previous) ? "forward" : "back";
    previous = path;
    const resolved = resolve(path);
    if (resolved.route.screen.mode === "kiosk") kioskPath = path;
    onChange(resolved, direction, force);
  };
  window.addEventListener("hashchange", () => handler());
  handler();
}
