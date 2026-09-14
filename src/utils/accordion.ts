import gsap from "gsap";

export const accordion_duration = 1.8;
export const accordion_ease = "expo.out";
export type accordionOptionType = { openEx?: (index: number, duration: number, ease: string) => void; closeEx?: (index: number, duration: number, ease: string) => void };

export function accordion_init(option?: accordionOptionType) {
  const accordions = document.querySelectorAll(".--accordion");

  accordions.forEach((accordion, index) => {
    const button = accordion.querySelector(".--accordion_button");
    const body = accordion.querySelector(".--accordion_body");
    const inner = accordion.querySelector(".--accordion_bodyInner");
    const arrow = accordion.querySelector(".--accordion_head_icon");

    if (!button || !body || !inner || !arrow) console.error("accordion_init");

    function open(isReisze: boolean) {
      const durationCoff = isReisze ? 0 : 1;
      const h = inner?.getBoundingClientRect().height;
      gsap.to(body, {
        height: h,
        duration: accordion_duration * durationCoff,
        ease: accordion_ease,
        overwrite: true,
      });
      gsap.to(arrow, {
        rotate: 90,
        duration: accordion_duration * durationCoff,
        ease: accordion_ease,
      });

      if (option?.openEx) option.openEx(index, accordion_duration * durationCoff, accordion_ease);
    }

    function close(isReisze: boolean) {
      const durationCoff = isReisze ? 0 : 1;
      gsap.to(body, {
        height: 0,
        duration: accordion_duration * durationCoff * 0.5,
        ease: accordion_ease,
        overwrite: true,
      });
      gsap.to(arrow, {
        rotate: 0,
        duration: accordion_duration * durationCoff * 0.5,
        ease: accordion_ease,
      });
      if (option?.closeEx) option.closeEx(index, accordion_duration * durationCoff, accordion_ease);
    }

    function onClick(isReisze: boolean) {
      if (accordion.classList.contains("--open")) {
        accordion.classList.remove("--open");
        close(isReisze);
      } else {
        accordion.classList.add("--open");
        open(isReisze);
      }
    }

    function onResize(isReisze: boolean) {
      if (accordion.classList.contains("--open")) {
        open(isReisze);
      } else {
        close(isReisze);
      }
    }

    button?.addEventListener("click", () => onClick(false));
    window.addEventListener("resize", () => onResize(true));
  });
}
