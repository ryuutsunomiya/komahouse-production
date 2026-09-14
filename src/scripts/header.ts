import gsap from "gsap";
import { rowResize } from "../utils/rowResize";

export function header_init() {
  const hamburger = document.querySelector(".hamburger");
  const buttons = document.querySelectorAll(".hamburgerButton");
  const anchors = hamburger?.querySelectorAll<HTMLAnchorElement>(".mainNav_main_anchor");
  let isOpen = false;
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      hamburger?.classList.toggle("--close");
      hamburger?.classList.toggle("--open");
      isOpen = !isOpen;
      if (isOpen) {
        anchors?.forEach((item, index) => {
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
}
