import gsap from "gsap";
import { createIo } from "../utils/createIo";

export function toggleBgSection_init() {
  const targets = document.querySelectorAll(".toggleBgSection");
  if (targets.length === 0) return;

  const html = document.querySelector("html")!;
  let current = -1;

  const showImgs = document.querySelectorAll(".others .others_imgs_inner");
  const showTexts = document.querySelectorAll(".others .others_texts");
  function change() {
    showImgs.forEach((item, index) => {
      const imgs = item.querySelectorAll(".showImg");
      imgs.forEach((img) => {
        if (index === current) img.classList.add("--act");
      });
    });
    showTexts.forEach((item, index) => {
      const texts = item.querySelectorAll(".showText");
      texts.forEach((img) => {
        setTimeout(() => {
          if (index === current) img.classList.add("--act");
        }, 100);
      });
    });
  }

  targets.forEach((target, index) => {
    function ioCallback(entry: IntersectionObserverEntry) {
      const col = target.getAttribute("data-col");
      if (entry.isIntersecting) {
        if (col) html.classList.add(`--toggleBgSection_${col}`);
        current = index;
        change();
      } else {
        if (col) html.classList.remove(`--toggleBgSection_${col}`);
      }
    }
    createIo(target, ioCallback, false, {
      root: null,
      rootMargin: "-50% 0px -50% 0px",
      threshold: 0,
    });
  });
}
