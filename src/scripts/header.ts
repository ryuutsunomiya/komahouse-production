import gsap from "gsap";
import { rowResize } from "../utils/rowResize";

function hamburger_init() {
  const hamburger = document.querySelector(".hamburger");
  const buttons = document.querySelectorAll(".hamburgerButton");
  const navAnchors = hamburger?.querySelectorAll<HTMLAnchorElement>(".mainNav_main_anchor");
  let isOpen = false;
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      hamburger?.classList.toggle("--close");
      hamburger?.classList.toggle("--open");
      isOpen = !isOpen;
      if (isOpen) {
        navAnchors?.forEach((item, index) => {
          item.classList.remove("--act");
          setTimeout(
            () => {
              item.classList.add("--act");
            },
            100 * index + 100,
          );
        });
      }
    });
  });

  function resize_start() {
    hamburger?.classList.add("js--noAnime");
  }
  function resize_end() {
    hamburger?.classList.remove("js--noAnime");
  }
  rowResize(resize_start, resize_end, 10);

  const anchors = document.querySelectorAll('a[href^="#"]');
  anchors.forEach((anchor) => {
    anchor.addEventListener("click", () => {
      hamburger?.classList.add("--close");
      hamburger?.classList.remove("--open");
      isOpen = false;
    });
  });
}

function overlap_init() {
  const header = document.querySelector(".header > .header_wrapper");
  const targets = document.querySelectorAll(".--header_white");

  const checkHeaderOverlap = () => {
    if (!header) return;

    const headerRect = header.getBoundingClientRect();

    const isOverlap = [...targets].some((target) => {
      const targetRect = target.getBoundingClientRect();

      return targetRect.top < headerRect.bottom && targetRect.bottom > headerRect.top;
    });

    header.classList.toggle("--color_white", isOverlap);
  };

  window.addEventListener("scroll", checkHeaderOverlap, {
    passive: true,
  });

  window.addEventListener("resize", checkHeaderOverlap);

  checkHeaderOverlap();
}

export function header_init() {
  overlap_init();
  hamburger_init();
}
