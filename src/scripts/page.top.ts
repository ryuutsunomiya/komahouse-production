import gsap from "gsap";
import { RowScroll } from "../utils/rowScroll";

function gallery_init() {
  const wrapper = document.querySelector(".gallerySlider");
  const nav = wrapper?.querySelector(".gallerySlider_nav_scroll")!;
  const navItems = nav.querySelectorAll(".gallerySlider_nav_item");
  const windowItems = wrapper?.querySelectorAll(".gallerySlider_window_item");
  const windowImgs = wrapper?.querySelectorAll(".gallerySlider_window_item img");

  if (!nav || navItems.length <= 2) return;

  let current = 0;
  const total = navItems.length - 1;
  let perGap = 0;
  let perH = 0;

  function onResize() {
    const item1Rect = navItems[0].getBoundingClientRect();
    const item2Rect = navItems[1].getBoundingClientRect();
    perGap = item2Rect.top - item1Rect.bottom;
    perH = item1Rect.height + perGap;
  }
  window.addEventListener("resize", onResize);
  onResize();

  function change() {
    navItems.forEach((item, index) => {
      item.classList.toggle("--current", index === current);
    });
    windowItems?.forEach((item, index) => {
      item.classList.toggle("js--hidden", index !== current);
      if (index === current && windowImgs) {
        const next = Math.min(index + 1, navItems.length - 1);
        if (windowImgs[next].getAttribute("src") === "") {
          windowImgs[next].setAttribute("src", windowImgs[next].getAttribute("data-src") || "");
        }
        const prev = Math.max(index - 1, 0);
        if (windowImgs[prev].getAttribute("src") === "") {
          windowImgs[prev].setAttribute("src", windowImgs[prev].getAttribute("data-src") || "");
        }
      }
    });
  }

  function onScroll() {
    const scY = nav.scrollTop;
    const next = Math.min(total, Math.max(0, Math.round(scY / perH)));

    if (next !== current) {
      current = next;
      change();
    }
  }
  new RowScroll({ wrapper: nav, onScroll: onScroll });
}

function enter() {
  setTimeout(() => {
    const fv = document.querySelector(".fv");
    fv?.classList.add("--act");
    const helos = fv?.querySelectorAll(".slTexts_text");
    helos?.forEach((item, index) => {
      setTimeout(
        () => {
          item.classList.remove("--hide");
        },
        // 200 + index * 100,
        0,
      );
    });

    const header = document.querySelector(".header");
    header?.classList.remove("js--noAnime");
    gsap.to(header, {
      opacity: 1,
      duration: 0.8,
      ease: "none",
    });
  }, 500);
}

function facility_init() {
  const facility = document.querySelector(".facilityList");
  const imgs = facility?.querySelectorAll(".facilityList_sticky_img");
  const titles = facility?.querySelectorAll(".facilityList_sticky_title_inner");
  const counters = facility?.querySelectorAll(".facilityList_sticky_numbers_number .--counter");
  const rightTexts = facility?.querySelectorAll(".facilityList_sticky_textRight_inner");
  const facilityList_scroll = facility?.querySelector(".facilityList_scroll")!;
  const facilityList_scroll_item = facility?.querySelector(".facilityList_scroll div")!;
  let current = -1;
  let perH = 0;
  const total = imgs ? imgs.length - 1 : 0;

  function onResize() {
    const rect = facilityList_scroll?.getBoundingClientRect();
    const perRect = facilityList_scroll_item.getBoundingClientRect();
    perH = (rect.height - perRect.height * 0.5) / (total + 1);
  }
  window.addEventListener("resize", onResize);
  onResize();

  function change() {
    function fade(items: NodeListOf<Element> | undefined) {
      items?.forEach((item, index) => {
        gsap.to(item, {
          opacity: 0,
          duration: 0.4,
          ease: "none",
          overwrite: true,
          onComplete: () => {
            gsap.to(item, {
              opacity: index === current ? 1 : 0,
              duration: 0.8,
              ease: "none",
            });
          },
        });
      });
    }
    fade(rightTexts);
    fade(titles);
    fade(counters);

    imgs?.forEach((img, index) => img.classList.toggle("--current", index <= current));
  }
  function onScroll() {
    const rect = facilityList_scroll?.getBoundingClientRect();
    const next = Math.min(total, Math.max(0, Math.round((rect.top * -1) / perH)));
    console.log(perH);
    if (next !== current) {
      current = next;
      change();
    }
  }
  new RowScroll({ wrapper: facility, onScroll: onScroll });
  onScroll();
}

function other_init() {}

export function pageTop_init() {
  gallery_init();
  facility_init();
  other_init();

  enter();
}
