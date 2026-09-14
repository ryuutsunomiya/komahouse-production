import { createIo } from "../utils/createIo";

export function showImg_init() {
  const showImgs = document.querySelectorAll(".showImg.--inview");
  showImgs.forEach((item) => {
    function ioCallback(entry: IntersectionObserverEntry) {
      if (entry.isIntersecting) {
        item.classList.add("--act");
      }
    }
    createIo(item, ioCallback, true, {
      root: null,
      rootMargin: "-50% 0px -50% 0px",
      threshold: 0,
    });
  });
}
