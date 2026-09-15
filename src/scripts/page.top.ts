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
  const items = facility?.querySelectorAll(".facilityList_sticky_item");
  const facilityList_scroll = facility?.querySelector(".facilityList_scroll")!;
  let current = -1;
  let perH = 0;
  const total = items ? items.length - 1 : 0;

  function onResize() {
    const rect = facilityList_scroll?.getBoundingClientRect();
    perH = rect.height / (total + 1);
  }
  window.addEventListener("resize", onResize);
  onResize();

  function change() {
    items?.forEach((item, index) => item.classList.toggle("--current", index <= current));
  }
  function onScroll() {
    const rect = facilityList_scroll?.getBoundingClientRect();
    const next = Math.min(total, Math.max(0, Math.round((rect.top * -1) / perH)));
    if (next !== current) {
      current = next;
      change();
    }
  }
  new RowScroll({ wrapper: facility, onScroll: onScroll });
  onScroll();
}

function other_init() {
  // const other = document.querySelector(".others");
  // const sections = document.querySelectorAll(".others_textBlock");
  // let current = 0;
  // const total = sections.length - 1;
  // let isShow =
  // function onScroll() {
  //   sections.forEach((item, index) => {
  //   })
  //   const rect = facilityList_scroll?.getBoundingClientRect();
  //   const next = Math.min(total, Math.max(0, Math.round((rect.top * -1) / perH)));
  //   if (next !== current) {
  //     current = next;
  //     change();
  //   }
  // }
  // new RowScroll({ wrapper: other, onScroll: onScroll });
  // onScroll();
}

export function pageTop_init() {
  gallery_init();
  facility_init();
  other_init();

  enter();
}
