import gsap from "gsap";
import { createIo } from "../utils/createIo";
import { isSp } from "../utils/isSp";

export function pageTerms_init() {
  const sections = document.querySelectorAll(".terms_section");
  const navItems = document.querySelectorAll(".terms_nav_list a");

  const setActiveNav = (id: string) => {
    navItems.forEach((item) => {
      const href = item.getAttribute("href");
      console.log(id === href);
      item.classList.toggle("--current", href === id);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveNav(entry.target.getAttribute("data-href") || "");
        }
      });
    },
    {
      root: null,
      rootMargin: "-40% 0px -40% 0px",
      threshold: 0,
    },
  );

  sections.forEach((section) => {
    observer.observe(section);
  });

  if (isSp) {
    const sections = document.querySelector(".terms_sections")!;
    const navs = document.querySelector(".terms_nav");
    function ioCallback(entry: IntersectionObserverEntry) {
      const opacity = entry.isIntersecting ? 1 : 0;
      navs?.classList.toggle("js--noClick", !entry.isIntersecting);
      gsap.to(navs, {
        opacity: opacity,
        duration: 0.2,
        ease: "none",
      });
    }
    createIo(sections, ioCallback, false, {
      root: null,
      rootMargin: "-50% 0px -50% 0px",
      threshold: 0,
    });
  }
}
