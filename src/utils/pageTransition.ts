import { isDev } from "../utils/isDev";

export function pageTransition_set() {
  const links = document.querySelectorAll('a:not([target="_blank"])') as NodeListOf<HTMLAnchorElement>;
  if (isDev) {
    links.forEach((link) => {
      link.setAttribute("href", `${link.getAttribute("href") || "/"}?dev`);
    });
  }

  // links.forEach((link) => {
  //   link.addEventListener("click", (e) => {
  //     const hrefAttr = link.getAttribute("href") || "";

  //     if (hrefAttr.startsWith("#")) {
  //       return;
  //     }

  //     if (e instanceof PointerEvent) {
  //       if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || link.target === "_blank") {
  //         return;
  //       }
  //     }
  //     const href = link.href;

  //     e.preventDefault();

  //     window.location.href = href;
  //     if (isDev) {
  //       window.location.href = href;
  //     } else {
  //       const shutter = document.querySelector(".pageShutter")!;
  //       if (shutter) {
  //         shutter.classList.add("--act");
  //         shutter.addEventListener("transitionend", () => {
  //           window.location.href = href;
  //         });
  //       } else {
  //         window.location.href = href;
  //       }
  //     }
  //   });
  // });
}
