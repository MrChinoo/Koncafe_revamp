// Guía local de la demo. La función answer() es el punto de integración para un chatbot futuro.
const root = document.querySelector("#assistant-root");

function element(tag, className, text) {
  const item = document.createElement(tag);
  if (className) item.className = className;
  if (text) item.textContent = text;
  return item;
}

const toggle = element("button", "assistant-toggle");
toggle.type = "button";
toggle.setAttribute("aria-label", "Abrir guía de la demo");
toggle.setAttribute("aria-expanded", "false");
toggle.setAttribute("aria-controls", "assistant-panel");
toggle.append(element("span", "assistant-toggle-icon"), element("span", "assistant-toggle-label", "¿Te ayudo?"));

const panel = element("section", "assistant-panel");
panel.id = "assistant-panel";
panel.setAttribute("aria-label", "Guía de la demo KonCafe");
panel.hidden = true;
const header = element("div", "assistant-header");
const titleWrap = element("div", "assistant-title");
titleWrap.append(element("span", "assistant-avatar", "K"));
const titleText = element("div");
titleText.append(element("strong", "", "Guía KonCafe"), element("small", "", "Respuestas de esta demo"));
titleWrap.append(titleText);
const close = element("button", "assistant-close", "×");
close.type = "button";
close.setAttribute("aria-label", "Cerrar guía");
header.append(titleWrap, close);

const messages = element("div", "assistant-messages");
messages.setAttribute("role", "log");
messages.setAttribute("aria-live", "polite");
messages.setAttribute("aria-label", "Conversación de ayuda");
const prompts = element("div", "assistant-prompts");
const form = element("form", "assistant-form");
const input = element("input", "assistant-input");
input.type = "text";
input.placeholder = "Pregunta sobre la demo";
input.maxLength = 160;
input.setAttribute("aria-label", "Tu pregunta");
input.required = true;
const send = element("button", "assistant-send", "→");
send.type = "submit";
send.setAttribute("aria-label", "Enviar pregunta");
form.append(input, send);
const note = element("p", "assistant-note", "Guía automática local · No conecta con una persona");
panel.append(header, messages, prompts, form, note);
root.append(panel, toggle);

function addMessage(text, who) {
  messages.append(element("p", `assistant-message ${who}`, text));
  messages.scrollTop = messages.scrollHeight;
}

function answer(question) {
  const normalized = question.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (/pago|tarjeta|cobr|precio|cost/.test(normalized))
    return "Los precios son ilustrativos en MXN. El pago y la confirmación son simulados; esta demo no cobra ni genera pedidos reales.";
  if (/barra|estado|seguim|pedido/.test(normalized))
    return "Después de confirmar un pedido de prueba, puedes abrir Vista barra para avanzar su estado. Solo se guarda en esta pestaña.";
  if (/personal|leche|tamano|extra|bebida/.test(normalized))
    return "En el menú, toca una bebida para elegir tamaño, leche, temperatura y extras. El precio cambia al momento según tus opciones.";
  if (/chat|humano|contact|real|integr/.test(normalized))
    return "Esta guía usa respuestas locales. Un chatbot real puede conectarse aquí más adelante mediante un servicio seguro y separado de la demo.";
  return "Puedo ayudarte con personalización, pagos de prueba, seguimiento en barra o la futura integración del chat. Prueba con una de esas preguntas.";
}

function ask(question) {
  addMessage(question, "visitor");
  addMessage(answer(question), "guide");
}

function openPanel() {
  panel.hidden = false;
  toggle.setAttribute("aria-expanded", "true");
  toggle.setAttribute("aria-label", "Cerrar guía de la demo");
  input.focus();
}

function closePanel() {
  panel.hidden = true;
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Abrir guía de la demo");
  toggle.focus();
}

toggle.addEventListener("click", () => panel.hidden ? openPanel() : closePanel());
close.addEventListener("click", closePanel);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !panel.hidden) closePanel();
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = input.value.trim();
  if (!question) return;
  ask(question);
  input.value = "";
  input.focus();
});

addMessage("¡Hola! Soy la guía de esta demo. ¿Qué te gustaría conocer del kiosco?", "guide");
for (const question of ["¿Cómo personalizo una bebida?", "¿Se cobra de verdad?", "¿Cómo funciona la barra?"]) {
  const prompt = element("button", "assistant-prompt", question);
  prompt.type = "button";
  prompt.addEventListener("click", () => ask(question));
  prompts.append(prompt);
}
