// 01 · Atracción — la pausa antes del pedido.
import { h, icon, accent, money, productImage } from "../dom.js";
import { t, productName } from "../i18n.js";
import { productById } from "../data.js";
import { navigate } from "../router.js";
import { langToggle, brandLockup } from "../chrome.js";
import { stagger } from "../motion.js";

const FEATURED = ["matcha", "caramel", "cacahuate", "oreo"];

export function komorebi() {
  return h("div", { class: "komorebi", "aria-hidden": "true" },
    h("span", { class: "k-shaft k-shaft--1" }),
    h("span", { class: "k-shaft k-shaft--2" }),
    h("span", { class: "k-shaft k-shaft--3" }),
    h("span", { class: "k-dapple k-dapple--1" }),
    h("span", { class: "k-dapple k-dapple--2" }),
  );
}

function stamp() {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 120 120");
  svg.setAttribute("class", "stamp");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = '<defs><path id="stamp-circle" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1-88 0"/></defs><text><textPath href="#stamp-circle" textLength="272" lengthAdjust="spacingAndGlyphs">slow coffee · smart service · 고요 ·</textPath></text>';
  return svg;
}

export default {
  mode: "kiosk",
  chrome: { topbar: false },
  render() {
    let index = 0;
    const frames = FEATURED.map((id, i) => {
      const img = productImage(productById(id), { sizes: "(max-width: 900px) 70vw, 34vw", eager: i === 0, className: "arch-img" });
      if (i === 0) img.classList.add("is-active");
      return img;
    });
    const todayName = h("strong", { class: "today-name" });
    const todayMeta = h("span", { class: "today-meta" });
    const syncToday = () => {
      const product = productById(FEATURED[index]);
      todayName.textContent = productName(product);
      todayMeta.replaceChildren(h("span", { class: "kr" }, product.kr), " · ", h("span", { class: "mono" }, money(product.price)));
    };
    syncToday();

    const start = (event) => {
      if (event.target.closest("[data-no-start]")) return;
      navigate("/menu");
    };

    const cta = h("button", { class: "cta cta--xl", type: "button", onClick: () => navigate("/menu") },
      h("span", {}, t("attract.cta")),
      h("span", { class: "cta-orb" }, icon("arrow")),
    );

    const copy = h("div", { class: "attract-copy reveal-group" },
      h("p", { class: "eyebrow" }, h("span", { class: "eyebrow-line" }), t("attract.eyebrow")),
      h("h1", { class: "display" }, t("attract.title").split("\n").map((line) => h("span", { class: "display-line" }, accent(line)))),
      h("p", { class: "lead" }, t("attract.lead")),
      h("div", { class: "attract-actions" }, cta),
    );
    stagger([...copy.children]);

    const el = h("section", { class: "screen attract", onClick: start, "aria-labelledby": "attract-title" },
      komorebi(),
      h("header", { class: "attract-head" },
        brandLockup(),
        h("span", { class: "mono micro attract-terminal" }, t("terminal")),
        h("div", { "data-no-start": "" }, langToggle()),
      ),
      h("div", { class: "attract-body" },
        copy,
        h("div", { class: "attract-visual" },
          h("figure", { class: "arch" }, frames, h("span", { class: "arch-glow", "aria-hidden": "true" })),
          h("aside", { class: "float-card float-card--today" },
            h("span", { class: "micro" }, t("attract.today")),
            todayName,
            todayMeta,
          ),
          h("aside", { class: "float-card float-card--club" },
            h("span", { class: "club-icon" }, icon("leaf")),
            h("div", {}, h("strong", {}, t("attract.club")), h("p", {}, t("attract.clubText"))),
          ),
          stamp(),
        ),
      ),
      h("footer", { class: "attract-promises" },
        [["kiosk", "attract.promise1"], ["card", "attract.promise2"], ["receipt", "attract.promise3"]].map(([name, key]) =>
          h("span", { class: "promise" }, icon(name), t(key)),
        ),
      ),
    );
    el.querySelector("h1").id = "attract-title";

    // Sólo la primera foto entra en la carga inicial; el resto se adjunta cuando
    // la página ya está pintada (ahorra ~130 KB del primer render).
    const arch = el.querySelector(".arch");
    const glow = arch.querySelector(".arch-glow");
    for (const frame of frames.slice(1)) frame.remove();
    let timer = null;
    const lazy = setTimeout(() => {
      for (const frame of frames.slice(1)) {
        frame.loading = "eager";
        arch.insertBefore(frame, glow);
      }
      timer = setInterval(() => {
        frames[index].classList.remove("is-active");
        index = (index + 1) % frames.length;
        frames[index].classList.add("is-active");
        syncToday();
      }, 4800);
    }, 1600);

    // Paralaje sutil con el puntero (sólo ratón/trackpad y sin movimiento reducido).
    const finePointer = matchMedia("(pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const onMove = (event) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--px", ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3));
        el.style.setProperty("--py", ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3));
      });
    };
    if (finePointer) el.addEventListener("pointermove", onMove);

    return {
      el,
      focus: cta,
      destroy: () => {
        clearTimeout(lazy);
        clearInterval(timer);
        cancelAnimationFrame(frame);
      },
    };
  },
};
