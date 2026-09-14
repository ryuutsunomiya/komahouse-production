import Lenis from "lenis";

export let lenis: Lenis;
export function lenis_init() {
  lenis = new Lenis({ autoRaf: true, duration: 1.2 });

  const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href) as HTMLElement;
      if (!target) return;

      e.preventDefault();

      lenis.scrollTo(target, {
        offset: 0,
        duration: 1.2,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
      });
    });
  });
}
