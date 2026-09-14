import { createIo } from "../utils/createIo";
import { isSp } from "../utils/isSp";

export function slTexts_init() {
  const slTexts = document.querySelectorAll(".slTexts.--inview");
  slTexts.forEach((item) => {
    function show(entry: IntersectionObserverEntry) {
      if (entry.isIntersecting) {
        const block = item.querySelector(isSp ? ".--sp" : ".--pc");
        const texts = block?.querySelectorAll(".slTexts_text");
        if (texts)
          texts.forEach((text, index) => {
            setTimeout(
              () => {
                text.classList.remove("--hide");
              },
              index * 100 + 120,
            );
          });
      }
    }
    createIo(item, show, true);
  });
}
