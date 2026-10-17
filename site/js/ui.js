// Componentes compartidos: anuncios accesibles, avisos y diálogos.
import { h, icon } from "./dom.js";

export function announce(message) {
  const region = document.getElementById("announcer");
  if (!region) return;
  region.textContent = "";
  requestAnimationFrame(() => (region.textContent = message));
}

export function toast(message, { iconName = "check", tone = "" } = {}) {
  const root = document.getElementById("toast-root");
  const item = h("div", { class: ["toast", tone && `toast--${tone}`], role: "status" }, icon(iconName), h("span", {}, message));
  root.append(item);
  requestAnimationFrame(() => item.classList.add("is-in"));
  setTimeout(() => {
    item.classList.remove("is-in");
    item.addEventListener("transitionend", () => item.remove(), { once: true });
    setTimeout(() => item.remove(), 600);
  }, 2600);
}

/** Diálogo modal nativo con foco atrapado por <dialog>. Devuelve { el, close }. */
export function openDialog(content, { label, className = "", onClose, dismissible = true } = {}) {
  const dialog = h("dialog", { class: ["sheet", className], "aria-label": label });
  dialog.append(content);
  document.getElementById("overlay-root").append(dialog);
  const close = () => {
    if (!dialog.open || dialog.classList.contains("is-closing")) return;
    dialog.classList.add("is-closing");
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      dialog.close();
      dialog.remove();
      onClose?.();
    };
    dialog.addEventListener("animationend", done, { once: true });
    setTimeout(done, 400);
  };
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    if (dismissible) close();
  });
  dialog.addEventListener("click", (event) => {
    if (dismissible && event.target === dialog) close();
  });
  dialog.showModal();
  return { el: dialog, close };
}

export function closeButton(onClick, label) {
  return h("button", { class: "icon-button", type: "button", "aria-label": label, onClick }, icon("close"));
}
