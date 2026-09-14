import { RowScroll } from "../utils/rowScroll";

function gallery_init() {
  const wrapper = document.querySelector(".gallerySlider");
  const nav = wrapper?.querySelector(".gallerySlider_nav_scroll")!;
  const navItems = nav.querySelectorAll(".gallerySlider_nav_item");
  const windowItems = wrapper?.querySelectorAll(".gallerySlider_window_item");

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

    console.log(perH, perGap);
  }
  window.addEventListener("resize", onResize);
  onResize();

  function change() {
    navItems.forEach((item, index) => {
      item.classList.toggle("--current", index === current);
    });
    windowItems?.forEach((item, index) => {
      item.classList.toggle("js--hidden", index !== current);
    });
    console.log("j");
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

export function pageTop_init() {
  gallery_init();
  facility_init();

  enter();
}
