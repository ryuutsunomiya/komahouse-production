import gsap from "gsap";
import { createIo } from "../utils/createIo";

export function toggleBgSection_init() {
  const targets = document.querySelectorAll(".toggleBgSection");
  if (targets.length === 0) return;

  const html = document.querySelector("html")!;
  let current = -1;

  const showImgs = document.querySelectorAll(".others .others_imgs_inner");
  function change() {
    showImgs.forEach((item, index) => {
      gsap.to(item, {
        opacity: 0,
        duration: 0.4,
        ease: "none",
        overwrite: true,
        onComplete: () => {
          gsap.to(item, {
            opacity: index === current ? 1 : 0,
            duration: 0,
            ease: "none",
            overwrite: true,
          });
          showImgs.forEach((item, index) => {
            const imgs = item.querySelectorAll(".showImg");
            imgs.forEach((img) => {
              img.classList.toggle("--act", index === current);
            });
          });
        },
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

  const other = document.querySelector(".others");
  function ioCallback(entry: IntersectionObserverEntry) {
    if (!entry.isIntersecting) {
      current = -1;
      console.log("h");
      change();
    }
  }
  createIo(other, ioCallback, false, {
    root: null,
    rootMargin: "-50% 0px -50% 0px",
    threshold: 0,
  });
}
