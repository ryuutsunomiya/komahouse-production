import { createIo } from "../utils/createIo";

export function cta_init() {
  const cta = document.querySelector(".cta");
  if (!cta) return;
  const main = cta.querySelector(".slTexts");

  function ioCallback(entry: IntersectionObserverEntry) {
    if (entry.isIntersecting) {
      cta?.classList.add("--show");
    }
  }
  createIo(main, ioCallback, true);
}
