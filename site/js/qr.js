// QR ilustrativo: patrón determinista con patrones de posición reales.
// No codifica datos; se rotula como "ilustrativo" en la interfaz.

function hash(text) {
  let value = 2166136261;
  for (let i = 0; i < text.length; i++) {
    value ^= text.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return () => {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    return ((value >>> 0) % 1000) / 1000;
  };
}

export function fakeQr(seed, { size = 25, className = "qr" } = {}) {
  const random = hash(seed);
  const finder = (x, y) => {
    const corners = [[0, 0], [size - 7, 0], [0, size - 7]];
    return corners.some(([cx, cy]) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7);
  };
  const finderOn = (x, y) => {
    for (const [cx, cy] of [[0, 0], [size - 7, 0], [0, size - 7]]) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx >= 0 && dx < 7 && dy >= 0 && dy < 7) {
        const ring = Math.min(dx, dy, 6 - dx, 6 - dy);
        return ring !== 1;
      }
    }
    return false;
  };
  let path = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const on = finder(x, y) ? finderOn(x, y) : random() > 0.52;
      if (on) path += `M${x} ${y}h1v1h-1z`;
    }
  }
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", `-2 -2 ${size + 4} ${size + 4}`);
  svg.setAttribute("class", className);
  svg.setAttribute("role", "img");
  svg.setAttribute("shape-rendering", "crispEdges");
  const bg = document.createElementNS(ns, "rect");
  bg.setAttribute("x", "-2");
  bg.setAttribute("y", "-2");
  bg.setAttribute("width", String(size + 4));
  bg.setAttribute("height", String(size + 4));
  bg.setAttribute("fill", "#fff");
  const shape = document.createElementNS(ns, "path");
  shape.setAttribute("d", path);
  shape.setAttribute("fill", "currentColor");
  svg.append(bg, shape);
  return svg;
}
