import gsap from "gsap";

export function header_init() {
  const hamburger = document.querySelector(".hamburger");
  const button = document.querySelector(".hamburgerButton");
  const anchors = hamburger?.querySelectorAll<HTMLAnchorElement>(".mainNav_main_anchor");
  let isOpen = false;
  button?.addEventListener("click", () => {
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
}
